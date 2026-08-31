<script setup>
import { ref } from "vue";
import studentImage from "@/assets/student-1.svg";

const TEACHERS = [
  { id: 1, name: "Ralph Dela Cruz", points: 3, specialty: "[SC], [LS1], [DC]" },
  { id: 2, name: "Christine Magsino", points: 6, specialty: "[EP], [PP], [SF]" },
  { id: 3, name: "Ashley Tanaka", points: 4, specialty: "[LS1], [PP], [EP]" },
  { id: 4, name: "Sandra Ramos", points: 7, specialty: "[DC], [SC], [EP]" },
  { id: 5, name: "Meg Santos", points: 5, specialty: "[SC], [PP], [TL]" },
  { id: 6, name: "Mark Villanueva", points: 3, specialty: "[SF], [PP102], [DC]" },
];

const SC_TEACHERS = TEACHERS.filter((teacher) => teacher.specialty.includes("[SC]"));

const message = ref("");
const substitute = ref("accept");
const selectedTeacher = ref(null);
const randomizedTeacher = ref(null);
const isTeacherModalOpen = ref(false);

function selectTeacher(teacher) {
  const remainingTeachers = SC_TEACHERS.filter((item) => item.id !== teacher.id);
  const randomIndex = Math.floor(Math.random() * remainingTeachers.length);
  const secondTeacher = remainingTeachers[randomIndex] ?? null;
  selectedTeacher.value = teacher;
  randomizedTeacher.value = secondTeacher;
  isTeacherModalOpen.value = false;
}
</script>

<template>
  <div class="min-h-screen bg-[#e9edf1] px-3 py-4 text-[12px] text-slate-700 sm:px-6 sm:py-8">
    <div class="mx-auto max-w-[1240px] rounded-sm bg-[#f7f8fa] p-4 sm:p-6">
      <div class="rounded-xl bg-[#d9d9dd] px-4 py-3 sm:px-6">
        <h1 class="m-0 text-[12px] font-semibold text-slate-600">
          Reservation Details &amp; Message
        </h1>
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-[1fr,1.25fr]">
        <section class="flex flex-col items-center rounded-xl bg-transparent p-2">
          <div
            class="h-[220px] w-[220px] border-4 border-[#8d6e1a] bg-gradient-to-br from-[#90711f] via-[#c29d2f] to-[#8d6e1a] p-3 shadow-md sm:h-[300px] sm:w-[300px]"
          >
            <div
              class="flex h-full flex-col items-center justify-center border-4 border-[#c1aa63]/60 text-center"
            >
              <p class="m-0 text-5xl font-bold text-white drop-shadow-md">SC</p>
              <p class="m-0 mt-2 text-[12px] font-semibold text-white/90">
                Social Conversation
              </p>
            </div>
          </div>

          <h2 class="mb-0 mt-6 text-[12px] font-semibold text-slate-600">
            Social Conversation
          </h2>
          <p class="mt-3 text-center text-[12px] text-slate-600">
            Number of points consumed:
            <span class="text-[12px] font-bold text-primary">10</span> Points
          </p>
        </section>

        <section class="space-y-4">
          <div class="rounded-xl border-4 border-[#2683d8] bg-white px-4 py-4 text-center sm:px-6">
            <p class="m-0 text-[12px] font-semibold text-slate-600">
              Tokyo (Asia) - UTC+09:00
            </p>
            <p class="m-0 mt-1 text-[12px] text-slate-600">
              Lesson time: <span class="font-bold text-[#2683d8]">2026/2/16 11:00</span> ~
            </p>
          </div>

          <div class="rounded-xl bg-[#d8e3ef] p-4 sm:px-5">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label class="text-[12px] font-semibold text-slate-600 sm:w-[150px]">Subject</label>
              <div
                class="flex h-10 w-full items-center rounded-xl border-2 border-[#2683d8] bg-white px-3 text-[12px] font-semibold text-slate-700"
              >
                Social Conversation
              </div>
            </div>
            <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label class="text-[12px] font-semibold text-slate-600 sm:w-[150px]">
                Teacher Choice
              </label>
              <div class="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  class="h-10 rounded-xl border-2 border-[#2683d8] bg-white px-4 text-[12px] font-semibold text-slate-700 transition hover:bg-[#f0f7ff]"
                  @click="isTeacherModalOpen = true"
                >
                  Choose Teacher
                </button>
                <div
                  v-if="selectedTeacher"
                  class="grid grid-cols-[58px,1fr] text-[12px] text-slate-600"
                >
                  <p class="m-0">Selected:</p>
                  <p class="m-0">{{ selectedTeacher.name }}</p>
                  <template v-if="randomizedTeacher">
                    <p class="m-0" aria-hidden="true" />
                    <p class="m-0">{{ randomizedTeacher.name }}</p>
                  </template>
                </div>
                <span v-else class="text-[12px] text-slate-600">No teacher selected</span>
              </div>
            </div>
          </div>

          <div>
            <p class="m-0 text-[12px] text-slate-600">
              Let your teacher know what you'd like to learn or request for the lesson.
            </p>
            <textarea
              v-model="message"
              placeholder="Free input field (Please provide more detailed information)"
              class="mt-3 h-32 w-full rounded-md border border-slate-300 bg-white p-3 text-[12px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-primary"
            />
          </div>

          <div class="rounded-xl bg-[#efeff2] p-4 sm:p-5">
            <h3 class="m-0 text-[12px] font-semibold text-[#247bc8]">
              About Substitute Lessons
            </h3>
            <p class="mb-0 mt-3 text-[12px] text-slate-600">
              Please choose if you'd like a substitute teacher when your selected teacher cannot
              attend.
            </p>
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <label
                class="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-[#66a9e9] bg-[#ecf5ff] px-4 py-3 text-[12px] font-medium text-slate-600"
              >
                <input
                  type="radio"
                  name="substitute"
                  :checked="substitute === 'accept'"
                  class="h-5 w-5 accent-[#2683d8]"
                  @change="substitute = 'accept'"
                />
                Accept Substitute
              </label>
              <label
                class="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-[#66a9e9] bg-[#ecf5ff] px-4 py-3 text-[12px] font-medium text-slate-600"
              >
                <input
                  type="radio"
                  name="substitute"
                  :checked="substitute === 'decline'"
                  class="h-5 w-5 accent-[#2683d8]"
                  @change="substitute = 'decline'"
                />
                Decline Substitute
              </label>
            </div>
          </div>
        </section>
      </div>

      <div class="mt-8 flex justify-center">
        <button
          class="w-full max-w-xl rounded-lg bg-[#f6e743] px-6 py-3 text-[12px] font-semibold text-slate-700 shadow-sm transition hover:brightness-95"
        >
          Book a Lesson
        </button>
      </div>
    </div>

    <div
      v-if="isTeacherModalOpen"
      class="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/55 p-4 pt-10"
      @click="isTeacherModalOpen = false"
    >
      <div
        class="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-5"
        @click.stop
      >
        <div class="mb-4 flex items-center justify-between">
          <h2 class="m-0 text-[12px] font-semibold text-slate-700">Available Teachers</h2>
          <button
            class="rounded-lg border border-slate-300 bg-white px-3 py-1 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
            @click="isTeacherModalOpen = false"
          >
            Close
          </button>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="teacher in SC_TEACHERS"
            :key="teacher.id"
            :class="[
              'rounded-xl border p-3 transition',
              selectedTeacher?.id === teacher.id
                ? 'border-primary bg-primary/5'
                : 'border-slate-200 bg-white hover:border-slate-300',
            ]"
          >
            <div class="flex items-center gap-3">
              <img
                :src="studentImage"
                :alt="teacher.name"
                class="h-14 w-14 rounded-full object-cover"
              />
              <div>
                <p class="m-0 text-[12px] font-semibold text-slate-800">{{ teacher.name }}</p>
              </div>
            </div>
            <p class="mt-2 text-[12px] text-slate-600">{{ teacher.specialty }}</p>
            <button
              class="mt-2 w-full rounded-lg bg-primary px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-primary-dark"
              @click="selectTeacher(teacher)"
            >
              Select Teacher
            </button>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>
