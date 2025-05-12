import { memo } from "react";
import ChevronLeftIcon from "./chevron-left-solid.svg";
import ChevronRightIcon from "./chevron-right-solid.svg";

import classes from "./ArrowButton.module.css";

export type Props = Readonly<{
  className?: string;
  isRight: boolean;
  disabled: boolean;
  onClick: () => void;
}>;

export const ArrowButton: React.FC<Props> = memo(function ArrowButton(props) {
  const { className, isRight, onClick, disabled } = props;
  return (
    <div
      className={className}
      onClick={disabled ? undefined : onClick}
      data-testid={`${isRight ? "next" : "prev"}-button`}
      aria-label={isRight ? "Next" : "Previous"}
      aria-disabled={disabled}
      role="button"
    >
      <img
        src={isRight ? ChevronRightIcon : ChevronLeftIcon}
        alt={isRight ? "right" : "left"}
        className={`${classes.icon} ${disabled ? classes.disabled : ""}`}
      />
    </div>
  );
});
