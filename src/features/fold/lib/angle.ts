import { clamp } from "../../../shared/document";
export const normalizeAngle = (value: number) =>
  Number.isFinite(value) ? clamp(Math.round(value), -175, 175) : 0;
export const angleHint = (angle: number) =>
  Math.abs(angle) < 1
    ? "纸面平展"
    : Math.abs(angle) < 90
      ? "轻折 · 空间打开"
      : Math.abs(angle) < 150
        ? "深折 · 纸面靠拢"
        : "接近平折";
