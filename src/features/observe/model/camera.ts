import type { Document, View } from "../../../shared/types";
import { clamp } from "../../../shared/document";

export function setViewFor(view: View, preset: string) {
  if (preset === "top") {
    view.yaw = 0;
    view.pitch = 90;
  } else if (preset === "front") {
    view.yaw = 0;
    view.pitch = 15;
  } else {
    view.yaw = -35;
    view.pitch = 50;
  }
  view.zoom = 1;
}
export function orbitView(view: View, dx: number, dy: number) {
  view.yaw += dx * 0.45;
  view.pitch = clamp(view.pitch + dy * 0.35, -85, 90);
}
export function zoomView(view: View, delta: number) {
  view.zoom = clamp(view.zoom + delta, 0.5, 2.2);
}

/* 兼容单稿模式：作用于文档自身的视角 */
export function setView(doc: Document, preset: string) {
  setViewFor(doc.view, preset);
}
export function orbit(doc: Document, dx: number, dy: number) {
  orbitView(doc.view, dx, dy);
}
export function zoom(doc: Document, delta: number) {
  zoomView(doc.view, delta);
}
