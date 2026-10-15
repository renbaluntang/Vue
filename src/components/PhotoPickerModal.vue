<template>
  <Transition
    enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="fixed inset-0 z-50 !m-0 flex items-start justify-center overflow-y-auto bg-slate-900/60 px-3 pt-6 pb-3 backdrop-blur-xs sm:pt-16"
      @click.self="close"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-picker-title"
        class="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        @click.stop
      >
        <div class="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 id="photo-picker-title" class="m-0 text-base font-extrabold text-slate-900">Profile photo</h2>
          <button
            type="button"
            @click="close"
            class="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close"
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <!-- Two ways in -->
        <div v-if="mode === 'choose'" class="space-y-3 p-5">
          <div class="mx-auto mb-1 h-28 w-28 overflow-hidden rounded-full ring-4 ring-brighture-gold/20">
            <img :src="current" alt="Current profile photo" class="h-full w-full object-cover" />
          </div>
          <button
            type="button"
            @click="startCamera"
            class="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-brighture-gold hover:bg-brighture-cream/40"
          >
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brighture-gold text-brighture-ink">
              <i class="fa-solid fa-camera" aria-hidden="true"></i>
            </span>
            <span>
              <span class="block text-sm font-bold text-slate-900">Take a photo</span>
              <span class="block text-xs text-slate-500">Use your device's camera</span>
            </span>
          </button>
          <button
            type="button"
            @click="fileInput?.click()"
            @dragover.prevent="dragging = true"
            @dragleave="dragging = false"
            @drop.prevent="onDrop"
            class="flex w-full items-center gap-3 rounded-2xl border border-dashed p-4 text-left transition"
            :class="dragging ? 'border-brighture-gold bg-brighture-cream/60' : 'border-slate-300 bg-white hover:border-brighture-gold hover:bg-brighture-cream/40'"
          >
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
              <i class="fa-solid fa-arrow-up-from-bracket" aria-hidden="true"></i>
            </span>
            <span>
              <span class="block text-sm font-bold text-slate-900">Upload image</span>
              <span class="block text-xs text-slate-500">Choose a file or drop it here · JPG, PNG, up to 10 MB</span>
            </span>
          </button>
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFile" />
          <p v-if="error" class="m-0 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">{{ error }}</p>
        </div>

        <!-- Live camera -->
        <div v-else-if="mode === 'camera'" class="space-y-4 p-5">
          <div class="relative mx-auto aspect-square w-full max-w-[18rem] overflow-hidden rounded-full bg-slate-900">
            <!-- Mirrored, like a mirror: what people expect from a front camera -->
            <video ref="video" autoplay playsinline muted class="h-full w-full -scale-x-100 object-cover"></video>
            <p v-if="!cameraReady" class="absolute inset-0 m-0 flex items-center justify-center text-xs font-semibold text-slate-300">
              Starting camera…
            </p>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="backToChoose"
              class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              :disabled="!cameraReady"
              @click="capture"
              class="flex items-center justify-center gap-2 rounded-xl bg-brighture-gold px-4 py-2.5 text-xs font-black text-brighture-ink transition hover:bg-brighture-gold-deep disabled:opacity-40"
            >
              <i class="fa-solid fa-camera" aria-hidden="true"></i> Capture
            </button>
          </div>
        </div>

        <!-- Preview before saving -->
        <div v-else-if="mode === 'preview'" class="space-y-4 p-5">
          <div class="mx-auto h-48 w-48 overflow-hidden rounded-full ring-4 ring-brighture-gold/30">
            <img :src="preview" alt="New profile photo" class="h-full w-full object-cover" />
          </div>
          <p class="m-0 text-center text-xs text-slate-500">This is how your photo will appear to instructors.</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="source === 'camera' ? startCamera() : backToChoose()"
              class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              {{ source === 'camera' ? 'Retake' : 'Choose another' }}
            </button>
            <button
              type="button"
              @click="save"
              class="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white transition hover:bg-slate-800"
            >
              Use this photo
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, nextTick } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  /** The photo shown before anything is chosen. */
  current: { type: String, default: '' },
});
const emit = defineEmits(['close', 'save']);

const MAX_BYTES = 10 * 1024 * 1024;
/** Saved photos are a 400px square JPEG — sharp on any avatar, small to store. */
const OUTPUT_SIZE = 400;

const mode = ref('choose'); // 'choose' | 'camera' | 'preview'
const source = ref('upload');
const preview = ref('');
const error = ref('');
const dragging = ref(false);
const fileInput = ref(null);
const video = ref(null);
const cameraReady = ref(false);
let stream = null;

const stopCamera = () => {
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  cameraReady.value = false;
};

const reset = () => {
  stopCamera();
  mode.value = 'choose';
  preview.value = '';
  error.value = '';
  dragging.value = false;
};

watch(() => props.open, (isOpen) => { if (!isOpen) reset(); });
onBeforeUnmount(stopCamera);

const close = () => { reset(); emit('close'); };
const backToChoose = () => { stopCamera(); mode.value = 'choose'; };

/** Centre-crops any image source to a square and returns a JPEG data URL. */
const toSquare = (img, width, height, mirror = false) => {
  const side = Math.min(width, height);
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext('2d');
  if (mirror) { ctx.translate(OUTPUT_SIZE, 0); ctx.scale(-1, 1); }
  ctx.drawImage(img, (width - side) / 2, (height - side) / 2, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  return canvas.toDataURL('image/jpeg', 0.88);
};

const startCamera = async () => {
  error.value = '';
  if (!navigator.mediaDevices?.getUserMedia) {
    error.value = 'Your browser cannot use the camera here. Upload an image instead.';
    mode.value = 'choose';
    return;
  }
  mode.value = 'camera';
  cameraReady.value = false;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false });
    await nextTick();
    if (!video.value) { stopCamera(); return; }
    video.value.srcObject = stream;
    video.value.onloadedmetadata = () => { cameraReady.value = true; };
  } catch (err) {
    stopCamera();
    mode.value = 'choose';
    error.value = err?.name === 'NotAllowedError'
      ? 'Camera access was blocked. Allow the camera in your browser settings, or upload an image instead.'
      : err?.name === 'NotFoundError'
        ? 'No camera was found on this device. Upload an image instead.'
        : 'The camera could not be started. Upload an image instead.';
  }
};

const capture = () => {
  const v = video.value;
  if (!v || !v.videoWidth) return;
  // Mirror the saved photo too, so it matches what the student saw.
  preview.value = toSquare(v, v.videoWidth, v.videoHeight, true);
  source.value = 'camera';
  stopCamera();
  mode.value = 'preview';
};

const readFile = (file) => {
  error.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) { error.value = 'That file is not an image. Choose a JPG or PNG.'; return; }
  if (file.size > MAX_BYTES) { error.value = 'That image is over 10 MB. Choose a smaller one.'; return; }
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      preview.value = toSquare(img, img.naturalWidth, img.naturalHeight);
      source.value = 'upload';
      mode.value = 'preview';
    };
    img.onerror = () => { error.value = 'That image could not be read. Try another file.'; };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
};

const onFile = (event) => {
  readFile(event.target.files?.[0]);
  event.target.value = '';
};
const onDrop = (event) => {
  dragging.value = false;
  readFile(event.dataTransfer?.files?.[0]);
};

const save = () => {
  emit('save', preview.value);
  reset();
};
</script>
