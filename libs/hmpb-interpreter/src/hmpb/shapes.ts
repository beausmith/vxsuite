import { Corners, Point, Rect } from '@votingworks/types'
import { PIXEL_BLACK } from '../utils/binarize'
import { angleBetweenPoints } from '../utils/geometry'
import { getImageChannelCount } from '../utils/imageFormatUtils'
import { VisitedPoints } from '../utils/VisitedPoints'

export type Edge = Int32Array

export interface Shape {
  bounds: Rect
  edges: {
    top: Edge
    right: Edge
    bottom: Edge
    left: Edge
  }
}

/**
 * Finds a shape in a binarized image by looking for adjacent pixels of a
 * specific color starting at a given point.
 */
export function findShape(
  imageData: ImageData,
  startingPoint: Point,
  {
    visitedPoints = new VisitedPoints(imageData.width, imageData.height),
    color = PIXEL_BLACK,
    maximumSkipDistance = 0,
    maximumAllowedSkipCount = 0,
  } = {}
): Shape {
  const toVisit: Point[] = [startingPoint]
  const points = new VisitedPoints(imageData.width, imageData.height)
  const { data, width, height } = imageData
  const channel = getImageChannelCount(imageData)

  const topEdge = new Int32Array(imageData.width).fill(imageData.height)
  const rightEdge = new Int32Array(imageData.height).fill(-1)
  const bottomEdge = new Int32Array(imageData.width).fill(-1)
  const leftBorder = new Int32Array(imageData.height).fill(imageData.width)
  let xMin = startingPoint.x
  let yMin = startingPoint.y
  let xMax = startingPoint.x
  let yMax = startingPoint.y
  let remainingSkipCount = maximumAllowedSkipCount

  for (let point: Point | undefined; (point = toVisit.shift()); point) {
    const { x, y } = point

    if (!visitedPoints.add(x, y)) {
      continue
    }

    const index = (x + y * width) * channel
    const isForeground = data[index] === color
    points.add(x, y, isForeground)

    if (isForeground) {
      if (x < xMin) {
        xMin = x
      }
      if (y < yMin) {
        yMin = y
      }
      if (x > xMax) {
        xMax = x
      }
      if (y > yMax) {
        yMax = y
      }
      if (x < leftBorder[y]) {
        leftBorder[y] = x
      }
      if (y < topEdge[x]) {
        topEdge[x] = y
      }
      if (x > rightEdge[y]) {
        rightEdge[y] = x
      }
      if (y > bottomEdge[x]) {
        bottomEdge[x] = y
      }

      let found = false
      for (const xD of [-1, 0, 1]) {
        for (const yD of [-1, 0, 1]) {
          const nextX = x + xD
          const nextY = y + yD

          if (
            nextX > 0 &&
            nextY > 0 &&
            nextX < width &&
            nextY < height &&
            data[(nextX + nextY * width) * channel] === color &&
            !points.has(nextX, nextY)
          ) {
            found = true
            toVisit.push({ x: nextX, y: nextY })
          }
        }
      }

      if (!found && remainingSkipCount > 0) {
        for (
          let xD = -maximumSkipDistance - 1;
          xD <= maximumSkipDistance + 1;
          xD++
        ) {
          for (
            let yD = -maximumSkipDistance - 1;
            yD <= maximumSkipDistance + 1;
            yD++
          ) {
            const nextX = x + xD
            const nextY = y + yD

            if (
              nextX > 0 &&
              nextY > 0 &&
              nextX < width &&
              nextY < height &&
              data[(nextX + nextY * width) * channel] === color &&
              !points.has(nextX, nextY)
            ) {
              found = true
              toVisit.push({ x: nextX, y: nextY })
            }
          }
        }

        if (found) {
          remainingSkipCount--
        }
      }
    }
  }

  return {
    bounds: {
      x: xMin,
      y: yMin,
      width: xMax - xMin + 1,
      height: yMax - yMin + 1,
    },
    edges: {
      top: topEdge,
      right: rightEdge,
      bottom: bottomEdge,
      left: leftBorder,
    },
  }
}

export interface ParseRectangleResult {
  isRectangle: boolean
  angles: [number, number, number, number]
}

/**
 * Determines whether the given corners make for a roughly rectangular shape.
 * The amount of allowed error can be controlled.
 *
 * @param corners the corners to check
 * @param param1.allowedErrorAngle the angle in radians to allow in error
 */
export function parseRectangle(
  corners: Corners,
  { allowedErrorAngle = (5 / 180) * Math.PI } = {}
): ParseRectangleResult {
  const [topLeft, topRight, bottomLeft, bottomRight] = corners
  const minAllowedRightAngle = Math.PI / 2 - allowedErrorAngle
  const maxAllowedRightAngle = Math.PI / 2 + allowedErrorAngle
  const topLeftAngle = angleBetweenPoints(bottomLeft, topLeft, topRight)
  const topRightAngle = angleBetweenPoints(topLeft, topRight, bottomRight)
  const bottomLeftAngle = angleBetweenPoints(bottomRight, bottomLeft, topLeft)
  const bottomRightAngle = angleBetweenPoints(topRight, bottomRight, bottomLeft)
  return {
    isRectangle:
      topLeftAngle >= minAllowedRightAngle &&
      topLeftAngle <= maxAllowedRightAngle &&
      topRightAngle >= minAllowedRightAngle &&
      topRightAngle <= maxAllowedRightAngle &&
      bottomLeftAngle >= minAllowedRightAngle &&
      bottomLeftAngle <= maxAllowedRightAngle &&
      bottomRightAngle >= minAllowedRightAngle &&
      bottomRightAngle <= maxAllowedRightAngle,
    angles: [topLeftAngle, topRightAngle, bottomLeftAngle, bottomRightAngle],
  }
}
