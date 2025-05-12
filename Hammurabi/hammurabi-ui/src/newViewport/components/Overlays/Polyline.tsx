import { use, memo } from "react";
import { applyToPoint } from "transformation-matrix";
import { ViewportContext } from "../FrameViewport";

export type Props = React.SVGProps<SVGPolylineElement> & {
  readonly transformX?: number;
  readonly transformY?: number;
};
export type Ref = SVGPolylineElement;

export const Polyline: React.FC<Props> = memo(function Polyline(props) {
  const {
    points,
    fill,
    stroke,
    strokeWidth,
    pointerEvents,
    transformX = 0,
    transformY = 0,
  } = props;

  const { matrix } = use(ViewportContext);
  const screenPoints = (points ?? "")
    .split(" ")
    .reduce((prv, cur) => {
      const components = cur.split(",");
      const imagePoint = { x: +components[0], y: +components[1] };
      const screenPoint = applyToPoint(matrix, imagePoint);
      return (prv += `${(screenPoint.x + transformX).toString()},${(screenPoint.y + transformY).toString()} `);
    }, "")
    .trim();

  return (
    <polyline
      {...props}
      data-points={points}
      pointerEvents={pointerEvents ?? "initial"}
      points={screenPoints}
      fill={fill ?? "transparent"}
      stroke={stroke ?? "yellow"}
      strokeWidth={strokeWidth ?? 3}
    />
  );
});
