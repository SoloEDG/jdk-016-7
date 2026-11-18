import type { Vec3 } from "./types";
export const add = (a: Vec3, b: Vec3): Vec3 => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
];
export const sub = (a: Vec3, b: Vec3): Vec3 => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
];
export const scale = (a: Vec3, s: number): Vec3 => [
  a[0] * s,
  a[1] * s,
  a[2] * s,
];
export const dot = (a: Vec3, b: Vec3) =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const unit = (v: Vec3): Vec3 => scale(v, 1 / (Math.hypot(...v) || 1));
export function rotate(p: Vec3, a: Vec3, b: Vec3, angle: number): Vec3 {
  const k = unit(sub(b, a)),
    v = sub(p, a),
    r = (angle * Math.PI) / 180,
    c = Math.cos(r),
    s = Math.sin(r);
  return add(
    a,
    add(add(scale(v, c), scale(cross(k, v), s)), scale(k, dot(k, v) * (1 - c))),
  );
}
