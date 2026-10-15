<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
    <!-- Top Header -->
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <div class="flex items-center gap-2.5">
          <div class="h-9 w-9 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <i class="fa-solid fa-file-pen text-base"></i>
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Tests &amp; Exams</h1>
            <p class="mt-0.5 text-xs sm:text-sm text-slate-500">Design assessments with multiple choice questions, essays, and automated point scoring.</p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2.5 shrink-0">
        <button
          v-if="!isCreating && !resultsExam"
          type="button"
          @click="startNewExam"
          class="inline-flex items-center gap-2 rounded-2xl bg-brighture-gold hover:brightness-105 active:scale-[0.98] px-4 py-2.5 text-sm font-extrabold text-slate-900 shadow-sm transition"
        >
          <i class="fa-solid fa-plus text-xs"></i>
          <span>Create New Test</span>
        </button>
        <button
          v-else
          type="button"
          @click="backToList"
          class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-600 transition"
        >
          <i class="fa-solid fa-arrow-left text-xs"></i>
          <span>Back to Tests</span>
        </button>
      </div>
    </header>

    <!-- Stat Badges row when not in create mode -->
    <div v-if="!isCreating && !resultsExam" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div class="text-[11px] font-bold tracking-wider uppercase text-slate-400">Total Exams</div>
        <div class="mt-1 flex items-baseline gap-2">
          <span class="text-2xl font-black text-slate-900">{{ examsList.length }}</span>
          <span class="text-xs text-slate-500 font-medium">created</span>
        </div>
      </div>
      <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div class="text-[11px] font-bold tracking-wider uppercase text-slate-400">Published</div>
        <div class="mt-1 flex items-baseline gap-2">
          <span class="text-2xl font-black text-emerald-600">{{ publishedCount }}</span>
          <span class="text-xs text-slate-500 font-medium">ready to assign</span>
        </div>
      </div>
      <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div class="text-[11px] font-bold tracking-wider uppercase text-slate-400">Drafts</div>
        <div class="mt-1 flex items-baseline gap-2">
          <span class="text-2xl font-black text-amber-500">{{ draftCount }}</span>
          <span class="text-xs text-slate-500 font-medium">in progress</span>
        </div>
      </div>
      <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div class="text-[11px] font-bold tracking-wider uppercase text-slate-400">Total Questions</div>
        <div class="mt-1 flex items-baseline gap-2">
          <span class="text-2xl font-black text-slate-900">{{ totalQuestionsCount }}</span>
          <span class="text-xs text-slate-500 font-medium">MCQ &amp; Essay</span>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- VIEW 1: EXAM LIST (When not editing/creating)            -->
    <!-- ======================================================== -->
    <div v-if="!isCreating && !resultsExam" class="space-y-4">
      <!-- Search & Filters -->
      <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div class="relative flex-1 max-w-md">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by title, subject or tag..."
            class="w-full pl-9 pr-4 py-2 text-sm rounded-2xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50"
          />
        </div>
        <div class="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            v-for="filter in ['All', 'Published', 'Draft']"
            :key="filter"
            type="button"
            @click="activeStatusFilter = filter"
            class="px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap"
            :class="activeStatusFilter === filter
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'"
          >
            {{ filter }}
          </button>
        </div>
      </div>

      <!-- Exam Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="exam in filteredExams"
          :key="exam.id"
          class="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-amber-300 hover:shadow-md transition group"
        >
          <div>
            <div class="flex items-start justify-between gap-2 mb-3">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider"
                :class="exam.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-amber-50 text-amber-700 border border-amber-200/60'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="exam.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'"></span>
                {{ exam.status }}
              </span>
              <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-xs">
                {{ exam.subject }}
              </span>
            </div>

            <h3 class="text-base font-extrabold text-slate-900 group-hover:text-amber-700 transition">
              {{ exam.title }}
            </h3>
            <p class="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {{ exam.description || 'No description provided.' }}
            </p>

            <!-- Metadata pills -->
            <div class="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span class="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100 font-medium">
                <i class="fa-solid fa-list-check text-slate-400 text-[11px]"></i>
                {{ exam.questions.filter(q => q.type === 'mcq').length }} MCQs
              </span>
              <span class="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100 font-medium">
                <i class="fa-solid fa-pen text-slate-400 text-[11px]"></i>
                {{ exam.questions.filter(q => q.type === 'essay').length }} Essay
              </span>
              <span class="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100 font-medium">
                <i class="fa-regular fa-clock text-slate-400 text-[11px]"></i>
                {{ exam.durationMinutes }}m
              </span>
              <span class="inline-flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60 text-amber-800 font-bold ml-auto">
                {{ calculateTotalPoints(exam.questions) }} pts
              </span>
            </div>
            <p class="mt-3 text-[11px] text-slate-500 font-medium">
              <i class="fa-solid fa-user-group text-slate-400 mr-1"></i>
              <template v-if="exam.assignedTo?.length">
                Assigned to {{ exam.assignedTo.map(id => school.student(id).name.split(' ')[0]).join(', ') }}
              </template>
              <template v-else>Not assigned to anyone yet</template>
            </p>
          </div>

          <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <span class="text-[11px] text-slate-400 font-medium">
              Updated {{ updatedLabel(exam.updatedAt) }}
            </span>
            <div class="flex items-center gap-1.5">
              <!-- Results, with how many submissions are waiting for a grade. -->
              <button
                type="button"
                @click="openResults(exam)"
                title="Results"
                class="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                <i class="fa-solid fa-square-poll-vertical text-sm text-slate-400"></i>
                <span>{{ submissionsOf(exam.id).length }}</span>
                <span
                  v-if="needsGradingCount(exam.id)"
                  class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center"
                  :title="`${needsGradingCount(exam.id)} to grade`"
                >
                  {{ needsGradingCount(exam.id) }}
                </span>
              </button>
              <button
                type="button"
                @click="openPreview(exam)"
                title="Preview Exam"
                class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <i class="fa-regular fa-eye text-sm"></i>
              </button>
              <button
                type="button"
                @click="editExam(exam)"
                title="Edit Exam"
                class="p-2 rounded-xl text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition"
              >
                <i class="fa-solid fa-pen-to-square text-sm"></i>
              </button>
              <!-- Two clicks: the first arms it and says what goes with it. -->
              <button
                v-if="confirmDeleteId === exam.id"
                type="button"
                @click="removeExam(exam.id)"
                @blur="confirmDeleteId = null"
                class="px-2.5 py-1.5 rounded-xl bg-rose-600 text-white text-[11px] font-black hover:bg-rose-700 transition"
                :title="submissionsOf(exam.id).length ? `Also deletes ${submissionsOf(exam.id).length} submission(s)` : 'Delete this test'"
              >
                Delete?
              </button>
              <button
                v-else
                type="button"
                @click="confirmDeleteId = exam.id"
                title="Delete"
                class="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <i class="fa-regular fa-trash-can text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="filteredExams.length === 0"
        class="text-center py-16 px-4 rounded-3xl border border-dashed border-slate-200 bg-white"
      >
        <div class="mx-auto w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-3">
          <i class="fa-solid fa-file-circle-question"></i>
        </div>
        <h4 class="text-base font-bold text-slate-800">No tests found</h4>
        <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1">Get started by creating your first test with multiple choice and essay questions.</p>
        <button
          type="button"
          @click="startNewExam"
          class="mt-4 inline-flex items-center gap-2 rounded-2xl bg-brighture-gold px-4 py-2 text-xs font-bold text-slate-900 hover:brightness-105"
        >
          <i class="fa-solid fa-plus"></i> Create Exam
        </button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- VIEW 3: RESULTS (submissions for one exam)               -->
    <!-- ======================================================== -->
    <div v-if="!isCreating && resultsExam" class="space-y-4">
      <div class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-xs">{{ resultsExam.subject }}</span>
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Results</span>
          </div>
          <h2 class="mt-1.5 text-lg font-extrabold text-slate-900 truncate">{{ resultsExam.title }}</h2>
        </div>
        <div class="flex items-center gap-2 text-xs font-bold shrink-0">
          <span class="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
            {{ resultsSubmissions.length }} / {{ resultsExam.assignedTo?.length || 0 }} submitted
          </span>
          <span
            class="px-3 py-1.5 rounded-xl border"
            :class="needsGradingCount(resultsExam.id) ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'"
          >
            {{ needsGradingCount(resultsExam.id) ? `${needsGradingCount(resultsExam.id)} need grading` : 'All graded' }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <!-- Submission list -->
        <div class="lg:col-span-4 rounded-3xl border border-slate-200/80 bg-white p-2.5 shadow-xs space-y-1.5 self-start">
          <button
            v-for="sub in resultsSubmissions"
            :key="sub.id"
            type="button"
            @click="openSubmission(sub)"
            class="w-full rounded-2xl border p-3 text-left transition flex items-center gap-3"
            :class="activeSubmissionId === sub.id ? 'border-amber-300 bg-amber-50/60' : 'border-transparent hover:bg-slate-50'"
          >
            <AppImage :src="school.student(sub.studentId).photo" :alt="school.student(sub.studentId).name" class="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0" />
            <div class="min-w-0 flex-1">
              <p class="text-xs font-black text-slate-900 truncate">{{ school.student(sub.studentId).name }}</p>
              <p class="text-[10px] text-slate-400 font-medium tabular-nums">{{ stampIn(sub.submittedAt, MANILA) }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-xs font-black text-slate-900 tabular-nums">{{ school.submissionScore(sub) }} / {{ school.examMaxScore(resultsExam) }}</p>
              <span
                class="inline-block mt-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide"
                :class="sub.graded ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
              >
                {{ sub.graded ? 'Graded' : 'Needs grading' }}
              </span>
            </div>
          </button>

          <div
            v-for="id in notSubmittedIds"
            :key="`pending-${id}`"
            class="rounded-2xl p-3 flex items-center gap-3 opacity-60"
          >
            <AppImage :src="school.student(id).photo" :alt="school.student(id).name" class="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0 grayscale" />
            <p class="flex-1 min-w-0 text-xs font-bold text-slate-600 truncate">{{ school.student(id).name }}</p>
            <span class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Not submitted</span>
          </div>

          <p v-if="!resultsSubmissions.length && !notSubmittedIds.length" class="p-6 text-center text-xs text-slate-500">
            Nobody is assigned to this test yet.
          </p>
        </div>

        <!-- Selected submission -->
        <div class="lg:col-span-8">
          <div v-if="activeSubmission" class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
            <div class="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div class="min-w-0">
                <p class="text-sm font-extrabold text-slate-900 truncate">{{ school.student(activeSubmission.studentId).name }}</p>
                <p class="text-[11px] text-slate-500">Submitted {{ stampIn(activeSubmission.submittedAt, MANILA) }} PHT</p>
              </div>
              <p class="text-sm font-black text-amber-700 tabular-nums shrink-0">
                {{ draftScore }} / {{ school.examMaxScore(resultsExam) }} pts
              </p>
            </div>

            <div
              v-for="(q, idx) in resultsExam.questions"
              :key="q.id"
              class="rounded-2xl border border-slate-200/80 p-4 space-y-2.5"
            >
              <div class="flex items-start justify-between gap-3">
                <p class="text-sm font-bold text-slate-900">
                  <span class="text-amber-600 mr-1">Q{{ idx + 1 }}.</span> {{ q.prompt }}
                </p>
                <span class="shrink-0 text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                  {{ q.points }} pts
                </span>
              </div>

              <!-- MCQ: the student's pick against the key -->
              <div v-if="q.type === 'mcq'" class="space-y-1.5">
                <div
                  v-for="(opt, optIdx) in q.options"
                  :key="optIdx"
                  class="flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs"
                  :class="optIdx === q.correctIndex
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : optIdx === activeSubmission.answers[q.id]
                      ? 'border-rose-200 bg-rose-50 text-rose-900'
                      : 'border-slate-100 text-slate-600'"
                >
                  <span class="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-black shrink-0 border-current">
                    {{ ['A', 'B', 'C', 'D', 'E', 'F'][optIdx] }}
                  </span>
                  <span class="flex-1">{{ opt }}</span>
                  <span v-if="optIdx === activeSubmission.answers[q.id]" class="text-[10px] font-black uppercase tracking-wide">Chosen</span>
                  <span v-if="optIdx === q.correctIndex" class="text-[10px] font-black uppercase tracking-wide text-emerald-700">Correct</span>
                </div>
                <p class="text-[11px] font-bold" :class="activeSubmission.answers[q.id] === q.correctIndex ? 'text-emerald-700' : 'text-rose-600'">
                  {{ activeSubmission.answers[q.id] === q.correctIndex ? `+${q.points} marked automatically` : (activeSubmission.answers[q.id] === undefined ? 'Not answered — 0' : 'Incorrect — 0') }}
                </p>
              </div>

              <!-- Essay: the text, and a mark for the instructor to give -->
              <div v-else class="space-y-2.5">
                <p class="whitespace-pre-wrap rounded-xl bg-slate-50 border border-slate-100 p-3 text-sm leading-relaxed text-slate-800">{{ activeSubmission.answers[q.id] || '(No answer)' }}</p>
                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                  <span>
                    <strong class="tabular-nums" :class="wordCountOk(q, activeSubmission.answers[q.id]) ? 'text-slate-800' : 'text-rose-600'">{{ countWords(activeSubmission.answers[q.id]) }}</strong>
                    words (target {{ q.minWords }}–{{ q.maxWords }})
                  </span>
                  <span v-if="q.rubricFocus">Rubric: <em>{{ q.rubricFocus }}</em></span>
                </div>
                <p v-if="q.sampleAnswer" class="text-[11px] text-slate-500 italic">Reference: {{ q.sampleAnswer }}</p>
                <label class="inline-flex items-center gap-2 text-xs font-bold text-slate-700">
                  Points
                  <input
                    v-model.number="gradeDraft.essayScores[q.id]"
                    type="number"
                    min="0"
                    :max="q.points"
                    @change="clampScore(q)"
                    class="w-16 text-center px-2 py-1 rounded-lg border border-slate-200 font-black text-slate-900 focus:outline-none focus:border-amber-400"
                  />
                  <span class="text-slate-400 font-medium">/ {{ q.points }}</span>
                </label>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">Overall comment</label>
              <textarea
                v-model="gradeDraft.comment"
                rows="3"
                placeholder="What went well, and what to work on next..."
                class="w-full px-3.5 py-2 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 text-slate-800"
              ></textarea>
            </div>

            <div class="flex items-center justify-end gap-3">
              <span v-if="gradeSaved" class="text-xs font-bold text-emerald-600">
                <i class="fa-solid fa-check mr-1"></i> Grade saved — the student can see it now.
              </span>
              <button
                type="button"
                @click="saveGrade"
                class="px-5 py-2 rounded-2xl bg-brighture-gold hover:brightness-105 active:scale-[0.98] text-xs font-black text-slate-900 shadow-sm transition"
              >
                <i class="fa-solid fa-floppy-disk mr-1"></i> Save grade
              </button>
            </div>
          </div>

          <div v-else class="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <p class="text-sm font-bold text-slate-700">Select a submission</p>
            <p class="text-xs text-slate-400 mt-1">Answers, marks and your comment appear here.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- VIEW 2: EXAM BUILDER / EDITOR                            -->
    <!-- ======================================================== -->
    <div v-else-if="isCreating && currentExam" class="space-y-6">
      <!-- General Settings Card -->
      <div class="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-brighture-gold"></span>
            <h2 class="text-sm font-extrabold uppercase tracking-wider text-slate-800">Test Specifications</h2>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-slate-500 font-medium">
              Total Score:
              <strong class="text-amber-600 text-sm font-extrabold">{{ currentExamTotalPoints }}</strong> pts
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-2 space-y-1.5">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">Test Title <span class="text-rose-500">*</span></label>
            <input
              v-model="currentExam.title"
              type="text"
              placeholder="e.g., Speech Fluency & Discussion Mid-Term Exam"
              class="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 font-bold text-slate-800 placeholder-slate-400"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">Subject / Category</label>
            <select
              v-model="currentExam.subject"
              class="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 font-bold text-slate-800 bg-white"
            >
              <option value="SF">Speech Fluency (SF)</option>
              <option value="DC">Daily Conversation (DC)</option>
              <option value="PP">Pronunciation Power (PP)</option>
              <option value="RW">Reading &amp; Writing (RW)</option>
              <option value="FC">Free Conversation (FC)</option>
              <option value="BC">Business Communication (BC)</option>
            </select>
          </div>

          <div class="md:col-span-2 space-y-1.5">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">Instructions / Description</label>
            <textarea
              v-model="currentExam.description"
              rows="2"
              placeholder="Brief directions or instructions for the student taking this test..."
              class="w-full px-3.5 py-2 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 text-slate-700 placeholder-slate-400"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">Time Limit</label>
              <div class="relative">
                <input
                  v-model.number="currentExam.durationMinutes"
                  type="number"
                  min="5"
                  max="180"
                  class="w-full px-3 py-2 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:border-amber-400 font-bold text-slate-800"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">mins</span>
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">Status</label>
              <select
                v-model="currentExam.status"
                class="w-full px-3 py-2 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:border-amber-400 font-bold text-slate-800 bg-white"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
          </div>

          <!-- Who sits it. Only published tests reach these students. -->
          <div class="md:col-span-3 space-y-1.5">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Assigned students
              <span class="ml-1 normal-case tracking-normal font-medium text-slate-400">
                ({{ currentExam.assignedTo.length }} selected{{ currentExam.status === 'Draft' ? ' — visible to them once published' : '' }})
              </span>
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="s in assignableStudents"
                :key="s.id"
                type="button"
                @click="toggleAssigned(s.id)"
                :aria-pressed="currentExam.assignedTo.includes(s.id)"
                class="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border text-xs font-bold transition"
                :class="currentExam.assignedTo.includes(s.id)
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'"
              >
                <AppImage :src="s.photo" :alt="s.name" class="w-6 h-6 rounded-full object-cover" />
                <span>{{ s.name }}</span>
                <i v-if="currentExam.assignedTo.includes(s.id)" class="fa-solid fa-check text-[10px] text-amber-600"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Question List Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-extrabold uppercase tracking-wider text-slate-800">
              Questions ({{ currentExam.questions.length }})
            </h2>
            <span class="text-xs text-slate-400">Add multiple choice or essay questions</span>
          </div>

          <!-- Add question buttons -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="addQuestion('mcq')"
              class="inline-flex items-center gap-1.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 px-3.5 py-2 text-xs font-extrabold text-slate-700 transition"
            >
              <i class="fa-solid fa-list-check text-amber-600"></i>
              <span>+ Multiple Choice</span>
            </button>
            <button
              type="button"
              @click="addQuestion('essay')"
              class="inline-flex items-center gap-1.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 px-3.5 py-2 text-xs font-extrabold text-slate-700 transition"
            >
              <i class="fa-solid fa-pen-nib text-amber-600"></i>
              <span>+ Essay Question</span>
            </button>
          </div>
        </div>

        <!-- Question Cards -->
        <div v-if="currentExam.questions.length === 0" class="text-center py-12 rounded-3xl border border-dashed border-slate-300 bg-white">
          <div class="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2 text-lg">
            <i class="fa-regular fa-lightbulb"></i>
          </div>
          <p class="text-sm font-bold text-slate-700">No questions added yet</p>
          <p class="text-xs text-slate-400 mt-0.5">Click above to add Multiple Choice questions or Essay questions.</p>
        </div>

        <div
          v-for="(question, qIndex) in currentExam.questions"
          :key="question.id"
          class="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300 space-y-4"
        >
          <!-- Question Header bar -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2.5">
              <span class="w-6 h-6 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                {{ qIndex + 1 }}
              </span>
              <span
                class="px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider"
                :class="question.type === 'mcq' ? 'bg-blue-50 text-blue-700 border border-blue-200/60' : 'bg-purple-50 text-purple-700 border border-purple-200/60'"
              >
                <i :class="question.type === 'mcq' ? 'fa-solid fa-list-check' : 'fa-solid fa-pen-nib'" class="mr-1"></i>
                {{ question.type === 'mcq' ? 'Multiple Choice' : 'Essay Prompt' }}
              </span>
            </div>

            <div class="flex items-center gap-3">
              <!-- Points control -->
              <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl">
                <label class="text-[11px] font-bold text-slate-500 uppercase">Points:</label>
                <input
                  v-model.number="question.points"
                  type="number"
                  min="1"
                  max="100"
                  class="w-12 text-center text-xs font-black text-slate-900 bg-white border border-slate-200 rounded-lg py-0.5 focus:outline-none focus:border-amber-400"
                />
              </div>

              <!-- Reorder / Delete -->
              <button
                type="button"
                :disabled="qIndex === 0"
                @click="moveQuestion(qIndex, -1)"
                title="Move up"
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400"
              >
                <i class="fa-solid fa-arrow-up text-xs"></i>
              </button>
              <button
                type="button"
                :disabled="qIndex === currentExam.questions.length - 1"
                @click="moveQuestion(qIndex, 1)"
                title="Move down"
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400"
              >
                <i class="fa-solid fa-arrow-down text-xs"></i>
              </button>
              <button
                type="button"
                @click="removeQuestion(qIndex)"
                title="Delete question"
                class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <i class="fa-regular fa-trash-can text-xs"></i>
              </button>
            </div>
          </div>

          <!-- Prompt / Title Input -->
          <div class="space-y-1">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">Question Prompt / Statement</label>
            <textarea
              v-model="question.prompt"
              rows="2"
              placeholder="Enter question text or prompt here..."
              class="w-full px-3.5 py-2 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 text-slate-800"
            ></textarea>
          </div>

          <!-- TYPE 1: MULTIPLE CHOICE SPECIFICS -->
          <div v-if="question.type === 'mcq'" class="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Choices (Select radio button for the correct answer)
              </span>
              <button
                v-if="question.options.length < 6"
                type="button"
                @click="addOption(question)"
                class="text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1"
              >
                <i class="fa-solid fa-plus text-[10px]"></i> Add Option
              </button>
            </div>

            <div class="space-y-2">
              <div
                v-for="(option, optIdx) in question.options"
                :key="optIdx"
                class="flex items-center gap-2.5 bg-white p-2 rounded-xl border border-slate-200/90"
              >
                <!-- Correct choice selector -->
                <!-- `relative` is load-bearing: the radio inside is `sr-only`,
                     which is `position:absolute`. Without a positioned label it
                     resolves against an ancestor far up the tree, so clicking a
                     letter focused an input the browser then scrolled into
                     view — and the whole question list jumped. -->
                <label
                  class="relative cursor-pointer shrink-0 flex items-center justify-center w-7 h-7 rounded-lg border transition"
                  :class="question.correctIndex === optIdx
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                    : 'border-slate-200 text-slate-400 hover:border-slate-300'"
                  :title="question.correctIndex === optIdx ? 'Correct Answer' : 'Mark as correct answer'"
                >
                  <input
                    type="radio"
                    :name="'q_' + question.id"
                    :value="optIdx"
                    v-model="question.correctIndex"
                    class="sr-only"
                  />
                  <span class="text-xs font-extrabold uppercase">{{ ['A', 'B', 'C', 'D', 'E', 'F'][optIdx] }}</span>
                </label>

                <input
                  v-model="question.options[optIdx]"
                  type="text"
                  :placeholder="'Option ' + ['A', 'B', 'C', 'D', 'E', 'F'][optIdx]"
                  class="flex-1 px-2.5 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-800 font-medium"
                />

                <span v-if="question.correctIndex === optIdx" class="text-[10px] font-black uppercase text-emerald-600 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                  Correct Answer
                </span>

                <button
                  v-if="question.options.length > 2"
                  type="button"
                  @click="removeOption(question, optIdx)"
                  title="Remove option"
                  class="p-1 rounded-lg text-slate-300 hover:text-rose-500 transition"
                >
                  <i class="fa-solid fa-xmark text-xs"></i>
                </button>
              </div>
            </div>

            <!-- Explanation / Rational -->
            <div class="pt-2">
              <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Answer Explanation (Optional)</label>
              <input
                v-model="question.explanation"
                type="text"
                placeholder="Brief explanation why the selected answer is correct..."
                class="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-400 text-slate-700"
              />
            </div>
          </div>

          <!-- TYPE 2: ESSAY SPECIFICS -->
          <div v-else-if="question.type === 'essay'" class="space-y-3 bg-purple-50/40 p-4 rounded-2xl border border-purple-100">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Target Word Count</label>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="question.minWords"
                    type="number"
                    placeholder="Min"
                    class="w-24 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-center"
                  />
                  <span class="text-xs text-slate-400">to</span>
                  <input
                    v-model.number="question.maxWords"
                    type="number"
                    placeholder="Max"
                    class="w-24 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-center"
                  />
                  <span class="text-xs text-slate-500">words</span>
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Grading Rubric Focus</label>
                <input
                  v-model="question.rubricFocus"
                  type="text"
                  placeholder="e.g. Coherence, Vocabulary Range, Grammar, Argumentation"
                  class="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700"
                />
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Instructor Reference Notes / Sample Answer (Visible to teacher only)</label>
              <textarea
                v-model="question.sampleAnswer"
                rows="2"
                placeholder="Key concepts the student should mention, or sample exemplary points for the evaluator..."
                class="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="sticky bottom-4 z-10 flex items-center justify-between rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-md px-5 py-4 shadow-lg">
        <div class="text-xs text-slate-500">
          <p v-if="builderError" class="font-bold text-rose-600">
            <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ builderError }}
          </p>
          <template v-else>
            <span class="font-bold text-slate-800">{{ currentExam.questions.length }}</span> questions &bull;
            <span class="font-bold text-slate-800">{{ currentExamTotalPoints }}</span> total points
          </template>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="openPreview(currentExam)"
            class="px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-extrabold text-slate-700 transition"
          >
            <i class="fa-regular fa-eye mr-1"></i> Preview as Student
          </button>
          <button
            type="button"
            @click="saveCurrentExam"
            class="px-5 py-2 rounded-2xl bg-brighture-gold hover:brightness-105 active:scale-[0.98] text-xs font-black text-slate-900 shadow-sm transition"
          >
            <i class="fa-solid fa-floppy-disk mr-1"></i> Save Test
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- PREVIEW MODAL (STUDENT PERSPECTIVE)                      -->
    <!-- ======================================================== -->
    <div
      v-if="previewExamData"
      class="fixed inset-0 z-50 !m-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
      @click.self="previewExamData = null"
    >
      <div class="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-8">
        <!-- Preview Header -->
        <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div class="flex items-center gap-2.5">
            <span class="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
              Student Preview Mode
            </span>
            <span class="text-xs text-slate-500 font-bold">{{ previewExamData.subject }}</span>
          </div>
          <button
            type="button"
            @click="previewExamData = null"
            class="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition"
          >
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <!-- Exam Preview Body -->
        <div class="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          <div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900">{{ previewExamData.title }}</h2>
            <p class="mt-2 text-sm text-slate-600 leading-relaxed">{{ previewExamData.description }}</p>
            <div class="mt-4 flex items-center gap-4 text-xs font-bold text-slate-500 border-y border-slate-100 py-2.5">
              <span><i class="fa-regular fa-clock mr-1 text-slate-400"></i> Time: {{ previewExamData.durationMinutes }} mins</span>
              <span><i class="fa-solid fa-award mr-1 text-slate-400"></i> Total Score: {{ calculateTotalPoints(previewExamData.questions) }} points</span>
              <span><i class="fa-solid fa-list-ol mr-1 text-slate-400"></i> {{ previewExamData.questions.length }} Questions</span>
            </div>
          </div>

          <!-- Questions Rendered as Student sees them -->
          <div class="space-y-6">
            <div
              v-for="(q, idx) in previewExamData.questions"
              :key="q.id"
              class="rounded-2xl border border-slate-200/80 p-5 space-y-3 bg-white"
            >
              <div class="flex items-start justify-between gap-3">
                <span class="text-sm font-extrabold text-slate-900">
                  <span class="text-amber-600 mr-1">Q{{ idx + 1 }}.</span> {{ q.prompt }}
                </span>
                <span class="shrink-0 text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                  {{ q.points }} pts
                </span>
              </div>

              <!-- MCQ Preview -->
              <div v-if="q.type === 'mcq'" class="space-y-2 pt-1">
                <div
                  v-for="(opt, optIdx) in q.options"
                  :key="optIdx"
                  class="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-800"
                >
                  <span class="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-500">
                    {{ ['A', 'B', 'C', 'D', 'E', 'F'][optIdx] }}
                  </span>
                  <span>{{ opt }}</span>
                </div>
              </div>

              <!-- Essay Preview -->
              <div v-else-if="q.type === 'essay'" class="space-y-2 pt-1">
                <div class="text-[11px] text-slate-500 font-medium">
                  Requirement: {{ q.minWords }}-{{ q.maxWords }} words &bull; Focus: {{ q.rubricFocus || 'Standard Rubric' }}
                </div>
                <textarea
                  rows="4"
                  disabled
                  placeholder="Student writes answer here..."
                  class="w-full p-3 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-100 bg-slate-50 px-6 py-3 text-right">
          <button
            type="button"
            @click="previewExamData = null"
            class="px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-bold"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import AppImage from '../../components/AppImage.vue';
import { useSchoolStore } from '../../stores/useSchoolStore';
import { useTeacherStore } from '../../stores/useTeacherStore';
import { MANILA, stampIn, relativeLabel } from '../../lib/schoolTime';

const school = useSchoolStore();
const teacher = useTeacherStore();
const TEACHER_ID = teacher.teacherId;

// Tests live in the school's records, so a published one reaches the students
// it is assigned to, and their answers come back here.
const examsList = computed(() => school.examsForTeacher(TEACHER_ID));

/** 'Just now', '3h', 'Oct 2' — the card footer's "Updated" label. */
const updatedLabel = (iso) => (iso ? relativeLabel(iso, school.now) : '');

const searchQuery = ref('');
const activeStatusFilter = ref('All');

// Edit / Create state
const isCreating = ref(false);
const currentExam = ref(null);
const previewExamData = ref(null);

// Counts
const publishedCount = computed(() => examsList.value.filter(e => e.status === 'Published').length);
const draftCount = computed(() => examsList.value.filter(e => e.status === 'Draft').length);
const totalQuestionsCount = computed(() => {
  return examsList.value.reduce((sum, e) => sum + (e.questions?.length || 0), 0);
});

const calculateTotalPoints = (questions) => {
  if (!questions) return 0;
  return questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
};

const currentExamTotalPoints = computed(() => {
  if (!currentExam.value?.questions) return 0;
  return calculateTotalPoints(currentExam.value.questions);
});

// Filtered list
const filteredExams = computed(() => {
  return examsList.value.filter((e) => {
    const matchesFilter =
      activeStatusFilter.value === 'All' ||
      e.status === activeStatusFilter.value;

    const q = searchQuery.value.trim().toLowerCase();
    const matchesSearch =
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.subject.toLowerCase().includes(q) ||
      (e.description && e.description.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });
});

// Actions
const builderError = ref('');

const startNewExam = () => {
  builderError.value = '';
  currentExam.value = {
    // No id yet: the school store assigns one on first save.
    id: '',
    teacherId: TEACHER_ID,
    assignedTo: [],
    title: '',
    subject: 'SF',
    description: '',
    durationMinutes: 40,
    status: 'Draft',
    questions: [
      {
        id: 'q_' + Date.now() + '_1',
        type: 'mcq',
        prompt: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
        points: 5,
      }
    ]
  };
  isCreating.value = true;
};

const editExam = (exam) => {
  builderError.value = '';
  currentExam.value = JSON.parse(JSON.stringify(exam));
  if (!Array.isArray(currentExam.value.assignedTo)) currentExam.value.assignedTo = [];
  isCreating.value = true;
};

const cancelCreate = () => {
  isCreating.value = false;
  currentExam.value = null;
  builderError.value = '';
};

const backToList = () => {
  cancelCreate();
  closeResults();
};

const saveCurrentExam = () => {
  if (!currentExam.value.title.trim()) {
    builderError.value = 'Please enter a test title.';
    return;
  }
  if (currentExam.value.questions.length === 0) {
    builderError.value = 'Please add at least one question.';
    return;
  }
  school.saveExam({ ...currentExam.value, teacherId: TEACHER_ID });
  cancelCreate();
};

// The builder's message is about the last attempt; editing clears it.
watch(() => currentExam.value && JSON.stringify(currentExam.value), () => { builderError.value = ''; });

/** Armed by the first click on a card's bin; the second click deletes. */
const confirmDeleteId = ref(null);
const removeExam = (id) => {
  school.deleteExam(id);
  confirmDeleteId.value = null;
};

/** Students who take lessons with this instructor — the ones a test can go to. */
const assignableStudents = computed(() => {
  const ids = [...new Set(school.lessonsForTeacher(TEACHER_ID).map((l) => l.studentId))];
  return ids.map((id) => school.student(id)).sort((a, b) => a.name.localeCompare(b.name));
});

const toggleAssigned = (studentId) => {
  const list = currentExam.value.assignedTo;
  const i = list.indexOf(studentId);
  if (i === -1) list.push(studentId); else list.splice(i, 1);
};

// ── Results ────────────────────────────────────────────────────────────────
const submissionsOf = (examId) => school.submissionsForExam(examId);
const needsGradingCount = (examId) => submissionsOf(examId).filter((sub) => !sub.graded).length;

const resultsExamId = ref(null);
const resultsExam = computed(() => (resultsExamId.value ? school.findExam(resultsExamId.value) ?? null : null));

/** Ungraded first, then newest — the order the marking actually happens in. */
const resultsSubmissions = computed(() => {
  if (!resultsExam.value) return [];
  return [...submissionsOf(resultsExam.value.id)].sort((a, b) =>
    Number(a.graded) - Number(b.graded) || b.submittedAt.localeCompare(a.submittedAt)
  );
});

const notSubmittedIds = computed(() => {
  if (!resultsExam.value) return [];
  const done = new Set(resultsSubmissions.value.map((sub) => sub.studentId));
  return (resultsExam.value.assignedTo ?? []).filter((id) => !done.has(id));
});

const activeSubmissionId = ref(null);
const activeSubmission = computed(() =>
  resultsSubmissions.value.find((sub) => sub.id === activeSubmissionId.value) ?? null
);

const gradeDraft = ref({ essayScores: {}, comment: '' });
const gradeSaved = ref(false);

const openSubmission = (sub) => {
  activeSubmissionId.value = sub.id;
  gradeDraft.value = { essayScores: { ...(sub.essayScores ?? {}) }, comment: sub.teacherComment ?? '' };
  gradeSaved.value = false;
};

const openResults = (exam) => {
  resultsExamId.value = exam.id;
  const first = resultsSubmissions.value[0];
  if (first) openSubmission(first);
  else activeSubmissionId.value = null;
};

const closeResults = () => {
  resultsExamId.value = null;
  activeSubmissionId.value = null;
};

const countWords = (text) => (String(text ?? '').trim().match(/\S+/g) ?? []).length;
const wordCountOk = (q, text) => {
  const n = countWords(text);
  return (!q.minWords || n >= q.minWords) && (!q.maxWords || n <= q.maxWords);
};

/** Keeps a typed mark inside 0..the question's points. */
const clampScore = (q) => {
  const raw = Number(gradeDraft.value.essayScores[q.id]);
  const value = Number.isFinite(raw) ? Math.min(Math.max(0, raw), Number(q.points) || 0) : 0;
  gradeDraft.value.essayScores[q.id] = value;
};

/** The score as it would stand if the draft were saved now. */
const draftScore = computed(() => {
  if (!activeSubmission.value) return 0;
  return school.submissionScore({ ...activeSubmission.value, essayScores: gradeDraft.value.essayScores });
});

const saveGrade = () => {
  if (!activeSubmission.value || !resultsExam.value) return;
  resultsExam.value.questions.filter((q) => q.type === 'essay').forEach(clampScore);
  school.gradeSubmission(activeSubmission.value.id, {
    essayScores: gradeDraft.value.essayScores,
    comment: gradeDraft.value.comment.trim(),
  });
  gradeSaved.value = true;
};

const addQuestion = (type) => {
  const newQ = {
    id: 'q_' + Date.now(),
    type,
    prompt: '',
    points: type === 'mcq' ? 5 : 20,
  };

  if (type === 'mcq') {
    newQ.options = ['', '', '', ''];
    newQ.correctIndex = 0;
    newQ.explanation = '';
  } else {
    newQ.minWords = 100;
    newQ.maxWords = 200;
    newQ.rubricFocus = 'Coherence, Vocabulary, Grammar';
    newQ.sampleAnswer = '';
  }

  currentExam.value.questions.push(newQ);
};

const removeQuestion = (index) => {
  currentExam.value.questions.splice(index, 1);
};

const moveQuestion = (index, delta) => {
  const target = index + delta;
  if (target < 0 || target >= currentExam.value.questions.length) return;
  const temp = currentExam.value.questions[index];
  currentExam.value.questions[index] = currentExam.value.questions[target];
  currentExam.value.questions[target] = temp;
};

const addOption = (question) => {
  if (question.options.length < 6) {
    question.options.push('');
  }
};

/**
 * The correct answer is held as a position, so removing a choice above it
 * moves it. It used to only catch the case where the index fell off the end,
 * which meant deleting a choice before the answer silently re-pointed it at a
 * different option — the test still looked valid, and marked the wrong one.
 */
const removeOption = (question, optIdx) => {
  if (question.options.length <= 2) return;
  question.options.splice(optIdx, 1);
  if (optIdx === question.correctIndex) {
    // The answer itself is gone; nothing else can stand in for it.
    question.correctIndex = 0;
  } else if (optIdx < question.correctIndex) {
    // Everything below the hole shifted up, and the answer with it.
    question.correctIndex -= 1;
  }
  if (question.correctIndex >= question.options.length) question.correctIndex = 0;
};

const openPreview = (exam) => {
  previewExamData.value = exam;
};
</script>
