<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  SUBJECT_CATEGORIES,
  SUBJECT_LABELS,
  isSubjectMatchingFilter,
  getSubjectInstructorCount,
  INSTRUCTORS,
} from "./constants";

const props = defineProps({
  modelValue: {
    type: String,
    default: "ALL",
  },
  favoritesOnly: {
    type: Boolean,
    default: false,
  },
  favoritesCount: {
    type: Number,
    default: 0,
  },
  showFavoritesButton: {
    type: Boolean,
    default: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "update:favoritesOnly"]);

const isDropdownOpen = ref(false);
const searchQuery = ref("");
const dropdownRef = ref(null);

const activeCategory = computed(() => {
  if (!props.modelValue || props.modelValue === "ALL") return "ALL";
  if (props.modelValue.startsWith("CAT_")) {
    return props.modelValue.replace("CAT_", "");
  }
  for (const cat of SUBJECT_CATEGORIES) {
    if (cat.codes.includes(props.modelValue)) {
      return cat.id;
    }
  }
  return "ALL";
});

const selectedSubjectObject = computed(() => {
  if (!props.modelValue || props.modelValue === "ALL") return null;
  if (props.modelValue.startsWith("CAT_")) {
    const cat = SUBJECT_CATEGORIES.find((c) => c.id === props.modelValue.replace("CAT_", ""));
    return cat ? { label: `${cat.icon} All ${cat.shortName}`, isCategory: true } : null;
  }
  for (const cat of SUBJECT_CATEGORIES) {
    const sub = cat.subjects.find((s) => s.code === props.modelValue);
    if (sub) return { ...sub, categoryIcon: cat.icon, categoryName: cat.shortName };
  }
  return { code: props.modelValue, name: SUBJECT_LABELS[props.modelValue] || props.modelValue };
});

const currentSubChips = computed(() => {
  if (activeCategory.value === "ALL") return [];
  const cat = SUBJECT_CATEGORIES.find((c) => c.id === activeCategory.value);
  if (!cat) return [];
  return [
    { code: `CAT_${cat.id}`, label: `All ${cat.shortName}`, isCategory: true, count: getSubjectInstructorCount(`CAT_${cat.id}`) },
    ...cat.subjects.map((s) => ({
      code: s.code,
      label: s.short || s.name,
      badge: s.badge,
      name: s.name,
      count: getSubjectInstructorCount(s.code),
    })),
  ];
});

const filteredCategoriesForDropdown = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return SUBJECT_CATEGORIES;

  return SUBJECT_CATEGORIES.map((cat) => {
    const matchingSubjects = cat.subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.code.toLowerCase().includes(query) ||
        s.badge.toLowerCase().includes(query) ||
        cat.name.toLowerCase().includes(query)
    );
    return {
      ...cat,
      subjects: matchingSubjects,
    };
  }).filter((cat) => cat.subjects.length > 0);
});

const selectFilter = (val) => {
  emit("update:modelValue", val);
  isDropdownOpen.value = false;
};

const selectCategoryTab = (catId) => {
  if (catId === "ALL") {
    emit("update:modelValue", "ALL");
  } else {
    emit("update:modelValue", `CAT_${catId}`);
  }
};

const clearFilter = () => {
  emit("update:modelValue", "ALL");
  isDropdownOpen.value = false;
};

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="w-full space-y-2.5">
    <!-- Top Row: Category Tabs + Dropdown Menu + Favorites -->
    <div class="flex flex-wrap items-center justify-between gap-2.5">
      
      <!-- Category Segmented Control & Dropdown Trigger -->
      <div class="flex flex-wrap items-center gap-1.5 min-w-0">
        
        <!-- Category Tabs -->
        <div class="inline-flex items-center rounded-xl bg-slate-100 p-1 text-[11px] font-semibold text-slate-600">
          <button
            type="button"
            @click="selectCategoryTab('ALL')"
            :class="`rounded-lg px-2.5 py-1 transition-all duration-150 ${
              activeCategory === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`"
          >
            All ({{ INSTRUCTORS.length }})
          </button>
          
          <button
            v-for="cat in SUBJECT_CATEGORIES"
            :key="cat.id"
            type="button"
            @click="selectCategoryTab(cat.id)"
            :class="`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all duration-150 ${
              activeCategory === cat.id
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`"
          >
            <span>{{ cat.icon }}</span>
            <span>{{ cat.shortName }}</span>
          </button>
        </div>

        <!-- Subject Popover Trigger Button -->
        <div class="relative" ref="dropdownRef">
          <button
            type="button"
            @click="isDropdownOpen = !isDropdownOpen"
            :class="`inline-flex h-8 items-center gap-1.5 rounded-xl border px-2.5 text-[11px] font-semibold transition-all ${
              modelValue !== 'ALL' && !modelValue.startsWith('CAT_')
                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                : isDropdownOpen
                ? 'border-slate-300 bg-slate-100 text-slate-900'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`"
            title="Browse all specific subjects"
          >
            <span class="text-xs">📖</span>
            <span class="max-w-[160px] truncate sm:max-w-[200px]">
              {{ selectedSubjectObject && !selectedSubjectObject.isCategory ? selectedSubjectObject.name : 'Select Subject…' }}
            </span>
            <svg
              class="h-3 w-3 transition-transform duration-200"
              :class="isDropdownOpen ? 'rotate-180' : ''"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown Popover -->
          <div
            v-if="isDropdownOpen"
            class="absolute left-0 top-full mt-1.5 z-50 w-72 sm:w-80 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-black/10 text-slate-800 animate-in fade-in zoom-in-95 origin-top-left"
          >
            <!-- Search bar -->
            <div class="relative mb-2.5">
              <svg class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search subject or code (e.g. SF, Vowels)…"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-7 text-xs text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition placeholder:text-slate-400"
                autofocus
              />
              <button
                v-if="searchQuery"
                type="button"
                @click="searchQuery = ''"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <!-- "All Subjects" Option -->
            <button
              type="button"
              @click="clearFilter"
              :class="`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition mb-1.5 ${
                modelValue === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`"
            >
              <span class="flex items-center gap-2">
                <span>✨</span>
                <span>All Subjects</span>
              </span>
              <span :class="modelValue === 'ALL' ? 'text-slate-300' : 'text-slate-400'" class="text-[10px]">
                {{ INSTRUCTORS.length }} teachers
              </span>
            </button>

            <!-- Categorized list -->
            <div class="max-h-64 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              <div v-for="cat in filteredCategoriesForDropdown" :key="cat.id" class="space-y-1">
                <div class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <span>{{ cat.icon }}</span>
                  <span>{{ cat.name }}</span>
                </div>
                <div class="space-y-0.5">
                  <button
                    v-for="sub in cat.subjects"
                    :key="sub.code"
                    type="button"
                    @click="selectFilter(sub.code)"
                    :class="`w-full flex items-center justify-between rounded-lg px-2 py-1.5 text-xs transition text-left ${
                      modelValue === sub.code
                        ? 'bg-slate-900 text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-100 font-medium'
                    }`"
                  >
                    <div class="flex items-center gap-2 min-w-0 pr-2">
                      <span
                        :class="`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold shrink-0 ${
                          modelValue === sub.code
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`"
                      >
                        {{ sub.badge }}
                      </span>
                      <span class="truncate">{{ sub.name }}</span>
                    </div>
                    <span :class="modelValue === sub.code ? 'text-slate-300' : 'text-slate-400'" class="text-[10px] shrink-0">
                      {{ getSubjectInstructorCount(sub.code) }}
                    </span>
                  </button>
                </div>
              </div>

              <div v-if="filteredCategoriesForDropdown.length === 0" class="py-4 text-center text-xs text-slate-400">
                No subjects matching "{{ searchQuery }}"
              </div>
            </div>
          </div>
        </div>

        <!-- Active Filter Badge with Clear Button (if specific subject is selected) -->
        <button
          v-if="modelValue !== 'ALL'"
          type="button"
          @click="clearFilter"
          class="inline-flex items-center gap-1 rounded-full bg-slate-100 hover:bg-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600 transition"
          title="Reset to all subjects"
        >
          <span>✕</span>
          <span>Clear subject filter</span>
        </button>

      </div>

      <!-- Favorites Toggle (if enabled) -->
      <button
        v-if="showFavoritesButton"
        type="button"
        @click="emit('update:favoritesOnly', !favoritesOnly)"
        :aria-pressed="favoritesOnly"
        :class="`inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-semibold transition-all shrink-0 ${
          favoritesOnly
            ? 'border-amber-300 bg-amber-50 text-amber-800 shadow-xs font-bold'
            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
        }`"
      >
        <span :class="favoritesOnly ? 'text-amber-500' : 'text-slate-300'">★</span>
        <span>Favorites</span>
        <span
          v-if="favoritesCount > 0"
          :class="`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
            favoritesOnly ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-500'
          }`"
        >
          {{ favoritesCount }}
        </span>
      </button>

    </div>

    <!-- Tier 2: Contextual Sub-Chips Strip (Only shows when a specific category is active) -->
    <div
      v-if="currentSubChips.length > 0"
      class="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar transition-all duration-200"
    >
      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-0.5">
        Refine:
      </span>
      <button
        v-for="chip in currentSubChips"
        :key="chip.code"
        type="button"
        @click="emit('update:modelValue', chip.code)"
        :class="`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold transition-all shrink-0 ${
          modelValue === chip.code
            ? 'bg-slate-900 text-white shadow-xs'
            : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
        }`"
      >
        <span
          v-if="chip.badge"
          :class="`rounded px-1 text-[9px] font-mono font-bold ${
            modelValue === chip.code ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
          }`"
        >
          {{ chip.badge }}
        </span>
        <span>{{ chip.label }}</span>
        <span :class="modelValue === chip.code ? 'text-slate-300' : 'text-slate-400'" class="text-[10px]">
          ({{ chip.count }})
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
</style>
