import type { Document } from "../../../shared/types";
export function selectCrease(doc: Document, id: string) {
  if (doc.paper.creases.some((c) => c.id === id)) {
    doc.selected = id;
    doc.playing = false;
  }
}
export function toggleDirection(doc: Document) {
  doc.directions[doc.selected] = (doc.directions[doc.selected] ?? 1) * -1;
  doc.angles[doc.selected] = -(doc.angles[doc.selected] ?? 0);
  doc.playing = false;
}
