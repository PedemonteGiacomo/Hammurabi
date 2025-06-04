import React, {
  useRef,
  memo,
  useState,
  useLayoutEffect,
  useMemo,
  useEffect,
  useImperativeHandle,
} from "react";
import {
  transform,
  translate,
  scale,
  toCSS,
  Matrix,
  applyToPoint,
  inverse,
} from "transformation-matrix";
import { calcCenter, calcDistance } from "../../model";
import * as ContrastBrightness from "../../model/contrastBrightness";
import {
  PanFactor,
  isZoomStep,
  Point,
  ViewportPointerEvent,
  ViewportMouseEvent,
  Cursor,
} from "../../types";
import { noop } from "../../constants";
import {
  MAX_ZOOM_STEP,
  useMatrices,
  ZOOM_STEP_SIZE,
} from "../../hooks/useMatrices";
import { ViewportContext } from "./ViewportContext";

export type TestProps = {
  pointerDown?: (ev: ViewportPointerEvent) => void;
  pointerUp?: (ev: ViewportPointerEvent) => void;
  pointerMove?: (ev: ViewportPointerEvent) => void;
  doubleClick?: (ev: ViewportMouseEvent) => void;
};

export type Props = React.PropsWithChildren<
  Readonly<{
    /**
     * A ref to the frame viewport with the ability to focus on a region.
     */
    ref?: React.Ref<Ref>;
    /**
     * A class name to style the frame viewport.
     */
    className?: string;
    /**
     * The cursor(s) that are shown when hovering over the viewport.
     */
    cursor?: Cursor;
    /**
     * The frame to visualize.
     *
     * Note: the image element is expected to have been loaded.
     */
    frame: HTMLImageElement;
    /**
     * The amount of steps to zoom in on the frame.
     * @default 0
     */
    zoomStep?: number;
    /**
     * The factor with which the frame should be panned.
     * @default { x: 0, y: 0 }
     */
    panFactor?: PanFactor;
    /**
     * The amount of contrast that should be applied to the frame.
     * @default 50
     */
    contrast?: number;
    /**
     * The amount of brightness that should be applied to the frame.
     * @default 50
     */
    brightness?: number;
    /**
     * The speed at which the contrast changes.
     * @default 10
     */
    contrastSensitivity?: number;
    /**
     * The speed at which the brightness changes.
     * @default 10
     */
    brightnessSensitivity?: number;
    /**
     * Flip the frame horizontal (x-axis).
     * @default false
     */
    flipHorizontal?: boolean;
    /**
     * Flip the frame vertical (y-axis).
     * @default false
     */
    flipVertical?: boolean;
    /**
     * Occurs when the zoom step should change.
     * @param zoomStep The new zoom step.
     * @param focus Indicates that the zoom step was changed by the focus region function.
     */
    onZoomStepChange?: (zoomStep: number, focus?: boolean) => void;
    /**
     * Occurs when the pan factor should change.
     * @param panFactor The new pan factor.
     * @param ev The event that trigged the change.
     * @param focus Indicates that the pan factor was changed by the focus region function.
     */
    onPanFactorChange?: (
      panFactor: PanFactor,
      ev?: ViewportPointerEvent,
      focus?: boolean,
    ) => void;
    /**
     * Occurs when the contrast should change.
     * @param contrast The new contrast value.
     * @param ev The event that trigged the change.
     */
    onContrastChange?: (contrast: number, ev: ViewportPointerEvent) => void;
    /**
     * Occurs when the brightness should change.
     * @param brightness The new brightness value.
     * @param ev The event that trigged the change.
     */
    onBrightnessChange?: (brightness: number, ev: ViewportPointerEvent) => void;
    /**
     * Occurs when the pointer goes down on the viewport.
     * @param ev The pointer event.
     */
    onPointerDown?: (ev: ViewportPointerEvent) => void;
    /**
     * Occurs when the pointer goes up on the viewport.
     * @param ev The pointer event.
     */
    onPointerUp?: (ev: ViewportPointerEvent) => void;
    /**
     * Occurs when the pointer moves over the viewport.
     * @param ev The pointer event.
     */
    onPointerMove?: (ev: ViewportPointerEvent) => void;
    /**
     * Occurs when there is double clicked on the viewport.
     * @param ev The mouse event.
     */
    onDoubleClick?: (ev: ViewportMouseEvent) => void;
  }>
>;

/**
 * A ref to the frame viewport with the ability to focus on a region.
 */
export type Ref =
  | Readonly<{
      focusRegion: (topLeft: Point, bottomRight: Point) => void;
    }>
  | undefined;

const initPanFactor = { x: 0, y: 0 };

/**
 * The frame viewport that can visualize a single frame.
 */
export const FrameViewport: React.FC<Props> = memo(
  function FrameViewport(props) {
    const {
      ref,
      className,
      children,
      cursor,
      frame,
      zoomStep = 0,
      panFactor = initPanFactor,
      contrast = ContrastBrightness.DEFAULT,
      brightness = ContrastBrightness.DEFAULT,
      contrastSensitivity = ContrastBrightness.SENSITIVITY,
      brightnessSensitivity = ContrastBrightness.SENSITIVITY,
      flipHorizontal = false,
      flipVertical = false,
      onZoomStepChange = noop,
      onPanFactorChange = noop,
      onContrastChange = noop,
      onBrightnessChange = noop,
      onPointerDown = noop,
      onPointerUp = noop,
      onPointerMove = noop,
      onDoubleClick = noop,
    } = props;

    if (!frame.complete) {
      throw Error("The image passed to the viewport has not been loaded yet.");
    }

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const panStartRef = useRef<Point>(undefined);
    const pinchStartPositions = useRef<Point[]>([]);
    const cbStartRef = useRef<[Point, number, number]>(undefined);
    const isMultiTouchSequence = useRef<boolean>(false);

    const [viewportSize, setViewportSize] = useState<{width: number; height: number}>({
      width : 0,
      height: 0,
    });

    useLayoutEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) throw Error("Canvas is null.");

      canvas.width = frame.naturalWidth;
      canvas.height = frame.naturalHeight;

      const context = canvas.getContext("2d");
      if (!context) throw Error("Context is null.");

      context.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
      context.drawImage(
        frame,
        flipHorizontal ? -frame.naturalWidth : 0,
        flipVertical ? -frame.naturalHeight : 0,
      );
    }, [frame, flipHorizontal, flipVertical]);

    const { zoomPanMatrix, viewportMatrix, fitImageMatrix } = useMatrices(
      viewportSize,
      { width: frame.naturalWidth, height: frame.naturalHeight },
      zoomStep,
      panFactor,
    );

    useLayoutEffect(() => {
      const canvas = canvasRef.current;
      const container = canvas?.parentElement;
      if (!container) throw Error("Container is null or undefined.");

      const { width, height } = container.getBoundingClientRect();
      setViewportSize({ width, height });
    }, []);

    useImperativeHandle(ref, () => {
      if (viewportSize.width <= 0 || viewportSize.height <= 0) return undefined;

      return {
        focusRegion(topLeft: Point, bottomRight: Point) {
          const regionHeight = bottomRight.y - topLeft.y;
          const regionWidth = bottomRight.x - topLeft.x;
          const regionCenter = {
            x: topLeft.x + regionWidth / 2,
            y: topLeft.y + regionHeight / 2,
          };

          const topLeftScreen = applyToPoint(viewportMatrix, topLeft);
          const bottomRightScreen = applyToPoint(viewportMatrix, bottomRight);

          const regionHeightScreen = bottomRightScreen.y - topLeftScreen.y;
          const regionWidthScreen = bottomRightScreen.x - topLeftScreen.x;

          const wRatio = viewportSize.width / regionWidthScreen;
          const hRatio = viewportSize.height / regionHeightScreen;
          const scaleFactor = wRatio < hRatio ? wRatio : hRatio;

          const maxScale =
            (ZOOM_STEP_SIZE ** MAX_ZOOM_STEP * fitImageMatrix.a) /
            viewportMatrix.a;

          const clampedScaleFactor = Math.max(
            Math.min(scaleFactor, maxScale),
            0,
          );

          const matrix = transform(scale(clampedScaleFactor), viewportMatrix);

          const regionCenterScreen = applyToPoint(matrix, regionCenter);
          const viewportCenterScreen = {
            x: viewportSize.width / 2,
            y: viewportSize.height / 2,
          };

          const offsetX = viewportCenterScreen.x - regionCenterScreen.x;
          const offsetY = viewportCenterScreen.y - regionCenterScreen.y;

          const nextMatrix = transform(translate(offsetX, offsetY), matrix);
          const nextZoomPanMatrix = transform(
            inverse(fitImageMatrix),
            nextMatrix,
          );

          onZoomStepChange(toFactor(nextZoomPanMatrix.a), true);
          onPanFactorChange(getPanFactor(nextZoomPanMatrix), undefined, true);
        },
      };
    });

    useEffect(() => {
      let isMounted = true;
      const canvas = canvasRef.current;
      const container = canvas?.parentElement;
      if (!container) throw Error("Container is null or undefined.");

      const observerCallback = () => {
        const rect = container.getBoundingClientRect();
          if (
            rect.width !== viewportSize.width ||
            rect.height !== viewportSize.height
          ) {
            setViewportSize({ width: rect.width, height: rect.height });
          }
      };

      const resizeObserver =
        "ResizeObserver" in window
          ? new ResizeObserver(observerCallback)
          : null;

      resizeObserver?.observe(container);
      return () => {
        resizeObserver?.disconnect();
        isMounted = false;
      };
    }, [viewportSize]);

    function getImagePosition(
      ev: React.MouseEvent | Touch | MouseEvent,
    ): Point {
      const rect = canvasRef.current!.parentElement!.getBoundingClientRect();
      const { left, top } = rect;

      const x = ev.clientX - left;
      const y = ev.clientY - top;

      return applyToPoint(inverse(viewportMatrix), { x, y });
    }

    function getPanFactor(m: Matrix): Point {
      return { x: m.e, y: m.f };
    }

    // Zooming by mouse wheel.
    function handleWheel(ev: React.WheelEvent): void {
      // Do not allow zooming while panning.
      if (panStartRef.current) return;

      const step = ev.deltaY < 0 ? zoomStep + 1 : zoomStep - 1;

      // Reset to initial when zooming out completely.
      if (step <= 0) {
        onZoomStepChange(0);
        onPanFactorChange({ x: 0, y: 0 });
        return;
      }

      // Ensure that the step does not go out of range.
      if (!isZoomStep(step)) return;

      const pos = getImagePosition(ev);
      const stepSize = ev.deltaY < 0 ? ZOOM_STEP_SIZE : 1 / ZOOM_STEP_SIZE;

      // Point zoom by moving to the mouse position,
      // scaling and moving back to the initial position.
      const next = transform(
        zoomPanMatrix,
        translate(pos.x, pos.y),
        scale(stepSize),
        translate(-pos.x, -pos.y),
      );

      onZoomStepChange(step);
      onPanFactorChange(getPanFactor(next));
    }

    const isOnImage = (position: Point): boolean =>
      position.x >= 0 &&
      position.x <= frame.naturalWidth &&
      position.y >= 0 &&
      position.y <= frame.naturalHeight;

    function toFactor(value: number): number {
      return Math.log(value) / Math.log(ZOOM_STEP_SIZE);
    }

    function handleTouchStart(ev: React.TouchEvent): void {
      handleTouchStartAndEnd(ev);

      isMultiTouchSequence.current =
        isMultiTouchSequence.current || ev.touches.length > 1;
    }

    function handleTouchEnd(ev: React.TouchEvent): void {
      handleTouchStartAndEnd(ev);

      isMultiTouchSequence.current =
        isMultiTouchSequence.current && ev.touches.length > 0;
    }

    function handleTouchStartAndEnd(ev: React.TouchEvent): void {
      pinchStartPositions.current = Array.from(ev.touches).map(
        getImagePosition,
      );
    }

    function handleTouchMove(ev: React.TouchEvent): void {
      if (ev.touches.length < 2) {
        return;
      }

      // Start positions are in image coordinate system.
      const start1 = pinchStartPositions.current[0];
      const start2 = pinchStartPositions.current[1];

      // Current position in image coorinate system related to the previous pinch.
      const p1 = getImagePosition(ev.touches[0]);
      const p2 = getImagePosition(ev.touches[1]);

      // Calculate the center of both.
      const center = calcCenter(p1, p2);
      const prevCenter = calcCenter(start1, start2);

      // Calculate eucledian distance.
      const distance = calcDistance(p1, p2);
      const prevDistance = calcDistance(start1, start2);

      const distanceFactor = distance / prevDistance;

      const panX = center.x - prevCenter.x;
      const panY = center.y - prevCenter.y;

      const m = transform(
        zoomPanMatrix,
        translate(center.x, center.y),
        scale(distanceFactor),
        translate(-center.x, -center.y),
        translate(panX, panY),
      );

      let pinchZoomStep = toFactor(m.a);
      let pinchPanFactor = getPanFactor(m);

      // Ensure that the step does not go out of range.
      if (pinchZoomStep <= 0) {
        pinchZoomStep = 0;
        pinchPanFactor = { x: 0, y: 0 };
      }

      if (pinchZoomStep >= 10) {
        return;
      }

      if (zoomStep !== pinchZoomStep) {
        onZoomStepChange(pinchZoomStep);
      }
      if (
        panFactor.x !== pinchPanFactor.x ||
        panFactor.y !== pinchPanFactor.y
      ) {
        onPanFactorChange(pinchPanFactor);
      }
    }

    function handlePointerDown(ev: React.PointerEvent): void {
      if (isMultiTouchSequence.current) return;

      const position = getImagePosition(ev);

      // Start panning when zoomed.
      if (zoomStep !== 0) {
        panStartRef.current = position;
      }

      // Set screen position and contrast / brightness.
      const screenPosition = { x: ev.clientX, y: ev.clientY };
      cbStartRef.current = [screenPosition, contrast, brightness];

      onPointerDown({
        ...ev,
        position,
        isOverImage: isOnImage(position),
      });
    }

    function handlePointerUp(ev: React.PointerEvent): void {
      if (isMultiTouchSequence.current) return;

      const position = getImagePosition(ev);

      // Stop panning.

      panStartRef.current = undefined;
      cbStartRef.current = undefined;

      onPointerUp({
        ...ev,
        position,
        isOverImage: isOnImage(position),
      });
    }

    function handlePointerMove(ev: React.PointerEvent): void {
      if (isMultiTouchSequence.current) return;

      const position = getImagePosition(ev);
      const viewportPointerEvent = {
        ...ev,
        position,
        isOverImage: isOnImage(position),
      };

      if (panStartRef.current && ev.pointerType === "mouse") {
        const start = panStartRef.current;
        const pos = getImagePosition(ev);
        // Pan by moving the difference
        // between the current and start position.
        const tx = pos.x - start.x;
        const ty = pos.y - start.y;
        const next = transform(zoomPanMatrix, translate(tx, ty));
        const nextPanFactor = getPanFactor(next);
        onPanFactorChange(nextPanFactor, viewportPointerEvent);
      }

      if (cbStartRef.current && ev.pointerType === "mouse") {
        const [start, contrast, brightness] = cbStartRef.current;
        const dx = (ev.clientX - start.x) / contrastSensitivity;
        const dy = (ev.clientY - start.y) / brightnessSensitivity;
        const c = ContrastBrightness.clamp(contrast - dx);
        const b = ContrastBrightness.clamp(brightness + dy);
        onContrastChange(c, viewportPointerEvent);
        onBrightnessChange(b, viewportPointerEvent);
      }

      onPointerMove({
        ...ev,
        position,
        isOverImage: isOnImage(position),
      });
    }

    function handleDoubleClick(ev: React.MouseEvent): void {
      const position = getImagePosition(ev);

      onDoubleClick({
        ...ev,
        position,
        isOverImage: isOnImage(position),
      });
    }

    let viewportAreaCursor, imageAreaCursor;
    if (cursor) {
      if (typeof cursor === "string") {
        viewportAreaCursor = cursor;
      } else {
        viewportAreaCursor = cursor.viewportArea;
        imageAreaCursor = cursor.imageArea;
      }
    }

    const context = useMemo(() => {
      return {
        matrix: viewportMatrix,
        zoomPanMatrix,
        imageDimensions: {
          width: frame.naturalWidth,
          height: frame.naturalHeight,
        },
      };
    }, [
      viewportMatrix,
      zoomPanMatrix,
      frame.naturalWidth,
      frame.naturalHeight,
    ]);

    const c = ContrastBrightness.toFactor(contrast);
    const b = ContrastBrightness.toFactor(brightness);

    return (
      <ViewportContext value={context}>
        <div
          ref={(node: (HTMLDivElement & TestProps) | null) => {
            if (node) {
              node.pointerDown = onPointerDown;
              node.pointerUp = onPointerUp;
              node.pointerMove = onPointerMove;
              node.doubleClick = onDoubleClick;
            }
          }}
          className={className}
          style={{
            background: "black",
            cursor: viewportAreaCursor,
            height: "100%",
            overflow: "hidden",
            position: "relative",
            touchAction: "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleDoubleClick}
          onWheel={handleWheel}
          data-testid="frame-viewport"
          data-zoomstep={zoomStep}
          data-panfactor={`${panFactor.x.toString()},${panFactor.y.toString()}`}
          data-flip={`${flipHorizontal.toString()},${flipVertical.toString()}`}
        >
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              cursor: imageAreaCursor,
              transform: toCSS(viewportMatrix),
              transformOrigin: "0 0",
              filter: `contrast(${c.toString()}) brightness(${b.toString()})`,
            }}
          />
          <svg
            width="100%"
            height="100%"
            pointerEvents="none"
            style={{ position: "absolute" }}
          >
            {children}
          </svg>
        </div>
      </ViewportContext>
    );
  },
);
