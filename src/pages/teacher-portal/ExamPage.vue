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
          v-if="!isCreating"
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
          @click="cancelCreate"
          class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-600 transition"
        >
          <i class="fa-solid fa-arrow-left text-xs"></i>
          <span>Back to Tests</span>
        </button>
      </div>
    </header>

    <!-- Stat Badges row when not in create mode -->
    <div v-if="!isCreating" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
    <div v-if="!isCreating" class="space-y-4">
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
          </div>

          <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <span class="text-[11px] text-slate-400 font-medium">
              Updated {{ exam.updatedAt }}
            </span>
            <div class="flex items-center gap-1.5">
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
              <button
                type="button"
                @click="deleteExam(exam.id)"
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
    <!-- VIEW 2: EXAM BUILDER / EDITOR                            -->
    <!-- ======================================================== -->
    <div v-else class="space-y-6">
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
          <span class="font-bold text-slate-800">{{ currentExam.questions.length }}</span> questions &bull;
          <span class="font-bold text-slate-800">{{ currentExamTotalPoints }}</span> total points
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
            @click="saveExam"
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
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
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
import { ref, computed } from 'vue';

// Pre-seeded exams
const initialExams = [
  {
    id: 'exam-1',
    title: 'Speech Fluency (SF) - Level 3 Assessment',
    subject: 'SF',
    description: 'Comprehensive evaluation of conversational fluidity, idiom usage, and structured discourse.',
    durationMinutes: 45,
    status: 'Published',
    updatedAt: 'Oct 8, 2026',
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        prompt: 'Which transitional phrase best introduces a contrasting argument in a persuasive speech?',
        options: [
          'In addition to that',
          'On the other hand',
          'For instance',
          'As a matter of fact'
        ],
        correctIndex: 1,
        explanation: '"On the other hand" signals a direct contrast or opposing viewpoint.',
        points: 5,
      },
      {
        id: 'q2',
        type: 'mcq',
        prompt: 'Identify the sentence with natural conversational cadence:',
        options: [
          'I did go to the store yesterday because I wanted to buy apples.',
          'I went to the store yesterday to grab some apples.',
          'The apples were bought by me yesterday at the store.',
          'Going yesterday store apples grabbed.'
        ],
        correctIndex: 1,
        explanation: 'Active voice with "grab some apples" reflects natural colloquial phrasing.',
        points: 5,
      },
      {
        id: 'q3',
        type: 'essay',
        prompt: 'Discuss the advantages and challenges of remote working compared to traditional office environments. Provide personal examples or observations.',
        minWords: 150,
        maxWords: 250,
        rubricFocus: 'Discourse markers, cohesion, varied vocabulary, coherence',
        sampleAnswer: 'Expect clear introduction stating preference, 2 body paragraphs balancing flexibility vs isolation, and concise conclusion.',
        points: 20,
      }
    ]
  },
  {
    id: 'exam-2',
    title: 'Daily Conversation (DC) Idioms & Phrasal Verbs',
    subject: 'DC',
    description: 'Weekly quiz targeting high-frequency phrasal verbs and workplace expressions.',
    durationMinutes: 30,
    status: 'Published',
    updatedAt: 'Oct 5, 2026',
    questions: [
      {
        id: 'q4',
        type: 'mcq',
        prompt: 'What does "call it a day" mean?',
        options: [
          'To phone a friend during daylight',
          'To stop working on something for the rest of the day',
          'To celebrate a calendar holiday',
          'To postpone until next week'
        ],
        correctIndex: 1,
        explanation: '"Call it a day" means to conclude an activity or work session.',
        points: 5,
      },
      {
        id: 'q5',
        type: 'essay',
        prompt: 'Describe a memorable travel experience where you had to communicate with someone who spoke a different language. How did you overcome the barrier?',
        minWords: 100,
        maxWords: 180,
        rubricFocus: 'Storytelling past tense forms, descriptive adjectives',
        sampleAnswer: 'Evaluate past tense accuracy (simple past vs past continuous), narrative pacing.',
        points: 15,
      }
    ]
  },
  {
    id: 'exam-3',
    title: 'Reading & Writing (RW) Essay Practice: Climate Action',
    subject: 'RW',
    description: 'Argumentative essay test evaluating thesis construction and counterarguments.',
    durationMinutes: 50,
    status: 'Draft',
    updatedAt: 'Oct 9, 2026',
    questions: [
      {
        id: 'q6',
        type: 'essay',
        prompt: 'Should single-use plastics be completely banned worldwide, or should recycling programs be modernized instead? Present your thesis and supporting arguments.',
        minWords: 200,
        maxWords: 350,
        rubricFocus: 'Thesis clarity, argumentation, paragraph structure, lexical sophistication',
        sampleAnswer: 'Well-structured 4-paragraph argument essay with counter-argument concession.',
        points: 30,
      }
    ]
  }
];

const examsList = ref([...initialExams]);
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
const startNewExam = () => {
  currentExam.value = {
    id: 'exam-' + Date.now(),
    title: '',
    subject: 'SF',
    description: '',
    durationMinutes: 40,
    status: 'Draft',
    updatedAt: 'Just now',
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
  currentExam.value = JSON.parse(JSON.stringify(exam));
  isCreating.value = true;
};

const cancelCreate = () => {
  isCreating.value = false;
  currentExam.value = null;
};

const saveExam = () => {
  if (!currentExam.value.title.trim()) {
    alert('Please enter a test title.');
    return;
  }
  if (currentExam.value.questions.length === 0) {
    alert('Please add at least one question.');
    return;
  }

  currentExam.value.updatedAt = 'Just now';

  const existingIdx = examsList.value.findIndex(e => e.id === currentExam.value.id);
  if (existingIdx >= 0) {
    examsList.value[existingIdx] = JSON.parse(JSON.stringify(currentExam.value));
  } else {
    examsList.value.unshift(JSON.parse(JSON.stringify(currentExam.value)));
  }

  isCreating.value = false;
  currentExam.value = null;
};

const deleteExam = (id) => {
  if (confirm('Are you sure you want to delete this test?')) {
    examsList.value = examsList.value.filter(e => e.id !== id);
  }
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
