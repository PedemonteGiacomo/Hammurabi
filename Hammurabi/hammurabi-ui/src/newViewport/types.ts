import { MAX_ZOOM_STEP, MIN_ZOOM_STEP } from "./hooks/useMatrices";

export type Point = Readonly<{
  x: number;
  y: number;
}>;

export type Size = Readonly<{
  width: number;
  height: number;
}>;

export type PanFactor = Readonly<{
  /** A factor of the frame width with which a frame should be panned. */
  x: number;
  /** A factor of the frame height with which a frame should be panned. */
  y: number;
}>;

export function isZoomStep(step: number): boolean {
  return step >= MIN_ZOOM_STEP && step <= MAX_ZOOM_STEP;
}

export type ViewportEvent = Readonly<{
  /** The position of the pointer in image coordinates. */
  position: Point;
  /** Indication whether the position is over the image. */
  isOverImage: boolean;
}>;

export type ViewportPointerEvent = React.PointerEvent & ViewportEvent;
export type ViewportMouseEvent = React.MouseEvent & ViewportEvent;

/**
 * Defines a single cursor for the complete viewport or
 * a separate cursor for the image area and the remaining viewport area.
 */
export type Cursor =
  | string
  | Readonly<{ imageArea: string; viewportArea: string }>;

export type IndicatorEvent = Readonly<{
  /** The frame index of the pointer event. */
  frameIndex: number;
}>;

export type IndicatorPointerEvent = React.PointerEvent & IndicatorEvent;
