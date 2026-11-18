<script setup lang="ts">
import { computed, ref } from "vue";
import type { Document, PoseFace, View } from "../../../shared/types";
import { project, polygon, cameraPoint } from "../lib/projection";
import { orbitView, zoomView, setViewFor } from "../model/camera";
import { downloadView } from "../lib/export";
const props = defineProps<{
  doc: Document;
  pose: PoseFace[];
  hinges: {
    id: string;
    a: [number, number, number];
    b: [number, number, number];
  }[];
  /** 相机锁定时由外部传入的共享观察方向；否则使用文档自身视角 */
  externalView?: View;
  /** 比较模式：face id -> 0..1 热力值（仅含有对应关系的纸面） */
  heat?: Record<string, number>;
  /** 比较模式：无对应关系、不参与误差的纸面 id */
  unmatched?: string[];
  showCompare?: boolean;
}>();
defineEmits<{ select: [id: string] }>();
const svg = ref<SVGSVGElement>();
let drag = false,
  lastX = 0,
  lastY = 0;
const view = computed<View>(() => props.externalView ?? props.doc.view);
const unmatchedSet = computed(() => new Set(props.unmatched ?? []));
const faces = computed(() =>
  props.pose
    .map((f) => ({
      ...f,
      depth:
        f.points.reduce((s, p) => s + project(p, view.value).z, 0) /
        f.points.length,
      back: cameraPoint(f.normal, view.value)[2] > 0,
    }))
    .sort((a, b) => a.depth - b.depth),
);
/** 0 差异为绿、随差异增大过渡到红；无差异时近乎透明。 */
function heatColor(v: number) {
  const x = Math.max(0, Math.min(1, v));
  return `hsla(${Math.round(120 - x * 120)}, 72%, 42%, ${0.08 + x * 0.5})`;
}
function down(e: PointerEvent) {
  if ((e.target as Element).closest(".hinge")) return;
  drag = true;
  lastX = e.clientX;
  lastY = e.clientY;
  (e.currentTarget as Element).setPointerCapture(e.pointerId);
}
function move(e: PointerEvent) {
  if (!drag) return;
  orbitView(view.value, e.clientX - lastX, e.clientY - lastY);
  lastX = e.clientX;
  lastY = e.clientY;
}
</script>
<template>
  <section class="viewport">
    <div class="viewport-top">
      <div class="view-tabs">
        <button class="active" @click="setViewFor(view, 'iso')">立体视图</button
        ><button @click="setViewFor(view, 'top')">俯视</button
        ><button @click="setViewFor(view, 'front')">正视</button>
      </div>
      <span class="live"><i></i> 实时预览</span>
    </div>
    <svg
      ref="svg"
      class="paper-scene"
      viewBox="0 0 800 560"
      aria-label="三维折纸预览"
      @pointerdown="down"
      @pointermove="move"
      @pointerup="drag = false"
      @pointercancel="drag = false"
      @wheel.prevent="zoomView(view, -$event.deltaY * 0.001)"
    >
      <defs>
        <pattern id="grid" width="35" height="35" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="#d4d9d0" />
        </pattern>
        <pattern
          id="fiber"
          width="13"
          height="17"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M1 2l3 1M8 11l2 -2M3 14l1 -2"
            stroke="#fff"
            stroke-opacity=".22"
            stroke-width=".7"
          />
        </pattern>
        <pattern id="dots" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r=".65" fill="#fff" fill-opacity=".4" />
        </pattern>
        <pattern
          id="unmatched-hatch"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="8" stroke="#7d857a" stroke-width="2" />
        </pattern>
        <filter id="shadow"><feGaussianBlur stdDeviation="15" /></filter>
      </defs>
      <rect width="800" height="560" fill="#f6f7f2" />
      <rect v-if="doc.view.grid" width="800" height="560" fill="url(#grid)" />
      <ellipse
        cx="400"
        cy="401"
        rx="180"
        ry="32"
        fill="#63705a"
        opacity=".15"
        filter="url(#shadow)"
      />
      <g v-for="f in faces" :key="f.id" :data-face="f.id">
        <polygon
          :points="polygon(f.points, view)"
          :fill="f.back ? doc.back : doc.front"
          stroke="#785945"
          stroke-opacity=".35"
          stroke-width="1.2"
          stroke-linejoin="round"
        />
        <polygon
          :points="polygon(f.points, view)"
          fill="#314638"
          :opacity="Math.max(0, 0.1 + f.normal[1] * 0.08)"
        />
        <polygon
          v-if="doc.texture !== 'plain'"
          :points="polygon(f.points, view)"
          :fill="'url(#' + doc.texture + ')'"
        />
        <!-- 比较着色层：不属于任何一侧的保存数据，导出观察图时会被剔除 -->
        <polygon
          v-if="showCompare && unmatchedSet.has(f.id)"
          class="compare-overlay"
          :points="polygon(f.points, view)"
          fill="url(#unmatched-hatch)"
          opacity="0.55"
          stroke="#6f776e"
          stroke-dasharray="4 3"
          stroke-width="1"
        />
        <polygon
          v-else-if="showCompare && heat && heat[f.id] !== undefined"
          class="compare-overlay"
          :points="polygon(f.points, view)"
          :fill="heatColor(heat[f.id]!)"
          stroke="#b3402f"
          :stroke-width="heat[f.id]! > 0.55 ? 1.6 : 0.6"
          stroke-opacity=".6"
        />
      </g>
      <g v-if="doc.view.wire">
        <g
          v-for="(h, i) in hinges"
          :key="h.id"
          class="hinge"
          @click.stop="$emit('select', h.id)"
        >
          <line
            :x1="project(h.a, view).x"
            :y1="project(h.a, view).y"
            :x2="project(h.b, view).x"
            :y2="project(h.b, view).y"
            stroke="transparent"
            stroke-width="18"
          />
          <line
            :x1="project(h.a, view).x"
            :y1="project(h.a, view).y"
            :x2="project(h.b, view).x"
            :y2="project(h.b, view).y"
            :stroke="h.id === doc.selected ? '#fff8d9' : '#746f57'"
            :stroke-width="h.id === doc.selected ? 2.5 : 1.2"
            stroke-dasharray="5 4"
          />
          <circle
            :cx="(project(h.a, view).x + project(h.b, view).x) / 2"
            :cy="(project(h.a, view).y + project(h.b, view).y) / 2"
            r="11"
            :fill="h.id === doc.selected ? '#384d3f' : '#f7f6ee'"
          />
          <text
            :x="(project(h.a, view).x + project(h.b, view).x) / 2"
            :y="(project(h.a, view).y + project(h.b, view).y) / 2 + 3.5"
            text-anchor="middle"
            font-size="10"
            :fill="h.id === doc.selected ? 'white' : '#555'"
          >
            {{ i + 1 }}
          </text>
        </g>
      </g>
      <g transform="translate(58,475)" stroke-width="1.5">
        <path d="M0 0l28 12" stroke="#be806c" />
        <path d="M0 0v-30" stroke="#839b72" />
        <path d="M0 0l-18 15" stroke="#839eae" />
        <text x="32" y="17" font-size="10" fill="#ad7a69">X</text>
        <text x="-3" y="-37" font-size="10" fill="#789069">Y</text>
        <text x="-28" y="23" font-size="10" fill="#839eae">Z</text>
      </g>
    </svg>
    <div class="scene-caption">
      <span>拖动旋转视角 · 滚轮缩放</span
      ><b>{{ Math.round(view.zoom * 100) }}%</b>
    </div>
    <div class="scene-tools">
      <button
        :class="{ selected: doc.view.grid }"
        title="网格"
        @click="doc.view.grid = !doc.view.grid"
      >
        ▦</button
      ><button
        :class="{ selected: doc.view.wire }"
        title="折痕"
        @click="doc.view.wire = !doc.view.wire"
      >
        ⌁</button
      ><i></i><button title="放大" @click="zoomView(view, 0.1)">＋</button
      ><button title="缩小" @click="zoomView(view, -0.1)">−</button
      ><button title="重置视角" @click="setViewFor(view, 'iso')">⤢</button><i></i
      ><button title="下载观察图（不含比较图层）" @click="svg && downloadView(svg)">↓</button>
    </div>
  </section>
</template>
