import type { Vec3, View } from "../../../shared/types";
export function cameraPoint(p: Vec3, view: View): Vec3 {
  const a = (view.yaw * Math.PI) / 180,
    b = (view.pitch * Math.PI) / 180,
    x = p[0] * Math.cos(a) - p[2] * Math.sin(a),
    z = p[0] * Math.sin(a) + p[2] * Math.cos(a);
  return [
    x,
    p[1] * Math.cos(b) - z * Math.sin(b),
    p[1] * Math.sin(b) + z * Math.cos(b),
  ];
}
export function project(p: Vec3, view: View) {
  const c = cameraPoint(p, view);
  return {
    x: 400 + c[0] * 145 * view.zoom,
    y: 280 - c[1] * 145 * view.zoom,
    z: c[2],
  };
}
export function polygon(points: Vec3[], view: View) {
  return points
    .map((p) => {
      const v = project(p, view);
      return `${v.x},${v.y}`;
    })
    .join(" ");
}
