import { useMemo } from "react";
import {
  identity,
  Matrix,
  scale,
  transform,
  translate,
} from "transformation-matrix";
import { scaleToFit } from "../model";
import { PanFactor, Size } from "../types";

export const ZOOM_STEP_SIZE = 1.25;
export const MIN_ZOOM_STEP = 0;
export const MAX_ZOOM_STEP = 10;

export type ViewportMatrices = Readonly<{
  zoomPanMatrix: Matrix;
  fitImageMatrix: Matrix;
  viewportMatrix: Matrix;
}>;

/**
 * A hook to retrieve matrices for the positioning of overlay elements.
 */
export function useMatrices(
  viewportSize: Size,
  frameSize: Size,
  zoomStep: number,
  panFactor: PanFactor,
) {
  const fitImageMatrix = useMemo(() => {
    if (!viewportSize.width || !viewportSize.height) {
      return identity();
    }

    return scaleToFit(
      frameSize.width,
      frameSize.height,
      viewportSize.width,
      viewportSize.height,
    );
  }, [frameSize, viewportSize]);

  const zoomPanMatrix = useMemo(() => {
    return transform(
      translate(panFactor.x, panFactor.y),
      scale(Math.pow(ZOOM_STEP_SIZE, zoomStep)),
    );
  }, [zoomStep, panFactor]);

  const viewportMatrix = useMemo(() => {
    return transform(fitImageMatrix, zoomPanMatrix);
  }, [fitImageMatrix, zoomPanMatrix]);

  return { fitImageMatrix, zoomPanMatrix, viewportMatrix };
}
