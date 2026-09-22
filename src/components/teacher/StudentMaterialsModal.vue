<template>
  <Transition
    enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0"
  >
    <div
      v-if="student"
      class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      @click.self="$emit('close')"
    >
      <div
        class="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl supports-[max-height:100dvh]:max-h-[92dvh] sm:rounded-3xl"
        @click.stop
      >
        <!-- Header -->
        <div class="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div class="min-w-0">
            <p class="text-[10px] font-black uppercase tracking-wider text-brighture-bronze">Lesson materials</p>
            <h3 class="mt-0.5 truncate text-lg font-extrabold text-slate-900">{{ student.studentName }}</h3>
            <p class="mt-0.5 text-xs text-slate-500">
              Shared across every lesson with this student — not just this one.
            </p>
          </div>
          <button
            type="button"
            @click="$emit('close')"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            aria-label="Close"
          >
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        <!-- Shelf -->
        <div class="flex-1 overflow-y-auto px-5 py-4">
          <ul v-if="items.length" class="space-y-2">
            <li
              v-for="item in items"
              :key="item.id"
              class="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-3"
            >
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs ring-1"
                :class="materialKind(item.kind).chip"
              >
                <i :class="materialKind(item.kind).icon"></i>
              </span>

              <div class="min-w-0 flex-1">
                <p class="text-sm font-bold text-slate-900">{{ item.title }}</p>
                <p class="mt-0.5 text-[11px] font-semibold text-slate-500">
                  {{ materialKind(item.kind).label }}
                  <template v-if="item.subject"> · {{ item.subject }}</template>
                  · {{ item.addedOn }}
                </p>
                <p v-if="item.note" class="mt-1 text-xs italic text-slate-600">{{ item.note }}</p>
              </div>

              <div class="flex shrink-0 items-center gap-1">
                <a
                  v-if="item.url"
                  :href="item.url"
                  target="_blank"
                  rel="noopener"
                  class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                  title="Open"
                  aria-label="Open material"
                >
                  <i class="fa-solid fa-arrow-up-right-from-square text-[11px]"></i>
                </a>
                <button
                  type="button"
                  @click="teacher.removeMaterial(student.studentId, item.id)"
                  class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                  title="Remove"
                  :aria-label="`Remove ${item.title}`"
                >
                  <i class="fa-regular fa-trash-can text-[11px]"></i>
                </button>
              </div>
            </li>
          </ul>

          <p v-else class="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            Nothing shared with {{ firstName }} yet.
          </p>

          <!-- Add. Folded away by default: opening this modal is usually to
               check or hand over what is already there, and an empty form
               sitting under the list makes a short shelf look like a chore. -->
          <button
            v-if="!isAdding"
            type="button"
            @click="openForm"
            class="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-3 text-xs font-bold text-slate-600 transition hover:border-brighture-gold hover:bg-brighture-cream/20 hover:text-brighture-bronze active:scale-98"
          >
            <i class="fa-solid fa-plus text-xs text-brighture-bronze"></i>
            <span>Add materials</span>
          </button>

          <div v-else class="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3">
            <div class="flex items-center justify-between gap-2">
              <p class="text-[10px] font-black uppercase tracking-wider text-slate-400">Add materials</p>
              <button
                type="button"
                @click="cancelForm"
                class="-mr-1 -mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700"
                aria-label="Cancel"
              >
                <i class="fa-solid fa-xmark text-[11px]"></i>
              </button>
            </div>

            <div class="mt-2 space-y-2">
              <div>
                <label class="sr-only" for="mat-title">Title</label>
                <input
                  id="mat-title"
                  ref="titleEl"
                  v-model="draft.title"
                  type="text"
                  placeholder="What is it? e.g. Vowel drill worksheet"
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-brighture-gold focus:ring-2 focus:ring-brighture-gold/20"
                />
              </div>

              <div class="flex gap-2">
                <div class="w-32 shrink-0">
                  <label class="sr-only" for="mat-kind">Type</label>
                  <select
                    id="mat-kind"
                    v-model="draft.kind"
                    class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-brighture-gold"
                  >
                    <option v-for="opt in MATERIAL_KIND_OPTIONS" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
                <div class="min-w-0 flex-1">
                  <label class="sr-only" for="mat-url">Link</label>
                  <input
                    id="mat-url"
                    v-model="draft.url"
                    type="url"
                    placeholder="https://…"
                    class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-brighture-gold focus:ring-2 focus:ring-brighture-gold/20"
                  />
                </div>
              </div>

              <div>
                <label class="sr-only" for="mat-note">Note</label>
                <input
                  id="mat-note"
                  v-model="draft.note"
                  type="text"
                  placeholder="A note for the student (optional)"
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-brighture-gold focus:ring-2 focus:ring-brighture-gold/20"
                />
              </div>
            </div>

            <div class="mt-2.5 flex gap-2">
              <button
                type="button"
                @click="cancelForm"
                class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                @click="add"
                :disabled="!draft.title.trim()"
                class="flex-1 rounded-xl border border-transparent bg-brighture-gold px-4 py-2.5 text-xs font-extrabold text-brighture-ink transition hover:bg-brighture-gold-deep active:scale-95 disabled:opacity-40"
              >
                Add to {{ firstName }}'s materials
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { MATERIAL_KIND_OPTIONS, materialKind } from '../../lib/lessonMaterials';
import { useTeacherStore } from '../../stores/useTeacherStore';

const props = defineProps({
  /** A lesson row — it carries the studentId the shelf hangs off. */
  student: Object,
});
defineEmits(['close']);

const teacher = useTeacherStore();

const items = computed(() => (props.student ? teacher.materialsFor(props.student.studentId) : []));
const firstName = computed(() => (props.student?.studentName || '').split(' ')[0] || 'the student');

const blank = () => ({ title: '', kind: 'pdf', url: '', note: '' });
const draft = ref(blank());

const isAdding = ref(false);
const titleEl = ref(null);

const openForm = () => {
  isAdding.value = true;
  // Opening the form is already the decision to type, so put the caret there.
  nextTick(() => titleEl.value?.focus());
};

const cancelForm = () => {
  isAdding.value = false;
  draft.value = blank();
};

// A half-typed entry must not follow the instructor to the next student, and
// the form should greet each one folded.
watch(() => props.student?.studentId, () => {
  draft.value = blank();
  isAdding.value = false;
});

const add = () => {
  if (!props.student || !draft.value.title.trim()) return;
  teacher.addMaterial(props.student.studentId, {
    ...draft.value,
    subject: props.student.subject,
  });
  draft.value = blank();
  // Folded again: the new row is now in the list above, which is the
  // confirmation. Leaving an empty form open reads as "did that work?".
  isAdding.value = false;
};
</script>
