import type {
  AdjudicationReason,
  Dictionary,
  ElectionDefinition,
  VotesDict,
} from '@votingworks/types'
import type {
  BallotMark,
  BallotPageLayout,
  BallotPageMetadata,
  Size,
} from '@votingworks/hmpb-interpreter'
import type { AdjudicationInfo } from './ballot-review-types'

export interface MachineConfig {
  machineId: string
}

// Election
export type SetElectionDefinition = (value?: ElectionDefinition) => void

// Scanner Types
export interface CastVoteRecord
  extends Dictionary<string | string[] | boolean> {
  _precinctId: string
  _ballotStyleId: string
  _ballotType: 'absentee' | 'provisional' | 'standard'
  _ballotId: string
  _testBallot: boolean
  _scannerId: string
}

export type Ballot = BmdBallotInfo | HmpbBallotInfo | UnreadableBallotInfo

export interface BmdBallotInfo {
  id: number
  filename: string
  cvr: CastVoteRecord
}

export interface HmpbBallotInfo {
  id: number
  filename: string
  cvr: CastVoteRecord
  marks: MarkInfo
  layout: SerializableBallotPageLayout
}

export interface UnreadableBallotInfo {
  id: number
  filename: string
}

export type SerializableBallotPageLayout = Omit<
  BallotPageLayout,
  'ballotImage'
> & {
  ballotImage: Omit<BallotPageLayout['ballotImage'], 'imageData'>
}

export interface MarkInfo {
  marks: BallotMark[]
  ballotSize: Size
}

// these data structures live here until we can refactor the code
// to be more sheet-oriented and then place them where they belong.
interface ImageInfo {
  url: string
}

interface BallotPageInfo {
  image: ImageInfo
  interpretation: PageInterpretation
}

export interface BallotSheetInfo {
  id: string
  front: BallotPageInfo
  back: BallotPageInfo
}

export type BallotMetadata = Omit<BallotPageMetadata, 'pageNumber'>

export type PageInterpretation =
  | BlankPage
  | InterpretedBmdPage
  | InterpretedHmpbPage
  | InvalidTestModePage
  | UninterpretedHmpbPage
  | UnreadablePage
  | InvalidElectionHashPage

export interface BlankPage {
  type: 'BlankPage'
}

export interface InterpretedBmdPage {
  type: 'InterpretedBmdPage'
  ballotId: string
  metadata: BallotMetadata
  votes: VotesDict
}

export interface InterpretedHmpbPage {
  type: 'InterpretedHmpbPage'
  ballotId?: string
  metadata: BallotPageMetadata
  markInfo: MarkInfo
  votes: VotesDict
  adjudicationInfo: AdjudicationInfo
}

export interface InvalidTestModePage {
  type: 'InvalidTestModePage'
  metadata: BallotMetadata | BallotPageMetadata
}

export interface UninterpretedHmpbPage {
  type: 'UninterpretedHmpbPage'
  metadata: BallotPageMetadata
}

export interface UnreadablePage {
  type: 'UnreadablePage'
  reason?: string
}

export interface InvalidElectionHashPage {
  type: 'InvalidElectionHashPage'
  expectedElectionHash: string
  actualElectionHash: string
}

export type AdjudicationReasonInfo =
  | UninterpretableBallotAdjudicationReasonInfo
  | MarginalMarkAdjudicationReasonInfo
  | OvervoteAdjudicationReasonInfo
  | UndervoteAdjudicationReasonInfo
  | WriteInAdjudicationReasonInfo
  | BlankBallotAdjudicationReasonInfo

export interface UninterpretableBallotAdjudicationReasonInfo {
  type: AdjudicationReason.UninterpretableBallot
}

export interface MarginalMarkAdjudicationReasonInfo {
  type: AdjudicationReason.MarginalMark
  contestId: string
  optionId: string
}

export interface OvervoteAdjudicationReasonInfo {
  type: AdjudicationReason.Overvote
  contestId: string
  optionIds: readonly string[]
  expected: number
}

export interface UndervoteAdjudicationReasonInfo {
  type: AdjudicationReason.Undervote
  contestId: string
  optionIds: readonly string[]
  expected: number
}

export interface WriteInAdjudicationReasonInfo {
  type: AdjudicationReason.WriteIn
  contestId: string
  optionId: string
}

export interface BlankBallotAdjudicationReasonInfo {
  type: AdjudicationReason.BlankBallot
}