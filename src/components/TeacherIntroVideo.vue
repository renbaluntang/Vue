<template>
  <div class="relative bg-black">
    <div class="aspect-video w-full">
      <!-- YT.Player replaces this node with its own iframe. -->
      <div ref="mount" class="h-full w-full"></div>
    </div>

    <!-- Our own bar, so the player can run with controls=0 and still be
         controllable. YouTube's own bar is what carried the CC button, the
         settings gear and the wordmark. -->
    <div class="flex items-center gap-3 bg-slate-900 px-3 py-2.5 text-white sm:px-4">
      <button
        type="button"
        @click="togglePlay"
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm transition hover:bg-white/20 active:scale-95"
        :aria-label="isPlaying ? 'Pause' : 'Play'"
      >
        <i :class="isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'" class="text-[11px]"></i>
      </button>

      <span class="shrink-0 text-[11px] font-semibold tabular-nums text-slate-300">
        {{ clock(current) }} / {{ clock(duration) }}
      </span>

      <label class="sr-only" for="tiv-seek">Seek</label>
      <input
        id="tiv-seek"
        type="range"
        class="range min-w-0 flex-1"
        min="0"
        :max="Math.max(duration, 1)"
        step="0.1"
        :value="current"
        @input="seek($event.target.value)"
      />

      <button
        type="button"
        @click="toggleMute"
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm transition hover:bg-white/20 active:scale-95"
        :aria-label="isMuted || volume === 0 ? 'Unmute' : 'Mute'"
      >
        <i
          :class="isMuted || volume === 0 ? 'fa-solid fa-volume-xmark' : (volume < 50 ? 'fa-solid fa-volume-low' : 'fa-solid fa-volume-high')"
          class="text-[11px]"
        ></i>
      </button>

      <label class="sr-only" for="tiv-vol">Volume</label>
      <input
        id="tiv-vol"
        type="range"
        class="range w-16 shrink-0 sm:w-24"
        min="0"
        max="100"
        step="1"
        :value="isMuted ? 0 : volume"
        @input="setVolume($event.target.value)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  videoId: { type: String, required: true },
});

const mount = ref(null);
let player = null;
let ticker = null;

const isPlaying = ref(false);
const isMuted = ref(false);
const volume = ref(100);
const current = ref(0);
const duration = ref(0);

const clock = (s) => {
  const total = Math.max(0, Math.floor(Number(s) || 0));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

// One script tag for the whole app, however many players open over its life.
let apiPromise = null;
const loadApi = () => {
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    const prior = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prior === 'function') prior();
      resolve();
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
  return apiPromise;
};

const startTicker = () => {
  stopTicker();
  ticker = window.setInterval(() => {
    if (!player || typeof player.getCurrentTime !== 'function') return;
    current.value = player.getCurrentTime() || 0;
    if (!duration.value) duration.value = player.getDuration() || 0;
  }, 250);
};
const stopTicker = () => {
  if (ticker) window.clearInterval(ticker);
  ticker = null;
};

const build = async () => {
  await loadApi();
  if (!mount.value) return;
  player = new window.YT.Player(mount.value, {
    videoId: props.videoId,
    // nocookie holds YouTube's tracking cookies back until playback starts.
    host: 'https://www.youtube-nocookie.com',
    playerVars: {
      autoplay: 1,
      controls: 0,        // their bar is gone; ours replaces it
      rel: 0,             // related videos limited to this channel
      iv_load_policy: 3,  // no annotations
      cc_load_policy: 0,  // no forced captions
      playsinline: 1,
      disablekb: 1,
    },
    events: {
      onReady: (e) => {
        duration.value = e.target.getDuration() || 0;
        volume.value = e.target.getVolume?.() ?? 100;
        isMuted.value = e.target.isMuted?.() ?? false;
        startTicker();
      },
      onStateChange: (e) => {
        isPlaying.value = e.data === window.YT.PlayerState.PLAYING;
        if (!duration.value) duration.value = e.target.getDuration() || 0;
      },
    },
  });
};

const togglePlay = () => {
  if (!player) return;
  if (isPlaying.value) player.pauseVideo();
  else player.playVideo();
};

const toggleMute = () => {
  if (!player) return;
  if (player.isMuted()) {
    player.unMute();
    isMuted.value = false;
    // Coming back from mute at zero would look like a dead control.
    if (volume.value === 0) setVolume(60);
  } else {
    player.mute();
    isMuted.value = true;
  }
};

const setVolume = (value) => {
  const v = Math.round(Number(value));
  volume.value = v;
  if (!player) return;
  player.setVolume(v);
  if (v === 0) { player.mute(); isMuted.value = true; }
  else if (player.isMuted()) { player.unMute(); isMuted.value = false; }
};

const seek = (value) => {
  if (!player) return;
  const t = Number(value);
  current.value = t;
  player.seekTo(t, true);
};

watch(() => props.videoId, (id) => {
  if (player && typeof player.loadVideoById === 'function') player.loadVideoById(id);
});

onMounted(build);
onBeforeUnmount(() => {
  stopTicker();
  if (player && typeof player.destroy === 'function') player.destroy();
  player = null;
});
</script>

<style scoped>
.range {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.25);
  cursor: pointer;
}
.range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #FFCD00;
  border: none;
}
.range::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border: none;
  border-radius: 50%;
  background: #FFCD00;
}
.range:focus-visible { outline: 2px solid #FFCD00; outline-offset: 2px; }
</style>
