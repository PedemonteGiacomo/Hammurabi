import { use, memo } from "react";
import { applyToPoint } from "transformation-matrix";
import { ViewportContext } from "../FrameViewport";

export type Props = React.SVGProps<SVGCircleElement> & {
  readonly fixedSize?: boolean;
  readonly transformX?: number;
  readonly transformY?: number;
};
export type Ref = SVGCircleElement;

export const Circle: React.FC<Props> = memo(function Circle(props) {
  const {
    cx = 0,
    cy = 0,
    fill,
    r = 5,
    fixedSize = true,
    pointerEvents,
    transformX = 0,
    transformY = 0,
    ...rest
  } = props;

  const { matrix, zoomPanMatrix } = use(ViewportContext);
  const imagePoint = { x: +cx, y: +cy };
  const screenPoint = applyToPoint(matrix, imagePoint);
  const radius = fixedSize ? r : (r as number) * zoomPanMatrix.a;

  return (
    <circle
      data-point={`${cx.toString()},${cy.toString()}`}
      pointerEvents={pointerEvents ?? "initial"}
      cx={screenPoint.x + transformX}
      cy={screenPoint.y + transformY}
      fill={fill ?? "yellow"}
      r={radius}
      {...rest}
    />
  );
});
