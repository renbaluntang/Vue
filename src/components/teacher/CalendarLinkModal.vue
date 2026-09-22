<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
      leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0"
    >
      <div
        v-if="teacher.calendarSettingsOpen"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
        @click.self="close"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cal-link-title"
      >
        <div class="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl supports-[max-height:100dvh]:max-h-[90dvh]">
          <!-- Header -->
          <div class="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
            <div class="flex min-w-0 items-center gap-2.5">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50">
                <i class="fa-brands fa-google text-sm text-sky-500"></i>
              </div>
              <div class="min-w-0">
                <h3 id="cal-link-title" class="text-base font-extrabold text-slate-900">Google Calendar</h3>
                <p class="truncate text-xs text-slate-500">Your reservations appear in your own calendar.</p>
              </div>
            </div>
            <button
              type="button"
              @click="close"
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <i class="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>

          <!-- Body -->
          <div class="custom-scrollbar flex-1 overflow-y-auto p-5 sm:p-6">
            <!-- Status first: the question is "am I linked?", so it is answered
                 before anything asks to be clicked. -->
            <div
              class="rounded-2xl border p-4"
              :class="teacher.googleCalendarLinked
                ? 'border-emerald-200 bg-emerald-50/50'
                : 'border-amber-200 bg-amber-50/60'"
            >
              <p class="flex items-center gap-2 text-xs font-black uppercase tracking-wider"
                 :class="teacher.googleCalendarLinked ? 'text-emerald-800' : 'text-amber-900'">
                <span
                  v-if="teacher.googleCalendarLinked"
                  class="h-2 w-2 rounded-full bg-emerald-500"
                ></span>
                <i v-else class="fa-solid fa-triangle-exclamation text-[11px] text-amber-500"></i>
                {{ teacher.googleCalendarLinked ? 'Linked' : 'Not connected' }}
              </p>

              <template v-if="teacher.googleCalendarLinked">
                <p class="mt-2 truncate text-sm font-bold text-slate-900">
                  {{ teacher.googleCalendarAccount }}
                </p>
                <p class="mt-0.5 text-[11px] font-semibold text-slate-500">
                  Last synced {{ teacher.googleCalendarSyncedAt }}
                </p>
              </template>
              <p v-else class="mt-2 text-sm text-slate-700">
                Reservations will not appear in your calendar until you connect.
              </p>
            </div>

            <p
              v-if="justRelinked"
              class="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800"
              role="status"
            >
              <i class="fa-solid fa-check text-[11px]"></i>
              Reconnected — syncing resumed.
            </p>

            <!-- What it actually does, including the thing instructors ask about
                 most: whether their private calendar becomes visible. -->
            <ul class="mt-5 space-y-2 text-xs text-slate-600">
              <li class="flex gap-2.5">
                <i class="fa-solid fa-check mt-0.5 text-[11px] text-emerald-600"></i>
                <span>Confirmed lessons are added as calendar events.</span>
              </li>
              <li class="flex gap-2.5">
                <i class="fa-solid fa-check mt-0.5 text-[11px] text-emerald-600"></i>
                <span>Cancellations and reschedules update the same event.</span>
              </li>
              <li class="flex gap-2.5">
                <i class="fa-solid fa-lock mt-0.5 text-[11px] text-slate-400"></i>
                <span>Nothing in your calendar is shared with students or shown on your schedule.</span>
              </li>
            </ul>

            <!-- Actions -->
            <div v-if="teacher.googleCalendarLinked" class="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                @click="relink"
                class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50 active:scale-95"
              >
                <i class="fa-solid fa-rotate text-[11px] text-slate-400"></i>
                Relink account
              </button>
              <button
                type="button"
                @click="disconnect"
                class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-extrabold text-rose-700 transition hover:bg-rose-100 active:scale-95"
              >
                <i class="fa-solid fa-link-slash text-[11px]"></i>
                Disconnect
              </button>
            </div>

            <button
              v-else
              type="button"
              @click="relink"
              class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-brighture-gold px-4 py-3 text-xs font-extrabold text-brighture-ink transition hover:bg-brighture-gold-deep active:scale-95"
            >
              <i class="fa-brands fa-google text-[11px]"></i>
              Connect Google Calendar
            </button>

            <p v-if="teacher.googleCalendarLinked" class="mt-3 text-center text-[11px] text-slate-400">
              Relinking re-authorises the same account — it never removes existing events.
            </p>
          </div>

          <!-- Footer -->
          <div class="flex shrink-0 items-center justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
            <button
              type="button"
              @click="close"
              class="rounded-xl bg-brighture-gold px-5 py-2 text-xs font-extrabold text-brighture-ink shadow-sm transition hover:bg-brighture-gold-deep active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { useTeacherStore } from '../../stores/useTeacherStore';

const teacher = useTeacherStore();

/** A relink that changes nothing visible reads as a dead button, so say so. */
const justRelinked = ref(false);
let timer = null;

const relink = () => {
  teacher.linkGoogleCalendar();
  justRelinked.value = true;
  clearTimeout(timer);
  timer = setTimeout(() => { justRelinked.value = false; }, 4000);
};

/** The success note belongs to the linked state; it must not outlive it. */
const clearNote = () => { justRelinked.value = false; clearTimeout(timer); };

const disconnect = () => {
  clearNote();
  teacher.unlinkGoogleCalendar();
};

const close = () => { teacher.calendarSettingsOpen = false; };

// The confirmation belongs to one visit, not to the next one.
watch(() => teacher.calendarSettingsOpen, (open) => {
  if (!open) clearNote();
});

const onKeydown = (e) => { if (e.key === 'Escape' && teacher.calendarSettingsOpen) close(); };
document.addEventListener('keydown', onKeydown);
onBeforeUnmount(() => { document.removeEventListener('keydown', onKeydown); clearTimeout(timer); });
</script>
