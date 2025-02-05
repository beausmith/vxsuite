import { interpret as interpretNh } from '@votingworks/ballot-interpreter-nh';
import {
  AdjudicationReason,
  AdjudicationReasonInfo,
  BallotPageLayoutWithImage,
  ElectionDefinition,
  err,
  Id,
  MarkThresholds,
  ok,
  Optional,
  PageInterpretationWithFiles,
  PrecinctSelection,
  Result,
  mapSheet,
  SheetOf,
} from '@votingworks/types';
import {
  detectQrcodeInFilePath,
  normalizeSheetOutput,
} from '@votingworks/ballot-interpreter-vx';
import { time } from '@votingworks/utils';
import { Interpreter as VxInterpreter } from './vx_interpreter';
import { saveSheetImages } from './util/save_images';
import { rootDebug } from './util/debug';
import { SheetInterpretation } from './types';

export interface InterpreterConfig {
  readonly electionDefinition: ElectionDefinition;
  readonly precinctSelection: PrecinctSelection;
  readonly layouts: readonly BallotPageLayoutWithImage[];
  readonly ballotImagesPath: string;
  readonly markThresholdOverrides?: MarkThresholds;
  readonly testMode: boolean;
}

/**
 * A configurable interpreter for the precinct scanner.
 */
export interface PrecinctScannerInterpreter {
  configure(options: InterpreterConfig): void;
  unconfigure(): void;
  isConfigured(): boolean;
  interpret(
    sheetId: Id,
    sheet: SheetOf<string>
  ): Promise<Result<SheetInterpretationWithPages, Error>>;
}

/**
 * An interpretation for one ballot sheet that includes both the interpretation
 * result for the sheet as a whole and the individual page (i.e. front and back)
 * interpretations.
 */
export type SheetInterpretationWithPages = SheetInterpretation & {
  pages: SheetOf<PageInterpretationWithFiles>;
};

function combinePageInterpretationsForSheet(
  pages: SheetOf<PageInterpretationWithFiles>
): SheetInterpretation {
  const [front, back] = pages;
  const frontType = front.interpretation.type;
  const backType = back.interpretation.type;

  if (
    (frontType === 'InterpretedBmdPage' && backType === 'BlankPage') ||
    (backType === 'InterpretedBmdPage' && frontType === 'BlankPage')
  ) {
    return { type: 'ValidSheet' };
  }

  if (
    frontType === 'InterpretedHmpbPage' &&
    backType === 'InterpretedHmpbPage'
  ) {
    const frontAdjudication = front.interpretation.adjudicationInfo;
    const backAdjudication = back.interpretation.adjudicationInfo;

    if (
      !(
        frontAdjudication.requiresAdjudication ||
        backAdjudication.requiresAdjudication
      )
    ) {
      return { type: 'ValidSheet' };
    }

    const frontReasons = frontAdjudication.enabledReasonInfos;
    const backReasons = backAdjudication.enabledReasonInfos;

    let reasons: AdjudicationReasonInfo[];
    // If both sides are blank, the ballot is blank
    if (
      frontReasons.some(
        (reason) => reason.type === AdjudicationReason.BlankBallot
      ) &&
      backReasons.some(
        (reason) => reason.type === AdjudicationReason.BlankBallot
      )
    ) {
      reasons = [{ type: AdjudicationReason.BlankBallot }];
    }
    // Otherwise, we can ignore blank sides
    else {
      reasons = [...frontReasons, ...backReasons].filter(
        (reason) => reason.type !== AdjudicationReason.BlankBallot
      );
    }

    // If there are any non-blank reasons, they should be reviewed
    if (reasons.length > 0) {
      return {
        type: 'NeedsReviewSheet',
        reasons,
      };
    }
    return { type: 'ValidSheet' };
  }

  if (
    frontType === 'InvalidElectionHashPage' ||
    backType === 'InvalidElectionHashPage'
  ) {
    return {
      type: 'InvalidSheet',
      reason: 'invalid_election_hash',
    };
  }

  if (
    frontType === 'InvalidTestModePage' ||
    backType === 'InvalidTestModePage'
  ) {
    return {
      type: 'InvalidSheet',
      reason: 'invalid_test_mode',
    };
  }

  if (
    frontType === 'InvalidPrecinctPage' ||
    backType === 'InvalidPrecinctPage'
  ) {
    return {
      type: 'InvalidSheet',
      reason: 'invalid_precinct',
    };
  }

  if (frontType === 'UnreadablePage' || backType === 'UnreadablePage') {
    return {
      type: 'InvalidSheet',
      reason: 'unreadable',
    };
  }

  if (
    frontType === 'UninterpretedHmpbPage' ||
    backType === 'UninterpretedHmpbPage'
  ) {
    return {
      type: 'InvalidSheet',
      reason: 'unknown',
    };
  }

  return {
    type: 'InvalidSheet',
    reason: 'unknown',
  };
}

async function nhInterpret(
  sheetId: Id,
  sheet: SheetOf<string>,
  config: InterpreterConfig
): Promise<Result<SheetOf<PageInterpretationWithFiles>, Error>> {
  const timer = time(rootDebug, `nhInterpret: ${sheetId}`);

  const { electionDefinition, ballotImagesPath, markThresholdOverrides } =
    config;
  const result = await interpretNh(electionDefinition, sheet, {
    isTestMode: config.testMode,
    markThresholds: markThresholdOverrides,
    adjudicationReasons:
      electionDefinition.election.precinctScanAdjudicationReasons ?? [],
  });

  timer.checkpoint('finishedInterpretation');

  if (result.isErr()) {
    return result;
  }

  const [frontResult, backResult] = result.ok();

  const frontImages = await saveSheetImages(
    sheetId,
    ballotImagesPath,
    sheet[0],
    frontResult.normalizedImage
  );
  const backImages = await saveSheetImages(
    sheetId,
    ballotImagesPath,
    sheet[1],
    backResult.normalizedImage
  );

  timer.checkpoint('savedSheetImages');

  timer.end();

  const pageInterpretations: SheetOf<PageInterpretationWithFiles> = [
    {
      interpretation: frontResult.interpretation,
      originalFilename: frontImages.original,
      normalizedFilename: frontImages.normalized,
    },
    {
      interpretation: backResult.interpretation,
      originalFilename: backImages.original,
      normalizedFilename: backImages.normalized,
    },
  ];
  return ok(pageInterpretations);
}

async function vxInterpret(
  sheetId: Id,
  sheet: SheetOf<string>,
  config: InterpreterConfig
): Promise<Result<SheetOf<PageInterpretationWithFiles>, Error>> {
  const {
    electionDefinition,
    ballotImagesPath,
    layouts,
    markThresholdOverrides,
    precinctSelection,
    testMode,
  } = config;
  const timer = time(rootDebug, `vxInterpret: ${sheetId}`);

  const vxInterpreter = new VxInterpreter({
    electionDefinition,
    testMode,
    markThresholdOverrides,
    precinctSelection,
    adjudicationReasons:
      electionDefinition.election.precinctScanAdjudicationReasons ?? [],
  });

  for (const layout of layouts) {
    vxInterpreter.addHmpbTemplate(layout);
  }

  const [frontQrcodeOutput, backQrcodeOutput] = normalizeSheetOutput(
    electionDefinition,
    await mapSheet(sheet, detectQrcodeInFilePath)
  );

  timer.checkpoint('extractedQrCodes');

  const [frontPath, backPath] = sheet;
  const pageInterpretations = await mapSheet(
    [
      [frontPath, frontQrcodeOutput],
      [backPath, backQrcodeOutput],
    ] as const,
    async ([
      ballotImagePath,
      detectQrcodeResult,
    ]): Promise<PageInterpretationWithFiles> => {
      const result = await vxInterpreter.interpretFile({
        ballotImagePath,
        detectQrcodeResult,
      });

      const images = await saveSheetImages(
        sheetId,
        ballotImagesPath,
        ballotImagePath,
        result.normalizedImage
      );

      return {
        interpretation: result.interpretation,
        originalFilename: images.original,
        normalizedFilename: images.normalized,
      };
    }
  );

  timer.checkpoint('finishedInterpretation');

  timer.end();

  return ok(pageInterpretations);
}

/**
 * Create an interpreter for the precinct scanner. The interpreter can be
 * configured and unconfigured with different election settings.
 */
export function createInterpreter(): PrecinctScannerInterpreter {
  let config: Optional<InterpreterConfig>;

  return {
    configure(newConfig: InterpreterConfig) {
      config = newConfig;
    },

    unconfigure() {
      config = undefined;
    },

    isConfigured() {
      return config !== undefined;
    },

    interpret: async (sheetId, sheet) => {
      if (!config) return err(Error('Interpreter not configured'));
      const result = config.electionDefinition.election.gridLayouts
        ? await nhInterpret(sheetId, sheet, config)
        : await vxInterpret(sheetId, sheet, config);
      if (result.isErr()) return result;
      const pageInterpretations = result.ok();
      return ok({
        ...combinePageInterpretationsForSheet(pageInterpretations),
        pages: pageInterpretations,
      });
    },
  };
}
