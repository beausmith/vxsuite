import { isRgba } from '@votingworks/image-utils';
import {
  assertGrayscaleImage,
  assertRgbaImage,
  assertSizesMatch,
  makeInPlaceImageTransform,
} from './image_format_utils';

/**
 * Copies a grayscale image to a destination.
 */
export function fromGray(
  srcImageData: ImageData,
  dstImageData = srcImageData
): void {
  assertGrayscaleImage(srcImageData);
  assertGrayscaleImage(dstImageData);
  assertSizesMatch(srcImageData, dstImageData);

  if (srcImageData === dstImageData) {
    return;
  }

  dstImageData.data.set(srcImageData.data);
}

/**
 * Converts an RGBA image to grayscale. If the destination image is a
 * single-channel image, the alpha channel is ignored.
 *
 * Operates on the image in-place by default, or a different destination image
 * may be provided.
 */
export function fromRgba(
  srcImageData: ImageData,
  dstImageData = srcImageData
): void {
  assertRgbaImage(srcImageData);
  assertSizesMatch(srcImageData, dstImageData);

  const src32 = new Int32Array(srcImageData.data.buffer);

  if (isRgba(dstImageData)) {
    const dst32 = new Int32Array(dstImageData.data.buffer);
    for (let offset = 0, size = src32.length; offset < size; offset += 1) {
      const px = src32[offset];
      const r = px & 0xff;
      const g = (px >>> 8) & 0xff;
      const b = (px >>> 16) & 0xff;
      const a = (px >>> 24) & 0xff;

      // Luminosity grayscale formula.
      const luminosity = (0.21 * r + 0.72 * g + 0.07 * b) | 0;
      dst32[offset] =
        luminosity | (luminosity << 8) | (luminosity << 16) | (a << 24);
    }
  } else {
    const dst8 = dstImageData.data;
    for (let offset = 0, size = src32.length; offset < size; offset += 1) {
      const px = src32[offset];
      const r = px & 0xff;
      const g = (px >>> 8) & 0xff;
      const b = (px >>> 16) & 0xff;

      // Luminosity grayscale formula.
      const luminosity = (0.21 * r + 0.72 * g + 0.07 * b) | 0;
      dst8[offset] = luminosity;
    }
  }
}

export const grayscale = makeInPlaceImageTransform(fromGray, fromRgba);
