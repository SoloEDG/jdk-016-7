import type { Paper, Step } from "../../../shared/types";
export function makeSteps(paper: Paper): Step[] {
  const angles: Record<string, number> = {};
  return [
    {
      id: "flat",
      title: "准备纸张",
      note: "将纸张正面朝上，观察预设折痕。",
      angles: {},
      duration: 1000,
    },
    ...paper.creases.map((c, i) => {
      angles[c.id] = c.target;
      return {
        id: "step-" + i,
        title: c.name,
        note: c.description,
        angles: { ...angles },
        duration: 1600,
      };
    }),
  ];
}
export function interpolate(
  a: Record<string, number>,
  b: Record<string, number>,
  t: number,
) {
  const ease = t * t * (3 - 2 * t);
  return Object.fromEntries(
    [...new Set([...Object.keys(a), ...Object.keys(b)])].map((k) => [
      k,
      (a[k] ?? 0) + ((b[k] ?? 0) - (a[k] ?? 0)) * ease,
    ]),
  );
}
