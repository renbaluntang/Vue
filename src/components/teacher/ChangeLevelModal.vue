<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0"
    >
      <!-- Above the student panel (z-50), since it can be opened from there. -->
      <div
        v-if="studentId != null"
        class="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/60 px-3 pt-6 pb-4 sm:pt-12 backdrop-blur-xs"
        @click.self="$emit('close')"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-level-title"
          class="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl"
          @keydown.esc="$emit('close')"
        >
          <div class="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div class="min-w-0">
              <h2 id="change-level-title" class="m-0 text-base font-black text-slate-900">Change level</h2>
              <p class="m-0 mt-0.5 text-xs text-slate-500">
                {{ name }} · now
                <span class="font-bold text-slate-700">{{ summary.label }}</span>
              </p>
            </div>
            <button
              type="button"
              @click="$emit('close')"
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="space-y-4 px-5 py-4">
            <BrelasLevelPicker v-model="to" :current="summary.value" label="New rating" />

            <div>
              <label for="change-level-reason" class="mb-1 block text-xs font-bold text-slate-700">
                Reason <span class="text-rose-600">*</span>
              </label>
              <textarea
                id="change-level-reason"
                v-model="reason"
                rows="3"
                maxlength="500"
                placeholder="What you saw that changed your view of the student's level"
                class="w-full resize-y rounded-xl border bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:ring-2"
                :class="error && !reason.trim() ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-200 focus:border-brighture-gold focus:ring-brighture-gold/20'"
              ></textarea>
              <p class="m-0 mt-1 text-[11px] text-slate-400">Kept in the level history for admins and other teachers. The student never sees it.</p>
            </div>

            <p v-if="error" role="alert" class="m-0 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
              <i class="fa-solid fa-circle-exclamation mr-1" aria-hidden="true"></i>{{ error }}
            </p>
          </div>

          <div class="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3.5">
            <button
              type="button"
              @click="$emit('close')"
              class="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
            >Cancel</button>
            <button
              type="button"
              @click="save"
              class="rounded-xl bg-brighture-gold px-4 py-2 text-xs font-extrabold text-brighture-ink transition hover:bg-brighture-gold-deep active:scale-95"
            >Save level</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import BrelasLevelPicker from './BrelasLevelPicker.vue';
import { useSchoolStore } from '@/stores/useSchoolStore';
import { useTeacherStore } from '@/stores/useTeacherStore';

const props = defineProps({
  /** The student whose level to change; null keeps the modal closed. */
  studentId: { type: [Number, String], default: null },
});
const emit = defineEmits(['close', 'saved']);

const school = useSchoolStore();
const teacher = useTeacherStore();

const summary = computed(() => school.levelSummary(props.studentId));
const name = computed(() => school.student(props.studentId).name);

const to = ref(null);
const reason = ref('');
const error = ref('');

// Each opening starts from the student's current level and a blank reason,
// so a half-written reason for one student never carries to the next.
watch(() => props.studentId, (id) => {
  if (id == null) return;
  to.value = summary.value.value;
  reason.value = '';
  error.value = '';
}, { immediate: true });

const save = () => {
  if (to.value === null) { error.value = 'Choose a rating.'; return; }
  if (to.value === summary.value.value) { error.value = `${name.value} is already at this level. Choose a different one.`; return; }
  if (!reason.value.trim()) { error.value = 'Add a reason. Every level change needs one for the history.'; return; }
  const entry = school.setLevel(props.studentId, to.value, {
    by: { kind: 'teacher', id: teacher.teacherId, name: teacher.fullName },
    reason: reason.value,
  });
  if (!entry) { error.value = 'The level could not be saved. Try again.'; return; }
  emit('saved', entry);
  emit('close');
};
</script>
