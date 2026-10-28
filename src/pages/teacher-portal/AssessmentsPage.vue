<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-5">
    <!-- ===================== List ===================== -->
    <template v-if="!active">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Assessments</h1>
          <p class="mt-0.5 text-sm text-slate-500">Trial lessons, counseling sessions and fixed-class assessments you run. Times are in Manila (PHT).</p>
        </div>
        <div role="tablist" aria-label="Assessment lists" class="inline-flex shrink-0 rounded-2xl bg-slate-100 p-1">
          <button
            v-for="t in listTabs"
            :key="t.key"
            type="button"
            role="tab"
            :aria-selected="tab === t.key"
            @click="tab = t.key"
            class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition"
            :class="tab === t.key ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
          >
            {{ t.label }}
            <span
              class="rounded-full px-1.5 py-0.5 text-[10px] font-black tabular-nums"
              :class="tab === t.key ? (t.key === 'todo' && t.count ? 'bg-brighture-gold text-brighture-ink' : 'bg-slate-100 text-slate-600') : 'bg-slate-200/80 text-slate-500'"
            >{{ t.count }}</span>
          </button>
        </div>
      </header>

      <section class="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
        <ul v-if="rows.length" class="m-0 list-none divide-y divide-slate-100 p-0">
          <li v-for="row in rows" :key="row.id" class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <button
              type="button"
              @click="openAssessment(row.id)"
              class="flex min-w-0 flex-1 items-center gap-3 rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold"
            >
              <AppImage :src="row.photo" :alt="row.name" class="h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-slate-200" />
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span class="truncate text-sm font-extrabold text-slate-900">{{ row.name }}</span>
                  <span class="rounded-full px-2 py-0.5 text-[10px] font-black ring-1" :class="TYPE_STYLES[row.type]">
                    {{ row.type }} · {{ ASSESSMENT_TYPES[row.type].short }}
                  </span>
                </div>
                <p class="m-0 mt-0.5 text-xs font-semibold text-slate-500 tabular-nums">
                  <i class="fa-regular fa-calendar mr-1 text-slate-400" aria-hidden="true"></i>{{ row.when }}
                  <template v-if="row.startsIn"> · <span class="text-brighture-bronze">Starts in {{ row.startsIn }}</span></template>
                  <template v-if="row.submittedWhen"> · Submitted {{ row.submittedWhen }}</template>
                </p>
              </div>
            </button>

            <div class="flex flex-wrap items-center gap-2 sm:justify-end">
              <LevelChip :value="row.levelValue" />
              <span class="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider" :class="STATUS_STYLES[row.status]">
                {{ STATUS_LABELS[row.status] }}
              </span>
              <a
                v-if="row.meetLink && row.status !== 'submitted'"
                :href="row.meetLink"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <GoogleMeetIcon size="sm" /> Join
              </a>
              <button
                v-if="row.status === 'submitted'"
                type="button"
                @click="levelModalFor = row.studentId"
                class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <i class="fa-solid fa-arrow-right-arrow-left text-[10px] text-slate-400" aria-hidden="true"></i> Change level
              </button>
              <button
                type="button"
                @click="openAssessment(row.id)"
                class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-extrabold transition"
                :class="row.status === 'submitted' ? 'text-slate-600 hover:bg-slate-100' : 'bg-brighture-gold text-brighture-ink hover:bg-brighture-gold-deep'"
              >
                {{ row.status === 'submitted' ? 'View' : (row.status === 'draft' && row.started ? 'Continue' : 'Open') }}
                <i class="fa-solid fa-chevron-right text-[9px]" aria-hidden="true"></i>
              </button>
            </div>
          </li>
        </ul>

        <div v-else class="px-6 py-12 text-center">
          <i class="fa-solid fa-clipboard-check text-2xl text-slate-300" aria-hidden="true"></i>
          <p class="m-0 mt-2 text-sm font-bold text-slate-700">{{ tab === 'todo' ? 'Nothing to assess right now' : 'No submitted assessments yet' }}</p>
          <p class="m-0 mt-0.5 text-xs text-slate-500">
            {{ tab === 'todo' ? 'An assessment appears here once a trial or counseling lesson starts, or when an admin schedules one.' : 'Assessments you submit are kept here, read-only.' }}
          </p>
        </div>
      </section>
    </template>

    <!-- ===================== Assessment form ===================== -->
    <template v-else>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          @click="requestClose"
          class="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-white hover:text-slate-900"
        >
          <i class="fa-solid fa-arrow-left" aria-hidden="true"></i> All assessments
        </button>
        <span class="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider" :class="STATUS_STYLES[active.status]">
          {{ STATUS_LABELS[active.status] }}
        </span>
      </div>

      <!-- Leaving with unsaved work: a choice in the page, not a browser dialog. -->
      <div
        v-if="leaveArmed"
        role="alert"
        class="flex flex-col gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="m-0 text-xs font-bold text-amber-900">
          <i class="fa-solid fa-triangle-exclamation mr-1" aria-hidden="true"></i>You have changes that are not saved.
        </p>
        <div class="flex flex-wrap gap-2">
          <button type="button" @click="leaveArmed = false" class="rounded-lg px-3 py-1.5 text-[11px] font-bold text-amber-900 hover:bg-amber-100">Keep editing</button>
          <button type="button" @click="closeForm" class="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-amber-100">Discard changes</button>
          <button type="button" @click="saveDraft(true)" class="rounded-lg bg-brighture-gold px-3 py-1.5 text-[11px] font-extrabold text-brighture-ink hover:bg-brighture-gold-deep">Save draft and close</button>
        </div>
      </div>

      <!-- Header: who, what, when, and where the student stands now. -->
      <section class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
        <div class="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div class="lg:col-span-5">
            <div class="flex items-center gap-3.5">
              <AppImage :src="activeStudent.photo" :alt="activeStudent.name" class="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2 ring-brighture-gold/60" />
              <div class="min-w-0">
                <span class="rounded-full px-2 py-0.5 text-[10px] font-black ring-1" :class="TYPE_STYLES[active.type]">
                  {{ active.type }} · {{ ASSESSMENT_TYPES[active.type].label }}
                </span>
                <h1 class="m-0 mt-1 truncate text-xl font-black text-slate-900">{{ activeStudent.name }}</h1>
                <p class="m-0 mt-0.5 text-xs font-semibold text-slate-500 tabular-nums">{{ longWhen(active.scheduledAt) }}</p>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <button
                v-if="activeLesson"
                type="button"
                @click="lessonPanel = lessonRow"
                class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <i class="fa-solid fa-chalkboard-user text-[10px] text-slate-400" aria-hidden="true"></i> View lesson
              </button>
              <a
                v-if="activeMeetLink && active.status !== 'submitted'"
                :href="activeMeetLink"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <GoogleMeetIcon size="sm" /> Google Meet
              </a>
              <span v-if="activeStartsIn" class="inline-flex items-center rounded-lg bg-brighture-cream px-2.5 py-1.5 text-[11px] font-bold text-brighture-bronze">
                <i class="fa-regular fa-clock mr-1" aria-hidden="true"></i>Starts in {{ activeStartsIn }}
              </span>
              <span v-if="active.scheduledBy" class="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600">
                Scheduled by {{ active.scheduledBy }}
              </span>
            </div>
            <p v-if="activeStudentNote" class="m-0 mt-3 rounded-xl border border-[#faecd2] bg-[#fdfbf6] px-3 py-2 text-xs italic text-slate-700">
              “{{ activeStudentNote }}”
            </p>
          </div>

          <div class="lg:col-span-7">
            <LevelSummaryPanel :student-id="active.studentId" @change="levelModalFor = active.studentId" />
          </div>
        </div>
      </section>

      <p v-if="readonly" class="m-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-600">
        <i class="fa-solid fa-lock mr-1 text-slate-400" aria-hidden="true"></i>
        Submitted {{ longWhen(active.submittedAt) }}. Submitted assessments are read-only; use “Change level” if the level needs to move.
      </p>

      <!-- Template questions: internal, for admins and teachers. -->
      <section
        v-for="section in template?.sections ?? []"
        :key="section.id"
        class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6"
      >
        <h2 class="m-0 text-sm font-black text-slate-900">{{ section.title }}</h2>
        <div class="mt-4 space-y-5">
          <div v-for="field in section.fields" :key="field.id" :id="`field-${field.id}`">
            <component
              :is="field.type === 'rating' || field.type === 'multiselect' ? 'p' : 'label'"
              :for="field.type === 'rating' || field.type === 'multiselect' || field.type === 'checkbox' ? undefined : `in-${field.id}`"
              class="m-0 block text-xs font-bold text-slate-700"
              :class="field.type === 'checkbox' ? 'sr-only' : ''"
            >
              {{ field.label }}<span v-if="field.required" class="ml-0.5 text-rose-600" aria-hidden="true">*</span>
              <span v-if="field.required" class="sr-only">(required)</span>
            </component>
            <p v-if="field.help && field.type !== 'checkbox'" class="m-0 mt-0.5 text-[11px] text-slate-400">{{ field.help }}</p>

            <!-- Rating: one tap per option, as a segmented row. -->
            <div
              v-if="field.type === 'rating'"
              role="radiogroup"
              :aria-label="field.label"
              class="mt-2 flex flex-wrap gap-1.5"
            >
              <button
                v-for="opt in field.options"
                :key="opt"
                type="button"
                role="radio"
                :aria-checked="form.answers[field.id] === opt"
                :disabled="readonly"
                @click="setAnswer(field.id, form.answers[field.id] === opt && !field.required ? '' : opt)"
                class="rounded-full border px-3 py-1.5 text-xs font-bold transition disabled:cursor-default"
                :class="form.answers[field.id] === opt
                  ? 'border-brighture-ink bg-brighture-ink text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 disabled:hover:bg-white'"
              >{{ opt }}</button>
            </div>

            <div v-else-if="field.type === 'select'" class="relative mt-2 max-w-xs">
              <select
                :id="`in-${field.id}`"
                :value="form.answers[field.id] ?? ''"
                :disabled="readonly"
                @change="setAnswer(field.id, $event.target.value)"
                class="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-800 outline-none transition focus:border-brighture-gold disabled:cursor-default disabled:bg-slate-50"
              >
                <option value="">Choose…</option>
                <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <i class="fa-solid fa-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400" aria-hidden="true"></i>
            </div>

            <div v-else-if="field.type === 'multiselect'" class="mt-2 flex flex-wrap gap-1.5" role="group" :aria-label="field.label">
              <button
                v-for="opt in field.options"
                :key="opt"
                type="button"
                :aria-pressed="(form.answers[field.id] ?? []).includes(opt)"
                :disabled="readonly"
                @click="toggleMulti(field.id, opt)"
                class="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold transition disabled:cursor-default"
                :class="(form.answers[field.id] ?? []).includes(opt)
                  ? 'border-brighture-gold bg-brighture-cream text-brighture-bronze'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:hover:bg-white'"
              >
                <i v-if="(form.answers[field.id] ?? []).includes(opt)" class="fa-solid fa-check text-[9px]" aria-hidden="true"></i>
                {{ opt }}
              </button>
            </div>

            <div v-else-if="field.type === 'text' || field.type === 'longtext'" class="mt-2">
              <input
                v-if="field.type === 'text'"
                :id="`in-${field.id}`"
                type="text"
                :value="form.answers[field.id] ?? ''"
                :maxlength="field.max || undefined"
                :readonly="readonly"
                @input="setAnswer(field.id, $event.target.value)"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-brighture-gold focus:ring-2 focus:ring-brighture-gold/20 read-only:bg-slate-50"
              />
              <textarea
                v-else
                :id="`in-${field.id}`"
                :value="form.answers[field.id] ?? ''"
                :maxlength="field.max || undefined"
                :readonly="readonly"
                rows="3"
                @input="setAnswer(field.id, $event.target.value)"
                class="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-brighture-gold focus:ring-2 focus:ring-brighture-gold/20 read-only:bg-slate-50"
              ></textarea>
              <p v-if="field.max && !readonly" class="m-0 mt-0.5 text-right text-[10px] font-semibold tabular-nums text-slate-400">
                {{ (form.answers[field.id] ?? '').length }} / {{ field.max }}
              </p>
            </div>

            <label v-else-if="field.type === 'checkbox'" class="mt-1 flex cursor-pointer items-start gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                :checked="!!form.answers[field.id]"
                :disabled="readonly"
                @change="setAnswer(field.id, $event.target.checked)"
                class="mt-0.5 h-4 w-4 accent-[#c5a059]"
              />
              <span>
                <span class="font-bold">{{ field.label }}</span><span v-if="field.required" class="ml-0.5 text-rose-600">*</span>
                <span v-if="field.help" class="block text-[11px] text-slate-400">{{ field.help }}</span>
              </span>
            </label>

            <p v-if="errors[field.id]" class="m-0 mt-1 text-[11px] font-bold text-rose-600">{{ errors[field.id] }}</p>
          </div>
        </div>
      </section>

      <!-- Fixed part of every assessment, outside the template, so no
           template can move the level into what the student reads. -->
      <section id="field-level" class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <h2 class="m-0 text-sm font-black text-slate-900">BRELAS level<span class="ml-0.5 text-rose-600" aria-hidden="true">*</span></h2>
          <p class="m-0 text-[11px] font-semibold text-slate-400"><i class="fa-solid fa-lock mr-1" aria-hidden="true"></i>Admins and teachers only</p>
        </div>
        <div class="mt-3">
          <BrelasLevelPicker v-model="form.level" :current="activeSummary.value" :disabled="readonly" />
        </div>
        <p v-if="errors.level" class="m-0 mt-2 text-[11px] font-bold text-rose-600">{{ errors.level }}</p>

        <div class="mt-5" id="field-nfa">
          <label for="in-nfa" class="block text-xs font-bold text-slate-700">NFA</label>
          <p class="m-0 mt-0.5 text-[11px] font-semibold text-brighture-bronze">
            <i class="fa-solid fa-eye-slash mr-1" aria-hidden="true"></i>Internal — never shown to the student
          </p>
          <textarea
            id="in-nfa"
            v-model="form.nfa"
            rows="3"
            maxlength="1000"
            :readonly="readonly"
            placeholder="What the next teacher should know or watch for"
            class="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-brighture-gold focus:ring-2 focus:ring-brighture-gold/20 read-only:bg-slate-50"
          ></textarea>
          <p v-if="!readonly" class="m-0 mt-0.5 text-right text-[10px] font-semibold tabular-nums text-slate-400">{{ form.nfa.length }} / 1000</p>
        </div>
      </section>

      <section class="rounded-3xl border-2 border-brighture-gold/50 bg-brighture-cream/60 p-5 shadow-xs sm:p-6">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <h2 class="m-0 text-sm font-black text-slate-900">Feedback for the student</h2>
          <p class="m-0 text-[11px] font-bold text-brighture-bronze">
            <i class="fa-solid fa-eye mr-1" aria-hidden="true"></i>The student sees only these two
          </p>
        </div>

        <div
          v-if="levelReminder && !readonly"
          class="mt-3 flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-900"
        >
          <i class="fa-solid fa-bullhorn mt-0.5 text-sky-500" aria-hidden="true"></i>
          <span>Reminder from {{ levelReminder.by || 'Admin' }} on {{ dateIn(levelReminder.at, MANILA) }}: never mention the level in feedback.</span>
        </div>

        <div class="mt-4 space-y-4">
          <div id="field-performance">
            <label for="in-performance" class="block text-xs font-bold text-slate-700">Current performance<span class="ml-0.5 text-rose-600" aria-hidden="true">*</span></label>
            <textarea
              id="in-performance"
              v-model="form.performance"
              rows="4"
              :maxlength="FEEDBACK_MAX"
              :readonly="readonly"
              placeholder="What the student does well, in words they can act on"
              class="mt-1.5 w-full resize-y rounded-xl border bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:ring-2 read-only:bg-white/60"
              :class="errors.performance ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-200 focus:border-brighture-gold focus:ring-brighture-gold/20'"
            ></textarea>
            <div class="flex justify-between gap-2">
              <p class="m-0 text-[11px] font-bold text-rose-600">{{ errors.performance }}</p>
              <p v-if="!readonly" class="m-0 text-[10px] font-semibold tabular-nums text-slate-400">{{ form.performance.length }} / {{ FEEDBACK_MAX }}</p>
            </div>
          </div>

          <div id="field-workOn">
            <label for="in-workOn" class="block text-xs font-bold text-slate-700">What to work on<span class="ml-0.5 text-rose-600" aria-hidden="true">*</span></label>
            <textarea
              id="in-workOn"
              v-model="form.workOn"
              rows="4"
              :maxlength="FEEDBACK_MAX"
              :readonly="readonly"
              placeholder="Two or three concrete next steps"
              class="mt-1.5 w-full resize-y rounded-xl border bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:ring-2 read-only:bg-white/60"
              :class="errors.workOn ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-200 focus:border-brighture-gold focus:ring-brighture-gold/20'"
            ></textarea>
            <div class="flex justify-between gap-2">
              <p class="m-0 text-[11px] font-bold text-rose-600">{{ errors.workOn }}</p>
              <p v-if="!readonly" class="m-0 text-[10px] font-semibold tabular-nums text-slate-400">{{ form.workOn.length }} / {{ FEEDBACK_MAX }}</p>
            </div>
          </div>

          <!-- Level-word guard: a warning, not a block, because words like
               "advanced level" can be innocent — but it takes a second click. -->
          <div
            v-if="levelWordsFound.length && !readonly"
            role="alert"
            class="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs text-amber-900"
          >
            <p class="m-0 font-bold">
              <i class="fa-solid fa-triangle-exclamation mr-1" aria-hidden="true"></i>
              Feedback goes to the student — don't mention the level.
            </p>
            <p class="m-0 mt-0.5">
              Found:
              <span v-for="w in levelWordsFound" :key="w" class="mr-1 inline-block rounded bg-white px-1.5 py-0.5 font-mono text-[11px] font-bold ring-1 ring-amber-200">{{ w }}</span>
            </p>
          </div>

          <div v-if="active.type === 'CS'" id="field-nextCs">
            <label for="in-nextCs" class="block text-xs font-bold text-slate-700">Recommend next counseling session<span class="ml-0.5 text-rose-600" aria-hidden="true">*</span></label>
            <p class="m-0 mt-0.5 text-[11px] text-slate-500">The student is told when to book their next counseling session.</p>
            <div class="relative mt-1.5 max-w-xs">
              <select
                id="in-nextCs"
                v-model="form.nextCs"
                :disabled="readonly"
                class="w-full cursor-pointer appearance-none rounded-xl border bg-white py-2 pl-3 pr-8 text-sm text-slate-800 outline-none transition focus:border-brighture-gold disabled:cursor-default"
                :class="errors.nextCs ? 'border-rose-300' : 'border-slate-200'"
              >
                <option value="">Choose…</option>
                <option v-for="opt in nextCsOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <i class="fa-solid fa-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400" aria-hidden="true"></i>
            </div>
            <p v-if="errors.nextCs" class="m-0 mt-1 text-[11px] font-bold text-rose-600">{{ errors.nextCs }}</p>
          </div>
        </div>
      </section>

      <!-- Actions -->
      <div v-if="!readonly" class="sticky bottom-20 lg:bottom-4 z-10 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-md">
        <p v-if="errorCount" role="alert" class="m-0 mb-2 text-xs font-bold text-rose-700">
          <i class="fa-solid fa-circle-exclamation mr-1" aria-hidden="true"></i>
          {{ errorCount }} required {{ errorCount === 1 ? 'answer is' : 'answers are' }} missing.
        </p>
        <p v-else-if="submitArmed" class="m-0 mb-2 text-xs font-bold text-amber-800">
          <i class="fa-solid fa-triangle-exclamation mr-1" aria-hidden="true"></i>
          The feedback still mentions a level. Edit it, or submit anyway.
        </p>
        <div class="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            @click="saveDraft(false)"
            class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <i class="fa-regular fa-floppy-disk mr-1" aria-hidden="true"></i> Save draft
          </button>
          <button
            type="button"
            @click="submit"
            class="rounded-xl px-5 py-2 text-xs font-extrabold transition active:scale-95"
            :class="submitArmed ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-brighture-gold text-brighture-ink hover:bg-brighture-gold-deep'"
          >
            <i class="fa-solid fa-paper-plane mr-1" aria-hidden="true"></i>
            {{ submitArmed ? 'Submit anyway' : 'Submit assessment' }}
          </button>
        </div>
      </div>
    </template>

    <ChangeLevelModal :student-id="levelModalFor" @close="levelModalFor = null" @saved="onLevelSaved" />
    <StudentDetailModal :student="lessonPanel" initial-tab="class" @close="lessonPanel = null" />

    <!-- Toast: brief confirmation, top-right. -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 translate-x-6"
        leave-active-class="transition duration-200 ease-in" leave-to-class="opacity-0 translate-x-6"
      >
        <div
          v-if="toast"
          role="status"
          aria-live="polite"
          class="fixed right-4 top-4 z-[90] flex w-[calc(100vw-2rem)] max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl"
          :class="toast.error ? 'border-rose-200' : 'border-emerald-200'"
        >
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
            :class="toast.error ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'"
          >
            <i :class="toast.error ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-check'" aria-hidden="true"></i>
          </span>
          <div class="min-w-0 flex-1 pt-0.5">
            <p class="m-0 text-xs font-black" :class="toast.error ? 'text-rose-800' : 'text-emerald-800'">{{ toast.title }}</p>
            <p class="m-0 mt-0.5 text-xs font-semibold leading-snug text-slate-700">{{ toast.text }}</p>
          </div>
          <button
            type="button"
            @click="toast = null"
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Dismiss notification"
          >
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, h } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppImage from '@/components/AppImage.vue';
import GoogleMeetIcon from '@/components/GoogleMeetIcon.vue';
import BrelasLevelPicker from '@/components/teacher/BrelasLevelPicker.vue';
import ChangeLevelModal from '@/components/teacher/ChangeLevelModal.vue';
import LevelSummaryPanel from '@/components/teacher/LevelSummaryPanel.vue';
import StudentDetailModal from '@/components/teacher/StudentDetailModal.vue';
import { ASSESSMENT_TYPES, BAND_STYLES, LEVEL_WORDS, levelInfo } from '@/lib/brelas';
import { MANILA, dateIn, clockIn, stampIn, utcLabel, minutesUntil, countdownLabel } from '@/lib/schoolTime';
import { useSchoolStore } from '@/stores/useSchoolStore';
import { useTeacherStore } from '@/stores/useTeacherStore';

const school = useSchoolStore();
const teacher = useTeacherStore();
const route = useRoute();
const router = useRouter();

const FEEDBACK_MAX = 1500;
const nextCsOptions = ['In 1 month', 'In 3 months', 'In 6 months', 'Not needed'];

const TYPE_STYLES = {
  TA: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  CS: 'bg-blue-50 text-blue-700 ring-blue-200',
  FA: 'bg-orange-50 text-orange-700 ring-orange-200',
};
const STATUS_LABELS = { draft: 'Draft', scheduled: 'Scheduled', submitted: 'Submitted' };
const STATUS_STYLES = {
  draft: 'bg-amber-100 text-amber-800',
  scheduled: 'bg-slate-100 text-slate-600',
  submitted: 'bg-emerald-100 text-emerald-700',
};

/** The student's current rating as a chip; Unassessed is dashed, not a band. */
const LevelChip = (props) => {
  const info = levelInfo(props.value);
  if (!info.code) {
    return h('span', { class: 'rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-[10px] font-bold italic text-slate-500' }, 'Unassessed');
  }
  return h('span', {
    class: `rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${BAND_STYLES[info.band]}`,
    title: info.rating ? `${info.label} · ${info.band} · rating ${info.rating}/15 · CEFR ${info.cefr}` : `${info.label} · CEFR ${info.cefr}`,
  }, info.display);
};
LevelChip.props = ['value'];

// Started trial and counseling lessons get their draft the first time anyone
// looks, so the list is complete before it renders.
onMounted(() => school.syncLessonAssessments());

// ── List ────────────────────────────────────────────────────────────────
const tab = ref('todo');
const mine = computed(() => school.assessmentsForTeacher(teacher.teacherId));
const todo = computed(() => mine.value
  .filter((a) => a.status === 'draft' || a.status === 'scheduled')
  .sort((x, y) => x.scheduledAt.localeCompare(y.scheduledAt)));
const submitted = computed(() => mine.value
  .filter((a) => a.status === 'submitted')
  .sort((x, y) => (y.submittedAt ?? '').localeCompare(x.submittedAt ?? '')));

const listTabs = computed(() => [
  { key: 'todo', label: 'To do', count: todo.value.length },
  { key: 'submitted', label: 'Submitted', count: submitted.value.length },
]);

const shortWhen = (iso) => `${dateIn(iso, MANILA)}, ${clockIn(iso, MANILA)}`;
const longWhen = (iso) => {
  if (!iso) return '';
  const day = new Intl.DateTimeFormat('en-US', { timeZone: MANILA, weekday: 'short' }).format(new Date(iso));
  return `${day}, ${shortWhen(iso)} PHT`;
};

const meetLinkOf = (a) => a.meetLink || (a.lessonId ? school.findLesson(a.lessonId)?.meetLink : '') || '';

const rows = computed(() => (tab.value === 'todo' ? todo.value : submitted.value).map((a) => {
  const s = school.student(a.studentId);
  const mins = minutesUntil(a.scheduledAt, school.now);
  return {
    id: a.id,
    studentId: a.studentId,
    type: a.type,
    status: a.status,
    name: s.name,
    photo: s.photo,
    when: `${shortWhen(a.scheduledAt)} PHT`,
    started: mins <= 0,
    startsIn: a.status !== 'submitted' && mins > 0 ? countdownLabel(mins) : '',
    submittedWhen: a.submittedAt ? dateIn(a.submittedAt, MANILA) : '',
    levelValue: school.levelSummary(a.studentId).value,
    meetLink: meetLinkOf(a),
  };
}));

// ── Open assessment ─────────────────────────────────────────────────────
// The open assessment lives in the URL (?id=), so a link from the dashboard
// or a reload lands on the same form.
const activeId = computed(() => (typeof route.query.id === 'string' ? route.query.id : null));
const active = computed(() => (activeId.value ? school.findAssessment(activeId.value) : null));
const readonly = computed(() => active.value?.status === 'submitted');
const template = computed(() => (active.value ? school.templateFor(active.value) : null));
const activeStudent = computed(() => (active.value ? school.student(active.value.studentId) : {}));
const activeSummary = computed(() => (active.value ? school.levelSummary(active.value.studentId) : { code: null }));
const activeLesson = computed(() => (active.value?.lessonId ? school.findLesson(active.value.lessonId) : null));
const activeMeetLink = computed(() => (active.value ? meetLinkOf(active.value) : ''));
const activeStudentNote = computed(() => activeLesson.value?.note || '');
const activeStartsIn = computed(() => {
  if (!active.value || readonly.value) return '';
  const mins = minutesUntil(active.value.scheduledAt, school.now);
  return mins > 0 ? countdownLabel(mins) : '';
});

/** The lesson as a reservation-style row, for the student panel. */
const lessonRow = computed(() => {
  const l = activeLesson.value;
  if (!l) return null;
  const tz = activeStudent.value.timezone;
  return {
    id: l.id,
    studentId: l.studentId,
    subject: l.subject,
    note: l.note,
    meetLink: l.meetLink,
    startManila: stampIn(l.start, MANILA),
    startStudent: `${stampIn(l.start, tz)} ${utcLabel(tz)}`,
  };
});
const lessonPanel = ref(null);

const openAssessment = (id) => router.push({ query: { id } });

// ── Form ────────────────────────────────────────────────────────────────
const blankForm = () => ({ answers: {}, level: null, nfa: '', performance: '', workOn: '', nextCs: '' });
const form = ref(blankForm());
const savedSnapshot = ref('');
const errors = ref({});
const showErrors = ref(false);
const submitArmed = ref(false);
const leaveArmed = ref(false);

const snapshot = () => JSON.stringify(form.value);
const dirty = computed(() => !readonly.value && snapshot() !== savedSnapshot.value);

/** Loads the record into a working copy; edits stay local until saved. */
const loadForm = () => {
  const a = active.value;
  if (!a) { form.value = blankForm(); return; }
  form.value = {
    answers: JSON.parse(JSON.stringify(a.answers ?? {})),
    // Start from the student's current level, so confirming it is one click.
    level: a.level ?? (a.status === 'submitted' ? null : activeSummary.value.value),
    nfa: a.nfa ?? '',
    performance: a.performance ?? '',
    workOn: a.workOn ?? '',
    nextCs: a.nextCs ?? '',
  };
  // A pre-selected level is a suggestion, not an edit, so it does not count
  // as unsaved work.
  savedSnapshot.value = snapshot();
  errors.value = {};
  showErrors.value = false;
  submitArmed.value = false;
  leaveArmed.value = false;
};
watch(activeId, loadForm, { immediate: true });

const setAnswer = (id, value) => { form.value.answers[id] = value; };
const toggleMulti = (id, opt) => {
  const list = [...(form.value.answers[id] ?? [])];
  const i = list.indexOf(opt);
  if (i === -1) list.push(opt); else list.splice(i, 1);
  form.value.answers[id] = list;
};

const isEmpty = (field, value) => {
  if (field.type === 'multiselect') return !Array.isArray(value) || !value.length;
  if (field.type === 'checkbox') return !value;
  return !String(value ?? '').trim();
};

const validate = () => {
  const out = {};
  (template.value?.sections ?? []).forEach((section) => section.fields.forEach((field) => {
    if (field.required && isEmpty(field, form.value.answers[field.id])) out[field.id] = 'Required.';
  }));
  if (!form.value.level) out.level = 'Choose the BRELAS rating.';
  if (!form.value.performance.trim()) out.performance = 'Required. The student reads this.';
  if (!form.value.workOn.trim()) out.workOn = 'Required. The student reads this.';
  if (active.value?.type === 'CS' && !form.value.nextCs) out.nextCs = 'Recommend when the student should book their next session.';
  return out;
};
// Once a submit has failed, errors clear as the teacher fills them in.
watch(form, () => { if (showErrors.value) errors.value = validate(); }, { deep: true });
const errorCount = computed(() => (showErrors.value ? Object.keys(errors.value).length : 0));

/** Every distinct level word in the two student-facing boxes. */
const levelWordsFound = computed(() => {
  const re = new RegExp(LEVEL_WORDS.source, 'gi');
  const text = `${form.value.performance}\n${form.value.workOn}`;
  return [...new Set([...text.matchAll(re)].map((m) => m[0]))];
});
// Editing the feedback disarms "Submit anyway": the teacher confirms what is
// there now, not what was there when they were warned.
watch(levelWordsFound, () => { submitArmed.value = false; });

const toast = ref(null);
let toastTimer;
const showToast = (title, text, error = false) => {
  toast.value = { title, text, error };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.value = null; }, 4000);
};

const closeForm = () => {
  leaveArmed.value = false;
  router.push({ query: {} });
};
const requestClose = () => {
  if (dirty.value) { leaveArmed.value = true; return; }
  closeForm();
};

const payload = () => JSON.parse(JSON.stringify(form.value));

const saveDraft = (thenClose) => {
  if (!active.value || readonly.value) return;
  const saved = school.saveAssessmentDraft(active.value.id, payload());
  if (!saved) { showToast('Not saved', 'The draft could not be saved. Try again.', true); return; }
  savedSnapshot.value = snapshot();
  showToast('Draft saved', `Your assessment of ${activeStudent.value.name} is saved. Submit it when it is complete.`);
  if (thenClose) closeForm();
};

const scrollToFirstError = async () => {
  await nextTick();
  const first = Object.keys(errors.value)[0];
  document.getElementById(`field-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const submit = () => {
  if (!active.value || readonly.value) return;
  showErrors.value = true;
  errors.value = validate();
  if (Object.keys(errors.value).length) { scrollToFirstError(); return; }
  if (levelWordsFound.value.length && !submitArmed.value) {
    submitArmed.value = true;
    document.getElementById('field-performance')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  const name = activeStudent.value.name;
  const before = activeSummary.value.code;
  const done = school.submitAssessment(active.value.id, payload(), {
    kind: 'teacher', id: teacher.teacherId, name: teacher.fullName,
  });
  if (!done) { showToast('Not submitted', 'The assessment could not be submitted. Try again.', true); return; }
  const levelNote = done.level !== before ? ` Level set to ${levelInfo(done.level).display}.` : '';
  showToast('Assessment submitted', `${name} will see your feedback.${levelNote}`);
  savedSnapshot.value = snapshot();
  tab.value = 'submitted';
  closeForm();
};

// ── Level changes ───────────────────────────────────────────────────────
const levelModalFor = ref(null);
const onLevelSaved = (entry) => {
  showToast('Level changed', `${school.student(entry.studentId).name} is now ${levelInfo(entry.to).display}.`);
};
</script>
