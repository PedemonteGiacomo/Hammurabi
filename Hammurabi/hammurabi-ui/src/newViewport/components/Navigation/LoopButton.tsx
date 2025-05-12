import { memo } from "react";
import PlayIcon from "./play-solid.svg";
import StopIcon from "./stop-solid.svg";

import classes from "./LoopButton.module.css";

export type Props = Readonly<{
  className?: string;
  isLooping: boolean;
  disabled: boolean;
  onClick: () => void;
}>;

export const LoopButton: React.FC<Props> = memo(function LoopButton(props) {
  const { className, isLooping, onClick, disabled } = props;
  return (
    <div
      className={className}
      onClick={disabled ? undefined : onClick}
      data-testid={`${isLooping ? "stop" : "play"}-button`}
      aria-disabled={disabled}
      aria-label={isLooping ? "Stop" : "Play"}
      role="button"
    >
      <img
        src={isLooping ? StopIcon : PlayIcon}
        alt={isLooping ? "stop" : "play"}
        className={`${classes.icon} ${disabled ? classes.disabled : ""}`}
      />
    </div>
  );
});
