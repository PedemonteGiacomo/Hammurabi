import { use, memo } from "react";
import { applyToPoint } from "transformation-matrix";
import { ViewportContext } from "../FrameViewport";

export type Props = React.SVGProps<SVGImageElement> & {
  readonly transformX?: number;
  readonly transformY?: number;
};
export type Ref = SVGImageElement;

export const Image: React.FC<Props> = memo(function Image(props) {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    transformX = 0,
    transformY = 0,
    ...rest
  } = props;

  const { matrix } = use(ViewportContext);
  const leftTop = { x: +x, y: +y };
  const rightBottom = { x: +x + +width, y: +y + +height };
  const leftTopPoint = applyToPoint(matrix, leftTop);
  const rightBottomPoint = applyToPoint(matrix, rightBottom);
  const w = rightBottomPoint.x - leftTopPoint.x;
  const h = rightBottomPoint.y - leftTopPoint.y;

  return (
    <image
      x={leftTopPoint.x + transformX}
      y={leftTopPoint.y + transformY}
      width={w}
      height={h}
      opacity={0.5}
      {...rest}
    />
  );
});
