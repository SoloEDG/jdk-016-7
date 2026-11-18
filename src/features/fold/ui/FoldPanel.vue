<script setup lang="ts">
import { computed } from "vue";
import type { Document } from "../../../shared/types";
import { angleHint } from "../lib/angle";
defineEmits<{ angle: [value: number]; direction: []; target: [] }>();
const p = defineProps<{ doc: Document }>();
const angle = computed(() => p.doc.angles[p.doc.selected] ?? 0);
</script>
<template>
  <section class="panel fold-panel">
    <div class="section-heading"><span>折叠控制</span><small>FOLD</small></div>
    <div class="angle-display">
      <strong>{{ angle.toFixed(0) }}<sup>°</sup></strong
      ><span>{{ angleHint(angle) }}</span>
    </div>
    <input
      aria-label="折叠角度"
      type="range"
      min="-175"
      max="175"
      :value="angle"
      @input="$emit('angle', Number(($event.target as HTMLInputElement).value))"
    />
    <div class="range-labels">
      <span>−175°</span><span>0°</span><span>175°</span>
    </div>
    <div class="angle-presets">
      <button v-for="a in [0, 45, 90, 135]" :key="a" @click="$emit('angle', a)">
        {{ a }}°
      </button>
    </div>
    <div class="line-label">
      <label>折叠方向</label
      ><button class="text-button" @click="$emit('direction')">
        {{ (doc.directions[doc.selected] ?? 1) > 0 ? "谷折 ↗" : "山折 ↘" }} ⇄
      </button>
    </div>
    <button class="primary full" @click="$emit('target')">
      折至建议角度 <span>↗</span>
    </button>
    <p class="muted small">关联纸面将随当前折痕一起转动。</p>
  </section>
</template>
