import { createContext } from "react";
import { identity } from "transformation-matrix";

export const ViewportContext = createContext({
  matrix: identity(),
  zoomPanMatrix: identity(),
  imageDimensions: { width: 0, height: 0 },
});
