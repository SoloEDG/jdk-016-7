<script setup lang="ts">
import { computed } from "vue";
import { GitCompareArrows, Link2, Link2Off, Loader2 } from "lucide-vue-next";
import type { DiffMetric, Document } from "../../../shared/types";
import {
  compareState,
  compareResult,
  compareBusy,
  setMetric,
  toggleOverlay,
  toggleCameraLock,
} from "../model/compareStore";

const props = defineProps<{
  left: Document;
  right: Document;
  onToggle: () => void;
}>();

const metrics: { id: DiffMetric; name: string; hint: string }[] = [
  { id: "total", name: "总位移", hint: "同一区域代表点在两版本间的全部位置变化" },
  { id: "carried", name: "父纸面带动", hint: "剥掉当前折痕自身旋转后，仅由父纸面链带动的位移" },
  { id: "local", name: "本折痕旋转", hint: "当前折痕本身在两侧的折叠角之差" },
];

function faceLabel(doc: Document, id: string) {
  const face = doc.paper.faces.find((f) => f.id === id);
  if (!face) return id;
  if (!face.crease) return "根纸面 · " + id.toUpperCase();
  const crease = doc.paper.creases.find((c) => c.id === face.crease);
  return (crease?.name ?? face.crease) + " · " + id.toUpperCase();
}

const matchedCount = computed(() => compareResult.value?.correspondence.matched.length ?? 0);
const unmatchedLeft = computed(() => compareResult.value?.correspondence.onlyLeft ?? []);
const unmatchedRight = computed(() => compareResult.value?.correspondence.onlyRight ?? []);
const sameTopology = computed(
  () =>
    compareResult.value !== null &&
    unmatchedLeft.value.length === 0 &&
    unmatchedRight.value.length === 0,
);
const activeHint = computed(
  () => metrics.find((m) => m.id === compareState.metric)?.hint ?? "",
);
</script>
<template>
  <section class="panel compare-panel">
    <div class="section-heading">
      <span><GitCompareArrows :size="13" /> 双版本比较</span>
      <small>COMPARE</small>
    </div>
    <button
      class="compare-toggle"
      :class="{ on: compareState.enabled }"
      @click="props.onToggle()"
    >
      <span class="toggle-dot"></span>
      {{ compareState.enabled ? "比较进行中 · 点击退出" : "开启左右并排比较" }}
    </button>

    <template v-if="compareState.enabled">
      <button
        class="lock-row"
        :class="{ off: !compareState.cameraLocked }"
        @click="toggleCameraLock(left, right)"
      >
        <component
          :is="compareState.cameraLocked ? Link2 : Link2Off"
          :size="14"
        />
        <span>
          <b>{{ compareState.cameraLocked ? "观察方向已锁定" : "观察方向已解锁" }}</b>
          <small>
            {{
              compareState.cameraLocked
                ? "两侧相机同步旋转、缩放"
                : "两侧可自由转动；重新锁定只同步方向，不改折角"
            }}
          </small>
        </span>
      </button>

      <label class="field-label">差异度量（按同一原始纸面区域对应）</label>
      <div class="metric-tabs">
        <button
          v-for="m in metrics"
          :key="m.id"
          :class="{ active: compareState.metric === m.id }"
          @click="setMetric(m.id)"
        >
          {{ m.name }}
        </button>
      </div>
      <p class="muted small metric-hint">{{ activeHint }}</p>

      <label class="overlay-line">
        <input type="checkbox" :checked="compareState.overlay" @change="toggleOverlay" />
        显示差异着色层
      </label>

      <div class="compare-status">
        <Loader2 v-if="compareBusy" :size="13" class="spin" />
        <span v-else class="status-ok">●</span>
        <p v-if="compareBusy">正在后台计算，快速切换步骤时只呈现匹配当前版本的结果…</p>
        <p v-else>
          可比较区域 <b>{{ matchedCount }}</b> 处；
          <template v-if="sameTopology">两侧纸张拓扑一致，全部区域均有对应。</template>
          <template v-else>存在无对应区域，已排除在误差之外。</template>
        </p>
      </div>

      <div v-if="!sameTopology && !compareBusy" class="unmatched">
        <div v-if="unmatchedLeft.length">
          <span class="eyebrow">仅左侧存在 · 不参与误差</span>
          <p v-for="id in unmatchedLeft" :key="'l' + id">{{ faceLabel(left, id) }}</p>
        </div>
        <div v-if="unmatchedRight.length">
          <span class="eyebrow">仅右侧存在 · 不参与误差</span>
          <p v-for="id in unmatchedRight" :key="'r' + id">{{ faceLabel(right, id) }}</p>
        </div>
        <p class="muted small">这些纸面以斜纹标示、不计算误差，避免被染成巨大差异。</p>
      </div>

      <div v-if="!compareBusy" class="heat-legend">
        <span>小</span>
        <div class="heat-bar"></div>
        <span>大</span>
      </div>
    </template>
  </section>
</template>
