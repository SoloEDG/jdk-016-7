<script setup lang="ts">
import { computed } from "vue";
import type { Document, PoseFace, View } from "../../../shared/types";
import { Viewport } from "../../observe";
import { compareState, compareResult, compareBusy } from "../model/compareStore";
import { diffValue } from "../lib/diff";
import { seek } from "../../sequence";
import { flatten } from "../../fold";

const props = defineProps<{
  left: Document;
  right: Document;
  leftPose: PoseFace[];
  rightPose: PoseFace[];
  leftHinges: { id: string; a: [number, number, number]; b: [number, number, number] }[];
  rightHinges: { id: string; a: [number, number, number]; b: [number, number, number] }[];
  active: "left" | "right";
}>();
const emit = defineEmits<{
  activate: [side: "left" | "right"];
  select: [side: "left" | "right", id: string];
}>();

const sharedView = computed<View | undefined>(() =>
  compareState.cameraLocked ? props.left.view : undefined,
);

function heatFor(side: "left" | "right") {
  const r = compareResult.value;
  if (!r || !compareState.overlay) return {};
  const map: Record<string, number> = {};
  for (const d of r.diffs) map[d.id] = diffValue(d, compareState.metric);
  return map;
}
const leftHeat = computed(() => heatFor("left"));
const rightHeat = computed(() => heatFor("right"));
const leftUnmatched = computed(
  () => compareResult.value?.correspondence.onlyLeft ?? [],
);
const rightUnmatched = computed(
  () => compareResult.value?.correspondence.onlyRight ?? [],
);

function stepOf(doc: Document) {
  return { current: doc.step, total: doc.steps.length };
}
</script>
<template>
  <div class="split-compare">
    <div
      v-for="side in (['left', 'right'] as const)"
      :key="side"
      class="compare-pane"
      :class="{ active: active === side }"
      @click="emit('activate', side)"
    >
      <div class="pane-head">
        <span class="pane-tag">{{ side === "left" ? "版本 A" : "版本 B" }}</span>
        <b>{{ (side === "left" ? left : right).paper.name }}</b>
        <span v-if="compareState.cameraLocked" class="lock-badge">视角同步</span>
        <span class="pane-spacer"></span>
        <span class="pane-step"
          >步骤 {{ stepOf(side === "left" ? left : right).current + 1 }} /
          {{ stepOf(side === "left" ? left : right).total }}</span
        >
      </div>
      <Viewport
        :doc="side === 'left' ? left : right"
        :pose="side === 'left' ? leftPose : rightPose"
        :hinges="side === 'left' ? leftHinges : rightHinges"
        :external-view="sharedView"
        :heat="side === 'left' ? leftHeat : rightHeat"
        :unmatched="side === 'left' ? leftUnmatched : rightUnmatched"
        :show-compare="compareState.overlay && !compareBusy"
        @select="emit('select', side, $event)"
      />
      <div class="pane-controls" @click.stop>
        <button
          title="上一步"
          @click="seek(side === 'left' ? left : right, (side === 'left' ? left : right).step - 1)"
        >
          ‹
        </button>
        <button
          title="下一步"
          @click="seek(side === 'left' ? left : right, (side === 'left' ? left : right).step + 1)"
        >
          ›
        </button>
        <button
          class="pane-flatten"
          title="回到平展"
          @click="flatten(side === 'left' ? left : right)"
        >
          平展
        </button>
      </div>
    </div>
  </div>
</template>
