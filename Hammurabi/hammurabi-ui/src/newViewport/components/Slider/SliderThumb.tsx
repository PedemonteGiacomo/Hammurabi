import { memo } from "react";

import styles from "./Slider.module.css";

type Props = Readonly<{
  value: number;
  max: number;
  onPointerMove: React.PointerEventHandler;
  onTouchMove: React.TouchEventHandler;
  onPointerDown: React.PointerEventHandler;
  onTouchStart: React.TouchEventHandler;
  onPointerUp: React.PointerEventHandler;
  onTouchEnd: React.TouchEventHandler;
}>;

export const SliderThumb: React.FC<Props> = memo(function SliderThumb({
  value,
  max,
  ...props
}) {
  const left = `${((value / max) * 100).toString()}%`;

  return (
    <div
      className={styles.thumb}
      style={{ left }}
      data-testid="thumb"
      onPointerMove={props.onPointerMove}
      onTouchMove={props.onTouchMove}
      onPointerDown={props.onPointerDown}
      onTouchStart={props.onTouchStart}
      onPointerUp={props.onPointerUp}
      onTouchEnd={props.onTouchEnd}
    >
      <div className={styles.circle} />
    </div>
  );
});
