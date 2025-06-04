import { useContext, memo } from "react";
import { applyToPoint } from "transformation-matrix";
import { ViewportContext } from "../FrameViewport";

export type Props = React.SVGProps<SVGTextElement> & {
  readonly transformX?: number;
  readonly transformY?: number;
};
export type Ref = SVGTextElement;

export const Text: React.FC<Props> = memo(function Text(props) {
  const {
    x = 0,
    y = 0,
    fill,
    pointerEvents,
    transformX = 0,
    transformY = 0,
  } = props;

  const { matrix } = useContext(ViewportContext);
  const imagePoint = { x: +x, y: +y };
  const screenPoint = applyToPoint(matrix, imagePoint);

  return (
    <text
      {...props}
      pointerEvents={pointerEvents ?? "initial"}
      x={screenPoint.x + transformX}
      y={screenPoint.y + transformY}
      fill={fill ?? "white"}
    />
  );
});
