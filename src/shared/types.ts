export type Vec3 = [number, number, number];
export interface Face {
  id: string;
  points: Vec3[];
  parent?: string;
  hinge?: [Vec3, Vec3];
  crease?: string;
}
export interface Crease {
  id: string;
  name: string;
  description: string;
  face: string;
  target: number;
}
export interface Paper {
  id: string;
  name: string;
  subtitle: string;
  size: number;
  faces: Face[];
  creases: Crease[];
}
export interface Step {
  id: string;
  title: string;
  note: string;
  angles: Record<string, number>;
  duration: number;
}
export interface View {
  yaw: number;
  pitch: number;
  zoom: number;
  grid: boolean;
  wire: boolean;
}
export interface Document {
  paper: Paper;
  front: string;
  back: string;
  texture: string;
  selected: string;
  angles: Record<string, number>;
  directions: Record<string, number>;
  steps: Step[];
  step: number;
  playing: boolean;
  speed: number;
  view: View;
}
export interface PoseFace {
  id: string;
  points: Vec3[];
  normal: Vec3;
}
/** 比较的度量维度：本折痕旋转 / 父纸面带动 / 总位移 */
export type DiffMetric = "local" | "carried" | "total";
/** 同一原始纸面区域（按 face id 对应）在两个版本间的差异 */
export interface FaceDiff {
  id: string;
  /** 当前折痕本身带来的相对旋转角（度），根纸面恒为 0 */
  localAngle: number;
  /** 扣除自身折痕旋转后、由父纸面链带动的代表点位移（归一化） */
  carried: number;
  /** 代表点在两个版本间的总位移（归一化） */
  total: number;
}
export interface Correspondence {
  /** 两侧都存在、可比较的纸面 id（按同一张原始纸的区域对应） */
  matched: string[];
  /** 仅左/右版本存在，没有对应关系、不得计入误差的纸面 id */
  onlyLeft: string[];
  onlyRight: string[];
}
export interface CompareResult {
  key: string;
  correspondence: Correspondence;
  diffs: FaceDiff[];
  /** 归一化用的尺度（平展状态包围球半径） */
  scale: number;
}
