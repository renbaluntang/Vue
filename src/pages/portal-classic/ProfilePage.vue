<template>
  <div class="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Student Profile</h1>
        <p class="text-sm text-slate-500 font-medium mt-1">Manage your student credentials, online class preferences, and goals.</p>
      </div>
      <button
        @click="saveProfile"
        :disabled="!hasUnsavedChanges"
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm hover:scale-105 active:scale-95 transition disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-slate-900"
      >
        <span v-if="isSaved">✓ Saved!</span>
        <span v-else>Save Changes</span>
      </button>
    </div>

    <!-- Main Profile Card with BIG Profile Avatar -->
    <div class="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
      <!-- Big Avatar Section -->
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-slate-100">
        <div class="relative group">
          <!-- Bigger Avatar (w-32 h-32) -->
          <img
            :src="user.profile.photo"
            alt="Profile Avatar"
            class="w-28 h-28 sm:w-32 sm:h-32 rounded-full shadow-lg object-cover border-4 border-white ring-4 ring-indigo-100"
          />
          <button
            type="button"
            @click="triggerPhotoUpload"
            class="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/65 text-[11px] font-bold uppercase tracking-wider text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            Replace
          </button>
          <input
            ref="photoInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handlePhotoSelected"
          />
        </div>

        <div class="text-center sm:text-left space-y-2 flex-1">
          <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 class="text-2xl font-extrabold text-slate-900">{{ user.fullName }}</h2>
            <span class="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-extrabold border border-indigo-200">
              {{ user.profile.level }}
            </span>
          </div>
          <p class="text-sm text-slate-400 font-semibold">Member since {{ user.profile.memberSince }}</p>

          <div class="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-xl border border-amber-200">
              <span>🔥</span> {{ user.stats.currentStreak }} Day Streak
            </span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
              <span>🎓</span> {{ user.stats.totalLessons }} Online Lessons Completed
            </span>
          </div>
        </div>
      </div>

      <!-- Form Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">First Name (Local)</label>
          <input
            type="text"
            v-model="user.profile.firstName"
            class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200 transition"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Last Name (Local)</label>
          <input
            type="text"
            v-model="user.profile.lastName"
            class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200 transition"
          />
        </div>


        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Student Timezone</label>
          <select
            v-model="user.profile.timezone"
            class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200 transition"
          >
            <option v-for="zone in TIMEZONES" :key="zone.value" :value="zone.value">{{ zone.label }}</option>
          </select>
        </div>


        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Gender <span class="text-red-500">*</span></label>
          <div class="flex items-center gap-3">
            <label
              v-for="option in GENDERS"
              :key="option.value"
              :class="`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border py-3 px-4 text-sm font-semibold transition ${
                user.profile.gender === option.value
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300'
              }`"
            >
              <input type="radio" class="sr-only" :value="option.value" v-model="user.profile.gender" />
              {{ option.label }}
            </label>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Date of Birth <span class="text-red-500">*</span></label>
          <div class="flex gap-3">
            <select v-model.number="user.profile.birthYear" class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200 transition" aria-label="Birth year">
              <option v-for="year in BIRTH_YEARS" :key="year" :value="year">{{ year }}</option>
            </select>
            <select v-model.number="user.profile.birthMonth" class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200 transition" aria-label="Birth month">
              <option v-for="(label, index) in MONTHS" :key="label" :value="index + 1">{{ label }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address <span class="text-red-500">*</span></label>
          <input type="email" autocomplete="email" v-model="user.profile.email" class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200 transition" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Google Account (Gmail) <span class="text-red-500">*</span></label>
          <input type="email" v-model="user.profile.googleAccount" class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200 transition" />
          <p class="mt-1.5 text-[11px] font-medium text-slate-400">Used to invite you to Google Meet.</p>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">New Password</label>
          <input
            type="password"
            autocomplete="new-password"
            v-model="newPassword"
            placeholder="Leave blank to keep your current one"
            class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200 transition"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Confirm New Password</label>
          <input type="password" autocomplete="new-password" v-model="confirmPassword" class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200 transition" />
          <p v-if="passwordMismatch" class="mt-1.5 text-[11px] font-bold text-red-600">
            Passwords do not match.
          </p>
        </div>

        <div class="sm:col-span-2">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">English Learning Objectives <span class="text-red-500">*</span></label>
          <select v-model="user.profile.learningObjective" class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200 transition">
            <option v-for="option in LEARNING_OBJECTIVES" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="sm:col-span-2">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Study Goal & Focus</label>
          <input
            type="text"
            v-model="user.profile.targetGoal"
            placeholder="e.g. Business Meetings, IELTS 7.5, Accent Reduction"
            class="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200 transition"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useUserStore } from '../../stores/useUserStore';

const user = useUserStore();
const isSaved = ref(false);

const photoInputRef = ref(null);

const triggerPhotoUpload = () => {
  photoInputRef.value?.click();
};

const handlePhotoSelected = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) user.profile.photo = e.target.result;
  };
  reader.readAsDataURL(file);
};

// Everything the form can edit. Compared against the value captured on load so
// Save only lights up when something actually differs.
const snapshot = () =>
  JSON.stringify({
    ...user.profile,
    newPassword: newPassword.value,
    confirmPassword: confirmPassword.value,
  });

const savedSnapshot = ref('');
onMounted(() => {
  savedSnapshot.value = snapshot();
});

const hasUnsavedChanges = computed(() => savedSnapshot.value !== '' && snapshot() !== savedSnapshot.value);

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Oldest first would bury the likely values; students are adults, so start at 16.
const thisYear = new Date().getFullYear();
const BIRTH_YEARS = Array.from({ length: 80 }, (_, i) => thisYear - 16 - i);

const LEARNING_OBJECTIVES = [
  { value: 'business', label: 'Work & business communication' },
  { value: 'higher-education', label: 'Higher education' },
  { value: 'exam', label: 'Exam preparation (IELTS, TOEIC, TOEFL)' },
  { value: 'living-abroad', label: 'Living or working abroad' },
  { value: 'travel', label: 'Travel' },
  { value: 'general', label: 'General conversation' },
];

const TIMEZONES = [
  { value: 'Asia/Tokyo (JST)', label: 'UTC+09:00 — Tokyo (Asia)' },
  { value: 'Asia/Manila (PHT)', label: 'UTC+08:00 — Manila (Asia)' },
  { value: 'Asia/Shanghai (CST)', label: 'UTC+08:00 — Shanghai (Asia)' },
  { value: 'Europe/London (GMT)', label: 'UTC+00:00 — London (Europe)' },
  { value: 'America/New_York (EST)', label: 'UTC-05:00 — New York (America)' },
];

const newPassword = ref('');
const confirmPassword = ref('');
const passwordMismatch = computed(
  () => Boolean(confirmPassword.value) && newPassword.value !== confirmPassword.value
);



const saveProfile = () => {
  if (passwordMismatch.value || !hasUnsavedChanges.value) return;
  newPassword.value = '';
  confirmPassword.value = '';
  savedSnapshot.value = snapshot();
  isSaved.value = true;
  setTimeout(() => {
    isSaved.value = false;
  }, 2500);
};
</script>
