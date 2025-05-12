import { describe, expect, it } from "vitest";
import { calcAngle, calcCenter, calcDistance } from "../gesture";

describe("gestures", () => {
  it("should calculate the center between 2 points", () => {
    expect(calcCenter({ x: 2, y: 5 }, { x: 4, y: 1 })).toEqual({ x: 3, y: 3 });
  });

  it("should calculate the distance between 2 points", () => {
    expect(calcDistance({ x: 4, y: 3 }, { x: 1, y: 7 })).toBe(5);
  });

  it("should calculate the angle between 2 points", () => {
    expect(calcAngle({ x: 1, y: 8 }, { x: 6, y: 3 })).toBe(-Math.PI / 4);
  });
});
