<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  entry: { type: Object, required: true },
});

const sortMaterialsNewestFirst = (list) =>
  [...list].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

const baseMaterials = computed(() => [
  {
    createdAt: "2026-02-12T09:30:00.000Z",
    title: `${props.entry.subject} Lesson Packet`,
    link: "https://docs.google.com/document/d/materials-packet",
  },
  {
    createdAt: "2026-01-28T08:00:00.000Z",
    title: "Pronunciation Practice Sheet",
    link: "https://docs.google.com/document/d/materials-reference",
  },
]);

const materials = ref(sortMaterialsNewestFirst(baseMaterials.value));
const draft = ref(null);
const activeActionIndex = ref(null);
const editingIndex = ref(null);
const editingDraft = ref({ createdAt: "", title: "", link: "" });

watch(baseMaterials, (value) => {
  materials.value = sortMaterialsNewestFirst(value);
  draft.value = null;
  activeActionIndex.value = null;
  editingIndex.value = null;
  editingDraft.value = { createdAt: "", title: "", link: "" };
});

const hasDraftChanges = computed(
  () => draft.value !== null && (draft.value.title.trim() !== "" || draft.value.link.trim() !== "")
);

function handlePrimaryAction() {
  if (!draft.value) {
    draft.value = { title: "", link: "" };
    return;
  }

  if (!hasDraftChanges.value) {
    return;
  }

  const createdAt = new Date().toISOString();
  materials.value = sortMaterialsNewestFirst([...materials.value, { ...draft.value, createdAt }]);
  draft.value = { title: "", link: "" };
}

function startEditMaterial(index) {
  const selected = materials.value[index];
  if (!selected) {
    return;
  }
  editingIndex.value = index;
  editingDraft.value = {
    createdAt: selected.createdAt.slice(0, 10),
    title: selected.title,
    link: selected.link,
  };
  activeActionIndex.value = null;
}

function saveEditedMaterial() {
  if (editingIndex.value === null) {
    return;
  }
  const parsedDate = new Date(editingDraft.value.createdAt);
  const createdAt = Number.isNaN(parsedDate.getTime())
    ? materials.value[editingIndex.value].createdAt
    : parsedDate.toISOString();
  materials.value = sortMaterialsNewestFirst(
    materials.value.map((item, materialIndex) =>
      materialIndex === editingIndex.value ? { ...item, ...editingDraft.value, createdAt } : item
    )
  );
  editingIndex.value = null;
  editingDraft.value = { createdAt: "", title: "", link: "" };
}

function cancelEditingMaterial() {
  editingIndex.value = null;
  editingDraft.value = { createdAt: "", title: "", link: "" };
}

function deleteMaterial(index) {
  materials.value = materials.value.filter((_, materialIndex) => materialIndex !== index);
  if (activeActionIndex.value === index) {
    activeActionIndex.value = null;
  }
  if (editingIndex.value === index) {
    editingIndex.value = null;
  }
}
</script>

<template>
  <div class="space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
    <p class="m-0 font-semibold text-slate-800">Class Materials</p>
    <div class="overflow-x-auto rounded border border-slate-200 bg-white">
      <table class="min-w-full border-collapse text-xs sm:text-sm">
        <thead class="bg-slate-100 text-slate-600">
          <tr>
            <th class="border-b border-slate-200 px-3 py-2 text-left">Date Created</th>
            <th class="border-b border-slate-200 px-3 py-2 text-left">Title</th>
            <th class="border-b border-slate-200 px-3 py-2 text-left">Link</th>
            <th class="border-b border-slate-200 px-3 py-2 text-left" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in materials" :key="`${item.title}-${index}`">
            <td :class="`${index < materials.length - 1 ? 'border-b border-slate-100' : ''} px-3 py-2`">
              <input
                v-if="editingIndex === index"
                type="date"
                v-model="editingDraft.createdAt"
                class="w-full rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary sm:text-sm"
              />
              <template v-else>{{ new Date(item.createdAt).toLocaleDateString("en-US") }}</template>
            </td>
            <td :class="`${index < materials.length - 1 ? 'border-b border-slate-100' : ''} px-3 py-2`">
              <input
                v-if="editingIndex === index"
                type="text"
                v-model="editingDraft.title"
                class="w-full rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary sm:text-sm"
              />
              <template v-else>{{ item.title }}</template>
            </td>
            <td
              :class="`${index < materials.length - 1 ? 'border-b border-slate-100' : ''} px-3 py-2 text-primary-dark`"
            >
              <input
                v-if="editingIndex === index"
                type="text"
                v-model="editingDraft.link"
                class="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 outline-none focus:border-primary sm:text-sm"
              />
              <template v-else>{{ item.link }}</template>
            </td>
            <td :class="`${index < materials.length - 1 ? 'border-b border-slate-100' : ''} px-3 py-2`">
              <div v-if="editingIndex === index" class="flex items-center gap-1">
                <button
                  type="button"
                  @click="saveEditedMaterial"
                  class="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-white transition hover:bg-primary-dark"
                >
                  Save
                </button>
                <button
                  type="button"
                  @click="cancelEditingMaterial"
                  class="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
              <div v-else class="flex items-center gap-1">
                <button
                  type="button"
                  @click="activeActionIndex = activeActionIndex === index ? null : index"
                  class="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-700 transition hover:bg-slate-50"
                  :aria-label="`Actions for ${item.title}`"
                  title="Show actions"
                >
                  <span class="material-symbols-outlined text-base">more_horiz</span>
                </button>
                <template v-if="activeActionIndex === index">
                  <button
                    type="button"
                    @click="startEditMaterial(index)"
                    class="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    @click="deleteMaterial(index)"
                    class="rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    Delete
                  </button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="draft" class="rounded border border-slate-200 bg-white p-3">
      <p class="m-0 mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        New Material
      </p>
      <div class="grid gap-2 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Title"
          v-model="draft.title"
          class="rounded border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-primary"
        />
        <input
          type="text"
          placeholder="Link"
          v-model="draft.link"
          class="rounded border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-primary"
        />
      </div>
    </div>
    <div class="flex justify-end">
      <button
        type="button"
        @click="handlePrimaryAction"
        class="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
      >
        {{ hasDraftChanges ? "Save" : "Add Materials" }}
      </button>
    </div>
  </div>
</template>
