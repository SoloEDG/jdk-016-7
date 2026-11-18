import { onUnmounted } from "vue";
import type { Document } from "../../../shared/types";
import { interpolate } from "../lib/steps";

/**
 * 播放器只驱动当前激活文档：切换激活侧时旧文档的 playing 状态由
 * seek/changeAngle 等操作复位，闭包内通过 getter 始终拿到最新文档。
 */
export function usePlayer(getDoc: () => Document) {
  let frame = 0,
    last = 0,
    elapsed = 0,
    start: Record<string, number> = {},
    target = 0;
  function tick(now: number) {
    const doc = getDoc();
    if (!doc.playing) {
      last = 0;
      return;
    }
    if (!last) {
      last = now;
      start = { ...doc.angles };
      target = (doc.step + 1) % doc.steps.length;
      elapsed = 0;
    }
    elapsed += (now - last) * doc.speed;
    last = now;
    const step = doc.steps[target]!;
    doc.angles = interpolate(
      start,
      step.angles,
      Math.min(1, elapsed / step.duration),
    );
    if (elapsed >= step.duration) {
      doc.step = target;
      const c = doc.paper.creases[target - 1];
      if (c) doc.selected = c.id;
      if (target === doc.steps.length - 1) {
        doc.playing = false;
        last = 0;
        return;
      }
      start = { ...doc.angles };
      target++;
      elapsed = 0;
    }
    frame = requestAnimationFrame(tick);
  }
  function toggle() {
    const doc = getDoc();
    doc.playing = !doc.playing;
    cancelAnimationFrame(frame);
    last = 0;
    if (doc.playing) frame = requestAnimationFrame(tick);
  }
  onUnmounted(() => cancelAnimationFrame(frame));
  return { toggle };
}
