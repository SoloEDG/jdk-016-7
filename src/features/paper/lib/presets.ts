import type { Face, Paper } from "../../../shared/types";
const faces: Face[] = [
  {
    id: "a",
    points: [
      [-1, 0, -1],
      [1, 0, -1],
      [1, 0, 0],
    ],
  },
  {
    id: "b",
    parent: "a",
    crease: "c1",
    hinge: [
      [-1, 0, -1],
      [1, 0, 0],
    ],
    points: [
      [-1, 0, -1],
      [1, 0, 0],
      [1, 0, 1],
    ],
  },
  {
    id: "c",
    parent: "b",
    crease: "c2",
    hinge: [
      [-1, 0, -1],
      [1, 0, 1],
    ],
    points: [
      [-1, 0, -1],
      [1, 0, 1],
      [0, 0, 1],
    ],
  },
  {
    id: "d",
    parent: "c",
    crease: "c3",
    hinge: [
      [-1, 0, -1],
      [0, 0, 1],
    ],
    points: [
      [-1, 0, -1],
      [0, 0, 1],
      [-1, 0, 1],
    ],
  },
];
export const papers: Paper[] = [
  {
    id: "shelter",
    name: "纸之庭",
    subtitle: "立体空间 · 3 道折痕",
    size: 200,
    faces,
    creases: [
      {
        id: "c1",
        face: "b",
        name: "侧翼斜折",
        description: "沿第一条斜折线抬起纸面，后续纸面随动。",
        target: 75,
      },
      {
        id: "c2",
        face: "c",
        name: "对角深折",
        description: "沿正方形对角线继续折叠，形成开放的空间。",
        target: 65,
      },
      {
        id: "c3",
        face: "d",
        name: "侧翼回折",
        description: "在已经转动的纸面上收拢最后一翼。",
        target: -80,
      },
    ],
  },
  {
    id: "ribbon",
    name: "山谷回廊",
    subtitle: "连续折叠 · 3 道折痕",
    size: 180,
    faces,
    creases: [
      {
        id: "c1",
        face: "b",
        name: "第一道山脊",
        description: "右侧相邻纸面围绕中轴旋转。",
        target: 110,
      },
      {
        id: "c2",
        face: "c",
        name: "入口谷折",
        description: "左前翼向下展开。",
        target: -55,
      },
      {
        id: "c3",
        face: "d",
        name: "回廊转角",
        description: "末端纸面沿局部折轴回转。",
        target: 100,
      },
    ],
  },
];
export const swatches = [
  { name: "柿子", front: "#e88459", back: "#f8dec2" },
  { name: "苔绿", front: "#718c79", back: "#dce6cf" },
  { name: "雾蓝", front: "#7496ac", back: "#d8e5eb" },
  { name: "紫藤", front: "#ad8fb1", back: "#eadfea" },
  { name: "米白", front: "#e8d6b5", back: "#fff7e8" },
];
