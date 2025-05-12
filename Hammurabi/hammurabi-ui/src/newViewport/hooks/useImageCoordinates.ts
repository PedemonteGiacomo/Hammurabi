import { RefObject, use, useRef, useCallback } from "react";
import { applyToPoint, inverse } from "transformation-matrix";
import { ViewportContext } from "../components/FrameViewport";
import { Point, Size } from "../types";

export type UseImageCoordinates = (
  overlay: RefObject<SVGElement | null>,
) => ToImage;

export type ToImage = (
  x: number,
  y: number,
) => { position: Point; isOverImage: boolean; imageSize: Size };

/**
 * A hook to retrieve a function for a given overlay
 * that converts a mouse (or pointer) event to an image position.
 */
const useImageCoordinates: UseImageCoordinates = (overlay) => {
  const context = use(ViewportContext);
  const contextRef = useRef(context);
  contextRef.current = context;

  return useCallback(
    (x, y) => {
      const element = overlay.current;
      const svg = element?.ownerSVGElement;
      if (!svg) throw Error("SVG is null or undefined.");
      const bounds = svg.getBoundingClientRect();

      const screenX = x - bounds.left;
      const screenY = y - bounds.top;

      const { matrix, imageDimensions } = contextRef.current;
      const screenPoint = { x: screenX, y: screenY };
      const imagePoint = applyToPoint(inverse(matrix), screenPoint);
      const isOverImage =
        imagePoint.x >= 0 &&
        imagePoint.x <= imageDimensions.width &&
        imagePoint.y >= 0 &&
        imagePoint.y <= imageDimensions.height;

      return {
        position: imagePoint,
        isOverImage,
        imageSize: {
          width: imageDimensions.width,
          height: imageDimensions.height,
        },
      };
    },
    [overlay],
  );
};

export default useImageCoordinates;
