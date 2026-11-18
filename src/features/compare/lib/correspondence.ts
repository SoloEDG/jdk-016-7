import type { Paper, Correspondence } from "../../../shared/types";

/**
 * 按同一张原始纸上的区域（face id）建立对应关系，
 * 而不是按画面中最近的三角形配对。
 * 只有 id 相同的纸面才被视为同一区域；换过纸张拓扑后，
 * 无对应的纸面单列出来，不参与误差计算。
 */
export function buildCorrespondence(
  left: Paper,
  right: Paper,
): Correspondence {
  const leftIds = new Set(left.faces.map((f) => f.id));
  const rightIds = new Set(right.faces.map((f) => f.id));
  const matched = left.faces
    .map((f) => f.id)
    .filter((id) => rightIds.has(id));
  return {
    matched,
    onlyLeft: left.faces.map((f) => f.id).filter((id) => !rightIds.has(id)),
    onlyRight: right.faces.map((f) => f.id).filter((id) => !leftIds.has(id)),
  };
}
