<script setup>
import { computed, reactive, ref } from "vue";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, User } from "lucide-vue-next";
import heroPhoto from "@/assets/hero-lesson.jpg";
import brightureIcon from "@/assets/icon-black.svg";
import brightureLogo from "@/assets/logo-black.svg";

const HERO_COPY = {
  login: {
    display: ["Bright Future", "Brighture"],
    heading: "Learning that fits your life",
    body: "Live 1-on-1 lessons with certified instructors, a curriculum built around your goals, and scheduling that works around your week.",
  },
  register: {
    display: ["Start your", "first lesson"],
    heading: "Your trial lesson is on us",
    body: "Create an account, match with an instructor in minutes, and try a full lesson free. No card required, cancel anytime.",
  },
};

const SOCIAL_BUTTON =
  "flex items-center justify-center gap-2 rounded-lg border border-amber-100 bg-white/70 px-3 py-2 text-xs font-semibold text-brighture-ink transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 focus-visible:ring-offset-1";

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
  email: "",
  password: "",
  confirmPassword: "",
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
const strengthColors = ["bg-rose-400", "bg-rose-400", "bg-amber-400", "bg-brighture-amber", "bg-emerald-500"];
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-white" />

  <main v-if="submitted" class="relative isolate flex h-dvh items-center justify-center overflow-hidden px-4">
    <div class="w-full max-w-sm rounded-2xl border border-amber-100/70 bg-white/65 p-7 text-center shadow-[0_8px_32px_-8px_rgba(180,140,60,0.18)] backdrop-blur-2xl">
      <img :src="brightureIcon" alt="" aria-hidden="true" class="mx-auto h-9 w-9" />
      <div class="mx-auto mt-4 flex h-13 w-13 items-center justify-center rounded-full bg-amber-100/60">
        <CheckCircle2 class="h-7 w-7 text-brighture-bronze" />
      </div>
      <h1 class="mt-4 font-display text-xl font-bold text-brighture-ink">
        {{ isLogin ? "Welcome back!" : "Account created!" }}
      </h1>
      <p class="mt-1.5 text-sm leading-relaxed text-brighture-ink-soft">
        {{ isLogin
          ? "You're logged in. Redirecting you to your dashboard…"
          : "Check your inbox to verify your email and start your free trial lesson." }}
      </p>
      <button
        type="button"
        @click="resetForm"
        class="mt-5 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-brighture-ink-soft transition hover:text-brighture-bronze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50"
      >
        Back to {{ isLogin ? "login" : "sign up" }} <ArrowRight class="h-4 w-4" />
      </button>
    </div>
  </main>

  <!--
    h-dvh + overflow-hidden = viewport-locked, no scroll on desktop / landscape.
    Items are compact enough to always fit within a single viewport height.
  -->
  <main v-else class="relative isolate flex h-dvh items-center justify-center overflow-hidden px-3 py-3 sm:px-5">
    <div class="w-full max-w-[62rem]">
      <!-- Glass card -->
      <div class="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/30 p-2 shadow-[0_16px_48px_-12px_rgba(180,140,60,0.22),0_2px_8px_-2px_rgba(0,0,0,0.06)] backdrop-blur-2xl sm:rounded-[1.75rem] sm:p-2.5 lg:grid lg:grid-cols-2 lg:gap-2.5">
        <!-- Specular top edge -->
        <div
          aria-hidden="true"
          class="pointer-events-none absolute inset-x-8 top-0 z-30 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent"
        />

        <!-- Hero panel -->
        <div class="relative hidden overflow-hidden rounded-[1rem] bg-brighture-ink lg:flex lg:flex-col lg:justify-between lg:p-7 xl:p-9">
          <img
            :src="heroPhoto"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            class="absolute inset-0 h-full w-full object-cover object-center"
          />
          <!-- Light wash top -->
          <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/55 via-white/20 to-transparent" />
          <!-- Brand tint -->
          <div aria-hidden="true" class="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-300/20 via-transparent to-amber-200/10" />
          <!-- Dark scrim bottom -->
          <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-brighture-ink via-brighture-ink/70 to-transparent" />

          <!-- Decorative display type -->
          <p
            :key="`display-${mode}`"
            aria-hidden="true"
            class="relative z-10 animate-in font-display text-[clamp(2.2rem,3.8vw,3.8rem)] font-bold uppercase leading-[0.88] tracking-[-0.035em] text-brighture-ink duration-700 fade-in motion-reduce:animate-none"
          >
            {{ heroCopy.display[0] }}
            <br />
            <span class="text-transparent [-webkit-text-stroke:1.5px_rgba(26,26,26,0.55)]">
              {{ heroCopy.display[1] }}
            </span>
          </p>

          <div
            :key="`copy-${mode}`"
            class="relative z-10 max-w-xs animate-in duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none"
          >
            <h2 class="font-display text-xl font-bold leading-snug text-white xl:text-2xl">
              {{ heroCopy.heading }}
            </h2>
            <p class="mt-2 text-xs leading-relaxed text-white/80">{{ heroCopy.body }}</p>
          </div>
        </div>

        <!-- Form panel -->
        <div class="rounded-xl border border-slate-200/80 bg-white/65 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:rounded-2xl sm:px-7 sm:py-5 lg:flex lg:flex-col lg:justify-center lg:px-8 lg:py-5">

          <!-- Brand mark — logo with hover "Home" label -->
          <a
            href="#"
            aria-label="Go to home"
            class="group inline-flex items-center gap-2"
          >
            <img
              :src="brightureLogo"
              alt="Brighture"
              class="h-7 w-auto transition-opacity duration-200 group-hover:opacity-80"
            />
            <span
              class="translate-x-0 text-xs font-semibold text-brighture-ink-soft opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
            >
              Home
            </span>
          </a>

          <!-- Mode tab switcher -->
          <div class="mt-3 flex gap-0.5 rounded-lg border border-slate-200/80 bg-slate-100/70 p-0.5">
            <button
              v-for="m in ['login', 'register']"
              :key="m"
              type="button"
              @click="switchMode(m)"
              :class="`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 ${mode === m
                ? 'bg-white text-brighture-ink shadow-sm'
                : 'text-brighture-ink-soft hover:text-brighture-ink'
              }`"
            >
              {{ m === "login" ? "Sign In" : "Sign Up" }}
            </button>
          </div>

          <!-- Heading -->
          <div
            :key="mode"
            class="mt-3 animate-in duration-400 fade-in slide-in-from-bottom-1 motion-reduce:animate-none"
          >
            <h1 class="font-display text-2xl font-bold leading-tight text-brighture-ink">
              {{ isLogin ? "Welcome Back" : "Create Account" }}
            </h1>
            <p class="mt-0.5 text-xs text-brighture-ink-soft/75">
              {{ isLogin
                ? "Sign in to continue your lessons."
                : "Start your free trial lesson in minutes." }}
            </p>
          </div>

          <form class="mt-3 space-y-2.5" @submit.prevent="handleSubmit" novalidate>

            <!-- Name row — register only -->
            <div
              :aria-hidden="isLogin"
              :inert="!isLogin ? undefined : ''"
              :class="`grid transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${!isLogin ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`"
            >
              <div class="overflow-hidden">
                <div class="grid grid-cols-2 gap-2 pb-0.5">
                  <div>
                    <label for="auth-first" class="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-brighture-ink-soft/65">
                      First Name
                    </label>
                    <div
                      :class="`flex items-center gap-2 rounded-lg border bg-white/80 px-3 py-2 transition focus-within:bg-white focus-within:ring-2 ${errors.firstName
                        ? 'border-rose-300/80 focus-within:ring-rose-300/40'
                        : 'border-amber-100 focus-within:border-amber-300 focus-within:ring-amber-200/50'
                      }`"
                    >
                      <User aria-hidden="true" :class="`h-3.5 w-3.5 shrink-0 ${errors.firstName ? 'text-rose-400' : 'text-brighture-ink-soft/45'}`" />
                      <input
                        id="auth-first"
                        :aria-invalid="errors.firstName ? true : undefined"
                        :aria-describedby="errors.firstName ? 'auth-first-error' : undefined"
                        class="w-full border-0 bg-transparent text-sm text-brighture-ink outline-none placeholder:text-brighture-ink-soft/35"
                        type="text"
                        v-model="form.firstName"
                        @input="clearError('firstName')"
                      />
                    </div>
                    <p v-if="errors.firstName" id="auth-first-error" role="alert" class="mt-0.5 text-[11px] font-medium text-rose-500">
                      {{ errors.firstName }}
                    </p>
                  </div>
                  <div>
                    <label for="auth-last" class="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-brighture-ink-soft/65">
                      Last Name
                    </label>
                    <div
                      :class="`flex items-center gap-2 rounded-lg border bg-white/80 px-3 py-2 transition focus-within:bg-white focus-within:ring-2 ${errors.lastName
                        ? 'border-rose-300/80 focus-within:ring-rose-300/40'
                        : 'border-amber-100 focus-within:border-amber-300 focus-within:ring-amber-200/50'
                      }`"
                    >
                      <User aria-hidden="true" :class="`h-3.5 w-3.5 shrink-0 ${errors.lastName ? 'text-rose-400' : 'text-brighture-ink-soft/45'}`" />
                      <input
                        id="auth-last"
                        :aria-invalid="errors.lastName ? true : undefined"
                        :aria-describedby="errors.lastName ? 'auth-last-error' : undefined"
                        class="w-full border-0 bg-transparent text-sm text-brighture-ink outline-none placeholder:text-brighture-ink-soft/35"
                        type="text"
                        v-model="form.lastName"
                        @input="clearError('lastName')"
                      />
                    </div>
                    <p v-if="errors.lastName" id="auth-last-error" role="alert" class="mt-0.5 text-[11px] font-medium text-rose-500">
                      {{ errors.lastName }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Email -->
            <div>
              <label for="auth-email" class="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-brighture-ink-soft/65">
                Email
              </label>
              <div
                :class="`flex items-center gap-2 rounded-lg border bg-white/80 px-3 py-2 transition focus-within:bg-white focus-within:ring-2 ${errors.email
                  ? 'border-rose-300/80 focus-within:ring-rose-300/40'
                  : 'border-amber-100 focus-within:border-amber-300 focus-within:ring-amber-200/50'
                }`"
              >
                <Mail aria-hidden="true" :class="`h-3.5 w-3.5 shrink-0 ${errors.email ? 'text-rose-400' : 'text-brighture-ink-soft/45'}`" />
                <input
                  id="auth-email"
                  :aria-invalid="errors.email ? true : undefined"
                  :aria-describedby="errors.email ? 'auth-email-error' : undefined"
                  class="w-full border-0 bg-transparent text-sm text-brighture-ink outline-none placeholder:text-brighture-ink-soft/35"
                  type="email"
                  placeholder="you@example.com"
                  autocomplete="email"
                  v-model="form.email"
                  @input="clearError('email')"
                />
              </div>
              <p v-if="errors.email" id="auth-email-error" role="alert" class="mt-0.5 text-[11px] font-medium text-rose-500">
                {{ errors.email }}
              </p>
            </div>

            <!-- Password -->
            <div>
              <div>
                <label for="auth-password" class="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-brighture-ink-soft/65">
                  Password
                </label>
                <div
                  :class="`flex items-center gap-2 rounded-lg border bg-white/80 px-3 py-2 transition focus-within:bg-white focus-within:ring-2 ${errors.password
                    ? 'border-rose-300/80 focus-within:ring-rose-300/40'
                    : 'border-amber-100 focus-within:border-amber-300 focus-within:ring-amber-200/50'
                  }`"
                >
                  <Lock aria-hidden="true" :class="`h-3.5 w-3.5 shrink-0 ${errors.password ? 'text-rose-400' : 'text-brighture-ink-soft/45'}`" />
                  <input
                    id="auth-password"
                    :aria-invalid="errors.password ? true : undefined"
                    :aria-describedby="errors.password ? 'auth-password-error' : undefined"
                    class="w-full border-0 bg-transparent text-sm text-brighture-ink outline-none placeholder:text-brighture-ink-soft/35"
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
                    class="shrink-0 rounded text-brighture-ink-soft/45 transition hover:text-brighture-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50"
                  >
                    <EyeOff v-if="showPassword" class="h-3.5 w-3.5" />
                    <Eye v-else class="h-3.5 w-3.5" />
                  </button>
                </div>
                <p v-if="errors.password" id="auth-password-error" role="alert" class="mt-0.5 text-[11px] font-medium text-rose-500">
                  {{ errors.password }}
                </p>
              </div>
              <div
                :aria-hidden="isLogin"
                :inert="!isLogin ? undefined : ''"
                :class="`grid transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${!isLogin ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`"
              >
                <div class="overflow-hidden">
                  <div v-if="form.password" class="mt-1.5">
                    <div class="flex gap-1">
                      <span
                        v-for="i in [0, 1, 2, 3]"
                        :key="i"
                        :class="`h-1 flex-1 rounded-full transition-colors ${i < strengthScore ? strengthColors[strengthScore] : 'bg-amber-100'}`"
                      />
                    </div>
                    <p class="mt-0.5 text-[10px] font-medium text-brighture-ink-soft/65">{{ strengthLabels[strengthScore] }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Confirm password — register only -->
            <div
              :aria-hidden="isLogin"
              :inert="!isLogin ? undefined : ''"
              :class="`grid transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${!isLogin ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`"
            >
              <div class="overflow-hidden">
                <div class="pt-0.5">
                  <label for="auth-confirm" class="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-brighture-ink-soft/65">
                    Confirm Password
                  </label>
                  <div
                    :class="`flex items-center gap-2 rounded-lg border bg-white/80 px-3 py-2 transition focus-within:bg-white focus-within:ring-2 ${errors.confirmPassword
                      ? 'border-rose-300/80 focus-within:ring-rose-300/40'
                      : 'border-amber-100 focus-within:border-amber-300 focus-within:ring-amber-200/50'
                    }`"
                  >
                    <Lock aria-hidden="true" :class="`h-3.5 w-3.5 shrink-0 ${errors.confirmPassword ? 'text-rose-400' : 'text-brighture-ink-soft/45'}`" />
                    <input
                      id="auth-confirm"
                      :aria-invalid="errors.confirmPassword ? true : undefined"
                      :aria-describedby="errors.confirmPassword ? 'auth-confirm-error' : undefined"
                      class="w-full border-0 bg-transparent text-sm text-brighture-ink outline-none placeholder:text-brighture-ink-soft/35"
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
                      class="shrink-0 rounded text-brighture-ink-soft/45 transition hover:text-brighture-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50"
                    >
                      <EyeOff v-if="showConfirm" class="h-3.5 w-3.5" />
                      <Eye v-else class="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p v-if="errors.confirmPassword" id="auth-confirm-error" role="alert" class="mt-0.5 text-[11px] font-medium text-rose-500">
                    {{ errors.confirmPassword }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Remember me / Forgot — login only -->
            <div
              :aria-hidden="!isLogin"
              :inert="isLogin ? undefined : ''"
              :class="`grid transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${isLogin ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`"
            >
              <div class="overflow-hidden">
                <div class="flex items-center justify-between pt-0.5 text-xs">
                  <label class="flex items-center gap-1.5 text-brighture-ink-soft">
                    <input
                      type="checkbox"
                      v-model="remember"
                      class="h-3.5 w-3.5 rounded border-amber-200 accent-brighture-bronze"
                    />
                    Remember me
                  </label>
                  <a
                    href="#"
                    class="rounded font-semibold text-brighture-ink-soft/80 hover:text-brighture-bronze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50"
                  >
                    Forgot Password?
                  </a>
                </div>
              </div>
            </div>

            <!-- Terms — register only -->
            <div
              :aria-hidden="isLogin"
              :inert="!isLogin ? undefined : ''"
              :class="`grid transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${!isLogin ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`"
            >
              <div class="overflow-hidden">
                <div class="pt-0.5">
                  <label class="flex items-start gap-1.5 text-xs text-brighture-ink-soft">
                    <input
                      type="checkbox"
                      v-model="agree"
                      @change="clearError('agree')"
                      class="mt-0.5 h-3.5 w-3.5 rounded border-amber-200 accent-brighture-bronze"
                    />
                    <span>
                      I agree to the
                      <a href="#" class="font-semibold text-brighture-ink/80 underline-offset-2 hover:underline">
                        Terms of Service
                      </a>
                      and
                      <a href="#" class="font-semibold text-brighture-ink/80 underline-offset-2 hover:underline">
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

            <!-- Submit -->
            <button
              type="submit"
              :disabled="submitting"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brighture-gold via-[#ffd633] to-brighture-gold-deep px-4 py-2.5 text-sm font-bold text-brighture-ink shadow-[0_8px_20px_-6px_rgba(255,189,0,0.8)] transition hover:brightness-[1.03] hover:shadow-[0_12px_26px_-6px_rgba(255,189,0,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brighture-ink-soft/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white/70 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none"
            >
              <span v-if="submitting" class="h-4 w-4 animate-spin rounded-full border-2 border-brighture-ink/30 border-t-brighture-ink" />
              <template v-else>
                {{ isLogin ? "Sign In" : "Create Account" }}
                <ArrowRight class="h-3.5 w-3.5" />
              </template>
            </button>
          </form>

          <!-- Divider -->
          <div class="mt-3 flex items-center gap-2.5 text-[11px] text-brighture-ink-soft/55">
            <span class="h-px flex-1 bg-brighture-ink-soft/12" />
            Or continue with
            <span class="h-px flex-1 bg-brighture-ink-soft/12" />
          </div>

          <!-- Social buttons -->
          <div class="mt-2.5 grid grid-cols-2 gap-2">
            <button type="button" :class="SOCIAL_BUTTON">
              <svg viewBox="0 0 24 24" aria-hidden="true" class="h-3.5 w-3.5">
                <path fill="#4285F4" d="M23.52 12.27c0-.79-.07-1.55-.2-2.28H12v4.32h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.87c2.26-2.08 3.58-5.15 3.58-8.67z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.94-2.92l-3.87-3.01c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.11C3.26 21.3 7.31 24 12 24z" />
                <path fill="#FBBC05" d="M5.27 14.26A7.2 7.2 0 0 1 4.9 12c0-.78.13-1.54.37-2.26V6.63H1.28A11.96 11.96 0 0 0 0 12c0 1.93.46 3.76 1.28 5.37l3.99-3.11z" />
                <path fill="#EA4335" d="M12 4.78c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.63l3.99 3.11C6.22 6.89 8.87 4.78 12 4.78z" />
              </svg>
              Google
            </button>
            <button type="button" :class="SOCIAL_BUTTON">
              <svg viewBox="0 0 24 24" aria-hidden="true" class="h-3.5 w-3.5 fill-brighture-ink">
                <path d="M16.365 1.43c0 1.14-.417 2.06-1.25 2.75-.833.7-1.717 1.05-2.65.99-.06-1.09.36-2 .1-3.15C13.5-.09 14.35-.09 15.2.09c.4.06.79.4 1.165.34zM20.05 17.19c-.55 1.28-1.22 2.5-2 3.66-1.07 1.55-2.15 3.1-3.86 3.1-1.72 0-2.23-1.02-4.16-1.02-1.9 0-2.5 1-4.15 1.05-1.65.05-2.9-1.67-3.98-3.22C0 17.72-1.4 11.5 1.15 7.66c1.27-1.9 3.51-3.1 5.6-3.13 1.83-.03 3.34 1.13 4.35 1.13 1.03 0 2.88-1.4 4.85-1.19.83.04 3.14.34 4.66 2.5-.12.08-2.78 1.62-2.75 4.88.03 3.9 3.42 5.2 3.45 5.21-.03.09-.53 1.86-1.76 3.63l.55-.01Z" />
              </svg>
              Apple
            </button>
          </div>

          <!-- Switch mode footer -->
          <p class="mt-3 text-center text-xs text-brighture-ink-soft">
            {{ isLogin ? "Don't have an account? " : "Already have an account? " }}
            <button
              type="button"
              @click="switchMode(isLogin ? 'register' : 'login')"
              class="rounded font-bold text-brighture-ink transition hover:text-brighture-bronze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brighture-ink-soft/50"
            >
              {{ isLogin ? "Sign up" : "Log in" }}
            </button>
          </p>
        </div>
      </div>
    </div>
  </main>
</template>
