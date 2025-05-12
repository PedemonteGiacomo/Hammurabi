import { describe, expect, it } from "vitest";
import { scaleToFit } from "../coordinateSystem";

describe("coordinate system", () => {
  it("should shrink the source to the destination", () => {
    const srcWidth = 500;
    const srcHeight = 200;
    const dstWidth = 100;
    const dstHeight = 40;

    const matrix = scaleToFit(srcWidth, srcHeight, dstWidth, dstHeight);

    expect(matrix).toEqual({
      a: 0.2,
      b: 0,
      c: 0,
      d: 0.2,
      e: 0,
      f: 0,
    });
  });

  it("should enlarge the source to the destination", () => {
    const srcWidth = 125;
    const srcHeight = 200;
    const dstWidth = 500;
    const dstHeight = 800;

    const matrix = scaleToFit(srcWidth, srcHeight, dstWidth, dstHeight);

    expect(matrix).toEqual({
      a: 4,
      b: 0,
      c: 0,
      d: 4,
      e: 0,
      f: 0,
    });
  });

  it("should center the source horizontally in the destination", () => {
    const srcWidth = 300;
    const srcHeight = 300;
    const dstWidth = 500;
    const dstHeight = 300;

    const matrix = scaleToFit(srcWidth, srcHeight, dstWidth, dstHeight);

    expect(matrix).toEqual({
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: 100,
      f: 0,
    });
  });

  it("should center the source vertically in the destination", () => {
    const srcWidth = 425;
    const srcHeight = 150;
    const dstWidth = 425;
    const dstHeight = 650;

    const matrix = scaleToFit(srcWidth, srcHeight, dstWidth, dstHeight);

    expect(matrix).toEqual({
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: 0,
      f: 250,
    });
  });

  it("should scale and center the source to the destination", () => {
    const srcWidth = 160;
    const srcHeight = 540;
    const dstWidth = 720;
    const dstHeight = 270;

    const matrix = scaleToFit(srcWidth, srcHeight, dstWidth, dstHeight);

    expect(matrix).toEqual({
      a: 0.5,
      b: 0,
      c: 0,
      d: 0.5,
      e: 320,
      f: 0,
    });
  });
});
