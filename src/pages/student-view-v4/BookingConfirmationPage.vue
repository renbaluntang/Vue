<script setup>
import { Check, Calendar, Zap, BookOpen, MessageCircle, ChevronDown, ArrowRight } from "lucide-vue-next";
import { getTeacherPhoto } from "./constants";

defineProps({
  teacher: { type: Object, required: true },
  dayLabel: { type: String, default: "" },
  startLabel: { type: String, default: "" },
  endLabel: { type: String, default: "" },
  minutes: { type: Number, required: true },
  points: { type: Number, required: true },
  subject: { type: String, default: "" },
  subjectOptions: { type: Array, default: () => [] },
  message: { type: String, default: "" },
});

const emit = defineEmits(["update:subject", "update:message", "cancel", "submit"]);
</script>

<template>
  <div class="min-h-screen bg-[#F4F6F8] px-3 py-6 text-slate-800 sm:px-6 sm:py-10">
    <div class="mx-auto max-w-[850px] rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
      <!-- Header Bar -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-6">
        <div class="flex items-center gap-4">
          <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
            <Check class="h-6 w-6 stroke-[3]" />
          </span>
          <div>
            <h1 class="m-0 text-xl font-bold text-slate-900">
              Reservation Details &amp; Message
            </h1>
            <p class="m-0 mt-1 text-sm text-slate-500">
              Please review your lesson booking summary before finalizing
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="emit('cancel')"
          class="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          ← Back to Calendar
        </button>
      </div>

      <!-- Content Body -->
      <div class="mt-8 space-y-8">
        <!-- 1. Horizontal Profile & Lesson Summary Card -->
        <div class="flex flex-col sm:flex-row items-stretch rounded-2xl border border-slate-200 bg-[#F9FAFB] p-6 shadow-sm">
          <!-- Left: Profile -->
          <div class="flex flex-col items-center sm:border-r sm:border-slate-200 sm:pr-8 sm:min-w-[220px]">
            <div class="relative">
              <img :src="getTeacherPhoto(teacher)" :alt="teacher.name" class="h-24 w-24 rounded-full object-cover shadow-sm ring-4 ring-sky-50" />
              <span class="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                <Check class="h-3.5 w-3.5 text-white stroke-[3]" />
              </span>
            </div>
            <div class="mt-4 text-center">
              <div class="text-[17px] font-bold text-slate-900">{{ teacher.name }}</div>
              <div class="mt-2 inline-flex rounded bg-white border border-sky-200 px-2 py-0.5 text-[11px] font-bold text-sky-600 shadow-sm">
                {{ teacher.specialty }}
              </div>
            </div>
          </div>

          <!-- Right: Lesson Details -->
          <div class="flex-1 sm:pl-8 flex flex-col justify-center gap-6">
            <div>
              <span class="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Calendar class="h-4 w-4 text-slate-400" /> Date &amp; Time
              </span>
              <div class="text-[22px] font-bold tracking-tight text-slate-800">
                {{ dayLabel }}, {{ startLabel }} – {{ endLabel }}
              </div>
              <div class="mt-1 text-[15px] text-slate-500">
                ({{ minutes === 60 ? "1 hour" : "30 min" }}) · Tokyo (UTC+09:00)
              </div>
            </div>

            <div>
              <span class="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Zap class="h-4 w-4 text-amber-500" /> Points Required
              </span>
              <div class="inline-flex items-center rounded-xl border border-sky-100 bg-white px-5 py-2.5 text-xl font-bold text-sky-600 shadow-sm">
                {{ points }} Points
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Lesson Subject -->
        <div>
          <label
            for="confirm-subject"
            class="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
          >
            <BookOpen class="h-4 w-4 text-slate-500" /> Lesson Subject:
          </label>
          <div class="relative">
            <select
              id="confirm-subject"
              :value="subject"
              @change="emit('update:subject', $event.target.value)"
              class="w-full appearance-none rounded-xl border border-slate-200 bg-white p-4 pr-10 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="">Select a subject</option>
              <option v-for="opt in subjectOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
            <ChevronDown class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <!-- 3. Message Textarea -->
        <div>
          <label class="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <MessageCircle class="h-4 w-4 text-slate-500" /> Message or Request for Teacher (Optional):
          </label>
          <textarea
            :value="message"
            @input="emit('update:message', $event.target.value)"
            placeholder="e.g., Let's focus on business vocabulary..."
            class="h-28 w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          />
        </div>
      </div>

      <!-- Bottom Actions -->
      <div class="mt-8 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-slate-100 pt-6">
        <button
          type="button"
          @click="emit('cancel')"
          class="w-full sm:w-auto rounded-full border border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="emit('submit')"
          class="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#2E9B66] px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#258355]"
        >
          Confirm &amp; Book Lesson
          <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  </div>
</template>
