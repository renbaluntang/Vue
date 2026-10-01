<template>
  <div
    class="h-full flex flex-col bg-white overflow-hidden select-none font-sans"
    @mouseup="handleGlobalMouseUp"
    @mousemove="handleGlobalMouseMove"
  >
    <!-- Top Google Calendar Header Bar -->
    <header class="h-16 px-4 sm:px-6 border-b border-slate-200 flex items-center justify-between gap-3 bg-white shrink-0">
      <!-- Left: Navigation & Current Date Label -->
      <div class="flex items-center gap-3 sm:gap-4 min-w-0">
        <!-- Google Calendar Logo / Icon badge -->
        <div class="flex items-center gap-2.5 mr-1">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
            <span class="text-xs font-black uppercase tracking-tighter">{{ gcalDateBadge }}</span>
          </div>
          <div class="hidden sm:block">
            <h2 class="text-base font-black text-slate-900 leading-tight">Calendar</h2>
            <p class="text-[11px] font-semibold text-slate-400 leading-none">Schedule & Time</p>
          </div>
        </div>

        <!-- Today button -->
        <button
          type="button"
          @click="goToToday"
          class="px-3.5 py-1.5 rounded-full border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition active:scale-95 shadow-2xs cursor-pointer"
        >
          Today
        </button>

        <!-- Prev / Next arrows -->
        <div class="flex items-center">
          <button
            type="button"
            @click="navigatePeriod(-1)"
            class="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
            title="Previous"
          >
            <i class="fa-solid fa-chevron-left text-xs"></i>
          </button>
          <button
            type="button"
            @click="navigatePeriod(1)"
            class="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition cursor-pointer"
            title="Next"
          >
            <i class="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>

        <!-- Current Range Title -->
        <h3 class="text-base sm:text-lg font-bold text-slate-800 tracking-tight truncate ml-1">
          {{ periodTitle }}
        </h3>
      </div>

      <!-- Right: View Switcher, Create Event, Timezone Indicator -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <!-- Quick Drag Tip Pill -->
        <div class="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-xs font-bold text-blue-800">
          <i class="fa-solid fa-arrows-up-down text-[11px] text-blue-600"></i>
          <span>Click & drag across multiple slots to select</span>
        </div>

        <!-- Quick Stats Pill -->
        <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-600">
          <span class="inline-flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span class="text-slate-900">{{ teacher.openHours }}h</span> open
          </span>
          <span class="h-3 w-px bg-slate-200"></span>
          <span class="inline-flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-indigo-600"></span>
            <span class="text-slate-900">{{ teacher.reservedHours }}h</span> reserve
          </span>
        </div>

        <!-- Google Calendar View Mode Selector -->
        <div class="relative">
          <button
            type="button"
            @click="isViewMenuOpen = !isViewMenuOpen"
            class="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
          >
            <span>{{ viewModeLabels[currentView] }}</span>
            <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 transition" :class="{ 'rotate-180': isViewMenuOpen }"></i>
          </button>

          <div
            v-if="isViewMenuOpen"
            class="fixed inset-0 z-30"
            @click="isViewMenuOpen = false"
          ></div>

          <div
            v-if="isViewMenuOpen"
            class="absolute right-0 top-full mt-1.5 z-40 w-36 rounded-xl border border-slate-200 bg-white p-1 shadow-xl ring-1 ring-black/5 text-xs font-bold"
          >
            <button
              v-for="(label, mode) in viewModeLabels"
              :key="mode"
              type="button"
              @click="currentView = mode; isViewMenuOpen = false"
              class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition hover:bg-slate-100 cursor-pointer"
              :class="currentView === mode ? 'text-blue-600 font-black bg-blue-50/60' : 'text-slate-700'"
            >
              <span>{{ label }}</span>
              <i v-if="currentView === mode" class="fa-solid fa-check text-[10px]"></i>
            </button>
          </div>
        </div>

        <!-- "+ Create" Button -->
        <button
          type="button"
          @click="openCreateModal()"
          class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-md hover:shadow-lg border border-slate-200/80 transition-all active:scale-95 cursor-pointer"
        >
          <svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          <span class="hidden sm:inline">Create</span>
        </button>
      </div>
    </header>

    <!-- Main Workspace -->
    <div class="flex-1 flex min-h-0 bg-white overflow-hidden">
      <!-- Left Mini Calendar Sidebar -->
      <aside class="hidden xl:flex w-64 flex-col border-r border-slate-200 p-4 shrink-0 overflow-y-auto space-y-5">
        <!-- Floating + Create Action Button -->
        <button
          type="button"
          @click="openCreateModal()"
          class="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-black text-sm shadow-md hover:shadow-lg border border-slate-200 transition-all active:scale-98 group cursor-pointer"
        >
          <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs shadow-xs group-hover:rotate-90 transition-transform">
            <i class="fa-solid fa-plus"></i>
          </div>
          <span>Create Schedule</span>
        </button>

        <!-- Mini Month Calendar Picker -->
        <div class="bg-white rounded-2xl border border-slate-100 p-3 shadow-2xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-extrabold text-slate-800">{{ miniMonthTitle }}</span>
            <div class="flex items-center gap-1">
              <button
                type="button"
                @click="shiftMiniMonth(-1)"
                class="w-6 h-6 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 text-[10px] cursor-pointer"
              >
                <i class="fa-solid fa-chevron-left"></i>
              </button>
              <button
                type="button"
                @click="shiftMiniMonth(1)"
                class="w-6 h-6 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 text-[10px] cursor-pointer"
              >
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1">
            <span v-for="d in ['S','M','T','W','T','F','S']" :key="d">{{ d }}</span>
          </div>

          <div class="grid grid-cols-7 gap-1 text-center text-xs">
            <button
              v-for="cell in miniMonthDays"
              :key="cell.iso"
              type="button"
              @click="selectMiniDate(cell.dateObj)"
              class="h-7 w-7 mx-auto rounded-full flex items-center justify-center text-[11px] font-semibold transition cursor-pointer"
              :class="[
                cell.isCurrentMonth ? 'text-slate-800' : 'text-slate-300',
                cell.isToday ? 'bg-blue-600 text-white font-black' : '',
                cell.isSelected && !cell.isToday ? 'bg-blue-100 text-blue-800 font-bold' : '',
                !cell.isToday && !cell.isSelected ? 'hover:bg-slate-100' : ''
              ]"
            >
              {{ cell.dayNumber }}
            </button>
          </div>
        </div>

        <!-- The toggle that used to live here decided what a drag would do
             before you made it. Both of its actions are now on the selection
             itself, where the run they apply to is in front of you. -->
        <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
          <h4 class="text-[11px] font-black uppercase tracking-wider text-slate-500">Selecting</h4>
          <p class="text-[11px] text-slate-500 leading-relaxed">
            Drag across the board to select a run of slots — empty, open or
            reserved, and over as many days as you like. Open, reserve or close
            the whole run from the bar that appears. Click a single slot to
            toggle it, or a block to inspect it.
          </p>
        </div>

      </aside>

      <!-- Center Grid View: Week / Day / Month -->
      <main class="flex-1 flex flex-col min-w-0 bg-white overflow-hidden relative">
        <!-- Week / Day View Header -->
        <div v-if="currentView === 'week' || currentView === 'day'" class="border-b border-slate-200 bg-white flex shrink-0 z-10">
          <div class="w-16 sm:w-20 shrink-0 border-r border-slate-200 p-2 text-right">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ activeZoneInfo.abbr }}</span>
          </div>

          <div class="flex-1 grid" :style="{ gridTemplateColumns: `repeat(${viewDays.length}, minmax(0, 1fr))` }">
            <div
              v-for="day in viewDays"
              :key="day.iso"
              class="p-2 sm:p-3 text-center border-r border-slate-200/80 last:border-r-0 transition"
              :class="day.isToday ? 'bg-blue-50/40' : ''"
            >
              <p class="text-[11px] font-bold uppercase tracking-wider" :class="day.isToday ? 'text-blue-600 font-black' : 'text-slate-500'">
                {{ day.dayName }}
              </p>
              <div
                class="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full mt-0.5 text-sm sm:text-base font-black transition"
                :class="day.isToday ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-800 hover:bg-slate-100'"
              >
                {{ day.dayNumber }}
              </div>
            </div>
          </div>
        </div>

        <!-- Week / Day View Timetable Grid (Scrollable & Drag-enabled) -->
        <div
          v-if="currentView === 'week' || currentView === 'day'"
          ref="scrollContainer"
          class="flex-1 overflow-y-auto flex relative custom-scrollbar select-none"
        >
          <!-- Time labels column -->
          <div class="w-16 sm:w-20 shrink-0 border-r border-slate-200 select-none bg-white">
            <div
              v-for="hour in hoursOfDay"
              :key="hour"
              class="h-16 relative border-b border-transparent"
            >
              <span class="absolute -top-2.5 right-2 text-[10px] sm:text-[11px] font-bold text-slate-400 tabular-nums">
                {{ formatHourLabel(hour) }}
              </span>
            </div>
          </div>

          <!-- Days Grid Columns.
               The board is 48 half hours of 32px. The height is stated here as
               well as on the columns because the line overlay below is sized
               against this box: left to stretch, it took the height of the
               window instead of the day, and its 24 hour rows shrank to fit —
               a second set of rules at a pitch of their own, crossing the real
               grid. -->
          <div
            class="flex-1 grid relative h-[1536px]"
            :style="{ gridTemplateColumns: `repeat(${viewDays.length}, minmax(0, 1fr))` }"
          >
            <!-- The grid, drawn once. Every day column shares these lines, so an
                 hour reads straight across the week instead of restarting at
                 each column edge. The hour rule is the darker of the two; the
                 half hour is a hint, not a division. -->
            <div class="absolute inset-0 pointer-events-none flex flex-col">
              <div
                v-for="hour in hoursOfDay"
                :key="`line-${hour}`"
                class="h-16 border-b border-slate-200/70 relative"
              >
                <div class="absolute top-8 inset-x-0 border-b border-slate-100"></div>
              </div>
            </div>

            <!-- Day Columns & Interactive Slots -->
            <div
              v-for="(day, dayIdx) in viewDays"
              :key="day.iso"
              :ref="el => setDayColRef(day.dayKey, el)"
              @mousedown="handleColMouseDown($event)"
              @mousemove="handleColMouseMove(day, $event)"
              @mouseleave="hoveredSlot = null"
              class="relative border-r border-slate-200/80 last:border-r-0 h-[1536px] cursor-crosshair select-none"
              :class="day.isToday ? 'bg-blue-50/15' : ''"
            >
              <!-- Real-time Slot Hover Indicator -->
              <div
                v-if="hoveredSlot && hoveredSlot.dayKey === day.dayKey && !isDragging"
                class="absolute inset-x-1 rounded-md pointer-events-none z-15 border border-indigo-400/80 bg-indigo-50/50 shadow-2xs transition-all duration-75"
                :style="{
                  top: `${hoveredSlot.slotIndex * 32}px`,
                  height: '32px',
                }"
              ></div>

              <!-- Current Time Red Line Indicator (ONLY on current day) -->
              <div
                v-if="day.isToday && currentTimePosition !== null"
                class="absolute inset-x-0 z-30 pointer-events-none flex items-center"
                :style="{ top: `${currentTimePosition}px` }"
              >
                <div class="w-3 h-3 rounded-full bg-red-500 -ml-1.5 shadow-sm ring-2 ring-white"></div>
                <div class="flex-1 border-t-2 border-red-500 shadow-xs"></div>
              </div>

              <!-- Render Events / Availability Blocks overlay on day column -->
              <template v-for="event in getEventsForDay(day)" :key="event.id">
                <div
                  @click.stop="onEventClick(event)"
                  class="absolute inset-x-1 rounded-lg px-2 py-1 overflow-hidden shadow-xs hover:shadow-md hover:ring-2 hover:ring-indigo-400/80 hover:brightness-105 transition-all z-10 text-xs border cursor-pointer"
                  :style="{
                    top: `${event.top}px`,
                    height: `${event.height}px`,
                    backgroundColor: event.bgColor,
                    borderColor: event.borderColor,
                    color: event.textColor,
                  }"
                  :title="`${event.title} • ${event.timeRange} (Click to inspect or drag across to select)`"
                >
                  <!-- Clean title and time badges -->
                  <div class="flex items-center justify-between gap-1 leading-tight h-full pointer-events-none">
                    <span class="font-extrabold uppercase tracking-wide truncate text-[11px]">{{ event.title }}</span>
                    <span class="text-[10px] opacity-90 shrink-0 tabular-nums font-mono font-bold">{{ event.timeRange }}</span>
                  </div>
                </div>
              </template>

              <!-- The sweep, live. Tinted rather than filled: the whole point of
                   dragging across open and held slots is to see which ones you
                   have got hold of, and an opaque box hid exactly that. -->
              <div
                v-if="dragRect && dayIdx >= dragRect.d0 && dayIdx <= dragRect.d1"
                class="absolute inset-x-0.5 rounded-lg z-40 pointer-events-none border-2 border-indigo-500 bg-indigo-500/15 ring-2 ring-indigo-200/70"
                :style="{
                  top: `${dragBoxStyles.top}px`,
                  height: `${dragBoxStyles.height}px`,
                }"
              >
                <span
                  v-if="dayIdx === dragRect.d0"
                  class="absolute -top-2.5 left-1 rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white shadow-sm"
                >
                  {{ dragBoxStyles.timeRange }}
                </span>
              </div>

              <!-- The same run once the mouse is up, waiting on an action. -->
              <div
                v-if="!isDragging && selectionRect && dayIdx >= selectionRect.d0 && dayIdx <= selectionRect.d1"
                class="absolute inset-x-0.5 rounded-lg z-40 pointer-events-none border-2 border-brighture-amber bg-brighture-gold/15 ring-2 ring-brighture-gold/35"
                :style="{
                  top: `${selectionBoxStyles.top}px`,
                  height: `${selectionBoxStyles.height}px`,
                }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Month View -->
        <div v-else-if="currentView === 'month'" class="flex-1 flex flex-col min-h-0 bg-slate-100 gap-px border-b border-slate-200">
          <!-- Month Day Names Header -->
          <div class="grid grid-cols-7 bg-white text-center py-2 border-b border-slate-200 shrink-0 text-xs font-extrabold text-slate-600">
            <span v-for="d in ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']" :key="d">{{ d }}</span>
          </div>

          <!-- Month Days Grid -->
          <div class="flex-1 grid grid-cols-7 grid-rows-5 sm:grid-rows-6 gap-px bg-slate-200 overflow-y-auto">
            <div
              v-for="cell in monthViewDays"
              :key="cell.iso"
              @click="onMonthCellClick(cell)"
              class="bg-white p-1 sm:p-1.5 flex flex-col min-h-[90px] hover:bg-slate-50 cursor-pointer transition relative overflow-hidden"
              :class="cell.isCurrentMonth ? '' : 'bg-slate-50/70 text-slate-400'"
            >
              <div class="flex items-center justify-between mb-1">
                <span
                  class="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold"
                  :class="cell.isToday ? 'bg-blue-600 text-white font-black' : (cell.isCurrentMonth ? 'text-slate-800' : 'text-slate-400')"
                >
                  {{ cell.dayNumber }}
                </span>
                <span v-if="cell.events.length > 0" class="text-[10px] font-black text-slate-400">
                  {{ cell.events.length }}
                </span>
              </div>

              <!-- Month Cell Event Badges -->
              <div class="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                <div
                  v-for="ev in cell.events.slice(0, 3)"
                  :key="ev.id"
                  @click.stop="selectEvent(ev)"
                  class="px-1.5 py-0.5 rounded text-[10px] font-bold truncate leading-tight transition hover:opacity-90 shadow-2xs"
                  :style="{ backgroundColor: ev.bgColor, color: ev.textColor, borderLeft: `3px solid ${ev.borderColor}` }"
                >
                  <span class="font-mono tabular-nums">{{ ev.shortTime }}</span> {{ ev.title }}
                </div>
                <div v-if="cell.events.length > 3" class="text-[9px] font-bold text-slate-500 pl-1">
                  +{{ cell.events.length - 3 }} more
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- What the sweep caught, and what can be done with it. It sits over
             the board rather than in the sidebar so the answer is next to the
             thing it describes, and it is the only place a run of slots is
             acted on — the sweep itself changes nothing. -->
        <!-- Google Calendar Quick Edit Dialog (matches Image 1 light Google Calendar card) -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95"
          leave-active-class="transition duration-100 ease-in"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="selectionSummary"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-2xs"
            @click.self="clearSelection"
          >
            <div
              class="w-full max-w-lg rounded-2xl bg-[#f0f4f9] text-[#1f1f1f] shadow-2xl border border-[#dfe3e7] overflow-visible select-none animate-in fade-in zoom-in-95 duration-150"
              @click.stop
            >
              <!-- Card Top Handle & Close Icon -->
              <div class="flex items-center justify-between px-5 pt-3.5 pb-1 text-[#5f6368]">
                <div class="flex items-center gap-2 text-xs">
                  <span class="text-[11px] font-semibold tracking-wide text-[#444746] uppercase">Edit Selected Schedule</span>
                </div>
                <button
                  type="button"
                  @click="clearSelection"
                  class="flex h-7 w-7 items-center justify-center rounded-full text-[#444746] hover:bg-[#e1e3e1] hover:text-[#1f1f1f] transition"
                  aria-label="Close"
                >
                  <i class="fa-solid fa-xmark text-sm"></i>
                </button>
              </div>

              <!-- Main Content Body -->
              <div class="px-6 py-2.5 space-y-3.5">
                <!-- Title / Reason Input with bottom border indicator (Image 1 style) -->
                <div>
                  <input
                    type="text"
                    v-model="selectionTitle"
                    placeholder="Add title (optional)"
                    class="w-full bg-transparent border-b-2 border-[#1a73e8] pb-1.5 text-xl font-normal text-[#1f1f1f] placeholder-[#747775] focus:outline-none transition-colors"
                  />
                </div>

                <!-- Action Type Pills (Reserve vs Open only, per Image 1 & user request) -->
                <div class="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    @click="selectionAction = 'reserve'"
                    class="rounded-lg px-3.5 py-1.5 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                    :class="selectionAction === 'reserve'
                      ? 'bg-[#c2e7ff] text-[#001d35] font-semibold shadow-xs'
                      : 'bg-white/80 text-[#444746] border border-[#c4c7c5] hover:bg-white hover:text-[#1f1f1f]'"
                  >
                    <i class="fa-solid fa-bookmark text-[10px]" :class="selectionAction === 'reserve' ? 'text-[#001d35]' : 'text-[#747775]'"></i>
                    Reserve Slots
                  </button>

                  <button
                    type="button"
                    @click="selectionAction = 'open'"
                    class="rounded-lg px-3.5 py-1.5 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                    :class="selectionAction === 'open'
                      ? 'bg-[#c4eed0] text-[#072711] font-semibold shadow-xs'
                      : 'bg-white/80 text-[#444746] border border-[#c4c7c5] hover:bg-white hover:text-[#1f1f1f]'"
                  >
                    <i class="fa-regular fa-calendar-check text-[10px]" :class="selectionAction === 'open' ? 'text-[#072711]' : 'text-[#747775]'"></i>
                    Open Availability
                  </button>
                </div>

                <!-- Date & Time Row (Image 1 style with clock icon) -->
                <div class="flex items-start gap-3.5 pt-1">
                  <i class="fa-regular fa-clock text-[#444746] text-base mt-0.5"></i>
                  <div class="space-y-0.5 text-xs">
                    <p class="text-sm font-medium text-[#1f1f1f]">
                      {{ selectionDateText }} &nbsp;·&nbsp;
                      <span class="text-[#0b57d0] font-bold">{{ selectionSummary.timeRange }}</span>
                    </p>
                    <p class="text-[11px] text-[#5f6368] flex items-center gap-1 flex-wrap">
                      <span>{{ activeZoneInfo.abbr }} ({{ activeZoneInfo.label }})</span>
                      <span>·</span>
                      <span class="text-[#1f1f1f] font-medium">{{ selectionSummary.slots }} slots ({{ selectionSummary.hoursLabel }})</span>
                      <span v-if="selectionSummary.past" class="text-amber-700 font-medium">· {{ selectionSummary.past }} past slots excluded</span>
                    </p>
                  </div>
                </div>

                <!-- Google Calendar-style recurrence dropdown row -->
                <div class="flex items-start gap-3.5 pt-1">
                  <i class="fa-solid fa-arrows-rotate text-[#444746] text-base mt-1.5"></i>
                  <div class="flex-1 text-xs">
                    <!-- Dropdown trigger -->
                    <div class="relative">
                      <button
                        type="button"
                        @click="repeatDropdownOpen = !repeatDropdownOpen"
                        class="flex items-center justify-between w-full max-w-[260px] gap-2 rounded-md border border-[#c4c7c5] bg-white px-3 py-1.5 text-xs font-medium text-[#1f1f1f] hover:bg-[#f3f4f6] transition cursor-pointer"
                      >
                        <span>{{ repeatDropdownLabel }}</span>
                        <i class="fa-solid fa-chevron-down text-[10px] text-[#747775]"></i>
                      </button>

                      <!-- Dropdown menu -->
                      <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 -translate-y-1" leave-active-class="transition duration-75 ease-in" leave-to-class="opacity-0 -translate-y-1">
                        <div
                          v-if="repeatDropdownOpen"
                          class="absolute left-0 top-full mt-1 z-20 w-56 rounded-lg border border-[#e0e0e0] bg-white shadow-xl py-1 text-sm text-[#1f1f1f]"
                        >
                          <button
                            v-for="opt in repeatPresetOptions"
                            :key="opt.value"
                            type="button"
                            @click="selectRepeatPreset(opt.value)"
                            class="w-full text-left px-4 py-2 hover:bg-[#f3f4f6] transition cursor-pointer"
                            :class="repeatPreset === opt.value ? 'bg-[#e8f0fe] font-medium text-[#1a73e8]' : ''"
                          >
                            {{ opt.label }}
                          </button>
                          <div class="border-t border-[#e0e0e0] mt-1 pt-1">
                            <button
                              type="button"
                              @click="openCustomRecurrence"
                              class="w-full text-left px-4 py-2 hover:bg-[#f3f4f6] transition cursor-pointer"
                              :class="repeatPreset === 'custom' ? 'bg-[#e8f0fe] font-medium text-[#1a73e8]' : ''"
                            >
                              Custom...
                            </button>
                          </div>
                        </div>
                      </Transition>
                    </div>

                    <!-- Summary text -->
                    <p class="text-[11px] text-[#5f6368] italic mt-1.5">{{ repeatSummaryStatement }}</p>
                  </div>
                </div>

                <!-- Custom Recurrence Modal (inline overlay) -->
                <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 scale-95" leave-active-class="transition duration-100 ease-in" leave-to-class="opacity-0 scale-95">
                  <div
                    v-if="showCustomRecurrence"
                    class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40"
                    @click.self="showCustomRecurrence = false"
                  >
                    <div class="w-full max-w-[340px] rounded-[28px] bg-[#edf2f8] shadow-2xl p-6 space-y-6 text-[#1f1f1f]" @click.stop>
                      <h3 class="text-[22px] font-normal text-[#1f1f1f] tracking-tight">Custom recurrence</h3>

                      <!-- Repeat every N [unit] -->
                      <div class="flex items-center gap-3 text-sm">
                        <span class="text-[#444746] whitespace-nowrap">Repeat every</span>
                        
                        <!-- Number stepper box -->
                        <div class="flex items-center bg-[#dfe4ea] hover:bg-[#d5dbe2] transition rounded-md px-2 py-1.5 gap-2">
                          <input
                            type="number"
                            v-model.number="customEvery"
                            min="1" max="99"
                            class="w-7 text-center text-sm font-medium bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <div class="flex flex-col text-[8px] text-[#444746] leading-none gap-0.5">
                            <button type="button" @click="customEvery = Math.min(99, customEvery + 1)" class="hover:text-black cursor-pointer">▲</button>
                            <button type="button" @click="customEvery = Math.max(1, customEvery - 1)" class="hover:text-black cursor-pointer">▼</button>
                          </div>
                        </div>

                        <!-- Unit dropdown -->
                        <div class="relative inline-flex items-center">
                          <select
                            v-model="customUnit"
                            class="appearance-none bg-[#dfe4ea] hover:bg-[#d5dbe2] transition rounded-md pl-3 pr-7 py-1.5 text-sm text-[#1f1f1f] focus:outline-none cursor-pointer"
                          >
                            <option value="day">day</option>
                            <option value="week">week</option>
                            <option value="month">month</option>
                          </select>
                          <i class="fa-solid fa-caret-down text-[10px] text-[#444746] absolute right-2.5 pointer-events-none"></i>
                        </div>
                      </div>

                      <!-- Repeat on (day chips) — only when weekly -->
                      <div v-if="customUnit === 'week'" class="space-y-3">
                        <div class="text-sm text-[#444746]">Repeat on</div>
                        <div class="flex items-center justify-between">
                          <button
                            v-for="d in repeatDayOptions"
                            :key="d.key"
                            type="button"
                            @click="toggleRepeatDay(d.key)"
                            class="w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center transition cursor-pointer select-none"
                            :class="repeatDays.includes(d.key)
                              ? 'bg-[#0b57d0] text-white shadow-xs'
                              : 'bg-[#dfe4ea] text-[#0b57d0] hover:bg-[#d2d8e0]'"
                          >
                            {{ d.label }}
                          </button>
                        </div>
                      </div>

                      <!-- Ends -->
                      <div class="space-y-3">
                        <div class="text-sm text-[#444746]">Ends</div>
                        <div class="space-y-3 text-sm">
                          <!-- Never -->
                          <label class="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="radio"
                              v-model="customEnds"
                              value="never"
                              class="w-4 h-4 text-[#0b57d0] accent-[#0b57d0] cursor-pointer"
                            />
                            <span class="text-[#1f1f1f]">Never</span>
                          </label>

                          <!-- On date -->
                          <label class="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="radio"
                              v-model="customEnds"
                              value="on"
                              class="w-4 h-4 text-[#0b57d0] accent-[#0b57d0] cursor-pointer"
                            />
                            <span class="text-[#1f1f1f] w-8">On</span>
                            <input
                              type="date"
                              v-model="customEndsOn"
                              :disabled="customEnds !== 'on'"
                              class="bg-[#dfe4ea] rounded-md px-3 py-1.5 text-xs text-[#1f1f1f] focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none"
                            />
                          </label>

                          <!-- After N occurrences -->
                          <label class="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="radio"
                              v-model="customEnds"
                              value="after"
                              class="w-4 h-4 text-[#0b57d0] accent-[#0b57d0] cursor-pointer"
                            />
                            <span class="text-[#1f1f1f] w-8">After</span>
                            <div
                              class="flex items-center bg-[#dfe4ea] rounded-md px-2.5 py-1.5 gap-2"
                              :class="customEnds !== 'after' ? 'opacity-40 pointer-events-none' : ''"
                            >
                              <input
                                type="number"
                                v-model.number="customAfterN"
                                min="1" max="999"
                                :disabled="customEnds !== 'after'"
                                class="w-7 text-center text-sm font-medium bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <span class="text-sm text-[#444746]">occurrences</span>
                              <div class="flex flex-col text-[8px] text-[#444746] leading-none gap-0.5">
                                <button type="button" @click="customEnds === 'after' && (customAfterN = Math.min(999, customAfterN + 1))" class="hover:text-black cursor-pointer">▲</button>
                                <button type="button" @click="customEnds === 'after' && (customAfterN = Math.max(1, customAfterN - 1))" class="hover:text-black cursor-pointer">▼</button>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>

                      <!-- Footer Buttons -->
                      <div class="flex items-center justify-end gap-2 pt-3">
                        <button
                          type="button"
                          @click="showCustomRecurrence = false"
                          class="px-5 py-2 text-sm font-medium text-[#0b57d0] hover:bg-[#dfe4ea] rounded-full transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          @click="applyCustomRecurrence"
                          class="px-6 py-2 text-sm font-medium text-white bg-[#0b57d0] hover:bg-[#0842a0] rounded-full shadow-xs transition cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                </Transition>

              </div>

              <!-- Footer with Delete area, Cancel, and Save (Image 1 style) -->
              <div class="flex items-center justify-between border-t border-[#dfe3e7] px-6 py-3 bg-[#e9eef6]">
                <button
                  type="button"
                  @click="deleteSelectionArea"
                  class="cursor-pointer text-xs font-medium text-[#b3261e] hover:text-rose-700 transition flex items-center gap-1.5 hover:underline"
                >
                  <i class="fa-regular fa-trash-can text-[12px]"></i>
                  Delete selected area
                </button>

                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    @click="clearSelection"
                    class="cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium text-[#444746] hover:bg-[#d3e3fd]/40 hover:text-[#1f1f1f] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    @click="saveSelectionAction"
                    class="cursor-pointer rounded-full bg-[#0b57d0] px-5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0842a0] active:scale-95 transition"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </main>
    </div>

    <!-- Event Detail & Inspector Popover Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95"
      leave-active-class="transition duration-150 ease-in" leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="selectedEvent"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        @click="selectedEvent = null"
      >
        <div
          class="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          @click.stop
        >
          <!-- Modal Header Color Strip -->
          <div
            class="p-6 text-white relative"
            :style="{ backgroundColor: selectedEvent.modalHeaderBg || '#2563eb' }"
          >
            <button
              type="button"
              @click="selectedEvent = null"
              class="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition cursor-pointer"
            >
              ✕
            </button>
            <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 mb-2">
              {{ selectedEvent.typeLabel }}
            </span>
            <h3 class="text-xl font-black">{{ selectedEvent.title }}</h3>
            <p class="text-sm font-semibold opacity-90 mt-0.5">
              {{ selectedEvent.fullDateLabel }}
            </p>
          </div>

          <!-- Modal Body Details -->
          <div class="p-6 space-y-4 text-xs font-semibold text-slate-700">
            <div class="flex items-center gap-3">
              <i class="fa-regular fa-clock w-4 text-center text-slate-400 text-sm"></i>
              <div>
                <p class="font-bold text-slate-900 text-sm">{{ selectedEvent.timeRange }}</p>
                <p class="text-slate-500 text-[11px]">Timezone: {{ activeZoneInfo.city }} ({{ activeZoneInfo.abbr }})</p>
              </div>
            </div>

            <div v-if="selectedEvent.studentName" class="flex items-center gap-3">
              <i class="fa-solid fa-user-graduate w-4 text-center text-blue-500 text-sm"></i>
              <div>
                <p class="font-bold text-slate-900">{{ selectedEvent.studentName }}</p>
                <p class="text-slate-500 text-[11px]">Subject: {{ selectedEvent.subject || 'Speech Fluency' }}</p>
              </div>
            </div>

            <div v-if="selectedEvent.reason" class="flex items-center gap-3">
              <i class="fa-solid fa-bookmark w-4 text-center text-indigo-500 text-sm"></i>
              <div>
                <p class="font-bold text-slate-900">Reserved Note / Reason</p>
                <p class="text-slate-600 text-[11px]">{{ selectedEvent.reason }}</p>
              </div>
            </div>

            <div v-if="selectedEvent.meetLink" class="flex items-center gap-3 pt-2">
              <a
                :href="selectedEvent.meetLink"
                target="_blank"
                rel="noopener"
                class="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
              >
                <span>📹</span>
                <span>Join Video Class</span>
              </a>
            </div>

            <!-- Actions: Toggle Open/Close or Delete -->
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                v-if="selectedEvent.canDelete"
                type="button"
                @click="deleteEvent(selectedEvent)"
                class="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <i class="fa-regular fa-trash-can"></i>
                <span>Remove Slot</span>
              </button>
              <div v-else></div>

              <button
                type="button"
                @click="selectedEvent = null"
                class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Create / Reserve Slot Modal with Dragged Initial Values -->
    <ReserveModal
      :is-open="isCreateModalOpen"
      :initial-days="modalInitialDays"
      :initial-start="modalInitialStart"
      :initial-end="modalInitialEnd"
      :initial-reason="modalInitialReason"
      @close="isCreateModalOpen = false"
      @applied="onCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useTeacherStore } from '@/stores/useTeacherStore';
import { getTimeZoneInfo, normalizeTimeZone } from '@/lib/timezoneUtils';
import ReserveModal from '@/components/teacher/ReserveModal.vue';

const teacher = useTeacherStore();

// Calendar Navigation State
const currentView = ref('week'); // 'day' | 'week' | 'month'
const isViewMenuOpen = ref(false);
const viewModeLabels = {
  day: 'Day',
  week: 'Week',
  month: 'Month',
};

// Anchor Date
const anchorDate = ref(new Date());
const scrollContainer = ref(null);
const selectedEvent = ref(null);

// Modal state
const isCreateModalOpen = ref(false);
const modalInitialDays = ref(['mon', 'tue', 'wed', 'thu', 'fri']);
const modalInitialStart = ref('t1300');
const modalInitialEnd = ref('t1400');
const modalInitialReason = ref('');

/* A sweep is a rectangle over the board — days across, half hours down. Both
   corners are stored as they were pointed at rather than sorted, so a drag up
   or to the left describes the same shape as one down and to the right. */
const isDragging = ref(false);
const dragMoved = ref(false);
const dragSelection = ref(null); // live while the button is down
const selection = ref(null);     // the same rectangle, kept after it comes up
const dayColElements = {};

// Google Calendar Quick Action Card State
const selectionAction = ref('reserve'); // 'reserve' | 'open'
const selectionTitle = ref('');
// The title at the top of the card is the note. There used to be a second
// free-text field below it asking the same question a different way.
const effectiveReserveReason = computed(() => selectionTitle.value.trim());
const repeatDays = ref([]); // list of day keys: ['mon', 'tue', ...]
const isRepeatOpen = ref(false);

// Google Calendar-style repeat dropdown
const repeatDropdownOpen = ref(false);
const repeatPreset = ref('none'); // 'none'|'daily'|'weekly'|'weekday'|'custom'
const showCustomRecurrence = ref(false);
// Custom recurrence state
const customEvery = ref(1);
const customUnit = ref('week'); // 'day'|'week'|'month'
const customEnds = ref('never'); // 'never'|'on'|'after'
const customEndsOn = ref('');
const customAfterN = ref(13);

const repeatDayOrderedKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

// Hours of day: 0 to 23
const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);

const formatHourLabel = (hour) => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
};

const formatSlotTime = (slotIndex) => {
  const hour = Math.floor(slotIndex / 2);
  const min = (slotIndex % 2) * 30;
  return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
};

// Date math utilities
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isoDate = (d) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Days for Week / Day view
const viewDays = computed(() => {
  if (currentView.value === 'day') {
    const d = anchorDate.value;
    const todayIso = isoDate(new Date());
    const thisIso = isoDate(d);
    return [{
      dateObj: d,
      iso: thisIso,
      dayName: DAY_NAMES[d.getDay()],
      dayKey: DAY_KEYS[d.getDay()],
      dayNumber: d.getDate(),
      isToday: thisIso === todayIso,
    }];
  }

  const start = getStartOfWeek(anchorDate.value);
  const todayIso = isoDate(new Date());

  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i);
    const thisIso = isoDate(d);
    return {
      dateObj: d,
      iso: thisIso,
      dayName: DAY_NAMES[d.getDay()],
      dayKey: DAY_KEYS[d.getDay()],
      dayNumber: d.getDate(),
      isToday: thisIso === todayIso,
    };
  });
});

const rectOf = (sel) => (sel
  ? {
      d0: Math.min(sel.fromDay, sel.toDay),
      d1: Math.max(sel.fromDay, sel.toDay),
      s0: Math.min(sel.fromSlot, sel.toSlot),
      s1: Math.max(sel.fromSlot, sel.toSlot),
    }
  : null);

const dragRect = computed(() => rectOf(dragSelection.value));
const selectionRect = computed(() => rectOf(selection.value));

const repeatPresetOptions = computed(() => {
  const r = selectionRect.value;
  let dayName = 'Monday';
  if (r && viewDays.value && viewDays.value[r.d0]) {
    const dayItem = viewDays.value[r.d0];
    if (dayItem.dateObj instanceof Date) {
      dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dayItem.dateObj.getDay()];
    } else if (dayItem.dayName) {
      dayName = dayItem.dayName;
    }
  }
  return [
    { value: 'none', label: 'Does not repeat' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: `Weekly on ${dayName}` },
    { value: 'weekday', label: 'Every weekday (Monday to Friday)' },
  ];
});

const repeatDropdownLabel = computed(() => {
  if (repeatPreset.value === 'none') return 'Does not repeat';
  if (repeatPreset.value === 'daily') return 'Daily';
  if (repeatPreset.value === 'weekday') return 'Every weekday (Monday to Friday)';
  if (repeatPreset.value === 'weekly') {
    const opt = repeatPresetOptions.value.find(o => o.value === 'weekly');
    return opt ? opt.label : 'Weekly';
  }
  if (repeatPreset.value === 'custom') {
    const unitLabel = customEvery.value === 1 ? customUnit.value : `${customUnit.value}s`;
    if (customUnit.value === 'week' && repeatDays.value.length > 0) {
      const dayNameMap = { mon: 'Mo', tue: 'Tu', wed: 'We', thu: 'Th', fri: 'Fr', sat: 'Sa', sun: 'Su' };
      const dayStr = repeatDayOrderedKeys.filter(k => repeatDays.value.includes(k)).map(k => dayNameMap[k]).join(', ');
      return `Every ${customEvery.value} ${unitLabel} on ${dayStr}`;
    }
    return `Every ${customEvery.value} ${unitLabel}`;
  }
  return 'Does not repeat';
});

const repeatDayOptions = [
  { key: 'sun', label: 'S', fullLabel: 'Sun' },
  { key: 'mon', label: 'M', fullLabel: 'Mon' },
  { key: 'tue', label: 'T', fullLabel: 'Tue' },
  { key: 'wed', label: 'W', fullLabel: 'Wed' },
  { key: 'thu', label: 'T', fullLabel: 'Thu' },
  { key: 'fri', label: 'F', fullLabel: 'Fri' },
  { key: 'sat', label: 'S', fullLabel: 'Sat' },
];

const setDayColRef = (key, el) => {
  if (el) dayColElements[key] = el;
};

// Active Timezone Info
const activeZoneId = computed(() => normalizeTimeZone(teacher.viewTimezone || teacher.profile.timezone));
const activeZoneInfo = computed(() => getTimeZoneInfo(activeZoneId.value));

// Today badge for logo
const gcalDateBadge = computed(() => {
  return String(new Date().getDate());
});

// Range Title
const periodTitle = computed(() => {
  if (currentView.value === 'month') {
    return `${MONTH_NAMES[anchorDate.value.getMonth()]} ${anchorDate.value.getFullYear()}`;
  }
  if (currentView.value === 'day') {
    const d = anchorDate.value;
    return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }
  const days = viewDays.value;
  if (!days.length) return '';
  const first = days[0].dateObj;
  const last = days[6].dateObj;

  if (first.getMonth() === last.getMonth()) {
    return `${MONTH_NAMES[first.getMonth()].slice(0, 3)} ${first.getDate()} – ${last.getDate()}, ${first.getFullYear()}`;
  }
  return `${MONTH_NAMES[first.getMonth()].slice(0, 3)} ${first.getDate()} – ${MONTH_NAMES[last.getMonth()].slice(0, 3)} ${last.getDate()}, ${last.getFullYear()}`;
});

// Mini Month Calendar
const miniMonthAnchor = ref(new Date());
const miniMonthTitle = computed(() => {
  return `${MONTH_NAMES[miniMonthAnchor.value.getMonth()]} ${miniMonthAnchor.value.getFullYear()}`;
});

const shiftMiniMonth = (delta) => {
  const d = new Date(miniMonthAnchor.value);
  d.setMonth(d.getMonth() + delta);
  miniMonthAnchor.value = d;
};

const selectMiniDate = (dateObj) => {
  anchorDate.value = new Date(dateObj);
  teacher.goToWeek(isoDate(dateObj));
};

const miniMonthDays = computed(() => {
  const d = miniMonthAnchor.value;
  const year = d.getFullYear();
  const month = d.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay();

  const startDate = addDays(firstDay, -startDayOfWeek);
  const todayIso = isoDate(new Date());
  const selectedIso = isoDate(anchorDate.value);

  return Array.from({ length: 35 }, (_, i) => {
    const cellDate = addDays(startDate, i);
    const cellIso = isoDate(cellDate);
    return {
      dateObj: cellDate,
      iso: cellIso,
      dayNumber: cellDate.getDate(),
      isCurrentMonth: cellDate.getMonth() === month,
      isToday: cellIso === todayIso,
      isSelected: cellIso === selectedIso,
    };
  });
});

// Month View Grid
const monthViewDays = computed(() => {
  const d = anchorDate.value;
  const year = d.getFullYear();
  const month = d.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay();
  const startDate = addDays(firstDay, -startDayOfWeek);
  const todayIso = isoDate(new Date());

  return Array.from({ length: 35 }, (_, i) => {
    const cellDate = addDays(startDate, i);
    const cellIso = isoDate(cellDate);
    const dayKey = DAY_KEYS[cellDate.getDay()];

    const events = [];
    
    teacher.reservations.forEach(r => {
      events.push({
        id: `r-${r.id}-${cellIso}`,
        title: 'reserve',
        shortTime: r.rangeManila.split('–')[0].trim(),
        bgColor: '#eef2ff',
        textColor: '#3730a3',
        borderColor: '#6366f1',
        modalHeaderBg: '#4f46e5',
        typeLabel: 'Reserve',
        studentName: r.studentName,
        subject: r.subject,
        meetLink: r.meetLink,
        timeRange: r.rangeManila,
        fullDateLabel: cellIso,
      });
    });

    return {
      dateObj: cellDate,
      iso: cellIso,
      dayKey,
      dayNumber: cellDate.getDate(),
      isCurrentMonth: cellDate.getMonth() === month,
      isToday: cellIso === todayIso,
      events: events.slice(0, 4),
    };
  });
});

// A rectangle's box on a column: half hours are 32px, whichever day it is.
const boxOf = (r) => (r
  ? { top: r.s0 * 32, height: (r.s1 - r.s0 + 1) * 32 - 2 }
  : { top: 0, height: 0 });

const dragBoxStyles = computed(() => {
  const r = dragRect.value;
  if (!r) return { top: 0, height: 0, timeRange: '' };
  return { ...boxOf(r), timeRange: `${formatSlotTime(r.s0)} – ${formatSlotTime(r.s1 + 1)}` };
});

const selectionBoxStyles = computed(() => boxOf(selectionRect.value));

/* Which cell the pointer is over, anywhere on the board rather than inside one
   column. A sweep that leaves the day it started in keeps following the mouse,
   which is what makes a run across several days possible at all. */
const pointToCell = (e) => {
  const days = viewDays.value;
  const first = days.length ? dayColElements[days[0].dayKey] : null;
  if (!first) return null;

  const top = first.getBoundingClientRect().top;
  let dayIdx = 0;
  days.forEach((d, i) => {
    const el = dayColElements[d.dayKey];
    if (el && e.clientX >= el.getBoundingClientRect().left) dayIdx = i;
  });

  const slot = Math.min(47, Math.max(0, Math.floor((e.clientY - top) / 32)));
  return { dayIdx, slot };
};

// Accurate Slot Index from Mouse Y Coordinate
const getSlotIndexFromMouseEvent = (e, dayKey) => {
  const colEl = dayColElements[dayKey];
  if (!colEl) return 0;
  const rect = colEl.getBoundingClientRect();
  const offsetY = e.clientY - rect.top;
  const clampedY = Math.max(0, Math.min(rect.height - 1, offsetY));
  return Math.min(47, Math.max(0, Math.floor(clampedY / 32)));
};

const hoveredSlot = ref(null);
const handleColMouseMove = (day, e) => {
  if (isDragging.value) {
    hoveredSlot.value = null;
    return;
  }
  const slotIndex = getSlotIndexFromMouseEvent(e, day.dayKey);
  hoveredSlot.value = { dayKey: day.dayKey, slotIndex };
};

// Mouse Down on Day Column
const handleColMouseDown = (e) => {
  if (e.button !== 0) return; // Only left click
  hoveredSlot.value = null;
  const cell = pointToCell(e);
  if (!cell) return;
  isDragging.value = true;
  dragMoved.value = false;
  dragSelection.value = {
    fromDay: cell.dayIdx,
    fromSlot: cell.slot,
    toDay: cell.dayIdx,
    toSlot: cell.slot,
  };
};

// Global Mouse Move for Smooth Drag Across Grid
const handleGlobalMouseMove = (e) => {
  if (!isDragging.value || !dragSelection.value) return;
  const cell = pointToCell(e);
  if (!cell) return;
  const sel = dragSelection.value;
  if (cell.dayIdx !== sel.toDay || cell.slot !== sel.toSlot) {
    sel.toDay = cell.dayIdx;
    sel.toSlot = cell.slot;
    dragMoved.value = true;
  }
};

/* Mouse up. A sweep leaves a selection behind instead of acting on the spot:
   the slots it covers may be empty, open or held, and which of those was meant
   is a question the board cannot answer on the instructor's behalf. A press
   that never moved is still the old single-slot toggle. */
const handleGlobalMouseUp = () => {
  if (!isDragging.value || !dragSelection.value) return;

  const swept = dragSelection.value;
  isDragging.value = false;

  if (dragMoved.value) {
    selection.value = { ...swept };
  } else {
    selection.value = null;
    const day = viewDays.value[swept.fromDay];
    const slotKey = teacher.scheduleSlots[swept.fromSlot]?.key;
    if (day && slotKey) {
      const current = teacher.getSlotStatus(day.dayKey, slotKey);
      if (current === 'closed') {
        teacher.setSlotStatus(day.dayKey, slotKey, 'open');
      } else if (current === 'open') {
        teacher.setSlotStatus(day.dayKey, slotKey, 'closed');
      }
    }
  }

  dragSelection.value = null;
  setTimeout(() => {
    dragMoved.value = false;
  }, 60);
};

/* Walks the selection. Hours already gone are left in — the store refuses them
   on its own, in one place, so every path here obeys the same rule. */
const eachSelectedSlot = (fn) => {
  const r = selectionRect.value;
  if (!r) return;
  for (let d = r.d0; d <= r.d1; d += 1) {
    const day = viewDays.value[d];
    if (!day) continue;
    for (let sl = r.s0; sl <= r.s1; sl += 1) {
      const slotKey = teacher.scheduleSlots[sl]?.key;
      if (slotKey) fn(day.dayKey, slotKey);
    }
  }
};

const selectionSummary = computed(() => {
  const r = selectionRect.value;
  if (!r) return null;

  const days = viewDays.value.slice(r.d0, r.d1 + 1);
  let open = 0;
  let reserved = 0;
  let closed = 0;
  let past = 0;

  days.forEach((day) => {
    for (let sl = r.s0; sl <= r.s1; sl += 1) {
      const slotKey = teacher.scheduleSlots[sl]?.key;
      if (!slotKey) continue;
      if (teacher.isPastSlot(day.dayKey, slotKey)) {
        past += 1;
      } else if (teacher.getSlotStatus(day.dayKey, slotKey) === 'open') {
        open += 1;
      } else if (teacher.getSlotStatus(day.dayKey, slotKey) === 'reserved') {
        reserved += 1;
      } else {
        closed += 1;
      }
    }
  });

  const slots = open + reserved + closed;
  const hours = slots / 2;
  const dayLabel = days.length === 1
    ? days[0].dayName
    : `${days[0].dayName}–${days[days.length - 1].dayName}`;

  return {
    slots,
    past,
    open,
    reserved,
    closed,
    dayLabel,
    hoursLabel: `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`,
    timeRange: `${formatSlotTime(r.s0)} – ${formatSlotTime(r.s1 + 1)}`,
  };
});

const clearSelection = () => {
  selection.value = null;
};

// Selection Detailed Formatted Date
const selectionDateText = computed(() => {
  const r = selectionRect.value;
  if (!r) return '';
  const days = viewDays.value.slice(r.d0, r.d1 + 1);
  if (days.length === 1) {
    const d = days[0].dateObj;
    const fullDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
    return `${fullDay}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
  }
  const first = days[0].dateObj;
  const last = days[days.length - 1].dateObj;
  return `${MONTH_NAMES[first.getMonth()].slice(0, 3)} ${first.getDate()} – ${MONTH_NAMES[last.getMonth()].slice(0, 3)} ${last.getDate()}`;
});

// Selection Recurrence Statement
const repeatSummaryStatement = computed(() => {
  if (repeatPreset.value === 'none') return 'Does not repeat';
  if (repeatPreset.value === 'daily') return 'Applied to every day of the week';
  if (repeatPreset.value === 'weekday') return 'Applied every weekday — Monday to Friday';
  if (repeatPreset.value === 'weekly') {
    const opt = repeatPresetOptions.value.find(o => o.value === 'weekly');
    return opt ? `Applied ${opt.label.toLowerCase()}` : 'Applied weekly';
  }
  if (repeatPreset.value === 'custom') return repeatDropdownLabel.value;
  return '';
});

const toggleRepeatDay = (dayKey) => {
  const idx = repeatDays.value.indexOf(dayKey);
  if (idx > -1) {
    repeatDays.value.splice(idx, 1);
  } else {
    repeatDays.value.push(dayKey);
  }
};

const selectRepeatPreset = (value) => {
  repeatPreset.value = value;
  repeatDropdownOpen.value = false;
  const r = selectionRect.value;
  const sweptKeys = r ? viewDays.value.slice(r.d0, r.d1 + 1).map(d => d.dayKey) : [];
  if (value === 'none') {
    repeatDays.value = sweptKeys;
  } else if (value === 'daily') {
    repeatDays.value = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  } else if (value === 'weekday') {
    repeatDays.value = ['mon', 'tue', 'wed', 'thu', 'fri'];
  } else if (value === 'weekly') {
    const r2 = selectionRect.value;
    const firstDay = r2 ? viewDays.value[r2.d0] : null;
    repeatDays.value = firstDay ? [firstDay.dayKey] : sweptKeys;
  }
};

const openCustomRecurrence = () => {
  repeatDropdownOpen.value = false;
  // seed day chips from current selection or swept days
  if (repeatDays.value.length === 0) {
    const r = selectionRect.value;
    repeatDays.value = r ? viewDays.value.slice(r.d0, r.d1 + 1).map(d => d.dayKey) : [];
  }
  if (!customEndsOn.value) {
    const r = selectionRect.value;
    const baseDate = r && viewDays.value[r.d0] ? new Date(viewDays.value[r.d0].dateObj) : new Date();
    baseDate.setMonth(baseDate.getMonth() + 3);
    customEndsOn.value = isoDate(baseDate);
  }
  showCustomRecurrence.value = true;
};

const applyCustomRecurrence = () => {
  repeatPreset.value = 'custom';
  if (customUnit.value !== 'week') {
    // for daily/monthly, cover all days
    repeatDays.value = customUnit.value === 'day'
      ? ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
      : repeatDays.value;
  }
  showCustomRecurrence.value = false;
};

/** The days the sweep itself covers — where the chips start from. */
const sweptDayKeys = () => {
  const r = selectionRect.value;
  return r ? viewDays.value.slice(r.d0, r.d1 + 1).map((d) => d.dayKey) : [];
};

/**
 * Closing puts the days back to the ones that were swept, which is the same as
 * not repeating. The panel is the only place a repeat is visible, so one left
 * set behind a closed row would change days the instructor can no longer see.
 */
const toggleRepeatPanel = () => {
  isRepeatOpen.value = !isRepeatOpen.value;
  repeatDays.value = sweptDayKeys();
};

// Initialize form defaults when selection happens
watch(selection, (newVal) => {
  if (newVal) {
    selectionAction.value = 'reserve';
    selectionTitle.value = '';
    isRepeatOpen.value = false;
    repeatPreset.value = 'none';
    repeatDropdownOpen.value = false;
    showCustomRecurrence.value = false;
    customEvery.value = 1;
    customUnit.value = 'week';
    customEnds.value = 'never';
    customAfterN.value = 13;
    repeatDays.value = sweptDayKeys();
  }
});

// Save changes according to selectionAction and repeatDays
const saveSelectionAction = () => {
  const r = selectionRect.value;
  if (!r) return;

  const targetDays = repeatDays.value.length > 0
    ? repeatDays.value
    : viewDays.value.slice(r.d0, r.d1 + 1).map((d) => d.dayKey);

  const status = selectionAction.value === 'reserve' ? 'reserved' : 'open';
  const reason = selectionAction.value === 'reserve' ? effectiveReserveReason.value : '';

  targetDays.forEach((dayKey) => {
    for (let sl = r.s0; sl <= r.s1; sl += 1) {
      const slotKey = teacher.scheduleSlots[sl]?.key;
      if (slotKey) {
        teacher.setSlotStatus(dayKey, slotKey, status, reason);
      }
    }
  });

  clearSelection();
};

// Direct Quick Delete Button
const deleteSelectionArea = () => {
  const r = selectionRect.value;
  if (!r) return;

  const targetDays = repeatDays.value.length > 0
    ? repeatDays.value
    : viewDays.value.slice(r.d0, r.d1 + 1).map((d) => d.dayKey);

  targetDays.forEach((dayKey) => {
    for (let sl = r.s0; sl <= r.s1; sl += 1) {
      const slotKey = teacher.scheduleSlots[sl]?.key;
      if (slotKey) {
        teacher.setSlotStatus(dayKey, slotKey, 'closed');
      }
    }
  });

  clearSelection();
};

const applyToSelection = (status, reason = '') => {
  eachSelectedSlot((dayKey, slotKey) => teacher.setSlotStatus(dayKey, slotKey, status, reason));
  clearSelection();
};

/* Reserving asks for a note, so it hands the range to the modal rather than
   writing it here. The modal reads the end as the last slot's own key. */
const reserveSelection = () => {
  const r = selectionRect.value;
  if (!r) return;
  modalInitialDays.value = viewDays.value.slice(r.d0, r.d1 + 1).map((d) => d.dayKey);
  modalInitialStart.value = teacher.scheduleSlots[r.s0]?.key || 't0900';
  modalInitialEnd.value = teacher.scheduleSlots[r.s1]?.key || 't1000';
  modalInitialReason.value = '';
  isCreateModalOpen.value = true;
};

const onSelectionKeydown = (e) => {
  if (e.key === 'Escape' && selection.value) clearSelection();
};

// A selection names cells on the week in view, so it cannot outlive it.
watch([anchorDate, currentView], clearSelection);

// Real-time Current Red Line Indicator
const currentTimePosition = ref(null);
const updateCurrentTimeLine = () => {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  currentTimePosition.value = (minutes / 30) * 32;
};

let timerId = null;

onMounted(() => {
  updateCurrentTimeLine();
  timerId = setInterval(updateCurrentTimeLine, 60000);
  
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = 512;
    }
  });

  window.addEventListener('mouseup', handleGlobalMouseUp);
  window.addEventListener('mousemove', handleGlobalMouseMove);
  window.addEventListener('keydown', onSelectionKeydown);
});

onUnmounted(() => {
  if (timerId) clearInterval(timerId);
  window.removeEventListener('mouseup', handleGlobalMouseUp);
  window.removeEventListener('mousemove', handleGlobalMouseMove);
  window.removeEventListener('keydown', onSelectionKeydown);
});

// Navigation Functions
const navigatePeriod = (delta) => {
  if (currentView.value === 'day') {
    anchorDate.value = addDays(anchorDate.value, delta);
  } else if (currentView.value === 'week') {
    anchorDate.value = addDays(anchorDate.value, delta * 7);
  } else if (currentView.value === 'month') {
    const d = new Date(anchorDate.value);
    d.setMonth(d.getMonth() + delta);
    anchorDate.value = d;
  }
  teacher.goToWeek(isoDate(anchorDate.value));
};

const goToToday = () => {
  anchorDate.value = new Date();
  miniMonthAnchor.value = new Date();
  teacher.goToThisWeek();
};

// Events calculation for each column in Week/Day view
const getEventsForDay = (day) => {
  const results = [];
  const dayKey = day.dayKey;

  // Availability Slots from Store
  for (let s = 0; s < 48; s++) {
    const slotKey = teacher.scheduleSlots[s]?.key;
    if (!slotKey) continue;

    const status = teacher.getSlotStatus(dayKey, slotKey);
    const top = s * 32;
    const height = 31;
    const timeRange = `${formatSlotTime(s)} – ${formatSlotTime(s + 1)}`;

    if (status === 'open') {
      results.push({
        id: `open-${dayKey}-${slotKey}`,
        dayKey,
        slotKey,
        slotIndex: s,
        top,
        height,
        title: 'open',
        timeRange,
        bgColor: '#ecfdf5',
        borderColor: '#10b981',
        textColor: '#065f46',
        modalHeaderBg: '#059669',
        typeLabel: 'Open',
        fullDateLabel: `${day.dayName}, ${day.iso}`,
        canDelete: true,
      });
    } else if (status === 'reserved') {
      const reason = teacher.getSlotReason(dayKey, slotKey) || 'Reserved Block';
      results.push({
        id: `res-${dayKey}-${slotKey}`,
        dayKey,
        slotKey,
        slotIndex: s,
        top,
        height,
        title: 'reserve',
        reason,
        timeRange,
        bgColor: '#eef2ff',
        borderColor: '#6366f1',
        textColor: '#3730a3',
        modalHeaderBg: '#4f46e5',
        typeLabel: 'Reserve',
        fullDateLabel: `${day.dayName}, ${day.iso}`,
        canDelete: true,
      });
    }
  }

  // Upcoming Student Lessons / Reservations
  teacher.reservations.forEach((r, idx) => {
    if (day.dayKey === 'wed' && idx === 0) {
      results.push({
        id: `booked-${r.id}`,
        slotIndex: 18,
        top: 18 * 32,
        height: 63,
        title: 'reserve',
        subtitle: `${r.subject} • ${r.topic}`,
        timeRange: r.rangeManila,
        studentName: r.studentName,
        subject: r.subject,
        meetLink: r.meetLink,
        bgColor: '#eef2ff',
        borderColor: '#4f46e5',
        textColor: '#312e81',
        modalHeaderBg: '#4338ca',
        typeLabel: 'Reserve',
        fullDateLabel: `${day.dayName}, ${day.iso}`,
        canDelete: false,
      });
    }
  });

  return results;
};

const onEventClick = (event) => {
  if (!dragMoved.value) {
    selectedEvent.value = event;
  }
};

const onMonthCellClick = (cell) => {
  anchorDate.value = new Date(cell.dateObj);
  currentView.value = 'day';
};

const selectEvent = (event) => {
  selectedEvent.value = event;
};

const deleteEvent = (event) => {
  if (event.dayKey && event.slotKey) {
    teacher.setSlotStatus(event.dayKey, event.slotKey, 'closed');
  }
  selectedEvent.value = null;
};

const openCreateModal = () => {
  modalInitialDays.value = ['mon', 'tue', 'wed', 'thu', 'fri'];
  modalInitialStart.value = 't1300';
  modalInitialEnd.value = 't1400';
  modalInitialReason.value = '';
  isCreateModalOpen.value = true;
};

const onCreated = () => {
  isCreateModalOpen.value = false;
  clearSelection();
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
