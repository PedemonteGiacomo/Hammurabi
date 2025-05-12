import { useCallback, memo, useRef } from "react";
import { noop } from "../../constants";
import useAnimationFrame from "../../hooks/useAnimationFrame";
import { useEventCallback } from "../../hooks/useEventCallback";
import { LoopButton } from "./LoopButton";
import styles from "./Navigation.module.css";
import { ArrowButton } from "./ArrowButton";
import { Slider } from "../Slider";

const MIN_FRAME_RATE = 1;
const MAX_FRAME_RATE = 240;

const clamp = (v: number): number =>
  Math.max(Math.min(v, MAX_FRAME_RATE), MIN_FRAME_RATE);

export type Props = Readonly<{
  /**
   * A class name to style the navigation.
   */
  className?: string;
  /**
   * The index of the frame to visualize.
   */
  frameIndex: number;
  /**
   * The total number of frames.
   */
  numberOfFrames: number;
  /**
   * The amount of frames that are available to visualize.
   */
  numberOfAvailableFrames: number;
  /**
   * Indicators that are visualized on the slider.
   */
  frameIndicators?: readonly React.JSX.Element[];
  /**
   * Indicates whether the viewport should be looping.
   */
  isLooping: boolean;
  /**
   * The frame rate with which the viewport should loop.
   * @default 20
   */
  frameRate?: number;
  /**
   * Indicates that arrow buttons should be shown with which the frame index can be changed.
   * @default false
   */
  hasArrowButtons?: boolean;
  /**
   * Occurs when the frame index should change.
   * @param index The new frame index.
   */
  onFrameIndexChange?: (index: number) => void;
  /**
   * Occurs when the looping state should change.
   * @param isLooping The new looping state.
   */
  onIsLoopingChange?: (isLooping: boolean) => void;
  /**
   * Occurs when the frame rate should change.
   * @param frameRate The new frame rate.
   */
  onFrameRateChange?: (frameRate: number) => void;
}>;

/**
 * The navigation bar that can control the visualized frame.
 */
export const Navigation: React.FC<Props> = memo(function Navigation({
  className,
  frameIndex,
  numberOfFrames,
  numberOfAvailableFrames,
  frameIndicators,
  isLooping,
  frameRate = 20,
  hasArrowButtons = false,
  onFrameIndexChange = noop,
  onIsLoopingChange = noop,
  onFrameRateChange,
}) {
  const frameTime = 1000 / frameRate;
  const deltaRef = useRef(0);

  useAnimationFrame((delta) => {
    deltaRef.current += delta;

    if (deltaRef.current >= frameTime) {
      const next = frameIndex + Math.floor(deltaRef.current / frameTime);
      onFrameIndexChange(next % numberOfFrames);

      deltaRef.current = deltaRef.current % frameTime;
    }
  }, isLooping);

  const handleChange = useEventCallback(
    (value: number) => {
      if (isLooping) {
        onIsLoopingChange(false);
      }

      onFrameIndexChange(value);
    },
    [isLooping, onIsLoopingChange, onFrameIndexChange],
  );

  const toggleLooping = useCallback(() => {
    onIsLoopingChange(!isLooping);
  }, [onIsLoopingChange, isLooping]);

  const tracks = [
    {
      start: 0,
      end: frameIndex,
      color: "rgb(3, 105, 170)",
      cursor: "pointer",
    },
    {
      start: frameIndex,
      end: numberOfAvailableFrames - 1,
      color: "whitesmoke",
      cursor: "pointer",
    },
    {
      start: Math.max(frameIndex, numberOfAvailableFrames - 1),
      end: numberOfFrames - 1,
      color: "gray",
      cursor: "pointer",
    },
  ];

  const classes = [styles.navigation];
  if (className) {
    classes.push(className);
  }

  return (
    <div className={classes.join(" ")} data-testid="navigation">
      <div className={styles.frames}>
        {onFrameRateChange && (
          <>
            <input
              type="number"
              disabled={numberOfFrames <= 1}
              step={1}
              value={clamp(frameRate).toString()}
              onChange={(e) => {
                onFrameRateChange(clamp(+e.target.value));
              }}
              onWheel={(e) => {
                e.stopPropagation();
              }}
            />
            <div className={styles.fps}>fps</div>
          </>
        )}
        <div data-testid="current-frame">
          {frameIndex + 1} / {numberOfFrames}
        </div>
      </div>
      <div className={styles.loopingButtonSliderBox}>
        <LoopButton
          isLooping={isLooping}
          onClick={toggleLooping}
          disabled={numberOfFrames <= 1}
          className={styles.loopingButton}
        />
        <Slider
          className={styles.slider}
          value={frameIndex}
          max={numberOfFrames - 1}
          valueIndicators={frameIndicators}
          onChange={handleChange}
          tracks={tracks}
        />

        {hasArrowButtons && (
          <ArrowButton
            isRight={false}
            disabled={frameIndex < 1}
            onClick={() => {
              handleChange(frameIndex - 1);
            }}
            className={styles.arrowButton}
          />
        )}
        {hasArrowButtons && (
          <ArrowButton
            isRight={true}
            disabled={frameIndex >= numberOfFrames - 1}
            onClick={() => {
              handleChange(frameIndex + 1);
            }}
            className={styles.arrowButton}
          />
        )}
      </div>
    </div>
  );
});
