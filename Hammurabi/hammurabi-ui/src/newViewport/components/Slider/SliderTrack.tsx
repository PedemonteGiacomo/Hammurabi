import { memo } from "react";

import styles from "./Slider.module.css";

type Props = Readonly<{
  proportion: number;
  color: string;
  cursor?: string;
  disabled?: boolean;
  onPointerMove: React.PointerEventHandler;
  onTouchMove: React.TouchEventHandler;
  onPointerDown: React.PointerEventHandler;
  onTouchStart: React.TouchEventHandler;
  onPointerUp: React.PointerEventHandler;
  onTouchEnd: React.TouchEventHandler;
}>;

export const SliderTrack: React.FC<Props> = memo(function SliderTrack({
  proportion,
  color,
  cursor,
  disabled,
  ...props
}) {
  return (
    <div
      className={styles.track}
      data-testid="track"
      style={{ cursor, flex: proportion }}
      onPointerMove={disabled ? undefined : props.onPointerMove}
      onTouchMove={disabled ? undefined : props.onTouchMove}
      onPointerDown={disabled ? undefined : props.onPointerDown}
      onTouchStart={disabled ? undefined : props.onTouchStart}
      onPointerUp={disabled ? undefined : props.onPointerUp}
      onTouchEnd={disabled ? undefined : props.onTouchEnd}
    >
      <div style={{ background: color }} />
    </div>
  );
});
