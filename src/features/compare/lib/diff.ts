import type {
  Paper,
  Vec3,
  FaceDiff,
  CompareResult,
  Face,
} from "../../../shared/types";
import { solveTransforms } from "../../fold/lib/kinematics";
import { sub, add, scale } from "../../../shared/vector";
import { buildCorrespondence } from "./correspondence";

type Transform = (p: Vec3) => Vec3;
const centroid = (pts: Vec3[]): Vec3 =>
  scale(
    pts.reduce((acc, p) => add(acc, p), [0, 0, 0] as Vec3),
    1 / pts.length,
  );
const dist = (a: Vec3, b: Vec3) => Math.hypot(...sub(a, b));

/**
 * 仅由父纸面链带动的变换（剥掉当前折痕自身的旋转）。
 * full(p) = rotate(parent(p), hingeA, hingeB, θ)，
 * carried 即去掉绕铰链那一步、只保留 parent 的完整累积运动。
 */
function carriedTransform(face: Face, transforms: Map<string, Transform>): Transform {
  if (!face.parent) return (p) => p;
  const parent = transforms.get(face.parent)!;
  return (p) => parent(p);
}

/** 平展状态下整张纸的包围球半径，作为位移归一化尺度。 */
function flatScale(paper: Paper): number {
  const c = centroid(paper.faces.flatMap((f) => f.points));
  const r = Math.max(
    ...paper.faces.flatMap((f) => f.points.map((p) => dist(p, c))),
  );
  return r || 1;
}

export interface CompareInput {
  paper: Paper;
  angles: Record<string, number>;
}

/**
 * 比较两个版本：按同一张原始纸上的区域（face id）对应。
 * localAngle —— 当前折痕本身在两侧的相对旋转角之差；
 * carried    —— 剥掉自身折痕后，父纸面链带动的代表点位移；
 * total      —— 代表点在两版本间的总位移。
 */
export function computeCompare(
  left: CompareInput,
  right: CompareInput,
): CompareResult {
  const correspondence = buildCorrespondence(left.paper, right.paper);
  const tl = solveTransforms(left.paper, left.angles);
  const tr = solveTransforms(right.paper, right.angles);
  const scale = Math.max(flatScale(left.paper), flatScale(right.paper));

  const faceL = new Map(left.paper.faces.map((f) => [f.id, f]));
  const faceR = new Map(right.paper.faces.map((f) => [f.id, f]));

  const diffs: FaceDiff[] = correspondence.matched.map((id) => {
    const fl = faceL.get(id)!;
    const fr = faceR.get(id)!;
    const fullL = tl.get(id)!;
    const fullR = tr.get(id)!;
    const c0 = centroid(fl.points);

    const total = dist(fullL(c0), fullR(c0)) / scale;

    const carryL = carriedTransform(fl, tl)(c0);
    const carryR = carriedTransform(fr, tr)(c0);
    const carried = dist(carryL, carryR) / scale;

    // 当前折痕自身的相对旋转角（两侧折痕角度之差）；
    // 无折痕（根纸面或拓扑差异）时为 0，避免把带动误判成自身旋转。
    let localAngle = 0;
    if (fl.crease && fr.crease && fl.crease === fr.crease) {
      localAngle =
        (left.angles[fl.crease] ?? 0) - (right.angles[fr.crease] ?? 0);
    }

    return { id, localAngle, carried, total };
  });

  return {
    key: "",
    correspondence,
    diffs,
    scale,
  };
}

/** 供视图着色用：按当前度量取 0..1 的归一化差异值。 */
export function diffValue(diff: FaceDiff, metric: string): number {
  if (metric === "local") return Math.min(1, Math.abs(diff.localAngle) / 90);
  if (metric === "carried") return Math.min(1, diff.carried);
  return Math.min(1, diff.total);
}
