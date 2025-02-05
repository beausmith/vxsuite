import { getImageChannelCount, isRgba, otsu } from '@votingworks/image-utils';
import { grayscale } from './grayscale';

export type RGBA = [number, number, number, number];

export const PIXEL_BLACK = 0;
export const PIXEL_WHITE = (1 << 8) - 1;
export const RGBA_BLACK: RGBA = [PIXEL_BLACK, PIXEL_BLACK, PIXEL_BLACK, 0xff];
export const RGBA_WHITE: RGBA = [PIXEL_WHITE, PIXEL_WHITE, PIXEL_WHITE, 0xff];

/**
 * Converts an image to a grayscale image with all pixels set to either black or
 * white, depending on whether their luminosity is higher or lower than
 * `threshold`. By default an automatic threshold is calculated using Otsu's
 * method.
 *
 * Operates on an image in-place by default, or you may specify a different
 * destination image.
 */
export function binarize(
  srcImageData: ImageData,
  dstImageData = srcImageData,
  { threshold }: { threshold?: number } = {}
): void {
  grayscale(srcImageData, dstImageData);

  const { data: dst } = dstImageData;
  const effectiveThreshold =
    threshold ?? otsu(dstImageData.data, getImageChannelCount(dstImageData));

  if (isRgba(dstImageData)) {
    const dst32 = new Int32Array(dst.buffer);
    const whiteU32 =
      PIXEL_WHITE | (PIXEL_WHITE << 8) | (PIXEL_WHITE << 16) | (0xff << 24);
    const blackU32 =
      PIXEL_BLACK | (PIXEL_BLACK << 8) | (PIXEL_BLACK << 16) | (0xff << 24);

    for (
      let offset32 = 0, offset8 = 0, size = dst32.length;
      offset32 < size;
      offset32 += 1, offset8 += 4
    ) {
      dst32[offset32] = dst[offset8] < effectiveThreshold ? blackU32 : whiteU32;
    }
  } else {
    for (let offset = 0, size = dst.length; offset < size; offset += 1) {
      dst[offset] =
        dst[offset] < effectiveThreshold ? PIXEL_BLACK : PIXEL_WHITE;
    }
  }
}
