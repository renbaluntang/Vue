<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { getTeacherPhoto } from "./constants";

const props = defineProps({
  teacher: { type: Object, required: true },
  dayLabel: { type: String, default: "" },
  startLabel: { type: String, default: "" },
  endLabel: { type: String, default: "" },
  minutes: { type: Number, required: true },
  points: { type: Number, required: true },
  subject: { type: String, default: "" },
  subjectOptions: { type: Array, default: () => [] },
  message: { type: String, default: "" },
  /** Points before booking; when given, the cost shows what is left after. */
  balance: { type: Number, default: null },
  /** 'page' fills the screen (older portals); 'modal' floats over the calendar. */
  variant: { type: String, default: "page" },
});

const emit = defineEmits(["update:subject", "update:message", "cancel", "submit"]);

const MESSAGE_MAX = 500;
const lengthLabel = computed(() => (props.minutes === 60 ? "1 hour" : "30 min"));

/** "2:30 – 3:30 PM": the period is said once when both ends share it. */
const timeRange = computed(() => {
  const [s, sp] = props.startLabel.split(" ");
  const [e, ep] = props.endLabel.split(" ");
  return sp && sp === ep ? `${s} – ${e} ${ep}` : `${props.startLabel} – ${props.endLabel}`;
});
const isModal = computed(() => props.variant === "modal");

/* A subject is required: the teacher plans the lesson around it. Booking is
   refused until one is chosen, and the field says why. */
const needsSubject = computed(() => props.subjectOptions.length > 0 && !props.subject);
const showSubjectError = ref(false);
const subjectSelect = ref(null);
watch(() => props.subject, (value) => { if (value) showSubjectError.value = false; });
const submit = () => {
  if (needsSubject.value) {
    showSubjectError.value = true;
    subjectSelect.value?.focus();
    return;
  }
  emit("submit");
};

// Esc closes the modal, the same as Cancel. Caught on the way down and
// stopped there, so the calendar underneath keeps the chosen slot.
const onKey = (e) => {
  if (!isModal.value || e.key !== "Escape") return;
  e.stopPropagation();
  emit("cancel");
};
onMounted(() => window.addEventListener("keydown", onKey, true));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey, true));
</script>

<template>
  <!-- Final step of booking: one compact card — what is being booked on top,
       the two choices in the middle, the button at the bottom. As a page in
       the older portals, as a modal over the calendar in the main one. -->
  <div
    :class="isModal
      ? 'fixed inset-0 z-[60] !m-0 flex items-start justify-center overflow-y-auto bg-slate-900/60 px-3 pt-6 pb-3 text-slate-800 backdrop-blur-xs sm:pt-16'
      : 'min-h-screen bg-[#F4F6F8] px-3 py-5 text-slate-800 sm:px-6 sm:py-8'"
    @click.self="isModal && emit('cancel')"
  >
    <div class="mx-auto w-full max-w-2xl">
      <button
        v-if="!isModal"
        type="button"
        @click="emit('cancel')"
        class="mb-3 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-bold text-slate-500 transition hover:bg-white hover:text-slate-900"
      >
        <i class="fa-solid fa-arrow-left text-[10px]" aria-hidden="true"></i> Back to calendar
      </button>

      <div
        class="overflow-hidden rounded-3xl border border-slate-200 bg-white"
        :class="isModal ? 'shadow-2xl' : 'shadow-sm'"
        :role="isModal ? 'dialog' : null"
        :aria-modal="isModal ? 'true' : null"
        aria-labelledby="confirm-lesson-title"
      >
        <div class="flex items-start justify-between gap-3 px-5 pt-5 sm:px-7 sm:pt-6">
          <div>
            <p class="m-0 text-[10px] font-black uppercase tracking-[0.16em] text-brighture-bronze">Step 2 of 2 · Confirm</p>
            <h1 id="confirm-lesson-title" class="m-0 mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">Confirm your lesson</h1>
          </div>
          <button
            v-if="isModal"
            type="button"
            @click="emit('cancel')"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Back to calendar"
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <!-- What is being booked -->
        <div class="mx-5 mt-4 grid grid-cols-1 items-center gap-4 rounded-2xl border border-brighture-gold/25 bg-brighture-cream/50 p-4 sm:mx-7 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div class="flex min-w-0 items-center gap-4">
            <img
              :src="getTeacherPhoto(teacher)"
              :alt="teacher.name"
              class="h-20 w-20 shrink-0 rounded-2xl object-cover ring-2 ring-white shadow-sm sm:h-24 sm:w-24"
            />
            <div class="min-w-0">
              <!-- Three steps down: who it is with, the day, then the time. -->
              <p class="m-0 truncate text-xs font-medium text-slate-500">
                with <span class="font-bold text-slate-700">{{ teacher.name }}</span>
              </p>
              <p class="m-0 mt-1 text-lg font-black leading-tight tracking-tight text-slate-900">{{ dayLabel }}</p>
              <p class="m-0 mt-1 flex flex-wrap items-baseline gap-x-2 text-sm">
                <span class="font-bold text-slate-800 tabular-nums">{{ timeRange }}</span>
                <span class="text-xs font-medium text-slate-500">
                  <i class="fa-regular fa-clock mr-0.5 text-sky-600" aria-hidden="true"></i>{{ lengthLabel }} · JST
                </span>
              </p>
            </div>
          </div>

          <!-- Cost, then the balance it comes out of: labelled rows rather than
               a bare "116 → 114", so the numbers say what they are. -->
          <div class="border-t border-brighture-gold/20 pt-3 sm:min-w-[9.5rem] sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <div class="flex items-baseline justify-between gap-3">
              <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">Cost</span>
              <span class="text-xl font-black text-slate-900 tabular-nums">
                {{ points }} <span class="text-xs font-bold text-slate-500">pt{{ points === 1 ? '' : 's' }}</span>
              </span>
            </div>
            <dl v-if="balance !== null" class="m-0 mt-1.5 space-y-0.5 border-t border-dashed border-brighture-gold/30 pt-1.5 text-[11px] tabular-nums">
              <div class="flex justify-between gap-3">
                <dt class="font-medium text-slate-500">Your balance</dt>
                <dd class="m-0 font-bold text-slate-700">{{ balance }} pts</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="font-medium text-slate-500">After booking</dt>
                <dd class="m-0 font-black" :class="balance - points < 0 ? 'text-rose-600' : 'text-emerald-700'">
                  {{ Math.max(0, balance - points) }} pts
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div class="space-y-5 px-5 py-5 sm:px-7">
          <!-- Subject -->
          <div>
            <label for="confirm-subject" class="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
              <i class="fa-solid fa-book-open text-indigo-500" aria-hidden="true"></i> Lesson subject
              <span class="font-semibold normal-case tracking-normal text-rose-500">Required</span>
            </label>
            <div class="relative">
              <select
                id="confirm-subject"
                ref="subjectSelect"
                :value="subject"
                :aria-invalid="showSubjectError ? 'true' : null"
                aria-describedby="confirm-subject-error"
                @change="emit('update:subject', $event.target.value)"
                class="w-full cursor-pointer appearance-none rounded-xl border bg-white py-3 pl-3.5 pr-10 text-sm font-semibold outline-none transition focus:ring-4"
                :class="[
                  subject ? 'text-slate-900' : 'text-slate-400',
                  showSubjectError
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                    : 'border-slate-200 hover:border-slate-300 focus:border-brighture-gold focus:ring-brighture-gold/15',
                ]"
              >
                <option value="">Choose a subject</option>
                <option v-for="opt in subjectOptions" :key="opt.value" :value="opt.value" class="text-slate-900">{{ opt.label }}</option>
              </select>
              <i class="fa-solid fa-chevron-down pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400" aria-hidden="true"></i>
            </div>
            <p
              v-if="showSubjectError"
              id="confirm-subject-error"
              class="m-0 mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-600"
              role="alert"
            >
              <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
              Choose a subject so {{ teacher.name.split(' ')[0] }} can prepare for your lesson.
            </p>
          </div>

          <!-- Message -->
          <div>
            <label for="confirm-message" class="mb-2 flex items-center justify-between gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
              <span class="flex items-center gap-2">
                <i class="fa-regular fa-message text-sky-600" aria-hidden="true"></i>
                Message for {{ teacher.name.split(' ')[0] }}
                <span class="font-semibold normal-case tracking-normal text-slate-400">(optional)</span>
              </span>
              <span class="font-semibold normal-case tracking-normal text-slate-400 tabular-nums">{{ message.length }}/{{ MESSAGE_MAX }}</span>
            </label>
            <textarea
              id="confirm-message"
              :value="message"
              :maxlength="MESSAGE_MAX"
              rows="3"
              @input="emit('update:message', $event.target.value)"
              placeholder="e.g. Let's focus on business vocabulary for my meeting on Friday."
              class="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brighture-gold focus:ring-4 focus:ring-brighture-gold/15"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p class="m-0 text-[11px] font-medium text-slate-500">
            <i class="fa-solid fa-shield-halved mr-1 text-emerald-600" aria-hidden="true"></i>
            Free cancellation up to 3 hours before the lesson.
          </p>
          <div class="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <button
              type="button"
              @click="emit('cancel')"
              class="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="submit"
              class="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"
            >
              Confirm &amp; book
              <i class="fa-solid fa-arrow-right text-xs transition-transform group-hover:translate-x-0.5" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
