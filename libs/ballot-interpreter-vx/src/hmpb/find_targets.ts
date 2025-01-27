import { noDebug } from '@votingworks/image-utils';
import {
  BallotTargetMarkPosition,
  Rect,
  TargetShape,
} from '@votingworks/types';
import makeDebug from 'debug';
import { EXPECTED_OPTION_TARGET_COLOR, IGNORED_SHAPE_COLOR } from '../debug';
import { PIXEL_WHITE } from '../utils/binarize';
import { rectCenter } from '../utils/geometry';
import { VisitedPoints } from '../utils/visited_points';
import { findShape, Shape } from './shapes';

const debug = makeDebug('ballot-interpreter-vx:findTargets');

export function* findTargets(
  ballotImage: ImageData,
  bounds: Rect,
  {
    inset = Math.round(0.0175 * ballotImage.width),
    targetMarkPosition = BallotTargetMarkPosition.Left,
    aspectRatio = 1.5,
    aspectRatioTolerance = 0.1,
    expectedWidth = Math.round(0.025 * ballotImage.width),
    errorMargin = Math.ceil(0.04 * expectedWidth),
    imdebug = noDebug(),
  } = {}
): Generator<TargetShape> {
  debug('finding targets in %o', bounds);
  const visitedPoints = new VisitedPoints(
    ballotImage.width,
    ballotImage.height
  );
  const minAspectRatio = aspectRatio - aspectRatioTolerance;
  const maxAspectRatio = aspectRatio + aspectRatioTolerance;

  const x =
    bounds.x +
    Math.round(
      targetMarkPosition === BallotTargetMarkPosition.Right
        ? bounds.width - 1 - inset - expectedWidth / 2
        : inset + expectedWidth / 2
    );
  let lastShape: Shape | undefined;

  for (let y = bounds.y + bounds.height - inset; y > bounds.y; y -= 1) {
    const shape = findShape(ballotImage, { x, y }, { visitedPoints });

    if (shape.bounds.width === 0 || shape.bounds.height === 0) {
      continue;
    }

    // If we already found one, so let's use it to determine the right size.
    let found: boolean;

    if (lastShape) {
      if (
        shape.bounds.width <= lastShape.bounds.width + errorMargin &&
        shape.bounds.width >= lastShape.bounds.width - errorMargin &&
        shape.bounds.height <= lastShape.bounds.height + errorMargin &&
        shape.bounds.height >= lastShape.bounds.height - errorMargin
      ) {
        debug('shape matches last target shape!');
        found = true;
      } else {
        debug(
          'skipping shape because it does not match the last known target shape: %O ≉ %O',
          shape.bounds,
          lastShape.bounds
        );
        imdebug.rect(
          shape.bounds.x,
          shape.bounds.y,
          shape.bounds.width,
          shape.bounds.height,
          IGNORED_SHAPE_COLOR
        );
        found = false;
      }
    } else {
      const actualAspectRatio = shape.bounds.width / shape.bounds.height;
      if (
        actualAspectRatio < minAspectRatio ||
        actualAspectRatio > maxAspectRatio
      ) {
        debug(
          'skipping shape because it is the wrong aspect ratio: %d ≉ %d ± %d: %O',
          actualAspectRatio,
          aspectRatio,
          aspectRatioTolerance,
          shape.bounds
        );
        imdebug.rect(
          shape.bounds.x,
          shape.bounds.y,
          shape.bounds.width,
          shape.bounds.height,
          IGNORED_SHAPE_COLOR
        );
        found = false;
      } else if (
        shape.bounds.width < expectedWidth - errorMargin ||
        shape.bounds.width > expectedWidth + errorMargin
      ) {
        debug(
          'skipping shape because it is the wrong width: %d ≉ %d ± %d: %O',
          shape.bounds.width,
          expectedWidth,
          errorMargin,
          shape.bounds
        );
        imdebug.rect(
          shape.bounds.x,
          shape.bounds.y,
          shape.bounds.width,
          shape.bounds.height,
          IGNORED_SHAPE_COLOR
        );
        found = false;
      } else {
        found = true;
      }
    }

    if (found) {
      debug('found shape: %O', shape.bounds);
      const innerShape = findShape(
        ballotImage,
        rectCenter(shape.bounds, { round: true }),
        { color: PIXEL_WHITE }
      );
      lastShape = shape;
      imdebug.rect(
        shape.bounds.x,
        shape.bounds.y,
        shape.bounds.width,
        shape.bounds.height,
        EXPECTED_OPTION_TARGET_COLOR
      );
      imdebug.rect(
        innerShape.bounds.x,
        innerShape.bounds.y,
        innerShape.bounds.width,
        innerShape.bounds.height,
        EXPECTED_OPTION_TARGET_COLOR
      );
      yield {
        bounds: shape.bounds,
        inner: innerShape.bounds,
      };
    }

    y = shape.bounds.y;
  }
}
