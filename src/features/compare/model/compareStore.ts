import { reactive, ref } from "vue";
import type {
  CompareResult,
  DiffMetric,
  Document,
  Paper,
} from "../../../shared/types";
import { computeCompare, type CompareInput } from "../lib/diff";

/**
 * 比较层是独立于两侧文档的临时状态：
 * 它不写入任何一侧的 angles / steps / view，保存步骤与重新锁定相机
 * 都不会改变折角，也不会覆盖另一侧的编辑。
 */
export const compareState = reactive({
  enabled: false,
  /** 相机方向锁定：两侧共用同一个观察方向 */
  cameraLocked: true,
  metric: "total" as DiffMetric,
  /** 是否显示比较着色层 */
  overlay: true,
});

/** 当前生效结果只对应当前两侧版本；过期结果一律丢弃。 */
export const compareResult = ref<CompareResult | null>(null);
export const compareBusy = ref(false);

let seq = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

function inputOf(doc: Document): CompareInput {
  return { paper: doc.paper, angles: { ...doc.angles } };
}

function signature(paper: Paper, angles: Record<string, number>) {
  return (
    paper.id +
    ":" +
    paper.faces
      .map((f) => f.id)
      .sort()
      .join(",") +
    ":" +
    Object.keys(angles)
      .sort()
      .map((k) => k + "=" + angles[k])
      .join(",")
  );
}

/**
 * 异步（宏任务）计算比较。大作品也不阻塞交互；
 * 每次请求带单调序号，快速换步骤时旧请求结果即使晚到也会被丢弃，
 * 只呈现与当前两侧版本签名匹配的结果。
 */
export function requestCompare(left: Document, right: Document) {
  if (!compareState.enabled) {
    compareResult.value = null;
    compareBusy.value = false;
    return;
  }
  const token = ++seq;
  const li = inputOf(left);
  const ri = inputOf(right);
  const key = signature(li.paper, li.angles) + "|" + signature(ri.paper, ri.angles);
  if (compareResult.value && compareResult.value.key === key) return;
  compareBusy.value = true;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    const result = computeCompare(li, ri);
    if (token !== seq) return; // 已被更新的请求取代，丢弃过期结果
    result.key = key;
    compareResult.value = result;
    compareBusy.value = false;
  }, 0);
}

export function setCompareEnabled(on: boolean, left: Document, right: Document) {
  compareState.enabled = on;
  seq++;
  if (timer) clearTimeout(timer);
  if (!on) {
    compareResult.value = null;
    compareBusy.value = false;
  } else {
    requestCompare(left, right);
  }
}

export function setMetric(metric: DiffMetric) {
  compareState.metric = metric;
}
export function toggleOverlay() {
  compareState.overlay = !compareState.overlay;
}
export function toggleCameraLock(left: Document, right: Document) {
  compareState.cameraLocked = !compareState.cameraLocked;
  if (compareState.cameraLocked) {
    // 重新锁定只同步观察方向（yaw/pitch/zoom），绝不触碰折角数据，
    // 也不覆盖另一侧已有的角度编辑。
    right.view.yaw = left.view.yaw;
    right.view.pitch = left.view.pitch;
    right.view.zoom = left.view.zoom;
  }
}
