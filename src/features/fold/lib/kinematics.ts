import type { Paper, PoseFace, Vec3 } from "../../../shared/types";
import { rotate, sub, cross, unit } from "../../../shared/vector";
type Transform = (p: Vec3) => Vec3;
export function solvePose(
  paper: Paper,
  angles: Record<string, number>,
): PoseFace[] {
  const transforms = new Map<string, Transform>(),
    pending = [...paper.faces],
    result: PoseFace[] = [];
  while (pending.length) {
    const i = pending.findIndex((f) => !f.parent || transforms.has(f.parent));
    if (i < 0) throw new Error("纸面连接关系不能成环");
    const f = pending.splice(i, 1)[0]!;
    const parent: Transform = f.parent ? transforms.get(f.parent)! : (p) => p;
    let transform = parent;
    if (f.hinge && f.crease) {
      const a = parent(f.hinge[0]),
        b = parent(f.hinge[1]),
        angle = angles[f.crease] ?? 0;
      transform = (p) => rotate(parent(p), a, b, angle);
    }
    transforms.set(f.id, transform);
    const points = f.points.map(transform);
    result.push({
      id: f.id,
      points,
      normal: unit(
        cross(sub(points[1]!, points[0]!), sub(points[2]!, points[0]!)),
      ),
    });
  }
  return result;
}
export function hingePositions(paper: Paper, pose: PoseFace[]) {
  return paper.creases.map((c) => {
    const base = paper.faces.find((f) => f.id === c.face)!;
    const face = pose.find((f) => f.id === c.face)!;
    const indices = base.hinge!.map((h) =>
      base.points.findIndex((p) => p.every((n, i) => n === h[i])),
    );
    return {
      id: c.id,
      a: face.points[indices[0]!]!,
      b: face.points[indices[1]!]!,
    };
  });
}
