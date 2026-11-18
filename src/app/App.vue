<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import {
  Layers,
  RotateCcw,
  ArrowUpRight,
  HelpCircle,
  Leaf,
} from "lucide-vue-next";
import { createDocument } from "../shared/document";
import { PaperPanel, papers, replacePaper } from "../features/paper";
import {
  CreasePanel,
  selectCrease,
  toggleDirection,
  selectedCrease,
} from "../features/creases";
import {
  FoldPanel,
  solvePose,
  hingePositions,
  changeAngle,
  flatten,
  applyTarget,
} from "../features/fold";
import {
  SequencePanel,
  makeSteps,
  seek,
  captureStep,
  usePlayer,
} from "../features/sequence";
import { Viewport, ObservePanel, setView } from "../features/observe";
const doc = reactive(createDocument(papers[0]!, makeSteps(papers[0]!)));
const pose = computed(() => solvePose(doc.paper, doc.angles)),
  hinges = computed(() => hingePositions(doc.paper, pose.value));
const { toggle } = usePlayer(doc);
const help = ref(false),
  toast = ref("");
function notify(s: string) {
  toast.value = s;
  setTimeout(() => (toast.value = ""), 2400);
}
function choosePaper(id: string) {
  const p = papers.find((p) => p.id === id);
  if (p) {
    replacePaper(doc, p);
    doc.steps = makeSteps(p);
    setView(doc, "iso");
  }
}
function reset() {
  flatten(doc);
  doc.steps = makeSteps(doc.paper);
  setView(doc, "iso");
  notify("已回到平展纸张");
}
function capture() {
  captureStep(doc);
  notify("当前形态已保存到步骤 " + (doc.step + 1));
}
</script>
<template>
  <div class="workspace">
    <header class="topbar">
      <a class="brand" href="#"
        ><span class="brand-mark">◩</span><strong>折间<span>ORI</span></strong
        ><i></i><small>三维折纸工作室</small></a
      >
      <nav>
        <span class="project-indicator"></span> 未命名的纸间探索
        <span class="local-badge">本次会话</span>
      </nav>
      <div class="header-actions">
        <button class="icon-button" aria-label="帮助" @click="help = !help">
          <HelpCircle :size="18" /></button
        ><button class="reset" @click="reset">
          <RotateCcw :size="14" />重新开始</button
        ><button class="primary" @click="seek(doc, doc.steps.length - 1)">
          观察成品 <ArrowUpRight :size="15" />
        </button>
      </div>
    </header>
    <main>
      <div class="page-title">
        <div>
          <div class="eyebrow">THE ART OF FOLDING</div>
          <h1>一张纸，无限可能<span>。</span></h1>
          <p>沿着折痕，让平面生长成空间。</p>
        </div>
        <div class="session-note">
          <Leaf :size="16" /><span>放慢一点，折出自己的节奏。</span>
        </div>
      </div>
      <div class="studio">
        <aside class="left-sidebar">
          <PaperPanel :doc="doc" @paper="choosePaper" /><CreasePanel
            :doc="doc"
            @select="selectCrease(doc, $event)"
          />
          <div class="sidebar-footer">
            <Layers :size="13" /> 单张纸 ·
            {{ doc.paper.faces.length }} 个关联纸面
          </div>
        </aside>
        <div class="center">
          <div class="canvas-label">
            <span
              >{{ doc.paper.name }}
              <small
                >/
                {{
                  doc.paper.id === "shelter" ? "PAPER GARDEN" : "VALLEY WALK"
                }}</small
              ></span
            ><span class="difficulty"
              >入门探索 <i></i><i></i><i class="empty"></i
            ></span>
          </div>
          <Viewport
            :doc="doc"
            :pose="pose"
            :hinges="hinges"
            @select="selectCrease(doc, $event)"
          />
          <div class="instruction">
            <span class="instruction-number">0{{ doc.step + 1 }}</span>
            <div>
              <b>{{ doc.steps[doc.step]?.title }}</b>
              <p>{{ doc.steps[doc.step]?.note }}</p>
            </div>
            <span class="step-count"
              >{{ doc.step + 1 }} / {{ doc.steps.length }}</span
            >
          </div>
        </div>
        <aside class="right-sidebar">
          <div class="selected-heading">
            <span class="eyebrow">当前折痕</span>
            <h2>{{ selectedCrease(doc)?.name }}</h2>
            <p>{{ selectedCrease(doc)?.description }}</p>
          </div>
          <FoldPanel
            :doc="doc"
            @angle="changeAngle(doc, $event)"
            @direction="toggleDirection(doc)"
            @target="applyTarget(doc)"
          /><ObservePanel :doc="doc" />
        </aside>
      </div>
      <SequencePanel
        :doc="doc"
        @seek="seek(doc, $event)"
        @play="toggle"
        @capture="capture"
      />
      <footer>
        <span>ORI / 折间 <i>用折叠，重新认识一张纸。</i></span
        ><span
          ><i class="status-dot"></i> 全部计算于浏览器本地
          <small>© 2026 ORI STUDIO</small></span
        >
      </footer>
    </main>
    <div v-if="toast" role="status" class="toast">✓ {{ toast }}</div>
    <div v-if="help" class="modal-backdrop" @click.self="help = false">
      <section class="help-modal">
        <button class="close" @click="help = false">×</button>
        <div class="eyebrow">A SMALL GUIDE</div>
        <h2>从第一道折痕开始</h2>
        <p>
          选择纸张与颜色，点选折痕后拖动角度滑杆。父纸面转动时，关联纸面会一起运动。
        </p>
        <p>
          下方步骤可还原对应形态，也可保存当前角度后播放。拖动画面旋转视角，滚轮缩放，下载按钮可保存当前观察图。
        </p>
        <p>作品保留在本次会话中，刷新会重新开始。</p>
        <button class="primary" @click="help = false">开始探索 ↗</button>
      </section>
    </div>
  </div>
</template>
