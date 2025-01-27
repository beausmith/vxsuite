import { typedAs } from '@votingworks/utils';
import * as fc from 'fast-check';
import { Rect, Segment } from './types';
import {
  bitsToNumber,
  calculateIntersection,
  checkApproximatelyColinear,
  closestPointOnLineSegmentToPoint,
  crossProduct,
  distance,
  dotProduct,
  intersectionOfLineSegments,
  loc,
  makeRect,
  median,
  rectsOverlap,
  segmentIntersectionWithRect,
  vec,
  vectorAdd,
  vectorMult,
  vectorSub,
} from './utils';

function arbitraryRect(): fc.Arbitrary<Rect> {
  return fc
    .record({
      x: fc.integer({ min: 0, max: 1000 }),
      y: fc.integer({ min: 0, max: 1000 }),
      width: fc.integer({ min: 1, max: 1000 }),
      height: fc.integer({ min: 1, max: 1000 }),
    })
    .map(({ x, y, width, height }) =>
      makeRect({
        minX: x,
        minY: y,
        maxX: x + width - 1,
        maxY: y + height - 1,
      })
    );
}

test('distance (basics)', () => {
  expect(distance(loc(1, 1), loc(0, 0))).toBe(Math.sqrt(2));
  expect(distance(loc(3, 3), loc(6, 7))).toBe(5);
});

test('distance along axes', () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), fc.integer(), (ox, oy, n) => {
      expect(distance(loc(ox + n, oy), loc(ox, oy))).toBe(Math.abs(n));
      expect(distance(loc(ox, oy + n), loc(ox, oy))).toBe(Math.abs(n));
    })
  );
});

test('distance is symmetric', () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), (x, y) => {
      expect(distance(loc(x, y), loc(0, 0))).toBe(
        distance(loc(0, 0), loc(x, y))
      );
    })
  );
});

test('distance exceeds maximum distance along an axis', () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), (x, y) => {
      expect(distance(loc(x, y), loc(0, 0))).toBeGreaterThanOrEqual(
        Math.max(Math.abs(x), Math.abs(y))
      );
    })
  );
});

test('median (basics)', () => {
  expect(median([1, 2, 3])).toBe(2);
  expect(median([2, 3, 1])).toBe(2);
  expect(median([1, 2, 3, 4])).toBe(2.5);
});

test('median does not depend on ordering', () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (values) => {
      expect(median(values)).toBe(
        median([...values].sort(() => Math.random() - 0.5))
      );
    })
  );
});

test('median is one of the array values for odd-length arrays', () => {
  fc.assert(
    fc.property(
      fc.array(fc.integer()).filter((values) => values.length % 2 === 1),
      (values) => {
        expect(values).toContain(median(values));
      }
    )
  );
});

test('crossProduct', () => {
  expect(crossProduct(vec(1, 1), vec(1, 1))).toBe(0);
  expect(crossProduct(vec(1, 0), vec(1, 1))).toBe(1);
  expect(crossProduct(vec(1, 2), vec(3, 4))).toBe(-2);
});

test('dotProduct', () => {
  expect(dotProduct(vec(1, 1), vec(1, 1))).toBe(2);
  expect(dotProduct(vec(1, 0), vec(1, 1))).toBe(1);
  expect(dotProduct(vec(1, 2), vec(3, 4))).toBe(11);
});

test('vectorAdd (basics)', () => {
  expect(vectorAdd(vec(1, 1), vec(1, 1))).toEqual(vec(2, 2));
  expect(vectorAdd(vec(-1, -1), vec(1, 1))).toEqual(vec(0, 0));
});

test('vectorAdd is commutative', () => {
  fc.assert(
    fc.property(
      fc.integer(),
      fc.integer(),
      fc.integer(),
      fc.integer(),
      (x, y, x2, y2) => {
        expect(vectorAdd(vec(x, y), vec(x2, y2))).toEqual(
          vectorAdd(vec(x2, y2), vec(x, y))
        );
      }
    )
  );
});

test('vectorSub (basics)', () => {
  expect(vectorSub(vec(1, 1), vec(1, 1))).toEqual(vec(0, 0));
  expect(vectorSub(vec(1, 2), vec(3, 4))).toEqual(vec(-2, -2));
});

test('vectorSub subtracting itself always yields the zero vector', () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), (x, y) => {
      expect(vectorSub(vec(x, y), vec(x, y))).toEqual(vec(0, 0));
    })
  );
});

test('vectorSub subtracting the zero vector always yields itself', () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), (x, y) => {
      expect(vectorSub(vec(x, y), vec(0, 0))).toEqual(vec(x, y));
    })
  );
});

test('vectorMult (basics)', () => {
  expect(vectorMult(vec(1, 2), 3)).toEqual(vec(3, 6));
  expect(vectorMult(vec(123, -456), 0.1)).toEqual(vec(12.3, -45.6));
});

test('vectorMult with scalar 1 always returns the original vector', () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), (x, y) => {
      expect(vectorMult(vec(x, y), 1)).toEqual(vec(x, y));
    })
  );
});

test('vectorMult with scalar -1 always negates the original vector', () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), (x, y) => {
      expect(vectorMult(vec(x, y), -1)).toEqual(vec(-x, -y));
    })
  );
});

test('vectorMult result components are divisible by the scalar value', () => {
  fc.assert(
    fc.property(
      fc
        .tuple(fc.integer(), fc.integer(), fc.integer())
        .filter(
          ([x, y, s]) =>
            Math.abs(s) !== 0 &&
            Math.abs(x * s) < Number.MAX_SAFE_INTEGER &&
            Math.abs(y * s) < Number.MAX_SAFE_INTEGER
        ),
      ([x, y, s]) => {
        const result = vectorMult(vec(x, y), s);
        expect(Math.abs(result.x % s)).toBe(0);
        expect(Math.abs(result.y % s)).toBe(0);
      }
    )
  );
});

test('intersectionOfLineSegments', () => {
  // intersection of two line segments
  expect(
    intersectionOfLineSegments(loc(0, 0), vec(2, 0), loc(1, -1), vec(0, 2))
  ).toEqual(loc(1, 0));
  expect(
    intersectionOfLineSegments(loc(0, 0), vec(2, 0), loc(1, -1), vec(0, 2), {
      bounded: false,
    })
  ).toEqual(loc(1, 0));

  // non-overlapping line segments
  expect(
    intersectionOfLineSegments(loc(0, 10), vec(0, 10), loc(2, 1), vec(-1, -1))
  ).toBeUndefined();
  expect(
    intersectionOfLineSegments(loc(0, 10), vec(0, 10), loc(2, 1), vec(-1, -1), {
      bounded: false,
    })
  ).toEqual(loc(0, -1));

  // parallel/colinear line segments
  fc.assert(
    fc.property(
      fc.integer(),
      fc.integer(),
      fc.integer(),
      fc.integer(),
      fc.integer(),
      (x, y, u, v, offset) => {
        expect(
          intersectionOfLineSegments(
            loc(x, y),
            vec(u, v),
            loc(x + offset, y),
            vec(u, v)
          )
        ).toBeUndefined();
        expect(
          intersectionOfLineSegments(
            loc(x, y),
            vec(u, v),
            loc(x, y + offset),
            vec(u, v)
          )
        ).toBeUndefined();
      }
    )
  );
});

test('closestPointOnLineSegmentToPoint', () => {
  const segment: Segment = {
    from: loc(0, 5),
    to: loc(5, 0),
  };

  // at endpoints
  expect(closestPointOnLineSegmentToPoint(segment, loc(0, 5))).toEqual(
    loc(0, 5)
  );
  expect(closestPointOnLineSegmentToPoint(segment, loc(5, 0))).toEqual(
    loc(5, 0)
  );

  // at origin
  expect(closestPointOnLineSegmentToPoint(segment, loc(0, 0))).toEqual(
    loc(2.5, 2.5)
  );

  // at point on line segment
  expect(closestPointOnLineSegmentToPoint(segment, loc(2.5, 2.5))).toEqual(
    loc(2.5, 2.5)
  );

  // past the endpoints
  expect(closestPointOnLineSegmentToPoint(segment, loc(10, 0))).toEqual(
    loc(5, 0)
  );
  expect(closestPointOnLineSegmentToPoint(segment, loc(0, 10))).toEqual(
    loc(0, 5)
  );
});

test('calculateIntersection', () => {
  // simple right angles
  expect(calculateIntersection(loc(0, 0), 0, loc(0, 0), Math.PI / 2)).toEqual(
    loc(0, 0)
  );
  expect(calculateIntersection(loc(0, 0), 0, loc(5, 5), Math.PI / 2)).toEqual(
    loc(5, 0)
  );

  // parallel lines
  expect(calculateIntersection(loc(0, 0), 0, loc(1, 1), 0)).toBeUndefined();
  expect(
    calculateIntersection(loc(0, 0), 0, loc(1, 1), Math.PI)
  ).toBeUndefined();

  // colinear lines
  expect(
    calculateIntersection(loc(0, 0), Math.PI / 2, loc(0, 1), Math.PI / 2)
  ).toBeUndefined();
  expect(
    calculateIntersection(loc(0, 0), Math.PI / 2, loc(0, 1), (Math.PI * 3) / 2)
  ).toBeUndefined();

  // intersection
  const point = calculateIntersection(
    loc(10, 10),
    Math.PI / 4,
    loc(0, 5),
    -Math.PI / 4
  );
  expect(point?.x).toBeCloseTo(2.5);
  expect(point?.y).toBeCloseTo(2.5);
});

test('bitsToNumber', () => {
  expect(bitsToNumber([])).toBe(0);
  expect(bitsToNumber([1])).toBe(1);
  expect(bitsToNumber([1], 1)).toBe(0);
  expect(bitsToNumber([0, 1])).toBe(2);
  expect(bitsToNumber([0, 1], 1)).toBe(1);
  expect(bitsToNumber([0, 1], 0, 1)).toBe(0);
  expect(bitsToNumber([0, 1], 1, 2)).toBe(1);
  expect(bitsToNumber([1, 1, 1, 1, 1, 1, 1, 1])).toBe(0xff);
});

test('segmentIntersectionWithRect', () => {
  expect(
    segmentIntersectionWithRect(
      makeRect({
        minX: -1,
        minY: 10,
        maxX: 9,
        maxY: 20,
      }),
      { from: loc(0, 15), to: loc(100, 15) },
      { bounded: false }
    )
  ).toEqual(typedAs<Segment>({ from: loc(-1, 15), to: loc(9, 15) }));
});

test('checkApproximatelyColinear', () => {
  const degree = Math.PI / 180;
  expect(checkApproximatelyColinear(0, 0, 0)).toBe(true);
  expect(checkApproximatelyColinear(0, Math.PI, 0)).toBe(true);
  expect(checkApproximatelyColinear(1 * degree, 0, 1 * degree)).toBe(true);
  expect(checkApproximatelyColinear(1 * degree, Math.PI, 1 * degree)).toBe(
    true
  );
  expect(checkApproximatelyColinear(1 * degree, Math.PI, 0)).toBe(false);
  expect(checkApproximatelyColinear(1 * degree, -1 * degree, 2 * degree)).toBe(
    true
  );
});

test('rectsOverlap(A, A) is always true', () => {
  fc.assert(
    fc.property(arbitraryRect(), (rect) => {
      expect(rectsOverlap(rect, rect)).toBe(true);
    })
  );
});

test(`rectsOverlap(A, A') is always true when A' is shifted less than width/height from A`, () => {
  fc.assert(
    fc.property(
      arbitraryRect()
        .filter((rect) => rect.minX !== rect.maxX || rect.minY !== rect.maxY)
        .chain((rect) =>
          fc.record({
            rect: fc.constant(rect),
            offset: fc.record({
              x: fc.integer({ min: -rect.width + 1, max: rect.width - 1 }),
              y: fc.integer({ min: -rect.height + 1, max: rect.height - 1 }),
            }),
          })
        ),
      ({ rect, offset }) => {
        const shifted = makeRect({
          minX: rect.minX + offset.x,
          minY: rect.minY + offset.y,
          maxX: rect.maxX + offset.x,
          maxY: rect.maxY + offset.y,
        });
        expect(rectsOverlap(rect, shifted)).toBe(true);
      }
    )
  );
});

test(`rectsOverlap(A, A') is always false when A' is shifted more than either width or height from A`, () => {
  fc.assert(
    fc.property(
      arbitraryRect().chain((rect) =>
        fc.record({
          rect: fc.constant(rect),
          offset: fc
            .record({
              x: fc.integer({ min: 1 }),
              y: fc.integer({ min: 1 }),
            })
            .filter(
              (offset) => offset.x >= rect.width || offset.y >= rect.height
            ),
        })
      ),
      ({ rect, offset }) => {
        const shifted = makeRect({
          minX: rect.minX + offset.x,
          minY: rect.minY + offset.y,
          maxX: rect.maxX + offset.x,
          maxY: rect.maxY + offset.y,
        });
        expect(rectsOverlap(rect, shifted)).toBe(false);
      }
    )
  );
});
