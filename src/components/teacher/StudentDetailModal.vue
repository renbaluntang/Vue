<template>
  <Transition
    enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0"
  >
    <div
      v-if="student"
      class="fixed inset-0 z-50 !m-0 flex items-start justify-center bg-slate-900/60 px-2 pt-6 pb-2 sm:px-5 sm:pt-12 sm:pb-5 backdrop-blur-xs overflow-y-auto"
      @click.self="$emit('close')"
    >
      <!-- Landscape Rectangle Modal Container: wide aspect layout, self-contained card matching user image -->
      <div
        class="relative w-full max-w-4xl overflow-hidden rounded-[26px] bg-white shadow-2xl transition-all border border-slate-200 max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4.25rem)] flex flex-col"
        @click.stop
      >
        <!-- Dark Header Block with Student Avatar and Close Button (Exact styling from reference image) -->
        <div class="relative bg-[#1e2738] px-5 pt-5 sm:px-6 sm:pt-6 text-white shrink-0">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3.5 min-w-0">
              <!-- Rounded square avatar with golden border -->
              <AppImage
                :src="studentPhoto"
                :alt="studentName"
                class="h-16 w-16 sm:h-[72px] sm:w-[72px] shrink-0 rounded-2xl object-cover ring-2 ring-[#c5a059] shadow-sm"
              />

              <div class="min-w-0">
                <p class="m-0 text-[11px] font-black uppercase tracking-wider text-[#e6b95c]">
                  STUDENT #{{ student.studentId }}
                </p>
                <h3 class="m-0 text-xl sm:text-2xl font-black text-white truncate mt-0.5">
                  {{ studentName }}
                </h3>
                <p class="m-0 text-xs text-slate-300 font-medium mt-0.5 truncate">
                  {{ membership }} · {{ record.category || student.category || student.lessonClass || 'Online' }}
                </p>
              </div>
            </div>

            <!-- Header Action buttons -->
            <div class="flex items-center gap-2">
              <router-link
                :to="{ path: '/chat', query: { student: student.studentId || student.id } }"
                @click="$emit('close')"
                class="flex items-center gap-1.5 rounded-full bg-brighture-gold/20 hover:bg-brighture-gold/30 text-amber-300 hover:text-amber-200 border border-amber-400/30 px-3 py-1.5 text-xs font-black transition"
                title="Chat with student"
              >
                <i class="fa-solid fa-comments text-xs"></i>
                <span class="hidden sm:inline">Message</span>
              </router-link>

              <!-- Round close button inside dark header -->
              <button
                type="button"
                @click="$emit('close')"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-slate-200 hover:bg-white/25 hover:text-white transition"
                aria-label="Close modal"
              >
                <i class="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>
          </div>

          <!-- A folder stack. Each tab has the same sloped edge on both
               sides — flared out at the bottom, rounded over at the top — and
               neighbours overlap by most of a slope, so the edges nest and
               only a small notch of the header shows where their tops meet.
               Left tabs sit over right ones; the open tab comes to the front. -->
          <div
            class="tab-row -ml-5 mt-5 flex items-end overflow-x-auto sm:-ml-6"
            role="tablist"
            aria-label="Student detail sections"
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
                activeTab === tab.key
                  ? 'bg-white text-slate-900'
                  : 'bg-[var(--tab-bg)] text-slate-700 hover:bg-slate-100',
              ]"
              :style="{
                zIndex: activeTab === tab.key ? tabs.length + 1 : tabs.length - i,
                '--tab-bg': tabShade(i),
              }"
            >
              <i
                v-if="tab.icon"
                :class="[tab.icon, activeTab === tab.key ? tab.iconOn : 'text-slate-500']"
                class="text-[11px]"
              ></i>
              <span class="whitespace-nowrap">{{ tab.label }}</span>
            </button>
          </div>
        </div>

        <!-- Scrollable Modal Body: Wide Landscape Content Grid -->
        <div class="flex-1 overflow-y-auto p-5 sm:p-6 bg-white">

          <!-- TAB 1: CLASS DETAILS -->
          <div v-if="activeTab === 'class'" class="space-y-4">
          <!-- Row 1: SUBJECT beside LESSON TIME. Points were the student's
               side of the booking — what it cost them — and say nothing the
               instructor acts on. -->
          <div class="grid grid-cols-12 items-stretch gap-3 sm:gap-4">
            <!-- SUBJECT -->
            <div class="col-span-12 flex flex-col justify-center rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 sm:col-span-5">
              <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                SUBJECT
              </p>
              <p class="m-0 text-sm sm:text-base font-extrabold text-slate-900 mt-1" :title="student.subject">
                {{ student.subject }}
              </p>
            </div>

            <!-- LESSON TIME -->
            <div class="col-span-12 rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 sm:col-span-7">
              <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                LESSON TIME
              </p>
              <div class="mt-2 space-y-1.5 text-xs sm:text-sm">
                <div class="flex items-baseline justify-between gap-3">
                  <span class="shrink-0 text-slate-500 font-medium">Your time</span>
                  <span class="font-bold text-slate-900 text-right">{{ teacherExactTime }}</span>
                </div>
                <div class="flex items-baseline justify-between gap-3">
                  <span class="shrink-0 text-slate-500 font-medium">Student</span>
                  <span class="font-bold text-slate-900 text-right">{{ studentExactTime }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Row 3: REQUEST FROM THE STUDENT Card -->
          <div
            v-if="student.note || student.studentMessage"
            class="rounded-2xl border border-[#faecd2] bg-[#fdfbf6] p-4"
          >
            <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-[#996b27]">
              REQUEST FROM THE STUDENT
            </p>
            <p class="m-0 text-xs sm:text-sm italic text-slate-700 leading-relaxed mt-1.5">
              “{{ student.note || student.studentMessage }}”
            </p>
          </div>

          <!-- Pre-class materials: what the student should look at first, and
               how much of it they have opened. The teacher picks the list. -->
          <div v-if="lessonRecord" class="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Pre-class materials</p>
              <span
                v-if="prep.total"
                class="rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums"
                :class="prep.reviewed === prep.total ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'"
              >
                {{ firstName }} reviewed {{ prep.reviewed }} of {{ prep.total }}
              </span>
              <span v-else class="text-[11px] font-semibold text-slate-400">Nothing set for this lesson</span>
            </div>
            <div v-if="prep.total" class="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="prep.reviewed === prep.total ? 'bg-emerald-500' : 'bg-amber-400'"
                :style="{ width: `${(prep.reviewed / prep.total) * 100}%` }"
              ></div>
            </div>

            <ul v-if="prep.total" class="m-0 mt-3 list-none space-y-1.5 p-0">
              <li v-for="item in prep.items" :key="item.id" class="flex items-center gap-2.5 text-xs">
                <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1" :class="materialKind(item.kind).chip">
                  <i :class="materialKind(item.kind).icon" class="text-[11px]" aria-hidden="true"></i>
                </span>
                <span class="min-w-0 flex-1 truncate font-semibold text-slate-800">{{ item.title }}</span>
                <span
                  class="shrink-0 text-[11px] font-bold"
                  :class="item.reviewedAt ? 'text-emerald-700' : 'text-slate-400'"
                >
                  <template v-if="item.reviewedAt"><i class="fa-solid fa-check mr-0.5" aria-hidden="true"></i>Reviewed {{ reviewedLabel(item.reviewedAt) }}</template>
                  <template v-else>Not opened yet</template>
                </span>
              </li>
            </ul>

            <!-- Choosing: every material on the student's shelf, ticked if it is for this lesson -->
            <div v-if="choosingPrep" class="mt-3 rounded-xl border border-slate-200 bg-white p-2">
              <label
                v-for="item in materials"
                :key="item.id"
                class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  :checked="prepIds.has(item.id)"
                  @change="togglePrep(item.id)"
                  class="h-4 w-4 accent-[#c5a059]"
                />
                <i :class="materialKind(item.kind).icon" class="w-4 text-center text-slate-400" aria-hidden="true"></i>
                <span class="min-w-0 flex-1 truncate font-semibold text-slate-800">{{ item.title }}</span>
                <span class="shrink-0 text-[10px] text-slate-400">{{ item.subject }}</span>
              </label>
              <p v-if="!materials.length" class="m-0 px-2 py-1.5 text-xs text-slate-500">No materials on {{ firstName }}'s shelf yet.</p>
            </div>

            <div class="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                @click="choosingPrep = !choosingPrep"
                class="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <i class="fa-solid fa-list-check mr-1 text-slate-400" aria-hidden="true"></i>
                {{ choosingPrep ? 'Done' : 'Choose materials' }}
              </button>
              <button
                type="button"
                @click="activeTab = 'materials'"
                class="rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-500 transition hover:bg-white hover:text-slate-800"
              >
                <i class="fa-solid fa-plus mr-1" aria-hidden="true"></i> Add a new one
              </button>
              <span v-if="!prep.chosen && prep.total" class="text-[11px] text-slate-400">Showing materials in this subject until you choose.</span>
            </div>
          </div>

          <!-- Row 4: Start Lesson Button (Green with camera icon) -->
          <div>
            <a
              v-if="student.meetLink"
              :href="student.meetLink"
              target="_blank"
              rel="noopener"
              class="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2db572] hover:bg-[#269e63] py-3.5 px-4 text-center text-sm font-black text-white shadow-xs transition active:scale-[0.99]"
            >
              <GoogleMeetIcon size="md" />
              <span>Start Lesson</span>
            </a>
            <button
              v-else
              type="button"
              disabled
              class="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 py-3.5 px-4 text-center text-xs font-bold text-slate-400 cursor-not-allowed"
            >
              <span>No meeting link available</span>
            </button>
          </div>

          </div>

          <!-- TAB 2: BASIC INFO -->
            <div v-if="activeTab === 'basic'" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <!-- Personal Details -->
                <div class="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 space-y-2.5">
                  <p class="font-bold text-[11px] uppercase tracking-wider text-slate-400 m-0">Personal Details</p>

                  <div class="flex justify-between py-1 border-b border-slate-100">
                    <span class="font-medium text-slate-500">Name</span>
                    <span class="font-semibold text-slate-900">{{ studentProfile.firstName }} {{ studentProfile.lastName }}</span>
                  </div>

                  <div class="flex justify-between py-1 border-b border-slate-100">
                    <span class="font-medium text-slate-500">Teacher Display (Romaji)</span>
                    <span class="font-semibold text-slate-900">{{ studentProfile.romaji }}</span>
                  </div>

                  <div class="flex justify-between py-1 border-b border-slate-100">
                    <span class="font-medium text-slate-500">Gender</span>
                    <span class="font-semibold text-slate-900">{{ studentProfile.gender }}</span>
                  </div>

                  <div class="flex justify-between py-1 border-b border-slate-100">
                    <span class="font-medium text-slate-500">Date of Birth</span>
                    <span class="font-semibold text-slate-900">{{ studentProfile.birthDate }}</span>
                  </div>

                  <div class="flex justify-between items-center py-1 border-b border-slate-100">
                    <span class="font-medium text-slate-500">Email</span>
                    <div class="flex items-center gap-1.5 font-mono text-[11px] text-slate-900">
                      <span>{{ studentProfile.email }}</span>
                      <button
                        type="button"
                        @click="copyText(studentProfile.email, 'email')"
                        class="text-slate-400 hover:text-slate-700 transition"
                        title="Copy Email"
                      >
                        <i :class="copiedField === 'email' ? 'fa-solid fa-check text-emerald-600' : 'fa-regular fa-copy'"></i>
                      </button>
                    </div>
                  </div>

                  <div class="flex justify-between items-center py-1">
                    <span class="font-medium text-slate-500">Google Account</span>
                    <div class="flex items-center gap-1.5 font-mono text-[11px] text-slate-900">
                      <span>{{ studentProfile.googleAccount }}</span>
                      <button
                        type="button"
                        @click="copyText(studentProfile.googleAccount, 'gmail')"
                        class="text-slate-400 hover:text-slate-700 transition"
                        title="Copy Gmail"
                      >
                        <i :class="copiedField === 'gmail' ? 'fa-solid fa-check text-emerald-600' : 'fa-regular fa-copy'"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Learning Profile & Curriculum -->
                <div class="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 space-y-2.5">
                  <p class="font-bold text-[11px] uppercase tracking-wider text-slate-400 m-0">Learning & Curriculum</p>

                  <div class="flex justify-between py-1 border-b border-slate-100">
                    <span class="font-medium text-slate-500">Membership</span>
                    <span class="font-semibold text-slate-900">{{ membership }}</span>
                  </div>

                  <div class="flex justify-between py-1 border-b border-slate-100">
                    <span class="font-medium text-slate-500">Level</span>
                    <span class="font-semibold text-slate-900">{{ studentProfile.level }}</span>
                  </div>

                  <div class="flex justify-between py-1 border-b border-slate-100">
                    <span class="font-medium text-slate-500">Student Timezone</span>
                    <span class="font-semibold text-slate-900">{{ studentProfile.timezone }}</span>
                  </div>

                  <div class="flex justify-between py-1 border-b border-slate-100">
                    <span class="font-medium text-slate-500">Primary Objective</span>
                    <span class="font-semibold text-slate-900">{{ studentProfile.learningObjective }}</span>
                  </div>

                  <div class="flex justify-between py-1 border-b border-slate-100">
                    <span class="font-medium text-slate-500">Target Goal</span>
                    <span class="font-semibold text-slate-900 truncate max-w-[170px]" :title="studentProfile.targetGoal">
                      {{ studentProfile.targetGoal }}
                    </span>
                  </div>

                  <div class="flex justify-between py-1">
                    <span class="font-medium text-slate-500">Member Since</span>
                    <span class="font-semibold text-slate-900">{{ studentProfile.memberSince }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 2: LESSON LOGS -->
            <div v-if="activeTab === 'logs'" class="space-y-3.5">
              <div class="flex flex-wrap items-center gap-2">
                <input
                  v-model="logTeacherFilter"
                  type="text"
                  placeholder="Filter instructor..."
                  class="rounded-full bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-300"
                />
                <input
                  v-model="logSubjectFilter"
                  type="text"
                  placeholder="Filter subject..."
                  class="rounded-full bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-300"
                />
                <button
                  v-if="logTeacherFilter || logSubjectFilter"
                  type="button"
                  @click="logTeacherFilter = ''; logSubjectFilter = ''"
                  class="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 font-semibold"
                >
                  Clear
                </button>
                <span class="ml-auto text-xs text-slate-500">
                  <span class="font-semibold text-slate-800">{{ filteredLogs.length }}</span> logged
                </span>
              </div>

              <div class="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
                <table class="w-full min-w-[580px] text-xs">
                  <thead>
                    <tr class="text-left border-b border-slate-100 bg-[#f8fafc]">
                      <th class="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Date</th>
                      <th class="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Instructor</th>
                      <th class="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Subject</th>
                      <th class="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Feedback</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="log in filteredLogs" :key="log.id" class="align-top hover:bg-slate-50/50 transition">
                      <td class="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        {{ log.dateManila }}
                        <div v-if="log.status !== 'completed'" class="text-[10px] font-bold uppercase tracking-wide mt-0.5" :class="log.status === 'no-show' ? 'text-rose-600' : 'text-slate-400'">
                          {{ log.statusLabel }}
                        </div>
                      </td>
                      <td class="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {{ log.instructorName }}
                      </td>
                      <td class="py-3 px-3 font-semibold text-slate-900">
                        {{ log.subject }}
                      </td>
                      <td class="py-3 px-3 text-slate-600 leading-relaxed whitespace-pre-line max-w-xs">
                        <span v-if="log.feedback">{{ log.feedback }}</span>
                        <span v-else class="italic text-slate-400">No feedback written yet.</span>
                      </td>
                    </tr>
                    <tr v-if="!filteredLogs.length">
                      <td colspan="4" class="py-6 px-3 text-center text-slate-400">No lessons logged yet.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- TAB 3: RESERVATION LIST -->
            <div v-if="activeTab === 'reservations'" class="space-y-3.5">
              <div class="flex items-center justify-between text-xs text-slate-500">
                <span>Upcoming scheduled lessons for this student</span>
                <span><span class="font-semibold text-slate-800">{{ studentReservations.length }}</span> booked</span>
              </div>

              <div class="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
                <table class="w-full min-w-[580px] text-xs">
                  <thead>
                    <tr class="text-left border-b border-slate-100 bg-[#f8fafc]">
                      <th class="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Appointed Date</th>
                      <th class="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Instructor</th>
                      <th class="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Subject</th>
                      <th class="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Focus / Topic</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="res in studentReservations" :key="res.id" class="align-top hover:bg-slate-50/50 transition">
                      <td class="py-3 px-3 whitespace-nowrap">
                        <div class="font-semibold text-slate-900">{{ res.startManila }}</div>
                        <div class="text-[11px] text-slate-400 mt-0.5">{{ res.startStudent }} (Student)</div>
                      </td>
                      <td class="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {{ res.instructorName }}
                      </td>
                      <td class="py-3 px-3 font-semibold text-slate-900">
                        {{ res.subject }}
                      </td>
                      <td class="py-3 px-3 text-slate-600">
                        <p class="m-0 font-semibold text-slate-900">{{ res.topic || 'General curriculum discussion' }}</p>
                        <p v-if="res.note" class="m-0 text-[11px] text-slate-400 italic mt-0.5">“{{ res.note }}”</p>
                      </td>
                    </tr>
                    <tr v-if="!studentReservations.length">
                      <td colspan="4" class="py-6 px-3 text-center text-slate-400">No upcoming lessons booked.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- TAB 4: MATERIALS -->
            <!-- The student's shared shelf: the same list the student portal
                 shows, so what is added or removed here is what they see. -->
            <div v-if="activeTab === 'materials'" class="space-y-3.5">
              <div class="flex items-center justify-between text-xs text-slate-500">
                <span>Shared across every lesson with this student — not just this one.</span>
                <span><span class="font-semibold text-slate-800">{{ materials.length }}</span> shared</span>
              </div>

              <ul v-if="materials.length" class="space-y-2">
                <li
                  v-for="item in materials"
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
                    <p class="m-0 text-sm font-bold text-slate-900">{{ item.title }}</p>
                    <p class="m-0 mt-0.5 text-[11px] font-semibold text-slate-500">
                      {{ materialKind(item.kind).label }}
                      <template v-if="item.subject"> · {{ item.subject }}</template>
                      · {{ item.addedOn }}
                      <template v-if="item.addedBy"> · {{ item.addedBy }}</template>
                    </p>
                    <p v-if="item.note" class="m-0 mt-1 text-xs italic text-slate-600">{{ item.note }}</p>
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
                      @click="teacher.removeMaterial(studentId, item.id)"
                      class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                      title="Remove"
                      :aria-label="`Remove ${item.title}`"
                    >
                      <i class="fa-regular fa-trash-can text-[11px]"></i>
                    </button>
                  </div>
                </li>
              </ul>
              <p v-else class="m-0 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                Nothing shared with {{ firstName }} yet.
              </p>

              <div class="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3">
                <p class="m-0 text-[10px] font-black uppercase tracking-wider text-slate-400">Add materials</p>
                <div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-12">
                  <input
                    v-model="draft.title"
                    type="text"
                    placeholder="What is it? e.g. Vowel drill worksheet"
                    class="sm:col-span-5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-brighture-gold focus:ring-2 focus:ring-brighture-gold/20"
                  />
                  <!-- Own chevron, inset like the text: the native arrow sat flush
                       against the right edge. -->
                  <div class="relative sm:col-span-2">
                    <select
                      v-model="draft.kind"
                      class="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs text-slate-800 outline-none transition focus:border-brighture-gold"
                    >
                      <option v-for="opt in MATERIAL_KIND_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                    </select>
                    <i class="fa-solid fa-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400" aria-hidden="true"></i>
                  </div>
                  <input
                    v-model="draft.url"
                    type="url"
                    placeholder="https://…"
                    class="sm:col-span-5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-brighture-gold focus:ring-2 focus:ring-brighture-gold/20"
                  />
                  <input
                    v-model="draft.note"
                    type="text"
                    placeholder="A note for the student (optional)"
                    class="sm:col-span-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-brighture-gold focus:ring-2 focus:ring-brighture-gold/20"
                  />
                  <label v-if="lessonRecord" class="sm:col-span-12 flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600">
                    <input v-model="draft.forLesson" type="checkbox" class="h-4 w-4 accent-[#c5a059]" />
                    {{ firstName }} should review this before the upcoming lesson
                  </label>
                  <button
                    type="button"
                    @click="addMaterial"
                    :disabled="!draft.title.trim()"
                    class="sm:col-span-3 rounded-xl bg-brighture-gold px-4 py-2 text-xs font-extrabold text-brighture-ink transition hover:bg-brighture-gold-deep active:scale-95 disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import GoogleMeetIcon from '../GoogleMeetIcon.vue';
import { ref, computed, watch } from 'vue';
import AppImage from '../AppImage.vue';
import studentImage from '@/assets/student-1.svg';
import { MATERIAL_KIND_OPTIONS, materialKind } from '@/lib/lessonMaterials';
import { MANILA, stampIn, utcLabel, minutesUntil, dateIn, clockIn } from '@/lib/schoolTime';
import { useTeacherStore } from '../../stores/useTeacherStore';
import { useSchoolStore } from '../../stores/useSchoolStore';

const teacher = useTeacherStore();
const school = useSchoolStore();

const props = defineProps({
  /** A reservation row or student reference; null closes the modal. */
  student: { type: Object, default: null },
  /** The tab to open on: 'class' from a Class Details button, 'basic' from
   *  the student's photo. */
  initialTab: { type: String, default: 'class' },
});
defineEmits(['close']);

/**
* Tabs. The modal opens on whatever the opener asked for — the lesson by
* default. Opening a second student reopens on that tab too, rather than
* keeping whichever tab was left open on the last one.
*/
const activeTab = ref(props.initialTab);

watch(
  () => props.student && (props.student.id ?? props.student.studentId),
  (id) => { if (id) activeTab.value = props.initialTab; }
);

/* Solid steps down one grey ramp, never opacity: tints let the tab behind
   show through the one in front, and two overlapping translucent tabs read as
   a single merged shape instead of two sheets of paper. */
const TAB_SHADES = ['#e8edf2', '#dde3ea', '#cfd7e0', '#c1cad5', '#b3becb'];
const tabShade = (i) => TAB_SHADES[Math.min(i, TAB_SHADES.length - 1)];

/* Arrow keys walk the stack, the way a real tablist does — with the tabs
   overlapping, reaching the one behind with a mouse is fiddly. */
const tabEls = ref([]);
const setTabEl = (el, i) => { if (el) tabEls.value[i] = el; };

const onTabKey = (event, index) => {
  const last = tabs.value.length - 1;
  const next = {
    ArrowRight: index === last ? 0 : index + 1,
    ArrowLeft: index === 0 ? last : index - 1,
    Home: 0,
    End: last,
  }[event.key];
  if (next === undefined) return;
  event.preventDefault();
  activeTab.value = tabs.value[next].key;
  tabEls.value[next]?.focus();
};

const tabs = computed(() => [
  { key: 'class', label: 'Class Details', icon: 'fa-solid fa-chalkboard-user', iconOn: 'text-amber-500' },
  { key: 'basic', label: 'Basic Info', icon: 'fa-solid fa-user', iconOn: 'text-[#c5a059]' },
  { key: 'logs', label: 'Lesson Logs', icon: 'fa-solid fa-clock-rotate-left', iconOn: 'text-blue-500' },
  { key: 'reservations', label: 'Reservation List', icon: 'fa-regular fa-calendar-check', iconOn: 'text-emerald-600' },
  { key: 'materials', label: 'Materials', icon: 'fa-regular fa-folder-open', iconOn: 'text-purple-500' },
]);

// Filter state for Lesson Logs
const logTeacherFilter = ref('');
const logSubjectFilter = ref('');

// Copy to clipboard notification
const copiedField = ref(null);
const copyText = (text, field) => {
  if (!text) return;
  navigator.clipboard?.writeText(text);
  copiedField.value = field;
  setTimeout(() => {
    if (copiedField.value === field) copiedField.value = null;
  }, 1800);
};

// Formatted clocks matching the reference card image
const teacherExactTime = computed(() => {
  if (!props.student) return 'Oct 9, 2026 18:00';
  const raw = props.student.startManila || teacher.localStart(props.student) || 'Oct 9, 2026 18:00';
  return raw.replace(/\(.*?\)/g, '').trim();
});

const studentExactTime = computed(() => {
  if (!props.student) return 'Oct 9, 2026 19:00 (UTC +09:00) Tokyo';
  if (props.student.startStudent) return props.student.startStudent;
  if (props.student.startTokyo) return `${props.student.startTokyo} (UTC +09:00) Tokyo`;
  return 'Oct 9, 2026 19:00 (UTC +09:00) Tokyo';
});

/** Whoever the opener passed — a reservation row, a log row, a chat contact. */
const studentId = computed(() => {
  const raw = props.student?.studentId ?? props.student?.id;
  const n = Number(raw);
  return Number.isFinite(n) ? n : raw;
});

/** The school's record for the student; the opener's row only fills gaps. */
const record = computed(() => (props.student ? school.student(studentId.value) : {}));
const studentName = computed(() =>
  school.db.students[studentId.value]?.name || props.student?.studentName || props.student?.student || record.value.name
);
const studentPhoto = computed(() => record.value.photo || props.student?.studentPhoto || studentImage);
const membership = computed(() => record.value.membership || props.student?.membership || 'Regular');
const firstName = computed(() => (studentName.value || '').split(' ')[0] || 'the student');

// Materials: the shared shelf, with a small add form under it.
const materials = computed(() => (props.student ? teacher.materialsFor(studentId.value) : []));
const blankDraft = () => ({ title: '', kind: 'pdf', url: '', note: '', forLesson: true });
const draft = ref(blankDraft());
watch(studentId, () => { draft.value = blankDraft(); });

const addMaterial = () => {
  if (!props.student || !draft.value.title.trim()) return;
  const { forLesson, ...fields } = draft.value;
  const entry = teacher.addMaterial(studentId.value, { ...fields, subject: props.student.subject || '' });
  if (forLesson && entry && lessonRecord.value) togglePrep(entry.id, true);
  draft.value = blankDraft();
};

/* The upcoming lesson this panel was opened for (a reservation row), if any. */
const lessonRecord = computed(() => {
  const l = props.student?.id ? school.findLesson(props.student.id) : null;
  return l && l.status === 'booked' ? l : null;
});
const prep = computed(() => (lessonRecord.value
  ? school.prepFor(lessonRecord.value.id)
  : { items: [], total: 0, reviewed: 0, chosen: false }));
const prepIds = computed(() => new Set(prep.value.items.map((i) => i.id)));
const choosingPrep = ref(false);
watch(() => props.student?.id, () => { choosingPrep.value = false; });

/** Adds or removes one material from this lesson's list (force = always add). */
const togglePrep = (id, force = false) => {
  if (!lessonRecord.value) return;
  const ids = new Set(prepIds.value);
  if (ids.has(id) && !force) ids.delete(id); else ids.add(id);
  school.setLessonPrep(lessonRecord.value.id, [...ids]);
};

const reviewedLabel = (iso) => `${dateIn(iso, MANILA)}, ${clockIn(iso, MANILA)}`;

// Accurate mapping matching student-portal/profile fields
const studentProfilesMap = {
  'Taro Yamada': {
    firstName: 'Taro',
    lastName: 'Yamada',
    romaji: 'Taro Yamada',
    gender: 'Male',
    birthDate: 'July 1994',
    email: 'taro.yamada@example.com',
    googleAccount: 'taro.yamada@gmail.com',
    timezone: 'Asia/Tokyo (JST)',
    learningObjective: 'Business English & Negotiations',
    targetGoal: 'Business Negotiations & IELTS 7.5',
    level: 'B2 Upper-Intermediate',
    memberSince: 'March 2025',
  },
  'Aiko Tanaka': {
    firstName: 'Aiko',
    lastName: 'Tanaka',
    romaji: 'Aiko Tanaka',
    gender: 'Female',
    birthDate: 'November 1993',
    email: 'aiko.tanaka@example.jp',
    googleAccount: 'aiko.tanaka@gmail.com',
    timezone: 'Asia/Tokyo (JST)',
    learningObjective: 'Pronunciation & Speaking',
    targetGoal: 'Accent Neutralization & Speech Fluency',
    level: 'B1 Intermediate',
    memberSince: 'January 2025',
  },
  'Kenji Sato': {
    firstName: 'Kenji',
    lastName: 'Sato',
    romaji: 'Kenji Sato',
    gender: 'Male',
    birthDate: 'August 1990',
    email: 'kenji.sato@example.jp',
    googleAccount: 'kenji.sato@gmail.com',
    timezone: 'Asia/Tokyo (JST)',
    learningObjective: 'Daily Conversation',
    targetGoal: 'Travel and Overseas Everyday Communication',
    level: 'A2 Pre-Intermediate',
    memberSince: 'September 2025',
  },
  'Mika Kobayashi': {
    firstName: 'Mika',
    lastName: 'Kobayashi',
    romaji: 'Mika Kobayashi',
    gender: 'Female',
    birthDate: 'February 1995',
    email: 'mika.koba@example.jp',
    googleAccount: 'mika.koba@gmail.com',
    timezone: 'Europe/London (GMT)',
    learningObjective: 'Exam Preparation',
    targetGoal: 'IELTS Academic Target Band 7.5',
    level: 'B2 Upper-Intermediate',
    memberSince: 'November 2024',
  },
  'Shigeko Kimura': {
    firstName: 'Shigeko',
    lastName: 'Kimura',
    romaji: 'Shigeko Kimura',
    gender: 'Female',
    birthDate: 'July 1979',
    email: 'shigeko.kimura@example.com',
    googleAccount: 'shigeko.kimura@gmail.com',
    timezone: 'Asia/Tokyo (JST)',
    learningObjective: 'Personal / Travel',
    targetGoal: 'Everyday Travel Fluency',
    level: 'B1 Intermediate',
    memberSince: 'June 2024',
  },
  'Mina Mori': {
    firstName: 'Mina',
    lastName: 'Mori',
    romaji: 'Mina Mori',
    gender: 'Female',
    birthDate: 'June 1984',
    email: 'mina.mori@example.com',
    googleAccount: 'mina.mori@gmail.com',
    timezone: 'Asia/Tokyo (JST)',
    learningObjective: 'Business English',
    targetGoal: 'Presentations & Executive Meetings',
    level: 'B2 Upper-Intermediate',
    memberSince: 'April 2024',
  },
};

/** Generic details for a student the map above does not know. */
const fallbackProfile = {
  gender: 'Unspecified',
  birthDate: 'June 1992',
  email: 'student@example.com',
  googleAccount: 'student@gmail.com',
  timezone: 'Asia/Tokyo (JST)',
  learningObjective: 'General Conversation',
  targetGoal: 'Improve Speaking & Vocabulary',
  level: 'B1 Intermediate',
  memberSince: 'January 2025',
};

/** Profile details: the map above for what the school record lacks, the
 *  record itself for name, level and timezone. */
const studentProfile = computed(() => {
  if (!props.student) return {};
  const name = studentName.value || 'Student Name';
  const parts = name.split(' ');
  return {
    ...fallbackProfile,
    ...(studentProfilesMap[name] ?? {}),
    firstName: parts[0] || 'Student',
    lastName: parts.slice(1).join(' '),
    romaji: name,
    ...(record.value.timezone ? { timezone: record.value.timezone } : {}),
    ...(record.value.level ? { level: record.value.level } : {}),
  };
});

const LOG_STATUS = { completed: 'Completed', 'no-show': 'No show (student)', cancelled: 'Cancelled' };

// Every lesson the student has had, with any instructor, newest first.
const studentLogs = computed(() => {
  if (!props.student) return [];
  const now = school.now;
  return school.lessonsForStudent(studentId.value)
    .filter((l) => LOG_STATUS[l.status] && minutesUntil(l.start, now) <= 0)
    .reverse()
    .map((l) => ({
      id: l.id,
      dateManila: stampIn(l.start, MANILA),
      instructorName: school.teacher(l.teacherId).name,
      subject: l.subject,
      status: l.status,
      statusLabel: LOG_STATUS[l.status],
      feedback: l.status === 'cancelled' ? (l.cancelReason || '') : l.feedback,
    }));
});

const filteredLogs = computed(() => {
  return studentLogs.value.filter((log) => {
    const matchTeacher = !logTeacherFilter.value.trim() ||
      (log.instructorName || '').toLowerCase().includes(logTeacherFilter.value.toLowerCase().trim());
    const matchSubject = !logSubjectFilter.value.trim() ||
      (log.subject || '').toLowerCase().includes(logSubjectFilter.value.toLowerCase().trim());
    return matchTeacher && matchSubject;
  });
});

// The student's booked lessons, with every instructor, soonest first.
const studentReservations = computed(() => {
  if (!props.student) return [];
  const tz = record.value.timezone;
  return school.lessonsForStudent(studentId.value)
    .filter((l) => l.status === 'booked')
    .map((l) => ({
      id: l.id,
      startManila: stampIn(l.start, MANILA),
      startStudent: `${stampIn(l.start, tz)} ${utcLabel(tz)}`,
      instructorName: school.teacher(l.teacherId).name,
      subject: l.subject,
      topic: l.topic,
      note: l.note,
    }));
});
</script>

<style scoped>
/* Five tabs fit the modal's width; on a narrower screen the row still
   scrolls sideways, but without a visible scrollbar under the tabs. */
.tab-row {
  scrollbar-width: none;
}
.tab-row::-webkit-scrollbar {
  display: none;
}

/* Tab, 184 x 36, with a 16px slope on each side: each edge flares out flat
   along the bottom and rounds over into the top. */
.folder-tab {
  clip-path: path('M0 36 Q8 36 10 28 L15 8 Q17 0 25 0 L159 0 Q167 0 169 8 L174 28 Q176 36 184 36 Z');
}
</style>
