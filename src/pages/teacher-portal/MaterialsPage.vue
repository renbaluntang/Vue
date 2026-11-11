<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div class="min-w-0">
        <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Materials</h1>
        <p class="mt-0.5 text-sm text-slate-500">Open an original, or send a student their own copy to work in.</p>
      </div>

      <!-- Whose copies the lists below show. Sending asks for the student
           again, so this only decides what is marked as sent. -->
      <div ref="pickerRoot" class="relative shrink-0 sm:w-80" @keydown.esc="pickerOpen = false">
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white py-2 pl-2 pr-3 text-left shadow-xs transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold"
          :aria-expanded="pickerOpen"
          aria-haspopup="listbox"
          @click="togglePicker"
        >
          <img :src="student.photo" alt="" class="h-9 w-9 shrink-0 rounded-full object-cover" />
          <span class="min-w-0 flex-1">
            <span class="block text-[11px] font-semibold text-slate-500">Showing copies for</span>
            <span class="block truncate text-sm font-bold text-slate-900">{{ student.name }} · ID {{ student.id }}</span>
          </span>
          <i class="fa-solid fa-chevron-down shrink-0 text-xs text-slate-400 transition" :class="pickerOpen ? 'rotate-180' : ''" aria-hidden="true"></i>
        </button>

        <!-- Search across every student, not only this teacher's, since
             teachers often cover for each other. -->
        <div
          v-if="pickerOpen"
          class="absolute right-0 top-full z-40 mt-2 w-full min-w-[18rem] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
        >
          <div class="relative">
            <i class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" aria-hidden="true"></i>
            <input
              ref="pickerInput"
              v-model="pickerQuery"
              type="search"
              autocomplete="off"
              placeholder="Search by name, ID or email"
              aria-label="Search students"
              class="h-10 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-brighture-gold focus:ring-4 focus:ring-brighture-gold/20 sm:text-sm"
              @keydown.enter.prevent="pickerMatches[0] && choosePickerStudent(pickerMatches[0].id)"
            />
          </div>
          <ul class="mt-2 max-h-72 space-y-0.5 overflow-y-auto" role="listbox" aria-label="Students to show">
            <li v-for="s in pickerMatches" :key="s.id">
              <button
                type="button"
                role="option"
                :aria-selected="s.id === studentId"
                class="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition"
                :class="s.id === studentId ? 'bg-brighture-cream' : 'hover:bg-slate-50'"
                @click="choosePickerStudent(s.id)"
              >
                <img :src="s.photo" alt="" class="h-8 w-8 shrink-0 rounded-full object-cover" />
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-bold text-slate-900">{{ s.name }}</span>
                  <span class="block truncate text-[11px] text-slate-500">ID {{ s.id }}<template v-if="s.email"> · {{ s.email }}</template></span>
                </span>
                <span
                  v-if="school.classCopiesFor(s.id).length"
                  class="shrink-0 text-[11px] font-semibold tabular-nums text-slate-500"
                >{{ school.classCopiesFor(s.id).length }} sent</span>
                <i v-if="s.id === studentId" class="fa-solid fa-check shrink-0 text-xs text-[#8A6600]" aria-hidden="true"></i>
              </button>
            </li>
            <li v-if="!pickerMatches.length" class="px-2 py-3 text-xs text-slate-500">No student matches “{{ pickerQuery }}”.</li>
          </ul>
        </div>
      </div>
    </header>

    <div class="grid grid-cols-1 gap-4 2xl:grid-cols-[17.5rem_minmax(0,1fr)]">
      <!-- Subjects: a column on wide screens, a scrolling row below that, so
           the pronunciation grid keeps its full width on laptops. -->
      <nav aria-label="Subjects" class="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 2xl:overflow-visible">
        <ul class="flex gap-2 2xl:flex-col 2xl:gap-1 2xl:rounded-3xl 2xl:border 2xl:border-slate-200/80 2xl:bg-white 2xl:p-2 2xl:shadow-xs">
          <li v-for="s in MATERIAL_SUBJECTS" :key="s.code" class="shrink-0">
            <button
              type="button"
              class="flex w-full items-center gap-3 whitespace-nowrap rounded-xl border px-3 py-2 text-left text-sm transition 2xl:border-transparent"
              :class="subjectCode === s.code
                ? 'border-brighture-gold/50 bg-brighture-cream font-bold text-slate-900'
                : 'border-slate-200 bg-white font-semibold text-slate-600 hover:bg-slate-50 2xl:bg-transparent'"
              :aria-current="subjectCode === s.code ? 'true' : undefined"
              @click="subjectCode = s.code"
            >
              <span class="w-9 shrink-0 text-[11px] font-black text-[#8A6600]">{{ s.code }}</span>
              <span class="min-w-0 flex-1 truncate">{{ s.name }}</span>
              <span
                v-if="sentCount(s.code)"
                class="shrink-0 rounded-full bg-emerald-100 px-1.5 text-[10px] font-black tabular-nums text-emerald-700"
                :title="`${sentCount(s.code)} sent to ${firstName}`"
              >{{ sentCount(s.code) }}</span>
            </button>
          </li>
        </ul>
      </nav>

      <section class="min-w-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
        <div class="flex flex-col gap-1 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div class="min-w-0">
            <h2 class="text-base font-extrabold text-slate-900">{{ subject.name }}</h2>
            <p class="mt-0.5 text-xs text-slate-500">
              Copies go to <span class="font-semibold text-slate-700">{{ folderLabel }}</span> in the Brighture shared drive.
              {{ firstName }} and all teachers can edit them; the original never changes.
            </p>
          </div>
          <!-- A plain meter, not an animation: it only moves when a copy is sent. -->
          <div class="flex shrink-0 items-center gap-3 pt-1 sm:pt-0">
            <span class="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
              <span class="block h-full rounded-full bg-brighture-gold" :style="{ width: `${(sentCount(subject.code) / items.length) * 100}%` }"></span>
            </span>
            <span class="text-xs font-semibold tabular-nums text-slate-500">{{ sentCount(subject.code) }} of {{ items.length }} sent</span>
          </div>
        </div>

        <!-- ===================== List subjects (lessons in sections) ===================== -->
        <div v-if="subject.layout === 'list'">
          <div v-for="group in listGroups" :key="group.name">
            <h3 class="border-b border-slate-100 bg-slate-50/70 px-4 py-2 text-xs font-bold text-slate-600 sm:px-5">{{ group.name }}</h3>
            <ul class="divide-y divide-slate-100">
              <li
                v-for="item in group.items"
                :key="item.id"
                class="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
              >
                <div class="flex min-w-0 flex-1 items-baseline gap-3">
                  <span v-if="item.lessonNo" class="w-16 shrink-0 text-xs font-semibold tabular-nums text-slate-400">Lesson {{ item.lessonNo }}</span>
                  <a
                    :href="item.url"
                    target="_blank"
                    rel="noopener"
                    class="min-w-0 text-sm font-semibold text-slate-800 underline-offset-2 hover:text-[#8A6600] hover:underline"
                    title="Open the original (view only)"
                  >{{ item.title }}</a>
                </div>
                <div class="flex shrink-0 items-center gap-2 sm:justify-end">
                  <p v-if="copyOf(item)" class="text-[11px] text-slate-400 sm:text-right">Sent {{ sentLabel(copyOf(item)) }}</p>
                  <a
                    v-if="copyOf(item)"
                    :href="copyOf(item).url"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
                  >
                    <i class="fa-solid fa-file-lines text-[11px]" aria-hidden="true"></i>
                    {{ firstName }}'s copy
                  </a>
                  <button
                    v-else
                    type="button"
                    class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 transition hover:border-brighture-gold hover:bg-brighture-cream"
                    @click="onSend(item)"
                  >
                    <i class="fa-regular fa-paper-plane text-[11px]" aria-hidden="true"></i>
                    Send a copy
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- ===================== Grid subjects (sound × practice) ===================== -->
        <template v-else>
          <!-- Desktop and tablet: the same grid the content team uses. Every
               sheet is a tile of the same size, so the grid reads as a set of
               documents and the sent ones stand out by colour alone. -->
          <div class="hidden overflow-x-auto md:block">
            <table class="w-full min-w-[46rem] table-fixed border-collapse text-left">
              <colgroup>
                <col class="w-48" />
                <col v-for="col in subject.columns" :key="col" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" class="px-5 pb-2 pt-4 text-[11px] font-semibold text-slate-400">{{ subject.rowLabel }}</th>
                  <th v-for="col in subject.columns" :key="col" scope="col" class="px-1.5 pb-2 pt-4 text-[11px] font-semibold text-slate-400 last:pr-5">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in gridRows" :key="row.name" class="border-t border-slate-100 first:border-t-0">
                  <th scope="row" class="px-5 py-3 align-middle font-normal">
                    <span class="block font-paper text-[22px] leading-tight text-slate-900">{{ row.name }}</span>
                    <span class="mt-0.5 block text-[11px] tabular-nums text-slate-400">{{ rowSent(row) }} of {{ rowTotal(row) }} sent</span>
                  </th>
                  <td
                    v-for="cell in row.cells"
                    :key="cell.key"
                    :colspan="cell.span"
                    class="px-1.5 py-3 align-middle last:pr-5"
                  >
                    <div v-if="cell.item" class="group relative">
                      <!-- Sent: the tile opens the student's copy. -->
                      <a
                        v-if="copyOf(cell.item)"
                        :href="copyOf(cell.item).url"
                        target="_blank"
                        rel="noopener"
                        class="flex h-14 items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 pl-3 pr-10 transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                      >
                        <i class="fa-solid fa-circle-check shrink-0 text-sm text-emerald-600" aria-hidden="true"></i>
                        <span class="min-w-0">
                          <span class="block truncate text-xs font-bold text-emerald-900">{{ row.single ? cell.item.title : `${firstName}'s copy` }}</span>
                          <span class="block truncate text-[11px] text-emerald-700/80">Sent {{ shortDate(copyOf(cell.item)) }}</span>
                        </span>
                      </a>
                      <!-- Not sent: the tile starts the send. -->
                      <button
                        v-else
                        type="button"
                        class="flex h-14 w-full items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 pl-3 pr-10 text-left transition hover:border-brighture-gold hover:bg-brighture-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold"
                        @click="onSend(cell.item)"
                        :aria-label="`Send a copy of ${cell.item.title}`"
                      >
                        <i class="fa-regular fa-file-lines shrink-0 text-sm text-slate-300 group-hover:hidden group-focus-within:hidden" aria-hidden="true"></i>
                        <i class="fa-regular fa-paper-plane hidden shrink-0 text-xs text-[#8A6600] group-hover:block group-focus-within:block" aria-hidden="true"></i>
                        <span class="min-w-0">
                          <span v-if="row.single" class="block truncate text-xs font-bold text-slate-800">{{ cell.item.title }}</span>
                          <!-- At rest the tile says only "Not sent", so a grid of
                               28 sheets is not 28 identical buttons; the action
                               shows on hover or keyboard focus. -->
                          <span class="block truncate text-xs text-slate-400 group-hover:hidden group-focus-within:hidden">Not sent</span>
                          <span class="hidden truncate text-xs font-bold text-[#8A6600] group-hover:block group-focus-within:block">Send a copy</span>
                        </span>
                      </button>
                      <a
                        :href="cell.item.url"
                        target="_blank"
                        rel="noopener"
                        class="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brighture-gold group-hover:text-slate-500"
                        :title="`Open the original ${cell.item.title} (view only)`"
                        :aria-label="`Open the original ${cell.item.title}`"
                      >
                        <i class="fa-solid fa-arrow-up-right-from-square text-[11px]" aria-hidden="true"></i>
                      </a>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Phones: one block per sound, its practice sheets listed under it. -->
          <div class="divide-y divide-slate-100 md:hidden">
            <div v-for="row in gridRows" :key="row.name" class="px-4 py-3">
              <h3 class="font-paper text-lg font-medium text-slate-900">{{ row.name }}</h3>
              <ul class="mt-1 divide-y divide-slate-100">
                <li v-for="cell in row.cells.filter((c) => c.item)" :key="cell.key" class="flex items-center gap-3 py-2">
                  <a
                    :href="cell.item.url"
                    target="_blank"
                    rel="noopener"
                    class="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700"
                  >{{ row.single ? cell.item.title : cell.item.column }}</a>
                  <a
                    v-if="copyOf(cell.item)"
                    :href="copyOf(cell.item).url"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-bold text-emerald-800"
                  >
                    <i class="fa-solid fa-file-lines text-[11px]" aria-hidden="true"></i>
                    {{ firstName }}'s copy
                  </a>
                  <button
                    v-else
                    type="button"
                    class="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 transition hover:border-brighture-gold hover:bg-brighture-cream"
                    @click="onSend(cell.item)"
                  >
                    <i class="fa-regular fa-paper-plane text-[11px]" aria-hidden="true"></i>
                    Send a copy
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </template>
      </section>
    </div>

    <!-- Send a copy: find the student, check the details, then send. Pinned
         near the top so the window does not jump as the results change. -->
    <Teleport to="body">
      <div
        v-if="sendItem"
        class="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 pb-6 pt-6 sm:pt-12"
        @click.self="closeSend"
        @keydown.esc="closeSend"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="send-copy-title"
          class="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          <div class="flex items-center justify-between gap-3 px-6 pb-2 pt-5">
            <h2 id="send-copy-title" class="text-lg font-extrabold tracking-tight text-slate-900">Send a copy</h2>
            <button
              type="button"
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
              @click="closeSend"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="px-6 pb-5">
            <!-- What is being sent. Said once here, so the summary below only
                 lists what the send creates. -->
            <div class="flex items-center gap-3 py-3">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <i class="fa-regular fa-file-lines" aria-hidden="true"></i>
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-xs text-slate-500">{{ materialSubject(sendItem.subject).name }}</p>
                <p class="truncate text-[15px] font-bold text-slate-900">{{ sendTitle(sendItem) }}</p>
              </div>
              <a
                :href="sendItem.url"
                target="_blank"
                rel="noopener"
                class="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                title="Open the original (view only)"
              >
                View original
                <i class="fa-solid fa-arrow-up-right-from-square text-[10px]" aria-hidden="true"></i>
              </a>
            </div>

            <!-- Who it goes to -->
            <div class="border-t border-slate-100 pt-4">
              <label for="send-student-search" class="text-xs font-semibold text-slate-500">To</label>

              <!-- The chosen student, with the Google account the copy is shared
                   with, since that address is what actually gets access. -->
              <div v-if="sendStudent && !searching" class="mt-2 flex items-center gap-3">
                <img :src="sendStudent.photo" alt="" class="h-10 w-10 shrink-0 rounded-full object-cover" />
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-bold text-slate-900">{{ sendStudent.name }} <span class="font-normal text-slate-400">· ID {{ sendStudent.id }}</span></span>
                  <span class="block truncate text-xs" :class="sendStudent.email ? 'text-slate-500' : 'font-semibold text-rose-700'">
                    {{ sendStudent.email || 'No Google account on file' }}
                  </span>
                </span>
                <button
                  type="button"
                  class="h-8 shrink-0 rounded-lg px-2.5 text-xs font-bold text-[#8A6600] hover:bg-brighture-cream"
                  @click="startSearch"
                >Change</button>
              </div>

              <template v-else>
                <div class="relative mt-2">
                  <i class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400" aria-hidden="true"></i>
                  <input
                    id="send-student-search"
                    ref="searchInput"
                    v-model="studentQuery"
                    type="search"
                    autocomplete="off"
                    placeholder="Search by name, ID or email"
                    class="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brighture-gold focus:ring-4 focus:ring-brighture-gold/20 sm:text-sm"
                  />
                </div>
                <ul class="-mx-2 mt-2 max-h-60 space-y-0.5 overflow-y-auto" role="listbox" aria-label="Students">
                  <li v-for="s in studentMatches" :key="s.id">
                    <button
                      type="button"
                      role="option"
                      :aria-selected="sendStudentId === s.id"
                      class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-slate-50"
                      @click="pickStudent(s.id)"
                    >
                      <img :src="s.photo" alt="" class="h-8 w-8 shrink-0 rounded-full object-cover" />
                      <span class="min-w-0 flex-1">
                        <span class="block truncate text-sm font-bold text-slate-900">{{ s.name }}</span>
                        <span class="block truncate text-[11px] text-slate-500">ID {{ s.id }} · {{ s.email || 'No Google account yet' }}</span>
                      </span>
                      <span
                        v-if="school.classCopyOf(s.id, sendItem.id)"
                        class="shrink-0 text-[11px] font-semibold text-emerald-700"
                      >Has a copy</span>
                    </button>
                  </li>
                  <li v-if="!studentMatches.length" class="px-2 py-3 text-xs text-slate-500">No student matches “{{ studentQuery }}”.</li>
                </ul>
              </template>
            </div>

            <!-- What the send creates -->
            <div v-if="sendStudent && !searching" class="mt-4 border-t border-slate-100 pt-4">
              <p v-if="sendExisting" class="flex items-start gap-2 text-sm text-emerald-800">
                <i class="fa-solid fa-circle-check mt-0.5 text-emerald-600" aria-hidden="true"></i>
                {{ sendStudent.name.split(' ')[0] }} already has this copy, sent {{ sentLabel(sendExisting) }}.
              </p>
              <p v-else-if="!sendStudent.email" class="text-sm text-slate-600">
                Ask {{ sendStudent.name.split(' ')[0] }} to add a Google account to their profile, then send the copy.
              </p>
              <dl v-else class="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
                <dt class="text-slate-500">File name</dt>
                <dd class="truncate font-semibold text-slate-900">{{ copyFileName(sendItem, sendStudent.id) }}</dd>
                <dt class="text-slate-500">Folder</dt>
                <dd class="truncate text-slate-700">{{ copyFolder(sendItem, sendStudent.id) }}</dd>
                <dt class="text-slate-500">Can edit</dt>
                <dd class="text-slate-700">{{ sendStudent.name.split(' ')[0] }} and all teachers</dd>
              </dl>
            </div>
          </div>

          <div class="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:items-center">
            <p class="text-xs text-slate-500 empty:hidden sm:flex-1 sm:empty:block">
              <template v-if="sendStudent && !searching && canSend">{{ sendStudent.name.split(' ')[0] }} gets an email from Google with the link. The original stays as it is.</template>
            </p>
            <div class="flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                class="h-11 rounded-xl px-4 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                @click="closeSend"
              >Cancel</button>
              <a
                v-if="sendExisting"
                :href="sendExisting.url"
                target="_blank"
                rel="noopener"
                class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white hover:bg-slate-800"
              >
                Open {{ sendStudent.name.split(' ')[0] }}'s copy
                <i class="fa-solid fa-arrow-up-right-from-square text-xs" aria-hidden="true"></i>
              </a>
              <button
                v-else
                type="button"
                class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brighture-gold px-5 text-sm font-bold text-slate-900 transition hover:bg-[#F0BE00] disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="!canSend || sending || searching"
                @click="confirmSend"
              >
                <span v-if="sending" class="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900 motion-reduce:animate-none" aria-hidden="true"></span>
                {{ sending ? 'Copying…' : sendStudent && !searching ? `Send to ${sendStudent.name.split(' ')[0]}` : 'Choose a student' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

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
          class="fixed right-4 top-4 z-[90] flex w-[calc(100vw-2rem)] max-w-sm items-start gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-xl"
        >
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-700">
            <i class="fa-solid fa-check" aria-hidden="true"></i>
          </span>
          <div class="min-w-0 flex-1 pt-0.5">
            <p class="m-0 text-xs font-black text-emerald-800">{{ toast.title }}</p>
            <p class="m-0 mt-0.5 text-xs font-semibold leading-snug text-slate-700">{{ toast.text }}</p>
            <a :href="toast.url" target="_blank" rel="noopener" class="mt-1.5 inline-block text-xs font-bold text-[#8A6600] hover:underline">Open the copy</a>
          </div>
          <button
            type="button"
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Dismiss notification"
            @click="toast = null"
          >
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useSchoolStore } from '@/stores/useSchoolStore';
import { CURRENT_TEACHER_ID } from '@/lib/schoolSeed';
import { dateIn, MANILA } from '@/lib/schoolTime';
import {
  MATERIAL_SUBJECTS, MATERIAL_ITEMS, materialItem, materialSubject, itemLabel, copyFileName, copyFolder,
} from '@/lib/materialLibrary';

const school = useSchoolStore();
const route = useRoute();

// Opened from a student's lesson panel the page arrives with ?student=ID.
const studentId = ref(Number(route.query.student) || 21);
const student = computed(() => school.student(studentId.value));
const firstName = computed(() => student.value.name.split(' ')[0]);

const subjectCode = ref(MATERIAL_SUBJECTS[0].code);
const subject = computed(() => MATERIAL_SUBJECTS.find((s) => s.code === subjectCode.value));
const items = computed(() => MATERIAL_ITEMS.filter((i) => i.subject === subjectCode.value));
const folderLabel = computed(() => `Class Materials / ${subject.value.code} / ${studentId.value}`);

const copyOf = (item) => school.classCopyOf(studentId.value, item.id);
const sentCount = (code) => school.classCopiesFor(studentId.value)
  .filter((c) => materialItem(c.itemId)?.subject === code).length;
/** "Nov 12", for the tight grid tiles; the year only shows when it differs. */
const shortDate = (copy) => {
  const full = dateIn(copy.sentAt, MANILA);
  return full.endsWith(String(new Date().getFullYear())) ? full.replace(/,\s*\d{4}$/, '') : full;
};
/** "/ɑr/ · Words" for a practice sheet, "Lesson 3 · …" for a lesson. */
const sendTitle = (item) => (item.column ? `${item.group} · ${item.column}` : itemLabel(item));
const rowTotal = (row) => row.cells.filter((c) => c.item).length;
const rowSent = (row) => row.cells.filter((c) => c.item && copyOf(c.item)).length;
const sentLabel = (copy) => `${dateIn(copy.sentAt, MANILA)} by ${copy.sentBy.name.split(' ')[0]}`;

/** Lessons kept in the order and sections the content team uses. */
const listGroups = computed(() => {
  const groups = [];
  for (const item of items.value) {
    let g = groups.find((x) => x.name === item.group);
    if (!g) groups.push((g = { name: item.group, items: [] }));
    g.items.push(item);
  }
  return groups;
});

/**
 * One row per sound with a cell per practice column. A row with a single
 * document (the assessment) spans every column instead of leaving three
 * empty cells.
 */
const gridRows = computed(() => {
  const rows = [];
  for (const item of items.value) {
    let r = rows.find((x) => x.name === item.group);
    if (!r) rows.push((r = { name: item.group, list: [] }));
    r.list.push(item);
  }
  return rows.map((r) => {
    if (r.list.length === 1 && r.list[0].wide) {
      return { name: r.name, single: true, cells: [{ key: r.list[0].id, item: r.list[0], span: subject.value.columns.length }] };
    }
    return {
      name: r.name,
      single: false,
      cells: subject.value.columns.map((col) => ({ key: `${r.name}-${col}`, item: r.list.find((i) => i.column === col), span: 1 })),
    };
  });
});

// The "Showing copies for" picker: a search box over every student.
const pickerOpen = ref(false);
const pickerQuery = ref('');
const pickerRoot = ref(null);
const pickerInput = ref(null);
const pickerMatches = computed(() => matchStudents(pickerQuery.value));
const togglePicker = () => {
  pickerOpen.value = !pickerOpen.value;
  if (pickerOpen.value) {
    pickerQuery.value = '';
    nextTick(() => pickerInput.value?.focus());
  }
};
const choosePickerStudent = (id) => {
  studentId.value = id;
  pickerOpen.value = false;
};
// A click anywhere else closes the list.
const closePickerOutside = (event) => {
  if (pickerOpen.value && pickerRoot.value && !pickerRoot.value.contains(event.target)) pickerOpen.value = false;
};
onMounted(() => document.addEventListener('pointerdown', closePickerOutside));
onBeforeUnmount(() => document.removeEventListener('pointerdown', closePickerOutside));

// Send a copy opens a window where the teacher finds the student and checks
// the details before anything is shared, since sending emails the student.
// It starts on the student whose copies are showing.
const sendItem = ref(null);
const sendStudentId = ref(null);
const studentQuery = ref('');
const sending = ref(false);
const searchInput = ref(null);

const allStudents = computed(() => Object.values(school.db.students)
  .sort((a, b) => a.name.localeCompare(b.name)));
/** Name, exact ID ("34" or "ID 34") or email; used by both student searches. */
const matchStudents = (query) => {
  const q = query.trim().toLowerCase();
  if (!q) return allStudents.value;
  return allStudents.value.filter((s) => s.name.toLowerCase().includes(q)
    || String(s.id) === q.replace(/^id\s*/, '')
    || (s.email ?? '').toLowerCase().includes(q));
};
const studentMatches = computed(() => matchStudents(studentQuery.value));
const sendStudent = computed(() => (sendStudentId.value ? school.student(sendStudentId.value) : null));
const sendExisting = computed(() => (sendItem.value && sendStudent.value
  ? school.classCopyOf(sendStudent.value.id, sendItem.value.id) : null));
const canSend = computed(() => !!sendStudent.value?.email && !sendExisting.value);


const searching = ref(false);

const onSend = (item) => {
  sendItem.value = item;
  sendStudentId.value = studentId.value;
  studentQuery.value = '';
  searching.value = false;
};
const startSearch = () => {
  searching.value = true;
  studentQuery.value = '';
  nextTick(() => searchInput.value?.focus());
};
const pickStudent = (id) => {
  sendStudentId.value = id;
  searching.value = false;
};
const closeSend = () => {
  if (sending.value) return;
  sendItem.value = null;
};

const toast = ref(null);
let toastTimer;
let sendTimer;

const confirmSend = () => {
  if (!canSend.value || sending.value) return;
  sending.value = true;
  const item = sendItem.value;
  const sid = sendStudent.value.id;
  const name = sendStudent.value.name.split(' ')[0];
  // Stands in for the backend copying the original and sharing it.
  sendTimer = setTimeout(() => {
    const copy = school.sendClassCopy(sid, item.id, CURRENT_TEACHER_ID);
    sending.value = false;
    sendItem.value = null;
    // Show the student the copy went to, so the list marks it as sent.
    studentId.value = sid;
    toast.value = {
      title: `Copy sent to ${name}`,
      text: `${copyFileName(item, sid)} is in ${copyFolder(item, sid)}. ${name} gets an email from Google with the link.`,
      url: copy.url,
    };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.value = null; }, 5000);
  }, 900);
};

onBeforeUnmount(() => { clearTimeout(sendTimer); clearTimeout(toastTimer); });
</script>
