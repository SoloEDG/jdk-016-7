import type { Document, Paper } from "../../../shared/types";
export function replacePaper(doc: Document, paper: Paper) {
  doc.paper = paper;
  doc.angles = {};
  doc.selected = paper.creases[0]?.id ?? "";
  doc.directions = Object.fromEntries(paper.creases.map((c) => [c.id, 1]));
  doc.playing = false;
  doc.step = 0;
}
export function setMaterial(doc: Document, front: string, back: string) {
  doc.front = front;
  doc.back = back;
}
