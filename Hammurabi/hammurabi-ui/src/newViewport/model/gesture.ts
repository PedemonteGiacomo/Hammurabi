import { Point } from "../types";

export const calcCenter = (p1: Point, p2: Point): Point => {
  const halfCenterX = Math.abs(p1.x - p2.x) / 2;
  const halfCenterY = Math.abs(p1.y - p2.y) / 2;

  const centerX = Math.min(p1.x, p2.x) + halfCenterX;
  const centerY = Math.min(p1.y, p2.y) + halfCenterY;

  return { x: centerX, y: centerY };
};

export const calcDistance = (p1: Point, p2: Point): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  return Math.sqrt(dx * dx + dy * dy);
};

export const calcAngle = (p1: Point, p2: Point): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  return Math.atan2(dy, dx);
};
