<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-4xl mx-auto pb-28">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <!-- The status pill only appears once there is a status to report. -->
        <div v-if="isDirty || hasSavedOnce" class="mb-1.5 flex items-center gap-2">
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
            :class="isDirty ? 'border border-amber-300 bg-amber-100 text-amber-900' : 'border border-emerald-300 bg-emerald-100 text-emerald-900'"
          >
            <span class="h-2 w-2 rounded-full" :class="isDirty ? 'bg-amber-500' : 'bg-emerald-500'" aria-hidden="true"></span>
            {{ isDirty ? 'Unsaved changes' : 'All changes saved' }}
          </span>
        </div>

        <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Profile Setting</h1>
        <p class="mt-0.5 text-sm text-slate-500">How students see you on the booking page.</p>
      </div>

      <div v-if="isDirty" class="flex shrink-0 items-center gap-2">
        <button
          type="button"
          @click="revert"
          class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
        >
          Discard
        </button>
        <button
          type="button"
          @click="save"
          class="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-95"
        >
          Save
        </button>
      </div>
    </header>

    <!-- Identity -->
    <section class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div class="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div class="relative shrink-0 group">
          <img
            :src="teacher.profile.photo"
            alt="Instructor avatar"
            class="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md ring-4 ring-brighture-gold/20"
          />
          <div class="absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-full bg-black/40 text-[11px] font-bold text-white opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
            <i class="fa-solid fa-camera mb-0.5 text-sm"></i>
            <span>Replace</span>
          </div>
        </div>

        <div class="grid w-full gap-3 sm:grid-cols-2">
          <label class="block">
            <span class="mb-1 block text-xs font-bold text-slate-600">First name</span>
            <input v-model="form.firstName" type="text" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-brighture-gold focus:bg-white" />
          </label>
          <label class="block">
            <span class="mb-1 block text-xs font-bold text-slate-600">Last name</span>
            <input v-model="form.lastName" type="text" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-brighture-gold focus:bg-white" />
          </label>
          <label class="block sm:col-span-2">
            <span class="mb-1 block text-xs font-bold text-slate-600">Email</span>
            <input v-model="form.email" type="email" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-brighture-gold focus:bg-white" />
          </label>
        </div>
      </div>
    </section>

    <!-- Teaching -->
    <section class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
      <h2 class="text-sm font-black uppercase tracking-wider text-slate-400">Teaching profile</h2>

      <label class="block">
        <span class="mb-1 block text-xs font-bold text-slate-600">Major / qualification</span>
        <input v-model="form.major" type="text" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-brighture-gold focus:bg-white" />
      </label>

      <label class="block">
        <span class="mb-1 block text-xs font-bold text-slate-600">Self introduction</span>
        <textarea v-model="form.selfIntro" rows="4" maxlength="600" class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-brighture-gold focus:bg-white"></textarea>
        <span class="mt-1 block text-right text-[11px] text-slate-400">{{ form.selfIntro.length }} / 600</span>
      </label>

      <label class="block">
        <span class="mb-1 block text-xs font-bold text-slate-600">Intro video</span>
        <input v-model="form.introVideo" type="url" placeholder="Paste YouTube intro-video URL here" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-brighture-gold focus:bg-white" />
      </label>

      <!-- Read-only: the school decides which subjects a teacher is
           assigned, so this lists them rather than offering toggles. -->
      <div>
        <div class="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <span class="text-xs font-bold text-slate-600">Subjects you teach</span>
          <span class="text-[11px] font-medium text-slate-400">
            <i class="fa-solid fa-lock mr-1 text-[10px]" aria-hidden="true"></i>Set by the school
          </span>
        </div>
        <ul class="m-0 flex list-none flex-wrap gap-x-4 gap-y-2 p-0">
          <li v-for="code in teacher.profile.subjects" :key="code" class="inline-flex items-center text-xs font-bold text-slate-700">
            <SubjectCode :subject="code" :show-name="hasSubjectName(code)" size="sm" />
          </li>
        </ul>
        <p class="mt-2.5 text-[11px] text-slate-500">
          To add or remove a subject, contact the school at
          <a :href="`mailto:${SUPPORT_EMAIL}`" class="font-bold text-brighture-bronze hover:underline">{{ SUPPORT_EMAIL }}</a>.
        </p>
      </div>
    </section>

    <!-- Working -->
    <section class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
      <h2 class="text-sm font-black uppercase tracking-wider text-slate-400">Working preferences</h2>

      <div class="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
        <div class="min-w-0">
          <p class="text-sm font-bold text-slate-800">Google Calendar</p>
          <p class="text-[11px] text-slate-500">{{ teacher.googleCalendarLinked ? 'Reservations sync automatically.' : 'Not connected.' }}</p>
        </div>
        <button
          type="button"
          @click="teacher.googleCalendarLinked ? teacher.unlinkGoogleCalendar() : teacher.linkGoogleCalendar()"
          class="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 active:scale-95"
        >
          {{ teacher.googleCalendarLinked ? 'Disconnect' : 'Connect' }}
        </button>
      </div>

      <div class="grid gap-3 pt-1 sm:grid-cols-2">
        <label class="block">
          <span class="mb-1 block text-xs font-bold text-slate-600">Your timezone</span>
          <select
            v-model="form.timezone"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-brighture-gold focus:bg-white"
          >
            <option v-for="zone in timezones" :key="zone" :value="zone">{{ zone }}</option>
          </select>
          <span class="mt-1 block text-[11px] text-slate-400">Every schedule and lesson time is shown in this zone.</span>
        </label>
        <div class="rounded-xl bg-slate-50 p-3">
          <dt class="text-[10px] font-bold uppercase tracking-wider text-slate-400">School timezone</dt>
          <dd class="mt-0.5 text-sm font-bold text-slate-800">{{ teacher.profile.schoolTimezone }}</dd>
          <dd class="mt-0.5 text-[11px] text-slate-400">Fixed — the school books in Tokyo time.</dd>
        </div>
      </div>
    </section>

    <Transition
      enter-active-class="transition duration-200 ease-out" enter-from-class="translate-y-12 opacity-0"
      leave-active-class="transition duration-150 ease-in" leave-to-class="translate-y-12 opacity-0"
    >
      <div
        v-if="isDirty"
        class="fixed bottom-20 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3.5 text-white shadow-2xl lg:bottom-6"
      >
        <p class="min-w-0 truncate text-xs font-semibold text-slate-200 sm:text-sm">You have unsaved profile changes.</p>
        <div class="flex shrink-0 items-center gap-2">
          <button type="button" @click="revert" class="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-400 transition hover:text-white">Discard</button>
          <button type="button" @click="save" class="rounded-xl bg-brighture-gold px-5 py-2 text-xs font-extrabold text-slate-950 transition hover:bg-brighture-gold-deep active:scale-95">Save</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import { useTeacherStore } from '../../stores/useTeacherStore';
import SubjectCode from '@/components/SubjectCode.vue';
import { parseSubject } from '@/pages/student-view-v4/constants';

const teacher = useTeacherStore();

// FC last: it is not a subject like the others but a class type, and it is
// the one that decides whether the header's Available/Away control appears.
const timezones = ['Asia/Manila (PHT)', 'Asia/Tokyo (JST)'];

const SUPPORT_EMAIL = 'support@brighture-edu.com';

// Some codes (LS2, BC, FC) have no name in the subject list yet. Those show
// the box alone rather than the same letters twice.
const hasSubjectName = (code) => parseSubject(code).name !== code;

const form = reactive({
  firstName: teacher.profile.firstName,
  lastName: teacher.profile.lastName,
  email: teacher.profile.email,
  major: teacher.profile.major,
  selfIntro: teacher.profile.selfIntro,
  introVideo: teacher.profile.introVideo,
  timezone: teacher.profile.timezone,
});

const savedSnapshot = ref(JSON.stringify(form));
const hasSavedOnce = ref(false);
const isDirty = computed(() => JSON.stringify(form) !== savedSnapshot.value);

const revert = () => { Object.assign(form, JSON.parse(savedSnapshot.value)); };

// Saved to the shared store: it survives a reload, and the intro and major
// show on the student booking page and teacher pop-up.
const save = () => {
  teacher.saveProfile({ ...form });
  savedSnapshot.value = JSON.stringify(form);
  hasSavedOnce.value = true;
};
</script>
