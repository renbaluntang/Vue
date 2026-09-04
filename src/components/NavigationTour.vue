<template>
  <div v-if="open" class="pointer-events-none fixed inset-0 z-[60]">
    <!-- Four panes rather than one overlay with a hole: the gap between them IS
         the spotlight, so the highlighted control stays genuinely clickable
         while every other pixel of the page is covered and inert. -->
    <template v-if="rect">
      <div class="tour-mask" :style="maskTop" @click.stop></div>
      <div class="tour-mask" :style="maskBottom" @click.stop></div>
      <div class="tour-mask" :style="maskLeft" @click.stop></div>
      <div class="tour-mask" :style="maskRight" @click.stop></div>

      <div class="tour-ring" :style="ringStyle" aria-hidden="true"></div>
    </template>

    <!-- Tooltip -->
    <div
      ref="tipEl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      class="tour-tip pointer-events-auto fixed w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl"
      :style="tipStyle"
    >
      <div class="flex items-start justify-between gap-3">
        <p class="text-[10px] font-black uppercase tracking-wider text-brighture-bronze">
          {{ t('guide.step', { n: index + 1, total: steps.length }) }}
        </p>
        <button
          type="button"
          @click="finish"
          class="-mr-1 -mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          :aria-label="t('guide.skip')"
        >
          <i class="fa-solid fa-xmark text-[11px]"></i>
        </button>
      </div>

      <h2 id="tour-title" class="mt-1 text-sm font-extrabold text-slate-900">
        {{ t(step.title) }}
      </h2>
      <p class="mt-1 text-xs leading-relaxed text-slate-600">
        {{ t(step.body) }}
      </p>
      <p v-if="rect" class="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-brighture-bronze">
        <i class="fa-solid text-[10px]" :class="step.noClick ? 'fa-eye' : 'fa-hand-pointer'"></i>
        {{ step.noClick ? t('guide.lookPrompt') : t('guide.clickPrompt') }}
      </p>

      <!-- Progress pips double as the position readout; the counter above is for
           screen readers and for anyone past pip-counting range. -->
      <div class="mt-3 flex items-center gap-1" aria-hidden="true">
        <span
          v-for="(s, i) in steps"
          :key="s.key"
          class="h-1 flex-1 rounded-full transition-colors"
          :class="i <= index ? 'bg-brighture-gold' : 'bg-slate-200'"
        ></span>
      </div>

      <div class="mt-3 flex items-center gap-2">
        <button
          type="button"
          @click="finish"
          class="rounded-xl px-2.5 py-2 text-[11px] font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {{ t('guide.skip') }}
        </button>
        <span class="flex-1"></span>
        <button
          v-if="index > 0"
          type="button"
          @click="go(-1)"
          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
        >
          {{ t('guide.back') }}
        </button>
        <button
          type="button"
          @click="go(1)"
          class="rounded-xl border border-transparent bg-brighture-gold px-4 py-2 text-[11px] font-black text-brighture-ink transition hover:bg-brighture-gold-deep active:scale-95"
        >
          {{ isLast ? t('guide.finish') : t('guide.next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  open: Boolean,
});
const emit = defineEmits(['close', 'prepare']);

const { t } = useI18n();

// Titles reuse nav.* so a step always calls a page whatever the sidebar calls
// it. `anchors` are tried in order and the first one actually on screen wins,
// which is what lets one step cover the sidebar link and its bottom-bar twin.
const STEPS = {
  dashboard: { key: 'dashboard', anchors: ['nav-/', 'mnav-/'], title: 'nav.dashboard', body: 'guide.items.dashboard' },
  book: { key: 'book', anchors: ['nav-/booking', 'mnav-/booking'], title: 'nav.book', body: 'guide.items.book' },
  history: { key: 'history', anchors: ['nav-/history', 'mnav-/history'], title: 'nav.history', body: 'guide.items.history' },
  writing: { key: 'writing', anchors: ['nav-/writing', 'dnav-/writing'], title: 'nav.writing', body: 'guide.items.writing' },
  analytics: { key: 'analytics', anchors: ['nav-/analytics', 'mnav-/analytics'], title: 'nav.analytics', body: 'guide.items.analytics' },
  points: { key: 'points', anchors: ['nav-points', 'dnav-points'], title: 'nav.pointsGroup', body: 'guide.items.pointsGroup' },
  refer: { key: 'refer', anchors: ['nav-/refer', 'dnav-/refer'], title: 'nav.refer', body: 'guide.items.refer' },
  header: { key: 'header', anchors: ['header'], title: 'guide.headerTitle', body: 'guide.headerBody', noClick: true },
  collapse: { key: 'collapse', anchors: ['sidebar-toggle'], title: 'guide.collapseTitle', body: 'guide.collapseBody' },
  talknow: { key: 'talknow', anchors: ['talk-now'], title: 'guide.talkNowTitle', body: 'guide.talkNowBody', noClick: true },
  menu: { key: 'menu', anchors: ['mobile-menu'], title: 'guide.menuTitle', body: 'guide.menuBody' },
  settings: { key: 'settings', anchors: ['settings', 'mobile-settings'], title: 'guide.settingsTitle', body: 'guide.settingsBody' },
};

// Two orders, because the two layouts genuinely differ: the sidebar lists every
// page, the bottom bar holds four and hides the rest behind ☰.
const DESKTOP = ['header', 'collapse', 'dashboard', 'talknow', 'book', 'history', 'writing', 'analytics', 'points', 'refer', 'settings'];
const MOBILE = ['header', 'dashboard', 'talknow', 'book', 'analytics', 'history', 'menu', 'writing', 'points', 'refer', 'settings'];

const steps = ref([]);
const index = ref(0);
const step = computed(() => steps.value[index.value] ?? STEPS.dashboard);
const isLast = computed(() => index.value >= steps.value.length - 1);

const rect = ref(null);
const tipEl = ref(null);
const tipPos = ref({ top: 0, left: 0 });

const PAD = 6;
const GAP = 14;

// An anchor counts only if it is actually on screen: the mobile drawer and the
// bottom bar both stay in the DOM at all times (off-canvas, or display:none at
// lg), so presence alone would point the spotlight at nothing.
const onScreen = (el) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return null;
  if (r.right <= 0 || r.bottom <= 0) return null;
  if (r.left >= window.innerWidth || r.top >= window.innerHeight) return null;
  return r;
};

const resolve = (s) => {
  for (const name of s.anchors) {
    const r = onScreen(document.querySelector(`[data-tour="${name}"]`));
    if (r) return r;
  }
  return null;
};

const measure = () => {
  const r = resolve(step.value);
  if (!r) { rect.value = null; return; }
  rect.value = { top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom, right: r.right };
};

const place = () => {
  const tip = tipEl.value;
  if (!tip) return;
  const tw = tip.offsetWidth;
  const th = tip.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const r = rect.value;

  if (!r) {
    tipPos.value = { top: Math.round((vh - th) / 2), left: Math.round((vw - tw) / 2) };
    return;
  }

  let left;
  let top;
  if (r.right + GAP + tw <= vw - 8) {
    left = r.right + GAP;
    top = r.top + r.height / 2 - th / 2;
  } else if (r.left - GAP - tw >= 8) {
    left = r.left - GAP - tw;
    top = r.top + r.height / 2 - th / 2;
  } else if (r.bottom + GAP + th <= vh - 8) {
    left = r.left + r.width / 2 - tw / 2;
    top = r.bottom + GAP;
  } else {
    left = r.left + r.width / 2 - tw / 2;
    top = r.top - GAP - th;
  }

  tipPos.value = {
    top: Math.round(Math.min(Math.max(8, top), vh - th - 8)),
    left: Math.round(Math.min(Math.max(8, left), vw - tw - 8)),
  };
};

const px = (n) => `${Math.round(n)}px`;
const maskTop = computed(() => ({ top: 0, left: 0, width: '100%', height: px(Math.max(0, rect.value.top - PAD)) }));
const maskBottom = computed(() => ({ top: px(rect.value.bottom + PAD), left: 0, width: '100%', bottom: 0 }));
const maskLeft = computed(() => ({
  top: px(rect.value.top - PAD), left: 0,
  width: px(Math.max(0, rect.value.left - PAD)), height: px(rect.value.height + PAD * 2),
}));
const maskRight = computed(() => ({
  top: px(rect.value.top - PAD), left: px(rect.value.right + PAD),
  right: 0, height: px(rect.value.height + PAD * 2),
}));
const ringStyle = computed(() => ({
  top: px(rect.value.top - PAD), left: px(rect.value.left - PAD),
  width: px(rect.value.width + PAD * 2), height: px(rect.value.height + PAD * 2),
}));
const tipStyle = computed(() => ({ top: px(tipPos.value.top), left: px(tipPos.value.left) }));

// The layout owns its own drawer, so the tour asks for the state a step needs
// rather than reaching into it. The wait covers the drawer's 300ms slide —
// measuring mid-animation would spotlight where the panel used to be.
const activate = async () => {
  emit('prepare', step.value.key);
  await nextTick();
  await new Promise((r) => setTimeout(r, 340));
  measure();
  await nextTick();
  place();
};

const go = async (dir) => {
  const next = index.value + dir;
  if (next < 0) return;
  if (next >= steps.value.length) return finish();
  index.value = next;
  await activate();
};

const finish = () => emit('close');

// Clicking the highlighted control is the point of the exercise, so treat it as
// "understood" and move on — after a beat, so the page it opened is visible.
let armedEl = null;
const onAnchorClick = () => {
  window.setTimeout(() => { if (props.open) go(1); }, 420);
};
const arm = () => {
  disarm();
  if (step.value.noClick) return;
  for (const name of step.value.anchors) {
    const el = document.querySelector(`[data-tour="${name}"]`);
    if (el && onScreen(el)) { armedEl = el; el.addEventListener('click', onAnchorClick); return; }
  }
};
const disarm = () => {
  if (armedEl) armedEl.removeEventListener('click', onAnchorClick);
  armedEl = null;
};

let frame = null;
const track = () => {
  measure();
  place();
  arm();
  frame = window.requestAnimationFrame(track);
};

const onKeydown = (e) => {
  if (e.key === 'Escape') finish();
  else if (e.key === 'ArrowRight') go(1);
  else if (e.key === 'ArrowLeft') go(-1);
};

const stop = () => {
  if (frame) window.cancelAnimationFrame(frame);
  frame = null;
  disarm();
  document.removeEventListener('keydown', onKeydown);
};

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) { stop(); return; }
    const order = window.innerWidth >= 1024 ? DESKTOP : MOBILE;
    steps.value = order.map((k) => STEPS[k]);
    index.value = 0;
    document.addEventListener('keydown', onKeydown);
    await activate();
    // Re-measure every frame: the sidebar rail scrolls, the drawer slides, and
    // the viewport can rotate mid-tour.
    frame = window.requestAnimationFrame(track);
  }
);

onBeforeUnmount(stop);
</script>

<style scoped>
.tour-mask {
  position: fixed;
  pointer-events: auto;
  background: rgb(15 23 42 / 0.72);
}

.tour-ring {
  position: fixed;
  pointer-events: none;
  border-radius: 1rem;
  box-shadow: 0 0 0 2px #FFCD00, 0 0 0 6px rgb(255 205 0 / 0.25);
  animation: tour-pulse 1.8s ease-in-out infinite;
}

@keyframes tour-pulse {
  0%, 100% { box-shadow: 0 0 0 2px #FFCD00, 0 0 0 5px rgb(255 205 0 / 0.22); }
  50% { box-shadow: 0 0 0 2px #FFCD00, 0 0 0 10px rgb(255 205 0 / 0.08); }
}

@media (prefers-reduced-motion: reduce) {
  .tour-ring { animation: none; }
}
</style>
