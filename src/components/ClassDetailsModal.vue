<template>
  <Transition
    enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0"
  >
    <!-- Pinned near the top, like the instructor's lesson panel, so the
         header does not jump when the body is taller or shorter. -->
    <div
      v-if="lesson"
      class="fixed inset-0 z-50 !m-0 flex items-start justify-center overflow-y-auto bg-slate-900/60 px-2 pt-6 pb-2 backdrop-blur-xs sm:px-5 sm:pt-12 sm:pb-5"
      @click.self="$emit('close')"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="class-details-title"
        class="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-2xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4.25rem)]"
        @click.stop
      >
        <!-- Dark header: who the lesson is with, and how soon -->
        <div class="shrink-0 bg-[#1e2738] px-5 pt-5 text-white sm:px-6 sm:pt-6">
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3.5">
              <!-- The only photo in the panel; pressing it shows it full size. -->
              <button
                type="button"
                @click="photoOpen = true"
                class="group relative shrink-0 cursor-zoom-in rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold"
                :aria-label="`View ${lesson.teacherName}'s photo`"
              >
                <AppImage
                  :src="lesson.teacherPhoto"
                  :alt="lesson.teacherName"
                  eager
                  class="h-16 w-16 rounded-2xl object-cover shadow-sm ring-2 ring-[#c5a059] transition group-hover:brightness-90 sm:h-[72px] sm:w-[72px]"
                />
                <span class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[9px] text-slate-700 shadow ring-1 ring-slate-200" aria-hidden="true">
                  <i class="fa-solid fa-magnifying-glass-plus"></i>
                </span>
              </button>
              <div class="min-w-0">
                <p class="m-0 text-[11px] font-black uppercase tracking-wider text-[#e6b95c]">
                  {{ lesson.isSubstitute ? 'Substitute instructor' : 'Your instructor' }}
                </p>
                <h2 id="class-details-title" class="m-0 mt-0.5 truncate text-xl font-black sm:text-2xl">
                  {{ lesson.teacherName }}
                </h2>
                <p class="m-0 mt-0.5 truncate text-xs font-medium text-slate-300">
                  Online lesson<template v-if="lesson.duration"> · {{ lesson.duration }} min</template>
                  <template v-if="startsIn"> · <span class="font-bold text-emerald-300">starts in {{ startsIn }}</span></template>
                </p>
              </div>
            </div>

            <div class="flex shrink-0 items-start gap-2">
              <!-- Book a class sits above Message: both lead to this instructor. -->
              <div v-if="lesson.teacherId" class="flex flex-col items-stretch gap-1.5">
                <RouterLink
                  :to="{ path: '/booking', query: { teacher: lesson.teacherId } }"
                  @click="$emit('close')"
                  class="flex items-center justify-center gap-1.5 rounded-full bg-brighture-gold px-3 py-1.5 text-xs font-black text-brighture-ink transition hover:bg-amber-300"
                  title="Book another class with your instructor"
                >
                  <i class="fa-solid fa-calendar-plus text-xs" aria-hidden="true"></i>
                  <span class="hidden sm:inline">Book a class</span>
                </RouterLink>
                <RouterLink
                  :to="{ path: '/messages', query: { teacher: lesson.teacherId } }"
                  @click="$emit('close')"
                  class="flex items-center justify-center gap-1.5 rounded-full border border-amber-400/30 bg-brighture-gold/20 px-3 py-1.5 text-xs font-black text-amber-300 transition hover:bg-brighture-gold/30 hover:text-amber-200"
                  title="Message your instructor"
                >
                  <i class="fa-solid fa-comments text-xs" aria-hidden="true"></i>
                  <span class="hidden sm:inline">Message</span>
                </RouterLink>
              </div>
              <button
                type="button"
                @click="$emit('close')"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-slate-200 transition hover:bg-white/25 hover:text-white"
                aria-label="Close"
              >
                <i class="fa-solid fa-xmark text-sm" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <!-- Folder tabs, the same set of dividers as the instructor's panel:
               left tabs sit over right ones, the open tab comes to the front. -->
          <div
            class="tab-row -ml-7 mt-5 flex items-end overflow-x-auto sm:-ml-8"
            role="tablist"
            aria-label="Class detail sections"
          >
            <button
              v-for="(tab, i) in tabs"
              :key="tab.key"
              :ref="el => setTabEl(el, i)"
              type="button"
              role="tab"
              :aria-selected="activeTab === tab.key"
              :tabindex="activeTab === tab.key ? 0 : -1"
              @click="activeTab = tab.key"
              @keydown="onTabKey($event, i)"
              class="folder-tab relative flex h-9 w-[11.5rem] shrink-0 items-center justify-center gap-2 px-6 text-xs font-bold transition-colors outline-none focus:outline-none focus-visible:outline-none"
              :class="[
                i === 0 ? '' : '-ml-7',
                activeTab === tab.key ? 'bg-white text-slate-900' : 'bg-[var(--tab-bg)] text-slate-700 hover:bg-slate-100',
              ]"
              :style="{ zIndex: activeTab === tab.key ? tabs.length + 1 : tabs.length - i, '--tab-bg': tabShade(i) }"
            >
              <i :class="[tab.icon, activeTab === tab.key ? tab.iconOn : 'text-slate-500']" class="text-[11px]" aria-hidden="true"></i>
              <span class="whitespace-nowrap">{{ tab.label }}</span>
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto bg-white p-5 sm:p-6">
          <!-- TAB: CLASS DETAILS -->
          <div v-if="activeTab === 'class'" class="space-y-4">
          <!-- Subject beside lesson time, as on the instructor's side -->
          <div class="grid grid-cols-12 items-stretch gap-3 sm:gap-4">
            <div class="col-span-12 flex flex-col justify-center rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 sm:col-span-5">
              <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Subject</p>
              <p class="m-0 mt-1 flex min-w-0 text-sm font-extrabold text-slate-900 sm:text-base">
                <SubjectCode :subject="lesson.subject" />
              </p>
              <p v-if="lesson.topic || lesson.classType" class="m-0 mt-1 text-xs font-semibold text-slate-500">
                {{ lesson.topic || lesson.classType }}
              </p>
            </div>

            <div class="col-span-12 rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 sm:col-span-7">
              <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Lesson time</p>
              <div class="mt-2 space-y-1.5 text-xs sm:text-sm">
                <div class="flex items-baseline justify-between gap-3">
                  <span class="shrink-0 font-medium text-slate-500">Your time</span>
                  <span class="text-right font-bold text-slate-900">{{ yourTime }}</span>
                </div>
                <div v-if="teacherTime" class="flex items-baseline justify-between gap-3">
                  <span class="shrink-0 font-medium text-slate-500">Instructor</span>
                  <span class="text-right font-bold text-slate-900">{{ teacherTime }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- The message the instructor reads before the lesson. Kept neutral,
               like the cards above, so the amber of an unopened material is the
               only thing on the tab asking for attention. -->
          <div v-if="lesson.note" class="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4">
            <div class="flex items-center justify-between gap-2">
              <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <i class="fa-regular fa-message mr-1" aria-hidden="true"></i>
                Your message to the instructor
              </p>
              <button
                type="button"
                @click="$emit('edit', lesson)"
                class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                <i class="fa-solid fa-pen text-[9px]" aria-hidden="true"></i>
                Edit
              </button>
            </div>
            <!-- One line in the source: pre-wrap would print any newline or
                 indent around the text, pushing the quotes onto their own lines. -->
            <p class="m-0 mt-1.5 whitespace-pre-wrap text-xs italic leading-relaxed text-slate-700 sm:text-sm">“{{ lesson.note.trim() }}”</p>
          </div>
          <button
            v-else
            type="button"
            @click="$emit('edit', lesson)"
            class="flex w-full items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-left text-xs font-semibold text-slate-500 transition hover:border-amber-300 hover:bg-[#fdfbf6] hover:text-slate-700"
          >
            <i class="fa-regular fa-message text-slate-400" aria-hidden="true"></i>
            Tell your instructor what you want to focus on
            <i class="fa-solid fa-arrow-right ml-auto text-[10px]" aria-hidden="true"></i>
          </button>

          <!-- Before your class: what to look at first. Opening a material
               ticks it; the tick can also be set by hand. Progress is shared
               with the instructor's side. -->
          <div
            v-if="prep.total"
            ref="prepCard"
            class="rounded-2xl p-4 transition-shadow"
            :class="[
              prepDone ? 'border border-emerald-100 bg-emerald-50/40' : 'border-2 border-amber-400 bg-amber-50 shadow-sm shadow-amber-200/60',
              highlightPrep ? 'ring-4 ring-amber-300/50' : '',
            ]"
          >
            <div class="flex items-center justify-between gap-3">
              <p class="m-0 text-[10px] font-bold uppercase tracking-wider" :class="prepDone ? 'text-emerald-700' : 'text-[#996b27]'">
                <i :class="prepDone ? 'fa-solid fa-circle-check' : 'fa-solid fa-book-open'" class="mr-1" aria-hidden="true"></i>
                Before your class
              </p>
              <span
                class="inline-flex items-center gap-1 rounded-full text-[11px] font-black"
                :class="prepDone ? 'text-emerald-700' : 'bg-brighture-gold px-2.5 py-0.5 text-brighture-ink'"
              >
                <i v-if="!prepDone" class="fa-solid fa-circle-exclamation text-[10px]" aria-hidden="true"></i>
                {{ prepDone ? 'Reviewed' : prep.reviewed ? `${prep.total - prep.reviewed} not opened yet` : 'Not opened yet' }}
              </span>
            </div>
            <p v-if="!prepDone" class="m-0 mt-1.5 text-xs font-semibold text-amber-900">
              Open {{ prep.total - prep.reviewed === 1 ? 'this' : 'these' }} before your class, so you and {{ firstName }} can start right away.
            </p>

            <ul class="m-0 mt-3 list-none space-y-2 p-0">
              <li
                v-for="item in prep.items"
                :key="item.id"
                class="flex items-center gap-3 rounded-xl border bg-white p-2.5 shadow-2xs"
                :class="item.reviewedAt ? 'border-white' : 'border-amber-200'"
              >
                <button
                  type="button"
                  @click="toggleReviewed(item)"
                  class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition"
                  :class="item.reviewedAt ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white text-transparent hover:border-emerald-400'"
                  :aria-label="item.reviewedAt ? `Mark ${item.title} as not reviewed` : `Mark ${item.title} as reviewed`"
                >
                  <i class="fa-solid fa-check text-[10px]" aria-hidden="true"></i>
                </button>
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1" :class="materialKind(item.kind).chip">
                  <i :class="materialKind(item.kind).icon" class="text-xs" aria-hidden="true"></i>
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-xs font-bold sm:text-sm" :class="item.reviewedAt ? 'text-slate-500' : 'text-slate-900'">{{ item.title }}</span>
                  <span v-if="item.note" class="block truncate text-[11px] text-slate-500">{{ item.note }}</span>
                </span>
                <a
                  v-if="item.url"
                  :href="item.url"
                  target="_blank"
                  rel="noopener"
                  @click="school.markMaterialReviewed(lesson.id, item.id, true)"
                  class="shrink-0 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition"
                  :class="item.reviewedAt
                    ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    : 'border-amber-400 bg-brighture-gold text-brighture-ink shadow-2xs hover:bg-amber-300'"
                >
                  Open <i class="fa-solid fa-arrow-up-right-from-square ml-0.5 text-[9px]" aria-hidden="true"></i>
                </a>
              </li>
            </ul>
            <p class="m-0 mt-2 text-[11px] text-slate-500">
              {{ prep.chosen ? `Picked by ${firstName} for this lesson.` : 'The latest material in this lesson’s subject.' }}
              {{ firstName }} can see what you’ve reviewed.
            </p>
          </div>

          <!-- Join. With materials still unopened, the first press asks once
               instead of joining; it never blocks. -->
          <div
            v-if="lesson.meetLink && showJoinPrompt && unreviewed"
            class="rounded-2xl border border-amber-200 bg-amber-50 p-4"
            role="status"
          >
            <p class="m-0 text-sm font-bold text-amber-900">
              You haven’t opened the material for this class yet.
            </p>
            <p class="m-0 mt-0.5 text-xs text-amber-800">A quick look now makes the lesson go further.</p>
            <div class="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="reviewNow"
                class="rounded-xl bg-amber-400 px-3 py-2.5 text-xs font-black text-amber-950 transition hover:bg-amber-300"
              >
                Review now
              </button>
              <a
                :href="lesson.meetLink"
                target="_blank"
                rel="noopener"
                @click="showJoinPrompt = false"
                class="flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-3 py-2.5 text-xs font-bold text-amber-900 transition hover:bg-amber-100"
              >
                <GoogleMeetIcon size="sm" /> Join anyway
              </a>
            </div>
          </div>
          <a
            v-else-if="lesson.meetLink"
            :href="lesson.meetLink"
            target="_blank"
            rel="noopener"
            @click="onJoin"
            class="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2db572] px-4 py-3.5 text-center text-sm font-black text-white shadow-xs transition hover:bg-[#269e63] active:scale-[0.99]"
          >
            <GoogleMeetIcon size="md" />
            <span>Join Google Meet</span>
          </a>
          <p
            v-else
            class="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3.5 text-center text-xs font-bold text-slate-400"
          >
            <i class="fa-solid fa-link-slash" aria-hidden="true"></i>
            Meeting link not ready yet — it appears here before the class
          </p>

          <!-- Changes, under the policy they depend on -->
          <div class="rounded-2xl border border-slate-100 p-4">
            <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Change this class</p>
            <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                type="button"
                @click="$emit('edit', lesson)"
                class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <i class="fa-solid fa-pen text-slate-400" aria-hidden="true"></i>
                Edit subject &amp; message
              </button>
              <button
                type="button"
                @click="$emit('reschedule', lesson)"
                class="flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50/80 px-3 py-2.5 text-xs font-bold text-amber-900 transition hover:border-amber-400 hover:bg-amber-100"
              >
                <i class="fa-solid fa-calendar-days text-amber-600" aria-hidden="true"></i>
                Reschedule
              </button>
              <button
                type="button"
                @click="$emit('cancel', lesson)"
                :disabled="!cancellable"
                :title="cancellable ? null : levelCheckCancelNote"
                class="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
              >
                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                Cancel class
              </button>
            </div>
            <ul class="mt-3 space-y-1 text-[11px] leading-relaxed text-slate-500">
              <li v-if="checkType && !cancellable" class="font-semibold text-amber-800">
                <strong>Cancellation:</strong> {{ levelCheckCancelNote }}
              </li>
              <li v-else-if="checkType"><strong class="text-slate-600">Cancellation:</strong> free up to {{ LEVEL_CHECK_CANCEL_MINUTES }} minutes before the start{{ lesson.points ? ' — points are refunded' : '' }}.</li>
              <li v-else><strong class="text-slate-600">Cancellation:</strong> free up to 3h before the class starts — points are refunded.</li>
              <li><strong class="text-slate-600">Reschedule:</strong> move to another date or time without losing points.</li>
              <li><strong class="text-slate-600">Changes:</strong> subject and message can be changed until 2h before.</li>
            </ul>
          </div>
          </div>

          <!-- TAB: INSTRUCTOR INFO -->
          <div v-if="activeTab === 'instructor'" class="space-y-4">
            <!-- The header already shows the instructor's photo, so the tab opens
                 with what they say about themselves. -->
            <div>
              <div class="flex min-w-0 flex-col gap-2">
                <div class="relative min-w-0 rounded-2xl rounded-tl-md border border-amber-400 bg-[#fffaf0] p-4 pl-11 text-left">
                  <i class="fa-solid fa-quote-left absolute left-4 top-4 text-lg text-amber-400" aria-hidden="true"></i>
                  <p class="m-0 text-sm leading-relaxed text-slate-700">{{ instructor.selfIntro }}</p>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="v in VIDEOS"
                    :key="v.kind"
                    type="button"
                    @click="activeVideo = v.kind"
                    class="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border px-2 py-2 text-xs font-black shadow-2xs transition hover:shadow-sm active:scale-95 sm:px-3"
                    :class="v.off"
                  >
                    <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" :class="v.dot">
                      <i :class="v.icon" aria-hidden="true"></i>
                    </span>
                    <span class="truncate">{{ v.label(firstName) }}</span>
                  </button>
                </div>
              </div>
            </div>


            <!-- The same fields as the instructor's production profile, as cards. -->
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div
                v-for="row in instructorFacts"
                :key="row.label"
                class="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4"
                :class="row.wide ? 'sm:col-span-2' : ''"
              >
                <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ row.label }}</p>
                <p class="m-0 mt-1 text-sm font-bold text-slate-800">{{ row.items.join(', ') }}</p>
              </div>
            </div>

            <div v-if="instructor.subjects.length" class="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4">
              <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Subjects taught ({{ instructor.subjects.length }})</p>
              <!-- An even two-column grid, so long names don't leave ragged rows. -->
              <div class="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                <span
                  v-for="sub in instructor.subjects"
                  :key="sub.code"
                  class="flex min-w-0 items-center rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700"
                >
                  <SubjectCode :subject="sub.code" />
                </span>
              </div>
            </div>
          </div>

          <!-- TAB: LESSON HISTORY with this instructor -->
          <div v-if="activeTab === 'history'" class="space-y-3">
            <p class="m-0 text-xs text-slate-500">
              <span class="font-semibold text-slate-800">{{ history.length }}</span>
              class{{ history.length === 1 ? '' : 'es' }} taken with {{ firstName }}
            </p>
            <article
              v-for="past in history"
              :key="past.id"
              class="rounded-2xl border border-slate-100 bg-white p-4"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="m-0 flex min-w-0 text-sm font-bold text-slate-900">
                  <SubjectCode :subject="past.subject" size="sm" />
                </p>
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide"
                  :class="past.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
                >{{ past.status }}</span>
              </div>
              <p class="m-0 mt-0.5 text-[11px] font-medium text-slate-500">
                {{ past.date }} · {{ past.time }}<template v-if="past.topic"> · {{ past.topic }}</template>
              </p>
              <p v-if="past.feedback" class="m-0 mt-2 whitespace-pre-line rounded-xl bg-[#f8fafc] p-3 text-xs leading-relaxed text-slate-700">{{ past.feedback }}</p>
              <div v-if="past.materials?.length" class="mt-2 flex flex-wrap gap-1.5">
                <a
                  v-for="m in past.materials"
                  :key="m.id"
                  :href="m.url || undefined"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex max-w-full items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold ring-1 transition hover:brightness-95"
                  :class="materialKind(m.kind).chip"
                  :title="m.note || m.title"
                >
                  <i :class="materialKind(m.kind).icon" class="text-[10px]" aria-hidden="true"></i>
                  <span class="truncate">{{ m.title }}</span>
                </a>
              </div>
              <p v-if="past.yourRating" class="m-0 mt-2 text-[11px] font-semibold text-amber-700">
                <i class="fa-solid fa-star text-[10px]" aria-hidden="true"></i> You rated {{ past.yourRating }}/5
              </p>
            </article>
            <p v-if="!history.length" class="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
              You haven't taken a class with {{ firstName }} yet — this will be your first.
            </p>
          </div>

          <!-- TAB: MATERIALS shared by this instructor -->
          <div v-if="activeTab === 'materials'" class="space-y-2.5">
            <a
              v-for="item in materials"
              :key="item.id"
              :href="item.url || undefined"
              target="_blank"
              rel="noopener"
              class="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 transition hover:border-slate-200 hover:bg-slate-50"
            >
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1" :class="materialKind(item.kind).chip">
                <i :class="materialKind(item.kind).icon" aria-hidden="true"></i>
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-bold text-slate-900">{{ item.title }}</span>
                <span class="flex min-w-0 flex-wrap items-center gap-x-1 text-[11px] font-medium text-slate-500">
                  <span>{{ materialKind(item.kind).label }}</span>
                  <template v-if="item.subject"><span aria-hidden="true">·</span><SubjectCode :subject="item.subject" size="sm" /></template>
                  <span aria-hidden="true">·</span><span>{{ item.addedOn }}</span>
                </span>
                <span v-if="item.note" class="mt-1 block text-xs text-slate-600">{{ item.note }}</span>
              </span>
              <i v-if="item.url" class="fa-solid fa-arrow-up-right-from-square mt-1 text-[11px] text-slate-400" aria-hidden="true"></i>
            </a>
            <p v-if="!materials.length" class="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
              {{ firstName }} hasn't shared any materials with you yet.
            </p>
          </div>
        </div>
      </div>

      <!-- The video buttons open the same pop-up as the booking page, over this panel. -->
      <TeacherVideoModal
        v-if="activeVideo"
        v-model:kind="activeVideo"
        :name="lesson.teacherName"
        :subjects="videoSubjects"
        @close="activeVideo = null"
        @book="bookFromVideo"
      />

      <!-- The header photo at full size. Pressing anywhere or Escape closes it
           and returns to the panel, not the page behind. -->
      <div
        v-if="photoOpen"
        ref="photoViewer"
        tabindex="-1"
        class="fixed inset-0 z-[60] flex cursor-zoom-out items-start justify-center bg-slate-950/80 px-4 pt-6 outline-none sm:pt-12"
        role="dialog"
        aria-modal="true"
        :aria-label="`${lesson.teacherName}'s photo`"
        @click.stop="photoOpen = false"
        @keydown.esc.stop="photoOpen = false"
      >
        <figure class="m-0 w-full max-w-md">
          <AppImage
            :src="lesson.teacherPhoto"
            :alt="lesson.teacherName"
            eager
            class="block aspect-square w-full rounded-3xl border-4 border-white object-cover shadow-2xl"
          />
          <figcaption class="mt-3 text-center text-sm font-bold text-white">{{ lesson.teacherName }}</figcaption>
        </figure>
        <button
          type="button"
          class="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
          aria-label="Close photo"
        >
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import GoogleMeetIcon from './GoogleMeetIcon.vue';
import { computed, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppImage from './AppImage.vue';
import SubjectCode from './SubjectCode.vue';
import TeacherVideoModal from './TeacherVideoModal.vue';
import { MANILA, TOKYO, partsIn, rangeIn, countdownLabel } from '@/lib/schoolTime';
import { materialKind } from '@/lib/lessonMaterials';
import { assessmentTypeOf, LEVEL_CHECK_CANCEL_MINUTES } from '@/lib/brelas';
import { useUserStore } from '@/stores/useUserStore';
import { useSchoolStore } from '@/stores/useSchoolStore';
import {
  INSTRUCTORS, SUBJECT_LABELS,
  parseSubjectCodes, getTeacherProfile, pointsForDuration,
} from '@/pages/student-view-v4/constants';

const props = defineProps({
  /** null closes the modal — same pattern as TeacherDataModal. */
  lesson: Object,
  /** Opened from a Join button: show the "materials not opened" prompt straight away. */
  joinIntent: { type: Boolean, default: false },
});
const emit = defineEmits(['close', 'cancel', 'edit', 'reschedule']);

const user = useUserStore();
const school = useSchoolStore();

// Level checks (trial / counseling) close for cancelling 50 minutes before
// the start; regular lessons keep their own rule, handled on confirmation.
const checkType = computed(() => assessmentTypeOf(props.lesson?.subject));
const cancellable = computed(() => !checkType.value || school.canCancel(props.lesson?.id));
const levelCheckCancelNote = `Level checks can be cancelled until ${LEVEL_CHECK_CANCEL_MINUTES} minutes before the start.`;

/* Pre-class materials for this lesson, from the shared store. */
const prep = computed(() => (props.lesson?.id ? school.prepFor(props.lesson.id) : { items: [], total: 0, reviewed: 0, chosen: false }));
const unreviewed = computed(() => prep.value.total - prep.value.reviewed);
const prepDone = computed(() => prep.value.total > 0 && unreviewed.value === 0);
const toggleReviewed = (item) => school.markMaterialReviewed(props.lesson.id, item.id, !item.reviewedAt);

const showJoinPrompt = ref(false);
const highlightPrep = ref(false);
const prepCard = ref(null);
/** First press with materials unopened asks instead of joining. */
const onJoin = (event) => {
  if (unreviewed.value > 0) {
    event.preventDefault();
    showJoinPrompt.value = true;
  }
};
const reviewNow = () => {
  showJoinPrompt.value = false;
  prepCard.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  highlightPrep.value = true;
  setTimeout(() => { highlightPrep.value = false; }, 1600);
};

/* Tabs, mirroring the instructor's lesson panel from the student's side.
   It always opens on the class itself, and reopens there for a new lesson. */
const tabs = [
  { key: 'class', label: 'Class Details', icon: 'fa-solid fa-chalkboard-user', iconOn: 'text-amber-500' },
  { key: 'instructor', label: 'Instructor Info', icon: 'fa-solid fa-user', iconOn: 'text-[#c5a059]' },
  { key: 'history', label: 'Lesson History', icon: 'fa-solid fa-clock-rotate-left', iconOn: 'text-blue-500' },
  { key: 'materials', label: 'Materials', icon: 'fa-regular fa-folder-open', iconOn: 'text-purple-500' },
];
const activeTab = ref('class');
const activeVideo = ref(null);
const photoOpen = ref(false);
const photoViewer = ref(null);
// Focus the viewer when it opens so Escape reaches it straight away.
watch(photoOpen, (open) => { if (open) nextTick(() => photoViewer.value?.focus()); });
watch(() => props.lesson?.id, () => {
  activeTab.value = 'class';
  activeVideo.value = null;
  photoOpen.value = false;
  showJoinPrompt.value = props.joinIntent && unreviewed.value > 0;
}, { immediate: true });

/* Solid steps down one grey ramp, as on the instructor side. */
const TAB_SHADES = ['#e8edf2', '#dde3ea', '#cfd7e0', '#c1cad5'];
const tabShade = (i) => TAB_SHADES[Math.min(i, TAB_SHADES.length - 1)];

const tabEls = ref([]);
const setTabEl = (el, i) => { if (el) tabEls.value[i] = el; };
const onTabKey = (event, index) => {
  const last = tabs.length - 1;
  const next = {
    ArrowRight: index === last ? 0 : index + 1,
    ArrowLeft: index === 0 ? last : index - 1,
    Home: 0,
    End: last,
  }[event.key];
  if (next === undefined) return;
  event.preventDefault();
  activeTab.value = tabs[next].key;
  tabEls.value[next]?.focus();
};

const firstName = computed(() => (props.lesson?.teacherName || '').split(' ')[0]);

// Tinted cards with a solid play circle, so the videos stand out from the
// plain cards below. Each opens the video pop-up on that video.
const router = useRouter();

/** The same caption the booking page gives the intro video. */
const videoSubjects = computed(() => {
  const names = instructor.value.subjects.map((s) => s.name.replace(/^\[[^\]]+\]\s*/, ''));
  if (names.length <= 2) return names.join(' and ');
  return `${names[0]}, ${names[1]} and ${names.length - 2} more`;
});

/** From the video straight to this instructor's booking calendar. */
const bookFromVideo = () => {
  const teacher = props.lesson?.teacherId;
  activeVideo.value = null;
  emit('close');
  router.push({ path: '/booking', query: teacher ? { teacher } : {} });
};

const VIDEOS = [
  { kind: 'intro', label: (n) => `Get to know ${n}`, icon: 'fa-solid fa-play text-[7px]', dot: 'bg-red-500 text-white',
    off: 'border-red-200 bg-red-50 text-red-900 hover:border-red-300' },
  { kind: 'demo', label: (n) => `See ${n} teach`, icon: 'fa-solid fa-chalkboard-user text-[8px]', dot: 'bg-indigo-500 text-white',
    off: 'border-indigo-200 bg-indigo-50 text-indigo-900 hover:border-indigo-300' },
];

/** Profile from the booking catalogue, matched by teacher id, then by name. */
const instructor = computed(() => {
  const l = props.lesson ?? {};
  const t = INSTRUCTORS.find((i) => i.imageKey === l.teacherId) ?? INSTRUCTORS.find((i) => i.name === l.teacherName);
  const profile = t ? getTeacherProfile(t) : {};
  const codes = parseSubjectCodes(t?.specialty);
  return {
    majors: profile.majors ?? ['Education', 'Language'],
    areas: profile.areas ?? ['Conversation', 'Grammar'],
    rate30: t ? pointsForDuration(t, 30) : 5,
    rate60: t ? pointsForDuration(t, 60) : 9,
    selfIntro: profile.selfIntro ?? 'Hello! I focus on practical English communication and personalised feedback.',
    subjects: codes.map((code) => ({ code, name: SUBJECT_LABELS[code] || code })),
  };
});

/** Background rows, short cards first, then the long expertise list across the full width. */
const instructorFacts = computed(() => [
  { label: 'Major at university', items: instructor.value.majors },
  { label: 'Required points', items: [`${instructor.value.rate30} pts (30m)`, `${instructor.value.rate60} pts (1hr)`] },
  { label: 'Areas of expertise', wide: true, items: instructor.value.areas },
]);

/** Classes this student actually took with this instructor, newest first —
 *  cancelled ones are left out. */
const history = computed(() => (user.pastLessons ?? []).filter(
  (p) => p.teacherName === props.lesson?.teacherName && p.status === 'completed'
));

/** Materials this instructor has shared with the student. */
const materials = computed(() => (user.lessonMaterials ?? []).filter((m) => m.addedBy === props.lesson?.teacherName));

/** The student's own clock; falls back to the row's labels when there is no instant. */
const yourTime = computed(() => {
  const l = props.lesson;
  if (!l) return '';
  if (l.start && l.duration) return `${l.date || relativeDayIn(l.start, TOKYO)} · ${rangeIn(l.start, l.duration, TOKYO)} JST`;
  return [l.date, l.time].filter(Boolean).join(' · ');
});

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** 'Today, Nov 2' / 'Tomorrow, Nov 3' / 'Wed, Nov 4', counted in the given zone,
 *  so the instructor's line reads the same way as the student's. */
const relativeDayIn = (iso, tz) => {
  const p = partsIn(iso, tz);
  const n = partsIn(new Date().toISOString(), tz);
  const diff = Math.round((Date.UTC(p.year, p.month, p.day) - Date.UTC(n.year, n.month, n.day)) / 86_400_000);
  const short = `${MONTHS[p.month]} ${p.day}`;
  if (diff === 0) return `Today, ${short}`;
  if (diff === 1) return `Tomorrow, ${short}`;
  return `${WEEKDAYS[new Date(Date.UTC(p.year, p.month, p.day)).getUTCDay()]}, ${short}`;
};

/** The instructor teaches on Manila time; shown so both sides agree on the hour. */
const teacherTime = computed(() => {
  const l = props.lesson;
  if (!l?.start || !l?.duration) return '';
  return `${relativeDayIn(l.start, MANILA)} · ${rangeIn(l.start, l.duration, MANILA)} PHT`;
});

const startsIn = computed(() => {
  const m = props.lesson?.minutesUntil;
  return typeof m === 'number' && m > 0 ? countdownLabel(m) : '';
});
</script>

<style scoped>
/* Same folder tabs as the instructor's lesson panel. */
.tab-row {
  scrollbar-width: none;
}
.tab-row::-webkit-scrollbar {
  display: none;
}
.folder-tab {
  clip-path: path('M0 36 Q8 36 10 28 L15 8 Q17 0 25 0 L159 0 Q167 0 169 8 L174 28 Q176 36 184 36 Z');
}
</style>
