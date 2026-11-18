export { default as ComparePanel } from "./ui/ComparePanel.vue";
export { default as SplitCompare } from "./ui/SplitCompare.vue";
export {
  compareState,
  compareResult,
  compareBusy,
  requestCompare,
  setCompareEnabled,
  setMetric,
  toggleOverlay,
  toggleCameraLock,
} from "./model/compareStore";
export { computeCompare, diffValue } from "./lib/diff";
export { buildCorrespondence } from "./lib/correspondence";
