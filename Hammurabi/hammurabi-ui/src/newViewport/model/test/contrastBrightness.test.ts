import { describe, expect, it } from "vitest";
import { clamp, toFactor } from "../contrastBrightness";

describe("contrast brightness", () => {
  it("should clamp a value to the minimum contrast brightness value", () => {
    expect(clamp(-10)).toBe(0);
  });

  it("should clamp a value to the maximum contrast brightness value", () => {
    expect(clamp(500)).toBe(100);
  });

  it.each([
    [0, 0],
    [25, 0.5],
    [50, 1],
    [75, 2],
    [90, 5],
    [95, 10],
    [99, 50],
  ])("should translate a value (%d) to a factor (%d)", (value, factor) => {
    expect(toFactor(value)).toBeCloseTo(factor, 8);
  });
});
