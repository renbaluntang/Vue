<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-vue-next';
import teacherTeam from '@/assets/teacher-team-cutout.png';
import brightureLogo from '@/assets/logo-black.svg';

const router = useRouter();
const appHome = import.meta.env.BASE_URL;
const form = reactive({ email: '', password: '', remember: true });
const errors = reactive({ email: '', password: '' });
const showPassword = ref(false);
const submitting = ref(false);

function signIn() {
  errors.email = '';
  errors.password = '';

  if (!form.email.trim()) errors.email = 'Enter your work email.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  if (!form.password) errors.password = 'Enter your password.';
  if (errors.email || errors.password) return;

  submitting.value = true;
  window.setTimeout(() => router.push('/'), 500);
}
</script>

<template>
  <main class="teacher-login relative h-screen h-dvh overflow-hidden bg-[#FCFDFE] text-[#1A1A1A]">
    <!-- Ambient Organic Background Shapes (matching reference design) -->
    <!-- 1. Top-Right Soft Mint Organic Wave -->
    <svg
      aria-hidden="true"
      class="teacher-login__wave pointer-events-none absolute -right-2 -top-2 z-0 h-auto w-[48vw] max-w-[560px] select-none"
      viewBox="0 0 560 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="topRightMintWave" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2DD4BF" stop-opacity="0.30" />
          <stop offset="55%" stop-color="#6EE7B7" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#A7F3D0" stop-opacity="0.18" />
        </linearGradient>
      </defs>
      <path d="M 60 0 C 150 85, 230 145, 360 135 C 440 128, 500 80, 560 95 L 560 0 Z" fill="url(#topRightMintWave)" />
    </svg>

    <!-- 2. Bottom-Right Violet & Mint Curve -->
    <svg
      aria-hidden="true"
      class="teacher-login__wave pointer-events-none absolute -bottom-4 -right-4 z-0 h-auto w-[36vw] max-w-[460px] select-none"
      viewBox="0 0 460 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bottomRightBlobGrad" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.55" />
          <stop offset="45%" stop-color="#A855F7" stop-opacity="0.38" />
          <stop offset="100%" stop-color="#2DD4BF" stop-opacity="0.30" />
        </linearGradient>
      </defs>
      <path d="M 460 70 C 380 60, 310 120, 260 190 C 205 270, 130 310, 0 360 L 460 360 Z" fill="url(#bottomRightBlobGrad)" />
    </svg>

    <!-- 3. Bottom Accent Bar -->
    <div
      aria-hidden="true"
      class="teacher-login__wave pointer-events-none absolute bottom-0 left-[36%] z-0 h-1.5 w-24 rounded-t-full bg-gradient-to-r from-[#00D2B4] via-[#10B981] to-[#2DD4BF] opacity-80"
    />

    <!-- Header: Logo positioned at top-left, matching reference layout -->
    <header class="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 sm:px-10 sm:py-7 lg:px-14 lg:py-8 pointer-events-none">
      <a
        :href="appHome"
        aria-label="Brighture home"
        class="pointer-events-auto inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCD00] focus-visible:ring-offset-4"
      >
        <img :src="brightureLogo" alt="Brighture English Academy" class="h-9 w-auto sm:h-10 lg:h-12" />
      </a>
      <a
        href="mailto:support@brighture-edu.com"
        class="pointer-events-auto rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-[#FDF9EF] hover:text-[#1A1A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCD00] sm:text-sm"
      >
        Need help?
      </a>
    </header>

    <!-- Main Stage: Left Art (Teacher Team & Blobs) & Right Login Card -->
    <div class="teacher-login__stage relative z-10 mx-auto grid h-full w-full max-w-[2400px] grid-rows-[minmax(0,1fr)_clamp(76px,16vh,132px)] px-4 pt-16 sm:grid-rows-[minmax(0,1fr)_clamp(88px,17vh,145px)] sm:px-8 md:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)] md:grid-rows-1 md:gap-6 md:px-10 md:pt-0 lg:gap-12 lg:px-14 xl:gap-16">
      <!-- Left Art Section with layered organic colorful gradient blobs -->
      <section
        class="teacher-login__art relative order-2 isolate flex min-h-0 items-end justify-center overflow-hidden md:order-1 md:overflow-visible"
        aria-label="Brighture teacher team"
      >
        <!-- The two shapes sit in a frame with a fixed aspect ratio, sized to
             the art area's height and centred under the photo. Sized against
             the area's own width and height instead, they stretched into tall
             or flat ovals whenever the screen's proportions changed. -->
        <div aria-hidden="true" class="teacher-login__blobs pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2">
          <!-- Violet shape, behind the heads and to the right -->
          <div
            class="absolute bottom-[8%] right-[6%] h-[80%] w-[74%] rounded-[48%_52%_62%_38%_/_42%_48%_52%_58%] bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#A855F7] opacity-95 shadow-[0_24px_70px_-20px_rgba(124,58,237,0.38)]"
          ></div>
          <!-- Mint shape, lower left, peeking out past the first teacher -->
          <div
            class="absolute bottom-[5%] left-[4%] h-[66%] w-[62%] rounded-[56%_44%_40%_60%_/_52%_60%_40%_48%] bg-gradient-to-tr from-[#00D2B4] via-[#10B981] to-[#2DD4BF] opacity-90 shadow-[0_20px_60px_-15px_rgba(0,210,180,0.35)]"
          ></div>
        </div>

        <!-- Teacher Cutout Image -->
        <img
          :src="teacherTeam"
          alt="The Brighture teacher team"
          class="teacher-login__team relative z-10 mx-auto h-full max-h-full w-auto max-w-[92%] object-contain object-bottom drop-shadow-[0_16px_28px_rgba(0,0,0,0.22)] md:absolute md:bottom-0 md:left-1/2 md:h-full md:w-[112%] md:max-w-none md:-translate-x-1/2"
        />

        <!-- Community Tag Badge -->
        <p class="absolute bottom-2 left-3 z-20 hidden rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-[#1A1A1A] shadow-sm backdrop-blur-xs sm:block md:bottom-4 md:left-4 lg:bottom-6 lg:left-6">
          Brighture teaching community
        </p>
      </section>

      <!-- Right Form Panel: Centering the Login Card -->
      <section class="teacher-login__form-panel relative z-10 order-1 flex min-h-0 items-center justify-center py-4 md:order-2 md:py-6">
        <!-- Login Card: COMPLETELY UNCHANGED -->
        <div class="teacher-login__card w-full max-w-[470px] rounded-[24px] border border-[#ece8da] bg-white p-4 shadow-[0_18px_55px_-36px_rgba(26,26,26,.35)] sm:rounded-[28px] sm:p-6 lg:p-7">
          <div class="teacher-login__card-head mb-4 flex items-center gap-3 sm:mb-5">
            <!-- Glass-style graduation cap: solid gradient shapes with a
                 translucent layer laid over them, so the overlap shows
                 through like coloured glass. -->
            <svg class="h-11 w-11 shrink-0 sm:h-12 sm:w-12" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="tl-cap-base" x1="12" y1="22" x2="36" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#FF6FB1" />
                  <stop offset="1" stop-color="#FFB15C" />
                </linearGradient>
                <linearGradient id="tl-cap-board" x1="4" y1="8" x2="44" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#A78BFA" stop-opacity="0.9" />
                  <stop offset="1" stop-color="#3B82F6" stop-opacity="0.8" />
                </linearGradient>
                <linearGradient id="tl-cap-tassel" x1="36" y1="20" x2="40" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#FFE066" />
                  <stop offset="1" stop-color="#F59E0B" />
                </linearGradient>
              </defs>
              <!-- Cap base, behind the board -->
              <path d="M12 21v10c0 3.9 5.4 7 12 7s12-3.1 12-7V21H12Z" fill="url(#tl-cap-base)" />
              <!-- Mortarboard: translucent so the base shows through it -->
              <path d="M24 7 45 17.5 24 28 3 17.5 24 7Z" fill="url(#tl-cap-board)" />
              <path d="M24 7 45 17.5 24 28 3 17.5 24 7Z" fill="white" fill-opacity="0.18" stroke="white" stroke-opacity="0.6" stroke-width="0.8" stroke-linejoin="round" />
              <!-- Tassel -->
              <path d="M24 17.5 38 21v10" stroke="url(#tl-cap-tassel)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <rect x="35.5" y="30" width="5" height="7" rx="2.5" fill="url(#tl-cap-tassel)" />
              <circle cx="24" cy="17.5" r="2" fill="#FFE066" />
            </svg>
            <div>
              <p class="text-xs font-bold text-[#8A6600]">Teacher portal</p>
              <p class="mt-0.5 text-xs text-slate-400">Your teaching workspace</p>
            </div>
          </div>

          <div class="teacher-login__intro mb-4 sm:mb-5">
            <h1 class="font-display text-[1.7rem] font-bold leading-tight tracking-tight text-[#1A1A1A] sm:text-[2rem]">Welcome back</h1>
            <p class="mt-1.5 text-xs leading-5 text-slate-500 sm:mt-2 sm:text-sm sm:leading-6">Sign in to manage your classes and connect with your students.</p>
          </div>

          <form class="teacher-login__fields space-y-3 sm:space-y-4" novalidate @submit.prevent="signIn">
          <div class="teacher-login__field">
            <label for="teacher-email" class="mb-1.5 block text-xs font-semibold text-slate-700 sm:mb-2 sm:text-sm">Work email</label>
            <div class="relative">
              <Mail class="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id="teacher-email"
                v-model="form.email"
                type="email"
                autocomplete="username"
                inputmode="email"
                placeholder="name@brighture-edu.com"
                :aria-invalid="!!errors.email"
                :aria-describedby="errors.email ? 'teacher-email-error' : undefined"
                class="h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-base text-slate-900 sm:text-sm outline-none transition placeholder:text-slate-400 focus:border-[#FFCD00] focus:ring-4 focus:ring-[#FFCD00]/20 sm:h-12"
                :class="errors.email ? 'border-rose-400' : 'border-slate-200'"
                @input="errors.email = ''"
              />
            </div>
            <p v-if="errors.email" id="teacher-email-error" class="mt-1.5 text-xs font-medium text-rose-600" role="alert">{{ errors.email }}</p>
          </div>

          <div>
            <div class="mb-2 flex items-center justify-between gap-3">
              <label for="teacher-password" class="text-sm font-semibold text-slate-700">Password</label>
              <a href="mailto:support@brighture-edu.com?subject=Teacher%20portal%20password%20help" class="rounded text-[11px] font-semibold text-[#8A6600] hover:text-[#1A1A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCD00] sm:text-xs">Forgot password?</a>
            </div>
            <div class="relative">
              <LockKeyhole class="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id="teacher-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Enter your password"
                :aria-invalid="!!errors.password"
                :aria-describedby="errors.password ? 'teacher-password-error' : undefined"
                class="h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-base text-slate-900 sm:text-sm outline-none transition placeholder:text-slate-400 focus:border-[#FFCD00] focus:ring-4 focus:ring-[#FFCD00]/20 sm:h-12"
                :class="errors.password ? 'border-rose-400' : 'border-slate-200'"
                @input="errors.password = ''"
              />
              <button type="button" class="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCD00]" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">
                <EyeOff v-if="showPassword" class="h-[17px] w-[17px]" aria-hidden="true" />
                <Eye v-else class="h-[17px] w-[17px]" aria-hidden="true" />
              </button>
            </div>
            <p v-if="errors.password" id="teacher-password-error" class="mt-1.5 text-xs font-medium text-rose-600" role="alert">{{ errors.password }}</p>
          </div>

          <label class="flex w-fit cursor-pointer items-center gap-2.5 rounded text-xs text-slate-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#FFCD00] focus-within:ring-offset-2 sm:text-sm">
            <input v-model="form.remember" type="checkbox" class="h-4 w-4 rounded border-slate-300 accent-[#FFCD00] focus:ring-[#FFCD00]" />
            Keep me signed in
          </label>

          <button type="submit" :disabled="submitting" class="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FFCD00] px-5 text-sm font-bold text-[#1A1A1A] transition hover:bg-[#F0BE00] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFCD00]/35 disabled:cursor-wait disabled:opacity-75 sm:h-12">
            <span>{{ submitting ? 'Opening your workspace…' : 'Sign in' }}</span>
            <ArrowRight v-if="!submitting" class="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            <span v-else aria-hidden="true" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" />
          </button>
          </form>

          <p class="teacher-login__preview mt-3 hidden rounded-xl bg-[#FDF9EF] px-3.5 py-2.5 text-[11px] leading-4 text-slate-600 sm:block">
            Preview mode: use any valid email and password to open the sample instructor workspace.
          </p>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.teacher-login__stage {
  grid-template-rows: minmax(0, 1fr) clamp(100px, 20vh, 160px);
}

.teacher-login__team {
  object-position: center bottom;
}

/* The art area is a size container so the shape frame can be measured
   against it. The frame is square and follows the photo rather than the
   area: on wide layouts the photo is 112% of the area's width at its own
   1567 x 1277 ratio, so it stands about 91% of the area's width tall, and
   the frame is a quarter taller than that (114%) so the shapes rise above
   the heads by the same amount at every size. It never outgrows the area's
   height. */
.teacher-login__art {
  container-type: size;
}

.teacher-login__blobs {
  aspect-ratio: 1 / 1;
  height: min(114cqw, 100cqh);
}

/* On laptop and desktop layouts the team is sized by the art area's height,
   so the heads sit just under the logo and the feet stand on the bottom edge
   on every screen. Sized by width, as before, the photo shrank on squarer
   screens and left a band of empty space above the heads. The width cap
   (130% of the column) stops it from spreading far under the sign-in card on
   narrow, tall windows; there the picture shrinks to fit that width and
   stays standing on the bottom edge. The stage is allowed up to 2400px wide
   (it used to stop at 1440px) so that on big monitors the column is wide
   enough for the photo to reach full height instead of hitting that cap. */
@media (min-width: 1024px) {
  .teacher-login__team {
    position: absolute;
    bottom: 0;
    left: 50%;
    height: 92%;
    width: auto;
    max-width: 130%;
    object-fit: contain;
    object-position: center bottom;
    transform: translateX(-50%);
  }
}

/* Landscape tablets (iPad Air at 1180 x 820, iPad at 1024 x 768, iPad Pro at
   1366 x 1024) are much squarer than a laptop, so the photo column was too
   narrow for the team to stand full height and left a band of empty space
   above their heads. On these screens the form column is a fixed, slightly
   narrower width and the photo may run a little wider than its column. */
@media (min-width: 1024px) and (max-aspect-ratio: 3/2) {
  .teacher-login__stage {
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 24px;
  }

  /* Wide enough to stand nearly full height, but not so wide that the last
     teacher disappears behind the card. Set a touch left of centre, so the
     overflow trims the first teacher's shoulder rather than hiding anyone. */
  .teacher-login__team {
    max-width: 128%;
    transform: translateX(-52%);
  }
}

/* On big monitors the photo at full height is wider than its column, and
   centred it lost the first teacher's shoulder off the left edge while
   leaving empty space in front of the card, so it is nudged right. Laptops
   keep it centred: there the card is close and would cover the last
   teacher's arm. */
@media (min-width: 1600px) {
  .teacher-login__team {
    transform: translateX(-46%);
  }
}

.teacher-login {
  height: 100vh;
  height: 100dvh;
}

@media (max-height: 620px) {
  .teacher-login__stage {
    grid-template-rows: minmax(0, 1fr) clamp(84px, 18vh, 112px);
  }

  .teacher-login__card {
    padding: 12px;
  }

  .teacher-login__card-head,
  .teacher-login__intro {
    margin-bottom: 10px;
  }

  .teacher-login__fields {
    gap: 8px;
  }

  .teacher-login__field input {
    height: 38px;
  }

  .teacher-login__preview {
    display: none;
  }
}

@media (max-height: 500px) {
  .teacher-login__stage {
    grid-template-rows: minmax(0, 1fr) clamp(40px, 8vh, 58px);
  }

  .teacher-login__card {
    padding: 8px;
  }

  .teacher-login__card-head,
  .teacher-login__intro {
    margin-bottom: 8px;
  }

  .teacher-login__fields {
    gap: 6px;
  }

  .teacher-login__field input {
    height: 36px;
  }
}

@media (max-height: 430px) {
  .teacher-login__stage {
    grid-template-rows: minmax(0, 1fr) 0;
  }

  .teacher-login__art {
    display: none;
  }
}

@media (min-width: 768px) {
  .teacher-login__stage {
    grid-template-rows: minmax(0, 1fr);
  }
}

/* Phones and portrait tablets: a page locked to the screen height squeezed
   the team photo into a thin strip (phones) or a narrow column with
   stretched shapes (tablets), and left the card floating between empty gaps.
   Here the page scrolls instead: the card sits right under the logo bar, and
   the photo follows at a height where the people and the shapes behind them
   keep their proportions. Placed last so it wins over the rules above and
   over the md: utilities in the template. */
@media (max-width: 1023px) {
  .teacher-login {
    height: auto;
    min-height: 100vh;
    min-height: 100dvh;
    overflow-x: hidden;
    overflow-y: auto;
  }

  /* The stage is at least one screen tall, so the photo area under the
     form can take whatever height is left instead of a fixed strip. */
  .teacher-login__stage {
    display: flex;
    flex-direction: column;
    height: auto;
    min-height: 100vh;
    min-height: 100dvh;
    gap: 20px;
    padding-top: 84px;
  }

  .teacher-login__form-panel {
    order: 1;
    padding-top: 0;
    padding-bottom: 0;
  }

  /* On a portrait tablet a fixed 420px strip left the team small, with a
     gap above their heads and blank page under them. The area now grows to
     the bottom of the screen (never shorter than before on phones). */
  .teacher-login__art {
    order: 2;
    display: flex;
    flex: 1 0 auto;
    height: auto;
    min-height: clamp(240px, 60vw, 420px);
    overflow: hidden;
  }

  /* The photo stops a little short of the top of its area so the shape
     frame, which fills the area's height, rises above the heads as it does
     on desktop. */
  /* The shapes follow the area's real height for the same reason as the
     photo below: container units do not resolve against a stretched area. */
  .teacher-login__blobs {
    height: 100%;
    max-width: 100%;
  }

  /* Positioned inside its area, because the area's height comes from the
     space left on screen: an absolutely placed photo measures its percentage
     height against that real height, where an ordinary one would not. */
  .teacher-login__team {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: auto;
    max-width: 96%;
    height: 90%;
    object-fit: contain;
    object-position: center bottom;
    transform: translateX(-50%);
  }

  .teacher-login__preview {
    display: block;
  }
}
/* Phones. Only the top of the team photo shows, heads and shoulders in a
   strip under the logo, and the sign-in card follows below it without
   overlapping. Laid over the photo, the card hid faces or needed a fade that
   tinted the team green and purple. The corner waves go, since they crowded
   the help link; the violet shape behind the heads already carries colour. */
@media (max-width: 639px) {
  .teacher-login__wave {
    display: none;
  }

  .teacher-login__stage {
    padding-top: 76px;
    padding-bottom: 24px;
    gap: 16px;
  }

  /* A fixed-ratio crop, full width of the screen. The photo is hung from
     the top of the strip, so whatever the phone, the cut falls at chest
     height. */
  .teacher-login__art {
    order: 1;
    flex: none;
    height: 50vw;
    min-height: 0;
    margin: 0 -16px;
  }

  .teacher-login__form-panel {
    order: 2;
    flex: 1 0 auto;
    align-items: flex-start;
  }

  /* Only the violet shape behind the heads is wanted in the crop; the mint
     one sits low and only showed as a tint over the shirts. */
  .teacher-login__blobs {
    top: 16px;
    bottom: auto;
    height: auto;
    width: 96vw;
    max-width: none;
  }

  .teacher-login__blobs > div:last-child {
    display: none;
  }

  /* Wider than the screen so the faces are large enough to read; the outer
     shoulders run off the edges. */
  .teacher-login__team {
    top: 4px;
    bottom: auto;
    width: 118vw;
    height: auto;
    max-width: none;
    max-height: none;
    filter: none;
  }

  .teacher-login__card {
    max-width: none;
    padding: 20px;
    border-color: rgba(26, 26, 26, 0.06);
    border-radius: 24px;
    background: #fff;
    box-shadow: 0 18px 40px -24px rgba(26, 26, 26, 0.35);
  }

  .teacher-login__card-head {
    margin-bottom: 20px;
  }
}
</style>
