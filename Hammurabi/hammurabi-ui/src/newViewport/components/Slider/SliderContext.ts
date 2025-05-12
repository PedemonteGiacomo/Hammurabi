import { createContext } from "react";

export const SliderContext = createContext({
  indexToLeft: (index: number): number => index,
  leftToIndex: (left: number): number => left,
});
