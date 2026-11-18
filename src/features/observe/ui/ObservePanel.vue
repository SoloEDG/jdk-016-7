<script setup lang="ts">
import type { Document } from "../../../shared/types";
defineProps<{ doc: Document }>();
</script>
<template>
  <section class="panel observe-panel">
    <div class="section-heading">
      <span>观察提示</span><small>INSPECT</small>
    </div>
    <div class="inspect-icon">⌘</div>
    <p>换个角度，发现纸的可能。</p>
    <span class="muted small"
      >拖动画面自由旋转，检查相邻纸面的连接与折叠关系。</span
    >
    <div class="legend">
      <span><i :style="{ background: doc.front }"></i>正面</span
      ><span><i :style="{ background: doc.back }"></i>背面</span
      ><span>┄ 折痕</span>
    </div>
  </section>
</template>
