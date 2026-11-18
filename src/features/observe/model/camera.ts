import type { Document } from "../../../shared/types";
import { clamp } from "../../../shared/document";
export function setView(doc: Document, preset: string) {
  if (preset === "top") {
    doc.view.yaw = 0;
    doc.view.pitch = 90;
  } else if (preset === "front") {
    doc.view.yaw = 0;
    doc.view.pitch = 15;
  } else {
    doc.view.yaw = -35;
    doc.view.pitch = 50;
  }
  doc.view.zoom = 1;
}
export function orbit(doc: Document, dx: number, dy: number) {
  doc.view.yaw += dx * 0.45;
  doc.view.pitch = clamp(doc.view.pitch + dy * 0.35, -85, 90);
}
export function zoom(doc: Document, delta: number) {
  doc.view.zoom = clamp(doc.view.zoom + delta, 0.5, 2.2);
}
