<script setup>
import { computed, reactive, ref } from "vue";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Star,
  FileText,
  Volume2,
  Sparkles,
  GraduationCap,
  Ticket,
} from "lucide-vue-next";
import heroPhoto from "@/assets/hero-lesson.jpg";
import brightureLogo from "@/assets/logo-black.svg";
import studentAvatar from "@/assets/student-1.svg";

const HERO_COPY = {
  login: {
    heading: ["Real-world English", "built for your goals."],
    subtext: "Structured 50-minute 1-on-1 lessons with certified instructors focusing on practical speaking, pronunciation, listening, and writing.",
  },
  register: {
    heading: ["Start your trial lesson", "on us."],
    subtext: "Create your free account in minutes, match with an instructor, and receive real-time tracked feedback from your very first lesson.",
  },
};

const mode = ref("login");
const showPassword = ref(false);
const showConfirm = ref(false);
const submitting = ref(false);
const submitted = ref(false);
const remember = ref(true);
const agree = ref(false);
const errors = reactive({});
const form = reactive({
  firstName: "",
  lastName: "",
  email: "ren.baluntang+2@brighture.jp",
  password: "••••••••",
  confirmPassword: "",
  referralCode: "",
});

const isLogin = computed(() => mode.value === "login");
const heroCopy = computed(() => HERO_COPY[mode.value]);

function clearError(key) {
  if (errors[key]) errors[key] = undefined;
}

function onPasswordInput() {
  clearError("password");
  clearError("confirmPassword");
}

function switchMode(next) {
  if (next === mode.value) return;
  mode.value = next;
  Object.keys(errors).forEach((key) => delete errors[key]);
  submitted.value = false;
}

function validate() {
  const next = {};
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  if (!form.email) next.email = "Email is required";
  else if (!emailOk) next.email = "Enter a valid email address";

  if (!form.password) next.password = "Password is required";
  else if (!isLogin.value && form.password.length < 8)
    next.password = "Use at least 8 characters";

  if (!isLogin.value) {
    if (!form.firstName) next.firstName = "First name is required";
    if (!form.lastName) next.lastName = "Last name is required";
    if (form.confirmPassword !== form.password)
      next.confirmPassword = "Passwords don't match";
    if (!agree.value) next.agree = "Please accept the Terms to continue";
  }

  Object.keys(errors).forEach((key) => delete errors[key]);
  Object.assign(errors, next);
  return Object.keys(next).length === 0;
}

function handleSubmit() {
  if (!validate()) return;

  submitting.value = true;
  setTimeout(() => {
    submitting.value = false;
    submitted.value = true;
  }, 900);
}

function resetForm() {
  submitted.value = false;
  form.firstName = "";
  form.lastName = "";
  form.email = "";
  form.password = "";
  form.confirmPassword = "";
  agree.value = false;
}

function passwordScore(password) {
  let s = 0;
  if (password.length >= 8) s += 1;
  if (/[A-Z]/.test(password)) s += 1;
  if (/[0-9]/.test(password)) s += 1;
  if (/[^A-Za-z0-9]/.test(password)) s += 1;
  return s;
}

const strengthScore = computed(() => passwordScore(form.password));
const strengthLabels = ["Too weak", "Weak", "Okay", "Good", "Strong"];
const strengthColors = ["bg-rose-400", "bg-rose-400", "bg-amber-400", "bg-amber-500", "bg-emerald-500"];
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-white" />

  <!-- Submitted View -->
  <main
    v-if="submitted"
    class="relative isolate flex min-h-dvh w-full items-center justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]"
  >
    <div class="w-full max-w-sm rounded-[1.75rem] border border-[#F0E4CE] bg-white p-8 text-center shadow-[0_16px_40px_-12px_rgba(200,165,100,0.2)] xshort:p-6">
      <a href="#" class="inline-block">
        <img :src="brightureLogo" alt="Brighture" class="mx-auto h-8 w-auto" />
      </a>
      <div class="mx-auto mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
        <CheckCircle2 class="h-8 w-8 text-amber-600" />
      </div>
      <h1 class="mt-4 font-display text-xl font-bold text-brighture-ink">
        {{ isLogin ? "Welcome back!" : "Account created!" }}
      </h1>
      <p class="mt-2 text-xs leading-relaxed text-[#736B5E]">
        {{ isLogin
          ? "You're logged in. Redirecting you to your student dashboard…"
          : "Check your inbox to verify your email and start your free trial lesson." }}
      </p>
      <button
        type="button"
        @click="resetForm"
        class="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-brighture-ink transition hover:text-amber-600"
      >
        Back to {{ isLogin ? "login" : "sign up" }} <ArrowRight class="h-4 w-4" />
      </button>
    </div>
  </main>

  <!--
    Split layout that centers when it fits and scrolls when it doesn't.
    `min-h-dvh` (never a fixed `h-dvh` + `overflow-hidden`) is what keeps short
    viewports from clipping the card — the page grows and scrolls instead.
    `overflow-x-hidden` only contains the hero's negatively-offset badges.
  -->
  <main
    v-else
    class="relative isolate flex min-h-dvh w-full items-center justify-center overflow-x-hidden px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pb-6 sm:pt-6"
  >
    <div class="w-full max-w-7xl">
      <div class="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-10">

        <!-- Left Hero Section with Collage (8 columns — the collage leads, FB-style) -->
        <div class="lg:col-span-8">
          <div class="relative hidden flex-col justify-center p-6 lg:flex xl:p-10 short:p-4 xshort:p-2">
            <!-- Collage and headline share one measure so their left edges line up -->
            <div class="mx-auto w-full max-w-xl xl:max-w-2xl short:max-w-xl xshort:max-w-lg">
              <!-- Middle Hero Graphic Collage (Facebook style floating interactive layers) -->
              <div class="relative w-full">
                <!-- Decorative ambient background blur behind collage -->
                <div class="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-300/20 via-amber-200/30 to-amber-100/10 blur-2xl" />

                <!-- Central main photo card -->
                <div class="relative z-10 overflow-hidden rounded-2xl border border-white/80 bg-white p-2.5 shadow-[0_20px_50px_-12px_rgba(180,140,60,0.25)] transition-transform duration-500 hover:scale-[1.01]">
                  <div class="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-900 xshort:aspect-[16/10]">
                    <img
                      :src="heroPhoto"
                      alt="1-on-1 Lesson"
                      class="h-full w-full object-cover object-center"
                    />
                    <!-- Live indicator badge -->
                    <div class="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                      <span class="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
                      <span>16:45</span>
                    </div>
                    <!-- Bottom info scrim -->
                    <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent p-4 text-white">
                      <div class="flex items-center justify-between">
                        <div>
                          <p class="text-xs text-white/80">Certified 1-on-1 Instructor</p>
                        </div>
                        <div class="flex items-center gap-1 rounded-lg bg-amber-400/90 px-2 py-0.5 text-xs font-bold text-slate-950">
                          <Star class="h-3.5 w-3.5 fill-slate-950 stroke-none" />
                          <span>4.9</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Floating card 1 — Bottom Left overlapping student lesson badge -->
                <div class="absolute -bottom-3 -left-8 z-20 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-3.5 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 short:-bottom-2 short:-left-6 short:p-3">
                  <div class="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100/80 short:h-11 short:w-11">
                    <img :src="studentAvatar" alt="" class="h-8 w-8" />
                    <span class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                  </div>
                  <div>
                    <div class="flex items-center gap-1.5">
                      <p class="text-sm font-bold text-brighture-ink short:text-xs">[SF] Speech Fluency</p>
                      <span class="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-900">50 min</span>
                    </div>
                    <p class="text-xs text-slate-500 short:text-[11px]">1-on-1 Intensive Session</p>
                  </div>
                </div>

                <!-- Floating Brighture Feature Badge 1 — Top Left -->
                <div class="absolute -left-8 -top-5 z-20 flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-transform duration-300 hover:scale-105 short:-left-6 short:-top-4 short:p-2.5">
                  <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-900 short:h-9 short:w-9">
                    <Volume2 class="h-5 w-5" />
                  </div>
                  <div class="pr-1">
                    <p class="text-xs font-extrabold text-brighture-ink short:text-[11px]">[PP] Phonics &amp; Pronunciation</p>
                    <p class="text-[11px] font-medium text-slate-500 short:text-[10px]">Sound &amp; Intonation Mastery</p>
                  </div>
                </div>

                <!-- Floating Brighture Feature Badge 2 — Bottom Centre-Right.
                    Sits inboard of the corner so the photo's own 4.9 rating stays visible. -->
                <div class="absolute -bottom-5 left-[52%] z-20 flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-transform duration-300 hover:scale-105 short:-bottom-4 short:left-[48%] short:p-2.5">
                  <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-amber-400 short:h-9 short:w-9">
                    <FileText class="h-5 w-5" />
                  </div>
                  <div class="pr-1">
                    <p class="text-xs font-extrabold text-brighture-ink short:text-[11px]">Google Docs Notes</p>
                    <p class="text-[11px] font-semibold text-emerald-600 short:text-[10px]">Tracked Real-time Feedback</p>
                  </div>
                </div>

                <!-- Floating badge 3 — Right edge pill, dropped clear of the photo's live timer -->
                <div class="absolute -right-8 top-24 z-20 flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur-md transition-all duration-300 hover:translate-x-1 short:-right-6 short:top-20 short:px-3.5 short:py-2">
                  <GraduationCap class="h-5 w-5 text-amber-500 short:h-4 short:w-4" />
                  <span class="text-sm font-bold text-brighture-ink short:text-xs">Certified Instructors</span>
                </div>
              </div>

              <!-- Bottom Typography (Similar to FB "Explore the things you love.")
                  mt clears the collage's negatively-offset floating badges. -->
              <div class="mt-12 short:mt-9 xshort:mt-8">
                <h1 class="font-display text-4xl font-extrabold leading-[1.12] tracking-tight text-brighture-ink xl:text-5xl short:text-3xl xshort:text-2xl">
                  {{ heroCopy.heading[0] }} <br />
                  <span class="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 bg-clip-text text-transparent underline decoration-amber-300/70 decoration-wavy decoration-2">
                    {{ heroCopy.heading[1] }}
                  </span>
                </h1>
                <p class="mt-2.5 max-w-lg text-sm leading-relaxed text-brighture-ink-soft/90 xl:text-base short:mt-1.5 short:text-xs xshort:hidden">
                  {{ heroCopy.subtext }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Login/Register Card (4 columns) matching Image 2 closely -->
        <div class="flex items-center justify-center lg:col-span-4">
          <div class="w-full max-w-[420px] rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.08)] sm:p-7 short:p-5 xshort:p-4">

            <!-- Card Header — Logo -->
            <div class="flex items-center justify-center">
              <a href="#" class="group inline-flex">
                <img
                  :src="brightureLogo"
                  alt="Brighture"
                  class="h-7 w-auto transition-all duration-200 group-hover:opacity-75 group-hover:scale-[1.03]"
                />
              </a>
            </div>

            <!-- Pill Tab Switcher (Sign In | Sign Up) with light gray bg & border -->
            <div class="mt-4 flex rounded-xl border border-slate-200 bg-slate-100/90 p-1 xshort:mt-3">
              <button
                type="button"
                @click="switchMode('login')"
                :class="`flex-1 rounded-lg py-2 text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCD00]/50 ${isLogin
                  ? 'bg-white text-brighture-ink shadow-sm'
                  : 'text-slate-500 hover:text-brighture-ink'
                }`"
              >
                Sign In
              </button>
              <button
                type="button"
                @click="switchMode('register')"
                :class="`flex-1 rounded-lg py-2 text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCD00]/50 ${!isLogin
                  ? 'bg-white text-brighture-ink shadow-sm'
                  : 'text-slate-500 hover:text-brighture-ink'
                }`"
              >
                Sign Up
              </button>
            </div>

            <!-- Welcome Heading -->
            <div :key="mode" class="mt-4 animate-in duration-300 fade-in slide-in-from-bottom-1 xshort:mt-3">
              <h2 class="font-display text-2xl font-extrabold tracking-tight text-brighture-ink sm:text-[1.65rem] xshort:text-xl">
                {{ isLogin ? "Welcome Back" : "Create Account" }}
              </h2>
              <p class="mt-1 text-xs text-[#736B5E] xshort:hidden">
                {{ isLogin
                  ? "Sign in to continue your lessons."
                  : "Start your free trial lesson in minutes." }}
              </p>
            </div>

            <!-- Form -->
            <form class="mt-4 space-y-3 xshort:mt-3 xshort:space-y-2" @submit.prevent="handleSubmit" novalidate>

              <!-- Name fields row (Sign Up only, no placeholders) -->
              <div
                :aria-hidden="isLogin"
                :inert="!isLogin ? undefined : ''"
                :class="`grid transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${!isLogin ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`"
              >
                <div class="overflow-hidden">
                  <div class="grid grid-cols-2 gap-2 pb-0.5">
                    <div>
                      <label for="auth-v2-first" class="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-[#8A8172]">
                        First Name
                      </label>
                      <div
                        :class="`flex items-center gap-2.5 rounded-xl border bg-white px-3.5 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition focus-within:bg-white focus-within:ring-2 xshort:py-2 ${errors.firstName
                          ? 'border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-200'
                          : 'border-slate-200 focus-within:border-[#FFCD00] focus-within:ring-[#FFCD00]/40'
                        }`"
                      >
                        <User aria-hidden="true" :class="`h-4 w-4 shrink-0 ${errors.firstName ? 'text-rose-400' : 'text-[#A39989]'}`" />
                        <input
                          id="auth-v2-first"
                          :aria-invalid="errors.firstName ? true : undefined"
                          :aria-describedby="errors.firstName ? 'auth-v2-first-error' : undefined"
                          class="w-full border-0 bg-transparent text-base text-brighture-ink outline-none placeholder:text-[#A39989]/50 sm:text-sm"
                          type="text"
                          v-model="form.firstName"
                          @input="clearError('firstName')"
                        />
                      </div>
                      <p v-if="errors.firstName" id="auth-v2-first-error" role="alert" class="mt-1 text-[11px] font-medium text-rose-500">
                        {{ errors.firstName }}
                      </p>
                    </div>
                    <div>
                      <label for="auth-v2-last" class="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-[#8A8172]">
                        Last Name
                      </label>
                      <div
                        :class="`flex items-center gap-2.5 rounded-xl border bg-white px-3.5 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition focus-within:bg-white focus-within:ring-2 xshort:py-2 ${errors.lastName
                          ? 'border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-200'
                          : 'border-slate-200 focus-within:border-[#FFCD00] focus-within:ring-[#FFCD00]/40'
                        }`"
                      >
                        <User aria-hidden="true" :class="`h-4 w-4 shrink-0 ${errors.lastName ? 'text-rose-400' : 'text-[#A39989]'}`" />
                        <input
                          id="auth-v2-last"
                          :aria-invalid="errors.lastName ? true : undefined"
                          :aria-describedby="errors.lastName ? 'auth-v2-last-error' : undefined"
                          class="w-full border-0 bg-transparent text-base text-brighture-ink outline-none placeholder:text-[#A39989]/50 sm:text-sm"
                          type="text"
                          v-model="form.lastName"
                          @input="clearError('lastName')"
                        />
                      </div>
                      <p v-if="errors.lastName" id="auth-v2-last-error" role="alert" class="mt-1 text-[11px] font-medium text-rose-500">
                        {{ errors.lastName }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- EMAIL -->
              <div>
                <label for="auth-v2-email" class="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-[#8A8172]">
                  EMAIL
                </label>
                <div
                  :class="`flex items-center gap-2.5 rounded-xl border bg-white px-3.5 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition focus-within:bg-white focus-within:ring-2 xshort:py-2 ${errors.email
                    ? 'border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-200'
                    : 'border-slate-200 focus-within:border-[#FFCD00] focus-within:ring-[#FFCD00]/40'
                  }`"
                >
                  <Mail aria-hidden="true" :class="`h-4 w-4 shrink-0 ${errors.email ? 'text-rose-400' : 'text-[#A39989]'}`" />
                  <input
                    id="auth-v2-email"
                    :aria-invalid="errors.email ? true : undefined"
                    :aria-describedby="errors.email ? 'auth-v2-email-error' : undefined"
                    class="w-full border-0 bg-transparent text-base text-brighture-ink outline-none placeholder:text-[#A39989]/50 sm:text-sm"
                    type="email"
                    placeholder="you@example.com"
                    autocomplete="email"
                    v-model="form.email"
                    @input="clearError('email')"
                  />
                </div>
                <p v-if="errors.email" id="auth-v2-email-error" role="alert" class="mt-1 text-[11px] font-medium text-rose-500">
                  {{ errors.email }}
                </p>
              </div>

              <!-- PASSWORD -->
              <div>
                <div>
                  <label for="auth-v2-password" class="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-[#8A8172]">
                    PASSWORD
                  </label>
                  <div
                    :class="`flex items-center gap-2.5 rounded-xl border bg-white px-3.5 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition focus-within:bg-white focus-within:ring-2 xshort:py-2 ${errors.password
                      ? 'border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-200'
                      : 'border-slate-200 focus-within:border-[#FFCD00] focus-within:ring-[#FFCD00]/40'
                    }`"
                  >
                    <Lock aria-hidden="true" :class="`h-4 w-4 shrink-0 ${errors.password ? 'text-rose-400' : 'text-[#A39989]'}`" />
                    <input
                      id="auth-v2-password"
                      :aria-invalid="errors.password ? true : undefined"
                      :aria-describedby="errors.password ? 'auth-v2-password-error' : undefined"
                      class="w-full border-0 bg-transparent text-base text-brighture-ink outline-none placeholder:text-[#A39989]/50 sm:text-sm"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="••••••••"
                      :autocomplete="isLogin ? 'current-password' : 'new-password'"
                      v-model="form.password"
                      @input="onPasswordInput"
                    />
                    <button
                      type="button"
                      @click="showPassword = !showPassword"
                      :aria-label="showPassword ? 'Hide password' : 'Show password'"
                      class="shrink-0 rounded text-[#A39989] transition hover:text-brighture-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCD00]/50"
                    >
                      <EyeOff v-if="showPassword" class="h-4 w-4" />
                      <Eye v-else class="h-4 w-4" />
                    </button>
                  </div>
                  <p v-if="errors.password" id="auth-v2-password-error" role="alert" class="mt-1 text-[11px] font-medium text-rose-500">
                    {{ errors.password }}
                  </p>
                </div>
                <div
                  :aria-hidden="isLogin"
                  :inert="!isLogin ? undefined : ''"
                  :class="`grid transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${!isLogin ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`"
                >
                  <div class="overflow-hidden">
                    <div v-if="form.password" class="mt-1.5">
                      <div class="flex gap-1">
                        <span
                          v-for="i in [0, 1, 2, 3]"
                          :key="i"
                          :class="`h-1 flex-1 rounded-full transition-colors ${i < strengthScore ? strengthColors[strengthScore] : 'bg-[#F0E4CE]'}`"
                        />
                      </div>
                      <p class="mt-0.5 text-[10px] font-semibold text-[#8A8172]">{{ strengthLabels[strengthScore] }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- CONFIRM PASSWORD & REFERRAL CODE (Sign Up only) -->
              <div
                :aria-hidden="isLogin"
                :inert="!isLogin ? undefined : ''"
                :class="`grid transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${!isLogin ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`"
              >
                <div class="overflow-hidden">
                  <div class="space-y-3 pt-0.5 xshort:space-y-2">
                    <div>
                      <label for="auth-v2-confirm" class="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-[#8A8172]">
                        CONFIRM PASSWORD
                      </label>
                      <div
                        :class="`flex items-center gap-2.5 rounded-xl border bg-white px-3.5 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition focus-within:bg-white focus-within:ring-2 xshort:py-2 ${errors.confirmPassword
                          ? 'border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-200'
                          : 'border-slate-200 focus-within:border-[#FFCD00] focus-within:ring-[#FFCD00]/40'
                        }`"
                      >
                        <Lock aria-hidden="true" :class="`h-4 w-4 shrink-0 ${errors.confirmPassword ? 'text-rose-400' : 'text-[#A39989]'}`" />
                        <input
                          id="auth-v2-confirm"
                          :aria-invalid="errors.confirmPassword ? true : undefined"
                          :aria-describedby="errors.confirmPassword ? 'auth-v2-confirm-error' : undefined"
                          class="w-full border-0 bg-transparent text-base text-brighture-ink outline-none placeholder:text-[#A39989]/50 sm:text-sm"
                          :type="showConfirm ? 'text' : 'password'"
                          placeholder="••••••••"
                          autocomplete="new-password"
                          v-model="form.confirmPassword"
                          @input="clearError('confirmPassword')"
                        />
                        <button
                          type="button"
                          @click="showConfirm = !showConfirm"
                          :aria-label="showConfirm ? 'Hide password' : 'Show password'"
                          class="shrink-0 rounded text-[#A39989] transition hover:text-brighture-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCD00]/50"
                        >
                          <EyeOff v-if="showConfirm" class="h-4 w-4" />
                          <Eye v-else class="h-4 w-4" />
                        </button>
                      </div>
                      <p v-if="errors.confirmPassword" id="auth-v2-confirm-error" role="alert" class="mt-1 text-[11px] font-medium text-rose-500">
                        {{ errors.confirmPassword }}
                      </p>
                    </div>
                    <div>
                      <label for="auth-v2-referral" class="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-[#8A8172]">
                        REFERRAL CODE (OPTIONAL)
                      </label>
                      <div class="flex items-center gap-2.5 rounded-xl border bg-white px-3.5 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition focus-within:bg-white focus-within:ring-2 xshort:py-2 border-slate-200 focus-within:border-[#FFCD00] focus-within:ring-[#FFCD00]/40">
                        <Ticket aria-hidden="true" class="h-4 w-4 shrink-0 text-[#A39989]" />
                        <input
                          id="auth-v2-referral"
                          class="w-full border-0 bg-transparent text-base text-brighture-ink outline-none placeholder:text-[#A39989]/50 sm:text-sm"
                          type="text"
                          placeholder="e.g. BRIGHT2026"
                          v-model="form.referralCode"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Remember me & Forgot Password (Sign In only) -->
              <div
                :aria-hidden="!isLogin"
                :inert="isLogin ? undefined : ''"
                :class="`grid transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${isLogin ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`"
              >
                <div class="overflow-hidden">
                  <div class="flex items-center justify-between pt-0.5 text-xs">
                    <label class="flex items-center gap-1.5 font-medium text-[#736B5E]">
                      <input
                        type="checkbox"
                        v-model="remember"
                        class="h-3.5 w-3.5 rounded border-[#F0E4CE] accent-amber-500"
                      />
                      Remember me
                    </label>
                    <a
                      href="#"
                      class="font-bold text-[#736B5E] transition hover:text-amber-700 focus-visible:outline-none"
                    >
                      Forgot Password?
                    </a>
                  </div>
                </div>
              </div>

              <!-- Terms checkbox (Sign Up only) -->
              <div
                :aria-hidden="isLogin"
                :inert="!isLogin ? undefined : ''"
                :class="`grid transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${!isLogin ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`"
              >
                <div class="overflow-hidden">
                  <div class="pt-0.5">
                    <label class="flex items-start gap-1.5 text-xs text-[#736B5E]">
                      <input
                        type="checkbox"
                        v-model="agree"
                        @change="clearError('agree')"
                        class="mt-0.5 h-3.5 w-3.5 rounded border-[#F0E4CE] accent-amber-500"
                      />
                      <span>
                        I agree to the
                        <a href="#" class="font-bold text-brighture-ink underline-offset-2 hover:underline">
                          Terms of Service
                        </a>
                        and
                        <a href="#" class="font-bold text-brighture-ink underline-offset-2 hover:underline">
                          Privacy Policy
                        </a>.
                      </span>
                    </label>
                    <p v-if="errors.agree" role="alert" class="mt-0.5 text-[11px] font-medium text-rose-500">
                      {{ errors.agree }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Primary Action Button (Vibrant Brighture Gold matching Image 2) -->
              <button
                type="submit"
                :disabled="submitting"
                class="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFCD00] px-4 py-3 text-sm xshort:py-2.5 font-bold text-brighture-ink shadow-[0_8px_20px_-4px_rgba(255,205,0,0.65)] transition-all duration-200 hover:bg-[#FFC000] hover:shadow-[0_10px_24px_-4px_rgba(255,205,0,0.85)] active:scale-[0.99] disabled:opacity-60"
              >
                <span v-if="submitting" class="h-4 w-4 animate-spin rounded-full border-2 border-brighture-ink/30 border-t-brighture-ink" />
                <template v-else>
                  <span>{{ isLogin ? "Sign In" : "Create Account" }}</span>
                  <ArrowRight class="h-4 w-4" />
                </template>
              </button>
            </form>

            <!-- Social Divider -->
            <div class="mt-4 flex items-center gap-3 text-[11px] font-semibold text-slate-400 xshort:mt-3">
              <span class="h-px flex-1 bg-slate-200" />
              Or continue with
              <span class="h-px flex-1 bg-slate-200" />
            </div>

            <!-- Social Buttons -->
            <div class="mt-3 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs xshort:py-2 font-bold text-brighture-ink shadow-xs transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99]"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" class="h-4 w-4">
                  <path fill="#4285F4" d="M23.52 12.27c0-.79-.07-1.55-.2-2.28H12v4.32h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.87c2.26-2.08 3.58-5.15 3.58-8.67z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.94-2.92l-3.87-3.01c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.11C3.26 21.3 7.31 24 12 24z" />
                  <path fill="#FBBC05" d="M5.27 14.26A7.2 7.2 0 0 1 4.9 12c0-.78.13-1.54.37-2.26V6.63H1.28A11.96 11.96 0 0 0 0 12c0 1.93.46 3.76 1.28 5.37l3.99-3.11z" />
                  <path fill="#EA4335" d="M12 4.78c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.63l3.99 3.11C6.22 6.89 8.87 4.78 12 4.78z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs xshort:py-2 font-bold text-brighture-ink shadow-xs transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99]"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" class="h-4 w-4 fill-brighture-ink">
                  <path d="M16.365 1.43c0 1.14-.417 2.06-1.25 2.75-.833.7-1.717 1.05-2.65.99-.06-1.09.36-2 .1-3.15C13.5-.09 14.35-.09 15.2.09c.4.06.79.4 1.165.34zM20.05 17.19c-.55 1.28-1.22 2.5-2 3.66-1.07 1.55-2.15 3.1-3.86 3.1-1.72 0-2.23-1.02-4.16-1.02-1.9 0-2.5 1-4.15 1.05-1.65.05-2.9-1.67-3.98-3.22C0 17.72-1.4 11.5 1.15 7.66c1.27-1.9 3.51-3.1 5.6-3.13 1.83-.03 3.34 1.13 4.35 1.13 1.03 0 2.88-1.4 4.85-1.19.83.04 3.14.34 4.66 2.5-.12.08-2.78 1.62-2.75 4.88.03 3.9 3.42 5.2 3.45 5.21-.03.09-.53 1.86-1.76 3.63l.55-.01Z" />
                </svg>
                Apple
              </button>
            </div>

            <!-- Footer Switcher link -->
            <p class="mt-4 text-center text-xs font-medium text-[#736B5E] xshort:mt-3">
              {{ isLogin ? "Don't have an account? " : "Already have an account? " }}
              <button
                type="button"
                @click="switchMode(isLogin ? 'register' : 'login')"
                class="font-bold text-brighture-ink transition hover:text-amber-700"
              >
                {{ isLogin ? "Sign up" : "Log in" }}
              </button>
            </p>

          </div>
        </div>

      </div>
    </div>
  </main>
</template>
