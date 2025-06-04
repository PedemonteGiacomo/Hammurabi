import { useContext, memo } from "react";
import { applyToPoint } from "transformation-matrix";
import { ViewportContext } from "../FrameViewport";

export type Props = React.SVGProps<HTMLTextAreaElement> & {
  readonly transformX?: number;
  readonly transformY?: number;
};
export type Ref = HTMLTextAreaElement;

export const InputField: React.FC<Props> = memo(function InputField(props) {
  const {
    x = 0,
    y = 0,
    width = 80,
    height = 20,
    pointerEvents,
    style,
    transformX = 0,
    transformY = 0,
  } = props;

  const { matrix } = useContext(ViewportContext);
  const imagePoint = { x: +x, y: +y };
  const screenPoint = applyToPoint(matrix, imagePoint);

  return (
    <foreignObject
      x={screenPoint.x + transformX}
      y={screenPoint.y + transformY}
      width={width}
      height={height}
      style={{ position: "absolute" }}
      pointerEvents={pointerEvents ?? "initial"}
    >
      <textarea
        {...props}
        style={{
          ...style,
          width,
          height,
          transform: "none",
        }}
      />
    </foreignObject>
  );
});
