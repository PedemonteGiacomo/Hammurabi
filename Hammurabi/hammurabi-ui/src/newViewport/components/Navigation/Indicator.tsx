import { use, memo } from "react";
import { IndicatorPointerEvent } from "../../types";
import { SliderContext } from "../Slider";

export type Props = Readonly<{
  /**
   * The index of the indicator on the slider.
   */
  index: number;
  /**
   * The minimum index that the indicator can be moved to.
   */
  minIndex?: number;
  /**
   * The maximum index that the indicator can be moved to.
   */
  maxIndex?: number;
  /**
   * Occurs when the indicator has been clicked on.
   * @param e The click event.
   */
  onClick?: (e: React.MouseEvent) => void;
  /**
   * Occurs when the indicator has been picked up.
   * @param e The event containing the index.
   */
  onPickup?: (e: IndicatorPointerEvent) => void;
  /**
   * Occurs when the indicator has been moved.
   * @param e The event containing the index.
   */
  onMove?: (e: IndicatorPointerEvent) => void;
  /**
   * Occurs when the indicator has been released.
   * @param e The event containing the index.
   */
  onRelease?: (e: IndicatorPointerEvent) => void;
}>;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * An indicator on the slider that, given a frame index, renders it's children centered on the slider.
 */
export const Indicator: React.FC<React.PropsWithChildren<Props>> = memo(
  function Indicator({
    index,
    minIndex = Number.MIN_VALUE,
    maxIndex = Number.MAX_VALUE,
    children,
    onClick,
    onPickup,
    onMove,
    onRelease,
  }) {
    const { indexToLeft, leftToIndex } = use(SliderContext);

    const handleIndicatorPointerDown = (e: React.PointerEvent): void => {
      e.currentTarget.setPointerCapture(e.pointerId);
      e.stopPropagation();

      const newIndex = leftToIndex(e.clientX);

      const clampedIndex = clamp(newIndex, minIndex, maxIndex);

      onPickup?.({ ...e, frameIndex: clampedIndex });
    };

    const handleIndicatorPointerMove = (e: React.PointerEvent): void => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        const newIndex = leftToIndex(e.clientX);

        const clampedIndex = clamp(newIndex, minIndex, maxIndex);

        if (index != newIndex) {
          onMove?.({ ...e, frameIndex: clampedIndex });
        }
      }
    };

    const handleIndicatorPointerUp = (e: React.PointerEvent): void => {
      e.currentTarget.releasePointerCapture(e.pointerId);
      const newIndex = leftToIndex(e.clientX);

      const clampedIndex = clamp(newIndex, minIndex, maxIndex);

      onRelease?.({ ...e, frameIndex: clampedIndex });
    };

    return (
      <div
        data-testid="frame-indicator"
        onClick={onClick}
        onPointerDown={onMove && handleIndicatorPointerDown}
        onPointerMove={onMove && handleIndicatorPointerMove}
        onPointerUp={onMove && handleIndicatorPointerUp}
        style={{
          position: "absolute",
          display: "flex",
          top: "50%",
          left: `${indexToLeft(index).toString()}%`,
          transform: "translate(-50%, -50%)",
          pointerEvents:
            (onClick ?? onPickup ?? onMove ?? onRelease) ? "auto" : "none",
        }}
      >
        {children}
      </div>
    );
  },
);
