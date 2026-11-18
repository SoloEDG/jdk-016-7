import type { Document } from "../../../shared/types";
import { normalizeAngle } from "../lib/angle";
export function changeAngle(doc: Document, value: number) {
  doc.playing = false;
  doc.angles[doc.selected] = normalizeAngle(value);
}
export function flatten(doc: Document) {
  doc.playing = false;
  doc.angles = {};
  doc.step = 0;
}
export function applyTarget(doc: Document) {
  const c = doc.paper.creases.find((c) => c.id === doc.selected);
  if (c) changeAngle(doc, c.target * (doc.directions[c.id] ?? 1));
}
