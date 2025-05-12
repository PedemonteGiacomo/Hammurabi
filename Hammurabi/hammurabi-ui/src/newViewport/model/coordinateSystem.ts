import { transform, translate, scale, Matrix } from "transformation-matrix";

export function scaleToFit(
  srcWidth: number,
  srcHeight: number,
  dstWidth: number,
  dstHeight: number,
): Matrix {
  const dstRatio = dstWidth / dstHeight;
  const srcRatio = srcWidth / srcHeight;

  let scaledWidth = 0;
  let scaledHeight = 0;

  if (srcRatio > dstRatio) {
    scaledWidth = dstWidth;
    scaledHeight = dstWidth / srcRatio;
  } else {
    scaledWidth = dstHeight * srcRatio;
    scaledHeight = dstHeight;
  }

  const offsetX = (dstWidth - scaledWidth) / 2.0;
  const offsetY = (dstHeight - scaledHeight) / 2.0;

  const scaleX = scaledWidth / srcWidth;
  const scaleY = scaledHeight / srcHeight;

  const matrix = transform(
    translate(offsetX, offsetY),
    scale(Math.min(scaleX, scaleY)),
  );

  return matrix;
}
