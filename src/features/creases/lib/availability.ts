import type { Document } from "../../../shared/types";
export function selectedCrease(doc: Document) {
  return (
    doc.paper.creases.find((c) => c.id === doc.selected) ?? doc.paper.creases[0]
  );
}
export function creaseProgress(doc: Document, id: string) {
  return Math.round((Math.abs(doc.angles[id] ?? 0) / 180) * 100);
}
