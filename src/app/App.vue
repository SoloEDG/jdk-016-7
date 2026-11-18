<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import {
  Layers,
  RotateCcw,
  ArrowUpRight,
  HelpCircle,
  Leaf,
  GitCompareArrows,
  Columns2,
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
import {
  ComparePanel,
  SplitCompare,
  compareState,
  compareResult,
  requestCompare,
  setCompareEnabled,
} from "../features/compare";

const left = reactive(createDocument(papers[0]!, makeSteps(papers[0]!)));
const right = reactive(
  createDocument(papers[1]!, makeSteps(papers[1]!)),
);
/** 当前由两侧编辑面板控制的文档；比较模式下可切换。 */
const activeSide = ref<"left" | "right">("left");
const doc = computed(() => (activeSide.value === "left" ? left : right));

const pose = computed(() => solvePose(doc.value.paper, doc.value.angles));
const hinges = computed(() => hingePositions(doc.value.paper, pose.value));
const leftPose = computed(() => solvePose(left.paper, left.angles));
const rightPose = computed(() => solvePose(right.paper, right.angles));
const leftHinges = computed(() => hingePositions(left.paper, leftPose.value));
const rightHinges = computed(() => hingePositions(right.paper, rightPose.value));

const { toggle } = usePlayer(() => doc.value);
const help = ref(false),
  toast = ref("");
function notify(s: string) {
  toast.value = s;
  setTimeout(() => (toast.value = ""), 2400);
}

/* ---------- 比较调度：任一相关状态变化都按最新版本重算，过期结果丢弃 ---------- */
watch(
  [
    () => [left.paper, left.angles],
    () => [right.paper, right.angles],
    () => compareState.enabled,
  ],
  () => {
    if (compareState.enabled) requestCompare(left, right);
  },
  { deep: true },
);

function toggleCompare() {
  const next = !compareState.enabled;
  setCompareEnabled(next, left, right);
  if (next) {
    activeSide.value = "left";
    notify("已进入双版本比较，按同一原始纸面区域对应");
  } else {
    notify("已退出比较，两侧折角均未被修改");
  }
}
function activate(side: "left" | "right") {
  if (activeSide.value === side) return;
  // 切换激活侧时暂停另一侧，避免播放循环在后台继续改写它的折角
  const other = side === "left" ? right : left;
  other.playing = false;
  activeSide.value = side;
}
function selectIn(side: "left" | "right", id: string) {
  activeSide.value = side;
  selectCrease(side === "left" ? left : right, id);
}

/* ---------- 作用于当前激活文档的编辑 ---------- */
function choosePaper(id: string) {
  const p = papers.find((p) => p.id === id);
  if (!p) return;
  const target = doc.value;
  replacePaper(target, p);
  target.steps = makeSteps(p);
  setView(target, "iso");
  if (compareState.enabled) requestCompare(left, right);
}
function reset() {
  flatten(doc.value);
  doc.value.steps = makeSteps(doc.value.paper);
  setView(doc.value, "iso");
  notify("已回到平展纸张");
}
function capture() {
  captureStep(doc.value);
  notify("当前形态已保存到步骤 " + (doc.value.step + 1));
}
function onAngle(v: number) {
  changeAngle(doc.value, v);
}
function onDirection() {
  toggleDirection(doc.value);
}
function onTarget() {
  applyTarget(doc.value);
}
function onSeek(n: number) {
  seek(doc.value, n);
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
        <button
          class="compare-entry"
          :class="{ on: compareState.enabled }"
          @click="toggleCompare"
        >
          <Columns2 :size="15" />
          {{ compareState.enabled ? "退出比较" : "双版本比较" }}
        </button>
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
          <PaperPanel :doc="doc" @paper="choosePaper" />
          <CreasePanel :doc="doc" @select="selectCrease(doc, $event)" />
          <ComparePanel
            :left="left"
            :right="right"
            :on-toggle="toggleCompare"
          />
          <div class="sidebar-footer">
            <Layers :size="13" />
            <template v-if="!compareState.enabled">
              单张纸 · {{ doc.paper.faces.length }} 个关联纸面
            </template>
            <template v-else>
              比较中 · 正在编辑
              <b :class="['side-tag', activeSide]">
                {{ activeSide === "left" ? "版本 A" : "版本 B" }}
              </b>
              · 点击任一侧画面切换
            </template>
          </div>
        </aside>
        <div class="center">
          <div class="canvas-label">
            <span v-if="!compareState.enabled"
              >{{ doc.paper.name }}
              <small
                >/
                {{
                  doc.paper.id === "shelter" ? "PAPER GARDEN" : "VALLEY WALK"
                }}</small
              ></span
            >
            <span v-else class="compare-label">
              <GitCompareArrows :size="13" />
              {{ left.paper.name }} <i>⇄</i> {{ right.paper.name }}
              <small>/ 按同一原始纸面区域对应</small>
            </span>
            <span class="difficulty"
              >入门探索 <i></i><i></i><i class="empty"></i
            ></span>
          </div>

          <Viewport
            v-if="!compareState.enabled"
            :doc="doc"
            :pose="pose"
            :hinges="hinges"
            @select="selectCrease(doc, $event)"
          />
          <SplitCompare
            v-else
            :left="left"
            :right="right"
            :left-pose="leftPose"
            :right-pose="rightPose"
            :left-hinges="leftHinges"
            :right-hinges="rightHinges"
            :active="activeSide"
            @activate="activate"
            @select="selectIn"
          />

          <div v-if="!compareState.enabled" class="instruction">
            <span class="instruction-number">0{{ doc.step + 1 }}</span>
            <div>
              <b>{{ doc.steps[doc.step]?.title }}</b>
              <p>{{ doc.steps[doc.step]?.note }}</p>
            </div>
            <span class="step-count"
              >{{ doc.step + 1 }} / {{ doc.steps.length }}</span
            >
          </div>
          <div v-else class="instruction compare-instruction">
            <span class="instruction-number">⇄</span>
            <div>
              <b>两版并排 · 各自调整步骤与角度</b>
              <p>
                相机{{ compareState.cameraLocked ? "已锁定同一观察方向" : "已解锁，可分别转动" }}；
                比较图层仅用于观察，不会保存到任一侧的步骤。
              </p>
            </div>
            <span class="step-count">
              可比较 {{ compareResult?.correspondence.matched.length ?? 0 }} 区域
            </span>
          </div>
        </div>
        <aside class="right-sidebar">
          <div v-if="compareState.enabled" class="active-side-banner">
            <span class="eyebrow">当前编辑</span>
            <div class="side-switch">
              <button
                :class="{ on: activeSide === 'left' }"
                @click="activeSide = 'left'"
              >
                版本 A
              </button>
              <button
                :class="{ on: activeSide === 'right' }"
                @click="activeSide = 'right'"
              >
                版本 B
              </button>
            </div>
          </div>
          <div class="selected-heading">
            <span class="eyebrow">当前折痕</span>
            <h2>{{ selectedCrease(doc)?.name }}</h2>
            <p>{{ selectedCrease(doc)?.description }}</p>
          </div>
          <FoldPanel
            :doc="doc"
            @angle="onAngle"
            @direction="onDirection"
            @target="onTarget"
          /><ObservePanel :doc="doc" />
        </aside>
      </div>
      <SequencePanel
        v-if="!compareState.enabled"
        :doc="doc"
        @seek="onSeek"
        @play="toggle"
        @capture="capture"
      />
      <div v-else class="timeline compare-timeline">
        <div class="timeline-top">
          <div>
            <span class="eyebrow">折叠步骤 · {{ activeSide === "left" ? "版本 A" : "版本 B" }}</span>
            <b>步骤调整只作用于当前激活的一侧。</b>
          </div>
          <div class="playback">
            <button title="上一步" @click="onSeek(doc.step - 1)">‹</button>
            <button class="play" @click="toggle">
              {{ doc.playing ? "Ⅱ" : "▶" }}
            </button>
            <button title="下一步" @click="onSeek(doc.step + 1)">›</button>
            <button class="save-step" @click="capture">保存当前步骤</button>
          </div>
        </div>
        <div class="step-track">
          <button
            v-for="(s, i) in doc.steps"
            :key="s.id"
            :class="{ current: doc.step === i, done: doc.step > i }"
            @click="onSeek(i)"
          >
            <span class="step-dot">{{
              doc.step > i ? "✓" : String(i + 1).padStart(2, "0")
            }}</span>
            <span
              ><b>{{ s.title }}</b
              ><small>{{
                i === 0
                  ? "START"
                  : i === doc.steps.length - 1
                    ? "FINISH"
                    : "FOLD " + String(i).padStart(2, "0")
              }}</small></span
            ><i v-if="i < doc.steps.length - 1"></i>
          </button>
        </div>
      </div>
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
          用顶部「双版本比较」可左右并排同一作品的两种折法：两侧各自调整步骤与角度，
          锁定相机后从同一观察方向对照。差异按同一张原始纸上的区域（纸面编号）对应，
          并区分父纸面带动的位移与当前折痕本身的旋转；换过纸张拓扑后，无对应的纸面
          只作斜纹标示、不计入误差。
        </p>
        <p>
          比较着色层不会保存到任一步骤，也不会出现在下载的观察图里；解锁再重新锁定相机
          只同步观察方向，不会改动折角或覆盖另一侧的编辑。
        </p>
        <button class="primary" @click="help = false">开始探索 ↗</button>
      </section>
    </div>
  </div>
</template>
