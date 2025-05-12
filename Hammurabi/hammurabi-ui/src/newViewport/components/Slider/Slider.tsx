import React, { memo, useCallback, useRef } from "react";
import { SliderThumb } from "./SliderThumb";
import { SliderTrack } from "./SliderTrack";
import { SliderContext } from "./SliderContext";

import styles from "./Slider.module.css";

export type Track = Readonly<{
  /**
   * The start index of the slider track.
   */
  start: number;
  /**
   * The end index of the slider track.
   */
  end: number;
  /**
   * The color of the slider track.
   */
  color: string;
  /**
   * The cursor of the slider track.
   */
  cursor?: string;
  /**
   * Indicates that the slider track should be disabled.
   */
  disabled?: boolean;
}>;

export type TestProps = {
  setValue?: (value: number) => void;
};

export type Props = Readonly<{
  /**
   * A class name to style the slider.
   */
  className?: string;
  /**
   * The current value of the slider.
   */
  value: number;
  /**
   * The maximum value of the slider.
   */
  max: number;
  /**
   * Indicators that are visualized on the slider.
   */
  valueIndicators?: readonly React.JSX.Element[];
  /**
   * Tracks that are used to visualize the slider.
   */
  tracks?: readonly Track[];
  /**
   * Occurs when the slider value should change.
   * @param value The new value of the slider.
   */
  onChange?: (value: number) => void;
}>;

/**
 * The slider component used for navigating through frames.
 */
export const Slider: React.FC<Props> = memo(function Slider({
  className,
  value,
  max,
  valueIndicators,
  onChange,
  tracks,
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);

  const leftToIndex = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track) throw Error("Track is null.");

      const offset = track.getBoundingClientRect().left;
      const width = track.offsetWidth;

      const x = clientX - offset;
      const clamped = Math.min(width, Math.max(0, x));
      const next = Math.round((clamped / width) * max);
      return next;
    },
    [max],
  );

  const context = React.useMemo(
    () => ({
      leftToIndex,
      indexToLeft: (index: number) => (index / max) * 100,
    }),
    [leftToIndex, max],
  );

  const updateValue = useCallback(
    (clientX: number) => {
      const next = leftToIndex(clientX);

      if (next !== value) {
        onChange?.(next);
      }
    },
    [leftToIndex, onChange, value],
  );

  const handlePointerDown = useCallback(
    (ev: React.PointerEvent) => {
      if (ev.button !== 0) return;
      ev.currentTarget.setPointerCapture(ev.pointerId);
      updateValue(ev.clientX);
    },
    [updateValue],
  );

  const handleTouchStart = useCallback(
    (ev: React.TouchEvent) => {
      updateValue(ev.targetTouches[0].clientX);
      isDragging.current = true;
    },
    [updateValue],
  );

  const handlePointerMove = useCallback(
    (ev: React.PointerEvent) => {
      if (ev.currentTarget.hasPointerCapture(ev.pointerId)) {
        updateValue(ev.clientX);
      }
    },
    [updateValue],
  );

  const handleTouchMove = useCallback(
    (ev: React.TouchEvent) => {
      if (isDragging.current) {
        updateValue(ev.targetTouches[0].clientX);
      }
    },
    [updateValue],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  const defaultTracks: readonly Track[] = [
    { start: 0, end: value, color: "rgb(3, 105, 170)", cursor: "pointer" },
    { start: value, end: max, color: "whitesmoke", cursor: "pointer" },
  ];

  const classes = [styles.slider];
  if (className) {
    classes.push(className);
  }
  if (isDragging.current) {
    classes.push(styles.dragging);
  }

  return (
    <SliderContext value={context}>
      <div
        className={classes.join(" ")}
        data-testid="slider"
        role="slider"
        ref={(node: (HTMLDivElement & TestProps) | null) => {
          if (node) {
            node.setValue = onChange;
          }
        }}
      >
        <div className={styles.trackContainer} ref={trackRef}>
          {max > 0 && (
            <div className={styles.tracks}>
              {(tracks ?? defaultTracks)
                .filter((track) => track.end - track.start > 0)
                .map((track, index) => (
                  <SliderTrack
                    key={index}
                    proportion={(track.end - track.start) / max}
                    color={track.color}
                    cursor={track.cursor}
                    disabled={track.disabled}
                    onPointerMove={handlePointerMove}
                    onTouchMove={handleTouchMove}
                    onPointerDown={handlePointerDown}
                    onTouchStart={handleTouchStart}
                    onPointerUp={handlePointerUp}
                    onTouchEnd={handleTouchEnd}
                  />
                ))}
            </div>
          )}
          {valueIndicators}
          {max > 0 && (
            <SliderThumb
              value={value}
              max={max}
              onPointerMove={handlePointerMove}
              onTouchMove={handleTouchMove}
              onPointerDown={handlePointerDown}
              onTouchStart={handleTouchStart}
              onPointerUp={handlePointerUp}
              onTouchEnd={handleTouchEnd}
            />
          )}
        </div>
      </div>
    </SliderContext>
  );
});
