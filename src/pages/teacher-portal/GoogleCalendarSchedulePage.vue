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

      </div>
    </header>

    <!-- Main Workspace -->
    <div class="flex-1 flex min-h-0 bg-white overflow-hidden">
      <!-- Left Mini Calendar Sidebar -->
      <aside class="hidden xl:flex w-64 flex-col border-r border-slate-200 p-4 shrink-0 overflow-y-auto space-y-5">
        <!-- Floating + Create Action Button -->
        <!-- A template is edited the same way hours are: by sweeping the board.
             The form this used to open asked for the same thing in a worse
             place, and nothing it produced could be seen until it was saved. -->
        <button
          type="button"
          @click="isTemplateOpen = true"
          class="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-black text-sm shadow-md hover:shadow-lg border border-slate-200 transition-all active:scale-98 group cursor-pointer"
        >
          <div class="w-6 h-6 shrink-0 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs shadow-xs group-hover:rotate-90 transition-transform">
            <i class="fa-solid fa-plus"></i>
          </div>
          <span>Create Schedule Template</span>
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
      <main class="flex-1 flex flex-col min-w-0 bg-white overflow-hidden relative pr-2">
        <!-- Week / Day View Header -->
        <!-- The header sits outside the scrolling grid, so a scrollbar takes
             width from the grid and not from here — every column boundary below
             then drifts left, a little at the first day and the full bar's width
             by the last. The same width is reserved here so the two rule sets
             stay on the same vertical lines. It is 0 where scrollbars overlay. -->
        <div
          v-if="currentView === 'week' || currentView === 'day'"
          class="border-b border-slate-200 bg-white flex shrink-0 z-10"
          :style="{ paddingRight: `${gridScrollbarWidth}px` }"
        >
          <div class="w-16 sm:w-20 shrink-0 border-r border-slate-200 p-2 text-right">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ activeZoneInfo.abbr }}</span>
          </div>

          <div class="flex-1 grid" :style="{ gridTemplateColumns: `repeat(${viewDays.length}, minmax(0, 1fr))` }">
            <div
              v-for="day in viewDays"
              :key="day.iso"
              class="p-2 sm:p-3 text-center border-r border-slate-200 transition"
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
              <!-- Every label straddles the rule it names. Midnight has no rule
                   above it to straddle, so the half of it that hung over the top
                   of the board was simply cut off; it sits just below the edge
                   instead. -->
              <span
                class="absolute right-2 text-[10px] sm:text-[11px] font-bold text-slate-400 tabular-nums"
                :class="hour === 0 ? 'top-0.5' : '-top-2.5'"
              >
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
            <!-- The grid, drawn once, and drawn on top.
                 Every day column shares these lines, so an hour reads straight
                 across the week instead of restarting at each column edge. They
                 sit at z-5 — above the past-hours shade, below the blocks —
                 because when they were under it a rule crossing a spent morning
                 came out several shades lighter than the same rule in the
                 header, and the two stopped reading as one line. -->
            <div class="absolute inset-0 z-[5] pointer-events-none flex flex-col">
              <div
                v-for="hour in hoursOfDay"
                :key="`line-${hour}`"
                class="h-16 border-b border-slate-200/70 relative"
              >
                <div class="absolute top-8 inset-x-0 border-b border-slate-100"></div>
              </div>
            </div>

            <!-- The day separators, on the same layer and from the same grid
                 template as the header's, so the two cannot drift apart. -->
            <div
              class="absolute inset-0 z-[5] pointer-events-none grid"
              :style="{ gridTemplateColumns: `repeat(${viewDays.length}, minmax(0, 1fr))` }"
            >
              <div
                v-for="day in viewDays"
                :key="`col-rule-${day.iso}`"
                class="border-r border-slate-200"
              ></div>
            </div>

            <!-- Day Columns & Interactive Slots -->
            <div
              v-for="(day, dayIdx) in viewDays"
              :key="day.iso"
              :ref="el => setDayColRef(day.dayKey, el)"
              @mousedown="handleColMouseDown($event)"
              @mousemove="handleColMouseMove(day, $event)"
              @mouseleave="hoveredSlot = null"
              class="relative h-[1536px] select-none"
              :class="[
                day.isToday ? 'bg-blue-50/15' : '',
                hoverInsideSelection(dayIdx)
                  ? 'cursor-move'
                  : spentSlots(day) >= 48
                    ? 'cursor-default'
                    : 'cursor-crosshair',
              ]"
            >
              <!-- Hours that have already begun. Shaded rather than left bare,
                   because an empty morning and a morning that has gone are not
                   the same thing, and only one of them can still be changed. -->
              <div
                v-if="spentSlots(day) > 0"
                class="absolute inset-x-0 top-0 z-0 pointer-events-none bg-slate-100/55"
                :style="{ height: `${spentSlots(day) * 32}px` }"
              ></div>

              <!-- Real-time Slot Hover Indicator -->
              <div
                v-if="hoveredSlot && hoveredSlot.dayKey === day.dayKey && !isDragging"
                class="absolute inset-x-1 rounded-md pointer-events-none z-[6] border border-indigo-400/80 bg-indigo-50/50 shadow-2xs transition-all duration-75"
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
                  v-if="!liftedOut(dayIdx, event.slotIndex)"
                  @click.stop="onEventClick(event)"
                  :data-locked="event.canDelete ? null : 'true'"
                  class="absolute inset-x-1 rounded-lg px-2 py-1 overflow-hidden shadow-xs transition-all z-10 text-xs border"
                  :class="isSlotEditable(day, event.slotIndex)
                    ? 'hover:shadow-md hover:ring-2 hover:ring-indigo-400/80 hover:brightness-105 cursor-pointer'
                    : 'opacity-45 saturate-50 cursor-default'"
                  :style="{
                    top: `${event.top}px`,
                    height: `${event.height}px`,
                    backgroundColor: event.bgColor,
                    borderColor: event.borderColor,
                    color: event.textColor,
                  }"
                  :title="`${event.title} • ${event.timeRange}`"
                >
                  <!-- A hold with a note is called by its note; without one it
                       falls back to the status word. The time is never dropped,
                       because two identical labels an hour apart are otherwise
                       indistinguishable. -->
                  <div class="flex items-center justify-between gap-1 leading-tight h-full pointer-events-none">
                    <span
                      class="truncate text-[11px]"
                      :class="event.label ? 'font-bold tracking-normal' : 'font-extrabold uppercase tracking-wide'"
                      :title="event.label ? `${event.label} · ${event.timeRange}` : event.title"
                    >{{ event.title }}</span>
                    <!-- A named hold shows only its start time. The full range
                         took more than half the block and left the label as
                         "De…", which is no label at all; the block's position
                         and the hour column already say where it sits. -->
                    <span class="text-[10px] opacity-80 shrink-0 tabular-nums font-mono font-bold">
                      {{ event.label ? event.startTime : event.timeRange }}
                    </span>
                  </div>
                </div>
              </template>

              <!-- The run in hand: the same blocks, at the hours they would
                   land on, lifted off the board with a shadow. -->
              <div
                v-for="blk in carriedBlocks(dayIdx)"
                :key="`carry-${blk.key}`"
                class="pointer-events-none absolute inset-x-1 z-20 flex items-center justify-between gap-1 overflow-hidden rounded-lg border px-2 py-1 text-xs shadow-lg"
                :class="moveBlocked ? 'opacity-50 saturate-50' : ''"
                :style="{
                  top: `${blk.top}px`,
                  height: '31px',
                  backgroundColor: blk.status === 'open' ? '#ecfdf5' : '#eef2ff',
                  borderColor: blk.status === 'open' ? '#10b981' : '#6366f1',
                  color: blk.status === 'open' ? '#065f46' : '#3730a3',
                }"
              >
                <span
                  class="truncate text-[11px]"
                  :class="blk.label ? 'font-bold tracking-normal' : 'font-extrabold uppercase tracking-wide'"
                >{{ blk.label || (blk.status === 'open' ? 'open' : 'reserve') }}</span>
                <span class="shrink-0 font-mono text-[10px] font-bold tabular-nums opacity-80">{{ blk.time }}</span>
              </div>

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
                class="absolute inset-x-0.5 rounded-lg z-40 pointer-events-none border-2 transition-colors"
                :class="isMovingSelection
                  ? (moveBlocked
                      ? 'border-rose-500 bg-rose-500/15 ring-2 ring-rose-300/60'
                      : 'border-brighture-amber bg-brighture-gold/25 ring-2 ring-brighture-gold/50 shadow-lg')
                  : 'border-brighture-amber bg-brighture-gold/15 ring-2 ring-brighture-gold/35'"
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
            v-if="selectionSummary && !isMovingSelection"
            class="pointer-events-none fixed inset-0 z-50"
          >
            <!-- Beside the run, not over the middle of the screen. The card is
                 about hours you are looking at, and a dimmed backdrop both hid
                 them and made the board unreachable — which is no good now that
                 the run itself can be picked up and dragged. -->
            <div
              ref="cardEl"
              class="pointer-events-auto absolute w-[23rem] rounded-2xl bg-[#f0f4f9] text-[#1f1f1f] shadow-2xl border border-[#dfe3e7] overflow-visible select-none animate-in fade-in zoom-in-95 duration-150"
              :style="cardStyle"
              @mousedown.stop
              @click.stop
            >
              <!-- Card Top Handle & Actions (Delete, Close) -->
              <div class="flex items-center justify-between px-5 pt-3.5 pb-2.5 border-b border-slate-200/60 bg-white rounded-t-2xl">
                <div class="flex items-center gap-2">
                  <span class="inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
                  <span class="text-xs font-bold tracking-wider text-slate-700 uppercase">Edit Schedule Slot</span>
                </div>
                <div class="flex items-center gap-1">
                  <!-- Delete / Trash Action at Top -->
                  <button
                    type="button"
                    @click="promptDelete"
                    class="group relative flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                    :title="clearLabel"
                    aria-label="Delete / Clear slot"
                  >
                    <i class="fa-regular fa-trash-can text-[13px]"></i>
                    <span v-if="selectionRepeats" class="absolute -bottom-0.5 right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-rose-100 text-[8px] text-rose-600 ring-1 ring-white">
                      <i class="fa-solid fa-rotate text-[7px]"></i>
                    </span>
                  </button>

                  <!-- Close Button -->
                  <button
                    type="button"
                    @click="clearSelection"
                    class="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                    aria-label="Close"
                  >
                    <i class="fa-solid fa-xmark text-sm"></i>
                  </button>
                </div>
              </div>

              <!-- Main Content Body -->
              <div class="px-5 py-4 space-y-4 bg-white">
                <!-- Action Segmented Control (Open vs Reserve) -->
                <div>
                  <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Availability Status</label>
                  <div
                    role="radiogroup"
                    aria-label="What to do with these slots"
                    class="relative grid grid-cols-2 rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200/80"
                  >
                    <span
                      aria-hidden="true"
                      class="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg shadow-sm transition-[transform,background-color] duration-200 ease-out motion-reduce:transition-none"
                      :class="selectionAction === 'reserve'
                        ? 'translate-x-0 bg-white ring-1 ring-purple-200/70'
                        : 'translate-x-full bg-white ring-1 ring-emerald-200/70'"
                    ></span>

                    <button
                      type="button"
                      role="radio"
                      :aria-checked="selectionAction === 'reserve' ? 'true' : 'false'"
                      @click="selectionAction = 'reserve'"
                      class="relative z-10 flex cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all focus:outline-none"
                      :class="selectionAction === 'reserve' ? 'text-purple-700 font-extrabold' : 'text-slate-500 hover:text-slate-700 font-medium'"
                    >
                      <i class="fa-solid fa-bookmark text-[11px]" :class="selectionAction === 'reserve' ? 'text-purple-600' : 'text-slate-400'"></i>
                      <span>Reserved</span>
                    </button>

                    <button
                      type="button"
                      role="radio"
                      :aria-checked="selectionAction === 'open' ? 'true' : 'false'"
                      @click="selectionAction = 'open'"
                      class="relative z-10 flex cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all focus:outline-none"
                      :class="selectionAction === 'open' ? 'text-emerald-700 font-extrabold' : 'text-slate-500 hover:text-slate-700 font-medium'"
                    >
                      <i class="fa-solid fa-circle-check text-[12px]" :class="selectionAction === 'open' ? 'text-emerald-600' : 'text-slate-400'"></i>
                      <span>Open</span>
                    </button>
                  </div>
                </div>

                <!-- Title / Reason input for Reserved -->
                <div v-if="selectionAction === 'reserve'" class="pt-0.5">
                  <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Reservation Note / Title</label>
                  <input
                    type="text"
                    v-model="selectionTitle"
                    placeholder="e.g. Office Hours, Meeting, Private Lesson"
                    class="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
                  />
                </div>

                <!-- Date & Time Box -->
                <div class="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-slate-50/70 p-3">
                  <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <i class="fa-regular fa-clock text-sm"></i>
                  </div>
                  <div class="min-w-0 flex-1 space-y-0.5">
                    <div class="flex items-center justify-between gap-2">
                      <p class="text-xs font-bold text-slate-900 leading-tight">
                        {{ selectionDateText }}
                      </p>
                      <span class="rounded bg-blue-100/70 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                        {{ selectionSummary.timeRange }}
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span>{{ activeZoneInfo.abbr }} ({{ activeZoneInfo.label }})</span>
                      <span class="text-slate-300">&bull;</span>
                      <span class="font-medium text-slate-700">{{ selectionSummary.slots }} {{ selectionSummary.slots === 1 ? 'slot' : 'slots' }} ({{ selectionSummary.hoursLabel }})</span>
                      <span v-if="selectionSummary.past" class="text-amber-700 font-semibold">&bull; {{ selectionSummary.past }} past excluded</span>
                    </p>
                  </div>
                </div>

                <!-- Recurrence / Repeat Selector -->
                <div class="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-slate-50/70 p-3">
                  <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                    <i class="fa-solid fa-rotate text-xs"></i>
                  </div>
                  <div class="min-w-0 flex-1 space-y-1">
                    <label class="block text-[11px] font-semibold text-slate-600">Frequency</label>
                    <div class="relative">
                      <button
                        ref="repeatTriggerEl"
                        type="button"
                        @click="repeatDropdownOpen = !repeatDropdownOpen"
                        class="flex items-center justify-between w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer shadow-2xs"
                      >
                        <span class="truncate font-semibold text-slate-700">{{ repeatDropdownLabel }}</span>
                        <i class="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
                      </button>

                      <!-- Dropdown menu -->
                      <!-- The card is placed beside the run, so it can sit low
                           on the board. A menu that only ever opened downwards
                           lost its last options off the bottom of the window.
                           It flips above the field when there is no room below,
                           and scrolls if there is room for neither. -->
                      <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" leave-active-class="transition duration-75 ease-in" leave-to-class="opacity-0 scale-95">
                        <div
                          v-if="repeatDropdownOpen"
                          ref="repeatMenuEl"
                          class="absolute left-0 z-30 w-60 max-h-[min(18rem,50vh)] overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white shadow-xl py-1 text-xs text-slate-700"
                          :class="repeatDropUp ? 'bottom-full mb-1.5 origin-bottom' : 'top-full mt-1.5 origin-top'"
                        >
                          <button
                            v-for="opt in repeatPresetOptions"
                            :key="opt.value"
                            type="button"
                            @click="selectRepeatPreset(opt.value)"
                            class="w-full flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 transition cursor-pointer"
                            :class="repeatPreset === opt.value ? 'bg-blue-50 font-bold text-blue-600' : ''"
                          >
                            <span>{{ opt.label }}</span>
                            <i v-if="repeatPreset === opt.value" class="fa-solid fa-check text-xs text-blue-600"></i>
                          </button>
                          <div class="border-t border-slate-100 mt-1 pt-1">
                            <button
                              type="button"
                              @click="openCustomRecurrence"
                              class="w-full flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 transition cursor-pointer"
                              :class="repeatPreset === 'custom' ? 'bg-blue-50 font-bold text-blue-600' : ''"
                            >
                              <span>Custom repetition...</span>
                              <i class="fa-solid fa-sliders text-xs text-slate-400"></i>
                            </button>
                          </div>
                        </div>
                      </Transition>
                    </div>

                    <!-- Explanatory note -->
                    <p class="text-[11px] leading-snug text-slate-500 pt-0.5">
                      <i class="fa-regular fa-circle-question text-[10px] mr-1 text-slate-400"></i>
                      <span>{{ repeatSummaryStatement }}</span>
                    </p>
                  </div>
                </div>

                <!-- Custom recurrence.
                     Only a weekly interval is offered because availability is
                     stored against weekdays — "every 3 days" and "every 2
                     months" had nowhere to be written, and the old month option
                     silently saved the same weekday chips while the label
                     claimed otherwise. -->
                <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 scale-95" leave-active-class="transition duration-100 ease-in" leave-to-class="opacity-0 scale-95">
                  <div
                    v-if="showCustomRecurrence"
                    class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40"
                    @click.self="cancelCustomRecurrence"
                  >
                    <div
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="custom-recurrence-title"
                      ref="customRecurrenceEl"
                      class="flex max-h-[calc(100vh-2rem)] w-full max-w-[360px] flex-col rounded-[28px] bg-[#edf2f8] text-[#1f1f1f] shadow-2xl"
                      @click.stop
                    >
                      <h3 id="custom-recurrence-title" class="shrink-0 px-6 pt-6 text-[22px] font-normal tracking-tight">
                        Custom repeat
                      </h3>

                      <!-- The dialog can be taller than a laptop window, and when it
                           was it took Done off the bottom of the screen with it. -->
                      <div class="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
                        <!-- Interval -->
                        <div class="flex items-center gap-3 text-sm">
                          <label for="repeat-every" class="whitespace-nowrap text-[#444746]">Repeat every</label>
                          <div class="flex items-center gap-1 rounded-md bg-[#dfe4ea] pl-2 pr-1 py-1">
                            <input
                              id="repeat-every"
                              type="number"
                              v-model.number="customEvery"
                              @change="customEvery = clampInt(customEvery, 1, 52)"
                              @blur="customEvery = clampInt(customEvery, 1, 52)"
                              min="1"
                              max="52"
                              class="w-8 bg-transparent text-center text-sm font-medium focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <div class="flex flex-col">
                              <button
                                type="button"
                                aria-label="Increase interval"
                                @click="customEvery = clampInt(customEvery + 1, 1, 52)"
                                class="flex h-5 w-6 items-center justify-center rounded text-[9px] text-[#444746] transition hover:bg-[#c9d0d8] hover:text-black cursor-pointer"
                              >▲</button>
                              <button
                                type="button"
                                aria-label="Decrease interval"
                                @click="customEvery = clampInt(customEvery - 1, 1, 52)"
                                class="flex h-5 w-6 items-center justify-center rounded text-[9px] text-[#444746] transition hover:bg-[#c9d0d8] hover:text-black cursor-pointer"
                              >▼</button>
                            </div>
                          </div>
                          <span class="text-[#444746]">{{ customEvery === 1 ? 'week' : 'weeks' }}</span>
                        </div>

                        <!-- Days -->
                        <div class="space-y-2">
                          <div role="group" aria-label="Repeat on these days" class="space-y-2">
                            <div class="text-sm text-[#444746]">Repeat on</div>
                            <div class="flex items-center justify-between">
                              <button
                                v-for="d in repeatDayOptions"
                                :key="d.key"
                                type="button"
                                :aria-label="d.name"
                                :aria-pressed="repeatDays.includes(d.key) ? 'true' : 'false'"
                                @click="toggleRepeatDay(d.key)"
                                class="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition cursor-pointer select-none"
                                :class="repeatDays.includes(d.key)
                                  ? 'bg-[#0b57d0] text-white shadow-xs'
                                  : 'bg-[#dfe4ea] text-[#0b57d0] hover:bg-[#d2d8e0]'"
                              >
                                {{ d.label }}
                              </button>
                            </div>
                          </div>
                          <!-- Two of the circles read S and two read T, so the chosen
                               days are named in full underneath rather than left to
                               be worked out from colour. -->
                          <p class="text-[11px] text-[#5f6368]">
                            {{ chosenDayNames || 'Pick at least one day' }}
                          </p>
                        </div>

                        <!-- Ends -->
                        <div role="radiogroup" aria-label="When the repeat ends" class="space-y-3">
                          <div class="text-sm text-[#444746]">Ends</div>

                          <label class="flex cursor-pointer items-center gap-3 text-sm">
                            <input type="radio" name="custom-ends" v-model="customEnds" value="never" class="h-4 w-4 accent-[#0b57d0] cursor-pointer" />
                            <span>Never</span>
                          </label>

                          <label class="flex cursor-pointer items-center gap-3 text-sm">
                            <input type="radio" name="custom-ends" v-model="customEnds" value="on" class="h-4 w-4 accent-[#0b57d0] cursor-pointer" />
                            <span class="w-10 shrink-0">On</span>
                            <input
                              type="date"
                              aria-label="Repeat until this date"
                              v-model="customEndsOn"
                              :min="teacher.manilaNow.iso"
                              @focus="customEnds = 'on'"
                              class="rounded-md border-none bg-[#dfe4ea] px-3 py-1.5 text-sm text-[#1f1f1f] focus:outline-none cursor-pointer"
                              :class="customEnds !== 'on' ? 'opacity-60' : ''"
                            />
                          </label>

                          <label class="flex cursor-pointer items-center gap-3 text-sm">
                            <input type="radio" name="custom-ends" v-model="customEnds" value="after" class="h-4 w-4 accent-[#0b57d0] cursor-pointer" />
                            <span class="w-10 shrink-0">After</span>
                            <div class="flex items-center gap-1 rounded-md bg-[#dfe4ea] pl-2 pr-1 py-1" :class="customEnds !== 'after' ? 'opacity-60' : ''">
                              <input
                                type="number"
                                aria-label="Number of dates"
                                v-model.number="customAfterN"
                                @focus="customEnds = 'after'"
                                @change="customAfterN = clampInt(customAfterN, 1, 999)"
                                @blur="customAfterN = clampInt(customAfterN, 1, 999)"
                                min="1"
                                max="999"
                                class="w-9 bg-transparent text-center text-sm font-medium focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <div class="flex flex-col">
                                <button type="button" aria-label="More dates" @click="customEnds = 'after'; customAfterN = clampInt(customAfterN + 1, 1, 999)" class="flex h-5 w-6 items-center justify-center rounded text-[9px] text-[#444746] transition hover:bg-[#c9d0d8] hover:text-black cursor-pointer">▲</button>
                                <button type="button" aria-label="Fewer dates" @click="customEnds = 'after'; customAfterN = clampInt(customAfterN - 1, 1, 999)" class="flex h-5 w-6 items-center justify-center rounded text-[9px] text-[#444746] transition hover:bg-[#c9d0d8] hover:text-black cursor-pointer">▼</button>
                              </div>
                              <span class="pr-1 text-sm text-[#444746]">times</span>
                            </div>
                          </label>
                        </div>

                        <!-- What this actually does. The settings above are the
                             argument; this is the answer, and it is the same
                             figure the card and the save use. -->
                        <div class="rounded-xl bg-white px-3.5 py-2.5 text-xs text-[#444746]">
                          <p v-if="customPreview" class="leading-relaxed">
                            <strong class="font-semibold text-[#1f1f1f]">{{ customPreview.count }}</strong>
                            {{ customPreview.count === 1 ? 'date' : 'dates' }} —
                            <span class="tabular-nums">{{ customPreview.list }}</span>
                            <span v-if="customPreview.passed" class="text-[#5f6368]">
                              · {{ customPreview.passed }} already passed, skipped
                            </span>
                            <!-- "Never" is the word people expect here, but the
                                 hours are written to real weeks and so have to
                                 stop somewhere. The option keeps its name; this
                                 line says where the run actually ends. -->
                            <span v-if="customPreview.capped" class="text-[#5f6368]">
                              · stops after {{ MAX_REPEAT_WEEKS }} weeks
                            </span>
                          </p>
                          <p v-else class="leading-relaxed text-[#5f6368]">
                            Nothing to change yet — pick at least one day that has not passed.
                          </p>
                        </div>
                      </div>

                      <div class="flex shrink-0 items-center justify-end gap-2 rounded-b-[28px] px-6 pb-5 pt-1">
                        <button
                          type="button"
                          @click="cancelCustomRecurrence"
                          class="rounded-full px-5 py-2 text-sm font-medium text-[#0b57d0] transition hover:bg-[#dfe4ea] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          :disabled="!customPreview"
                          @click="applyCustomRecurrence"
                          class="rounded-full bg-[#0b57d0] px-6 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-[#0842a0] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                </Transition>

              </div>

              <!-- Footer with Cancel and Save -->
              <div class="flex items-center justify-end gap-2 border-t border-slate-200/80 px-5 py-3 bg-slate-50/90 rounded-b-2xl">
                <button
                  type="button"
                  @click="clearSelection"
                  class="cursor-pointer rounded-lg px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 hover:text-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  @click="saveSelectionAction"
                  class="cursor-pointer rounded-lg bg-[#0b57d0] px-6 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0842a0] active:scale-95 transition"
                >
                  Save
                </button>
              </div>

              <!-- Repeating hours are two different deletes wearing one word.
                   Rather than pick a default and hope, the card asks, naming
                   what each one actually touches. -->
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0"
                leave-active-class="transition duration-100 ease-in"
                leave-to-class="opacity-0"
              >
                <div
                  v-if="pendingDelete === 'choose'"
                  class="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[#f0f4f9]/80 backdrop-blur-sm p-5"
                  @click.self="pendingDelete = ''"
                >
                  <div
                    role="dialog"
                    aria-modal="true"
                    class="w-full max-w-[380px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <!-- Header -->
                    <div class="px-5 pt-5 pb-3 text-left">
                      <div class="flex items-start gap-3">
                        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                          <i class="fa-regular fa-calendar-xmark text-lg"></i>
                        </div>
                        <div class="min-w-0 flex-1">
                          <h3 class="text-base font-semibold text-slate-900 leading-snug">
                            Clear Time Slot
                          </h3>
                          <p class="mt-0.5 text-xs text-slate-500 font-medium">
                            <span class="text-slate-700 font-semibold">{{ selectionSummary?.timeRange }}</span> &bull; {{ selectionDateShort }}
                          </p>
                        </div>
                        <button
                          type="button"
                          @click="pendingDelete = ''"
                          class="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                          title="Close"
                        >
                          <i class="fa-solid fa-xmark text-sm"></i>
                        </button>
                      </div>

                      <div v-if="selectionRepeats" class="mt-3 rounded-lg bg-amber-50/80 border border-amber-200/70 px-3 py-2 text-[11px] text-amber-800 flex items-center gap-2">
                        <i class="fa-solid fa-rotate text-amber-600 text-xs shrink-0"></i>
                        <span>This slot repeats weekly on <strong>{{ selectionWeekdayLong }}s</strong>. Choose what to remove:</span>
                      </div>
                      <p v-else class="mt-2 text-xs text-slate-500 leading-relaxed">
                        This will remove {{ selectionSummary?.timeRange }} on this date.
                      </p>
                    </div>

                    <!-- Action Options -->
                    <div class="px-4 py-2 space-y-2">
                      <!-- Option 1: Only this date -->
                      <button
                        type="button"
                        @click="deleteSelectionArea"
                        class="group w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-rose-300 hover:bg-rose-50/50 hover:shadow-xs active:bg-rose-100/60"
                      >
                        <div class="flex items-start gap-3">
                          <div class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-rose-100 group-hover:text-rose-600 transition">
                            <i class="fa-regular fa-calendar text-xs"></i>
                          </div>
                          <div class="min-w-0 flex-1">
                            <div class="flex items-center justify-between gap-1">
                              <span class="text-xs font-semibold text-slate-900 group-hover:text-rose-700">
                                {{ selectionRepeats ? `This date only (${selectionDateShort})` : 'Clear this time slot' }}
                              </span>
                              <span v-if="selectionRepeats" class="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                One-time
                              </span>
                            </div>
                            <p class="mt-0.5 text-[11px] leading-relaxed text-slate-500 group-hover:text-slate-600">
                              {{ selectionRepeats ? `Keeps ${selectionSummary?.timeRange} for all other upcoming ${selectionWeekdayLong}s.` : 'Removes availability for this slot.' }}
                            </p>
                          </div>
                        </div>
                      </button>

                      <!-- Option 2: All future / weekly recurrence -->
                      <button
                        v-if="selectionRepeats"
                        type="button"
                        @click="clearSelectionEveryWeek"
                        class="group w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-rose-300 hover:bg-rose-50/50 hover:shadow-xs active:bg-rose-100/60"
                      >
                        <div class="flex items-start gap-3">
                          <div class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-rose-100 group-hover:text-rose-600 transition">
                            <i class="fa-solid fa-rotate text-xs"></i>
                          </div>
                          <div class="min-w-0 flex-1">
                            <div class="flex items-center justify-between gap-1">
                              <span class="text-xs font-semibold text-slate-900 group-hover:text-rose-700">
                                Every {{ selectionWeekdayLong }} (Template)
                              </span>
                              <span class="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200/60 px-1.5 py-0.5 rounded">
                                Recurring
                              </span>
                            </div>
                            <p class="mt-0.5 text-[11px] leading-relaxed text-slate-500 group-hover:text-slate-600">
                              Permanently removes {{ selectionSummary?.timeRange }} from your weekly schedule template.
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>

                    <!-- Footer -->
                    <div class="border-t border-slate-100 bg-slate-50/80 px-4 py-3 flex justify-end">
                      <button
                        type="button"
                        @click="pendingDelete = ''"
                        class="cursor-pointer rounded-lg px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 hover:text-slate-800 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </Transition>
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
    <ScheduleTemplateModal :is-open="isTemplateOpen" @close="isTemplateOpen = false" />

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
import ScheduleTemplateModal from '@/components/teacher/ScheduleTemplateModal.vue';

const teacher = useTeacherStore();

// Calendar Navigation State
// Nothing switches this any more — the Day/Month selector was removed from the
// toolbar — but the month and day branches below are left intact so the control
// can come back without rebuilding them.
const currentView = ref('week'); // 'day' | 'week' | 'month'
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
const isTemplateOpen = ref(false);
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
let pressedLockedEvent = false;
const selection = ref(null);     // the same rectangle, kept after it comes up
const dayColElements = {};

/* Moving a run. Grabbing inside a selection picks the hours up rather than
   starting a new sweep: the statuses and their notes travel with the box, so
   a lesson block put down at the wrong time is corrected by dragging it, the
   way it would be in any calendar. `moveOrigin` holds where it was lifted
   from and what it was carrying, so a refused drop can put it all back. */
const isMovingSelection = ref(false);
const moveBlocked = ref(false);
const moveOrigin = ref(null);

/** Bumped whenever the board moves under the card, so the card follows it. */
const anchorTick = ref(0);
const bumpAnchor = () => { anchorTick.value += 1; };

const cardEl = ref(null);
const cardSize = ref({ w: 368, h: 300 });
const measureCard = () => {
  const el = cardEl.value;
  if (el) cardSize.value = { w: el.offsetWidth, h: el.offsetHeight };
};

/**
 * Put the card beside the run it is about.
 *
 * Right of the selection first, then left, then under it, then over it — the
 * first of those that fits on screen and does not cover the hours in question
 * wins. The card is measured rather than assumed, because its height changes
 * with the repeat row, the title field and the confirm states, and a guess
 * that is 40px out is a card that sits over the slots.
 */
const cardStyle = computed(() => {
  anchorTick.value; // re-run when the board scrolls or resizes
  const r = selectionRect.value;
  if (!r) return { visibility: 'hidden' };
  const first = dayColElements[viewDays.value[r.d0]?.dayKey];
  const last = dayColElements[viewDays.value[r.d1]?.dayKey];
  if (!first || !last) return { visibility: 'hidden' };

  const a = first.getBoundingClientRect();
  const b = last.getBoundingClientRect();
  const runTop = a.top + r.s0 * 32;
  const runBottom = a.top + (r.s1 + 1) * 32;
  const { w, h } = cardSize.value;
  const M = 12;   // keep clear of the window edges
  const GAP = 10; // and of the run itself
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const clampY = (y) => Math.min(Math.max(M, y), Math.max(M, vh - h - M));
  const clampX = (x) => Math.min(Math.max(M, x), Math.max(M, vw - w - M));

  if (b.right + GAP + w <= vw - M) return { left: `${b.right + GAP}px`, top: `${clampY(runTop - 8)}px` };
  if (a.left - GAP - w >= M) return { left: `${a.left - GAP - w}px`, top: `${clampY(runTop - 8)}px` };
  if (runBottom + GAP + h <= vh - M) return { left: `${clampX(a.left)}px`, top: `${runBottom + GAP}px` };
  if (runTop - GAP - h >= M) return { left: `${clampX(a.left)}px`, top: `${runTop - GAP - h}px` };
  return { left: `${clampX(a.left)}px`, top: `${clampY(runTop)}px` };
});

/**
 * The hours in hand, placed where they would land.
 *
 * Dragging only the outline left the green and purple blocks sitting at the
 * old time, so the board showed the run in two places at once and neither of
 * them was the answer. These are drawn at the destination instead, and
 * `liftedOut` takes the originals off the board for as long as the drag lasts.
 */
const carriedBlocks = (dayIdx) => {
  const o = moveOrigin.value;
  const r = selectionRect.value;
  if (!isMovingSelection.value || !o || !r) return [];
  return o.payload
    .filter((c) => r.d0 + c.dd === dayIdx)
    .map((c) => ({
      key: `${c.dd}-${c.ss}`,
      top: (r.s0 + c.ss) * 32,
      status: c.status,
      label: c.status === 'reserved' && c.reason && c.reason !== 'Reserved' ? c.reason : '',
      time:
        c.status === 'reserved' && c.reason && c.reason !== 'Reserved'
          ? formatSlotTime(r.s0 + c.ss)
          : `${formatSlotTime(r.s0 + c.ss)} – ${formatSlotTime(r.s0 + c.ss + 1)}`,
    }));
};

const liftedOut = (dayIdx, slotIndex) => {
  const o = moveOrigin.value;
  if (!isMovingSelection.value || !o) return false;
  return dayIdx >= o.d0 && dayIdx <= o.d1 && slotIndex >= o.s0 && slotIndex <= o.s1;
};

/** True when the pointer is over hours that are already selected. */
const hoverInsideSelection = (dayIdx) => {
  const r = selectionRect.value;
  const h = hoveredSlot.value;
  if (!r || !h) return false;
  const day = viewDays.value[dayIdx];
  if (!day || h.dayKey !== day.dayKey) return false;
  return dayIdx >= r.d0 && dayIdx <= r.d1 && h.slotIndex >= r.s0 && h.slotIndex <= r.s1;
};

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

/* The menu opens downwards by default and flips up when the window has no
   room for it there. Measured rather than guessed: its height changes with
   the preset list, and an estimate that is 30px out is a clipped option. */
const repeatTriggerEl = ref(null);
const repeatMenuEl = ref(null);
const repeatDropUp = ref(false);

watch(repeatDropdownOpen, (open) => {
  if (!open) {
    repeatDropUp.value = false;
    return;
  }
  nextTick(() => {
    const trigger = repeatTriggerEl.value?.getBoundingClientRect();
    const menu = repeatMenuEl.value;
    if (!trigger || !menu) return;
    const height = menu.offsetHeight;
    const MARGIN = 12;
    const GAP = 6;
    const fitsBelow = trigger.bottom + GAP + height <= window.innerHeight - MARGIN;
    const fitsAbove = trigger.top - GAP - height >= MARGIN;
    repeatDropUp.value = !fitsBelow && fitsAbove;
  });
});
const repeatPreset = ref('none'); // 'none'|'daily'|'weekly'|'weekday'|'custom'
const showCustomRecurrence = ref(false);
/* Custom recurrence state.
   There is no unit any more. Availability is stored against weekdays, so a week
   is the only interval the store can actually honour — "every 3 days" and
   "every 2 months" had nowhere to be written, and "month" was writing the same
   weekday chips as "week" while the label claimed otherwise. */
const customEvery = ref(1);
const customEnds = ref('on'); // 'never'|'on'|'after'
const customEndsOn = ref('');
const customAfterN = ref(8);

/** "Never" still has to stop somewhere; a year is the stated limit. */
const MAX_REPEAT_WEEKS = 52;

/** `max` on a number input does not stop anyone typing 999 into it. */
const clampInt = (value, lo, hi) => {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
};

const customRecurrenceEl = ref(null);

/** What the dialog held when it opened, so Cancel has something to go back to. */
let recurrenceDraft = null;

const repeatDayOrderedKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

// Hours of day: 0 to 23
const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);

/** How much width the grid's scrollbar is taking, if it takes any. */
const gridScrollbarWidth = ref(0);
const measureGridScrollbar = () => {
  const el = scrollContainer.value;
  gridScrollbarWidth.value = el ? Math.max(0, el.offsetWidth - el.clientWidth) : 0;
};
let gridResizeObserver = null;

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
    const every = Math.max(1, Math.round(customEvery.value) || 1);
    const unit = every === 1 ? 'week' : `${every} weeks`;
    const names = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
    const days = repeatDayOrderedKeys.filter((k) => repeatDays.value.includes(k)).map((k) => names[k]);
    return days.length ? `Every ${unit} on ${days.join(', ')}` : `Every ${unit}`;
  }
  return 'Does not repeat';
});

// `name` is what a screen reader says. The circles show one letter, and two of
// them are S and two are T, so the letter cannot be the accessible name.
const repeatDayOptions = [
  { key: 'sun', label: 'S', fullLabel: 'Sun', name: 'Sunday' },
  { key: 'mon', label: 'M', fullLabel: 'Mon', name: 'Monday' },
  { key: 'tue', label: 'T', fullLabel: 'Tue', name: 'Tuesday' },
  { key: 'wed', label: 'W', fullLabel: 'Wed', name: 'Wednesday' },
  { key: 'thu', label: 'T', fullLabel: 'Thu', name: 'Thursday' },
  { key: 'fri', label: 'F', fullLabel: 'Fri', name: 'Friday' },
  { key: 'sat', label: 'S', fullLabel: 'Sat', name: 'Saturday' },
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

/**
 * How many half hours of a day have already begun: all 48 for a day that is
 * over, none for one still ahead, and the slot the clock is in for today. One
 * number drives the shading, the hover and the refusals, so they cannot drift.
 */
const spentSlots = (day) => {
  const now = teacher.manilaNow;
  if (day.iso < now.iso) return 48;
  if (day.iso > now.iso) return 0;
  return Math.min(48, Math.floor(now.minutes / 30) + 1);
};

// Anything from the hour we are in onward can be changed, however far out.
const isSlotEditable = (day, slotIndex) => slotIndex >= spentSlots(day);

const hoveredSlot = ref(null);
const handleColMouseMove = (day, e) => {
  if (isDragging.value) {
    hoveredSlot.value = null;
    return;
  }
  const slotIndex = getSlotIndexFromMouseEvent(e, day.dayKey);
  // No hover over an hour that cannot be acted on — the indicator is an offer.
  if (!isSlotEditable(day, slotIndex)) {
    hoveredSlot.value = null;
    return;
  }
  hoveredSlot.value = { dayKey: day.dayKey, slotIndex };
};

// Mouse Down on Day Column
const handleColMouseDown = (e) => {
  if (e.button !== 0) return; // Only left click
  hoveredSlot.value = null;
  // A student's booked lesson is not availability to edit, so a press on one
  // is remembered here and left to the read-only inspector on mouseup.
  pressedLockedEvent = !!e.target?.closest?.('[data-locked]');
  const cell = pointToCell(e);
  if (!cell) return;
  // A drag cannot begin on an hour that has gone, or beyond the horizon.
  // Refusing at the press is what stops a sweep appearing to work and then
  // quietly doing nothing when it lands.
  const day = viewDays.value[cell.dayIdx];
  if (!day || !isSlotEditable(day, cell.slot)) return;

  // Inside an existing selection, the press means "pick this up".
  const r = selectionRect.value;
  if (r && cell.dayIdx >= r.d0 && cell.dayIdx <= r.d1 && cell.slot >= r.s0 && cell.slot <= r.s1) {
    beginSelectionMove(cell, r);
    return;
  }

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
  if (isMovingSelection.value && moveOrigin.value) {
    const cell = pointToCell(e);
    if (!cell) return;
    const r = movedRectFor(cell);
    moveBlocked.value = !rectIsLandable(r);
    selection.value = { fromDay: r.d0, fromSlot: r.s0, toDay: r.d1, toSlot: r.s1 };
    return;
  }
  if (!isDragging.value || !dragSelection.value) return;
  const cell = pointToCell(e);
  if (!cell) return;
  // Hold the far end at the first hour that is still ahead, so the rectangle
  // on screen is the one that will actually be applied.
  const overDay = viewDays.value[cell.dayIdx];
  if (!overDay) return;
  cell.slot = Math.max(cell.slot, spentSlots(overDay));
  if (cell.slot > 47) return;
  const sel = dragSelection.value;
  if (cell.dayIdx !== sel.toDay || cell.slot !== sel.toSlot) {
    sel.toDay = cell.dayIdx;
    sel.toSlot = cell.slot;
    dragMoved.value = true;
  }
};

/**
 * Lift the selected hours. What they are — open, held, and the note on a hold
 * — is copied out now, because the source cells are cleared on the drop and
 * there would otherwise be nothing left to write at the destination.
 */
const beginSelectionMove = (cell, r) => {
  const payload = [];
  for (let d = r.d0; d <= r.d1; d += 1) {
    const day = viewDays.value[d];
    if (!day) continue;
    for (let sl = r.s0; sl <= r.s1; sl += 1) {
      const slotKey = teacher.scheduleSlots[sl]?.key;
      if (!slotKey) continue;
      const status = teacher.getSlotStatus(day.dayKey, slotKey);
      if (status === 'closed') continue;
      payload.push({
        dd: d - r.d0,
        ss: sl - r.s0,
        status,
        reason: teacher.getSlotReason(day.dayKey, slotKey) || '',
      });
    }
  }
  // A sweep usually takes in more than it needs — empty half hours at the end
  // of a run, a column with nothing in it. Those are fine to select, but there
  // is nothing to carry there, so the box shrinks to what is actually in hand
  // the moment it is picked up: the hours you see moving are the hours moving.
  isMovingSelection.value = true;
  let box = { ...r };
  if (payload.length) {
    const minDd = Math.min(...payload.map((c) => c.dd));
    const maxDd = Math.max(...payload.map((c) => c.dd));
    const minSs = Math.min(...payload.map((c) => c.ss));
    const maxSs = Math.max(...payload.map((c) => c.ss));
    box = { d0: r.d0 + minDd, d1: r.d0 + maxDd, s0: r.s0 + minSs, s1: r.s0 + maxSs };
    payload.forEach((c) => {
      c.dd -= minDd;
      c.ss -= minSs;
    });
    // The grab point keeps its offset from the box, so nothing jumps under the
    // cursor when the trim happens.
    selection.value = { fromDay: box.d0, fromSlot: box.s0, toDay: box.d1, toSlot: box.s1 };
  }

  moveOrigin.value = { ...box, anchorDay: cell.dayIdx, anchorSlot: cell.slot, payload };
  moveBlocked.value = false;
};

/** Where the box would land for a given pointer cell, clamped to the board. */
const movedRectFor = (cell) => {
  const o = moveOrigin.value;
  const spanD = o.d1 - o.d0;
  const spanS = o.s1 - o.s0;
  const d0 = Math.min(
    Math.max(0, o.d0 + (cell.dayIdx - o.anchorDay)),
    viewDays.value.length - 1 - spanD
  );
  const s0 = Math.min(Math.max(0, o.s0 + (cell.slot - o.anchorSlot)), 47 - spanS);
  return { d0, d1: d0 + spanD, s0, s1: s0 + spanS };
};

/** A run cannot be dropped onto hours that have already begun. */
const rectIsLandable = (r) =>
  viewDays.value.slice(r.d0, r.d1 + 1).every((day) => day && r.s0 >= spentSlots(day));

const finishSelectionMove = () => {
  const o = moveOrigin.value;
  isMovingSelection.value = false;
  moveOrigin.value = null;
  if (!o) return;

  const r = selectionRect.value;
  const moved = r && (r.d0 !== o.d0 || r.s0 !== o.s0);
  if (!moved || !rectIsLandable(r)) {
    // Put it back where it came from rather than half-applying the drop.
    selection.value = { fromDay: o.d0, fromSlot: o.s0, toDay: o.d1, toSlot: o.s1 };
    moveBlocked.value = false;
    resetCardForSelection();
    return;
  }

  const write = (dayIdx, slotIdx, status, reason) => {
    const day = viewDays.value[dayIdx];
    const slotKey = teacher.scheduleSlots[slotIdx]?.key;
    if (day && slotKey) teacher.setSlotStatus(day.dayKey, slotKey, status, reason);
  };
  // Empty the old box first: source and destination can overlap, and clearing
  // afterwards would wipe hours that had just been written.
  for (let d = o.d0; d <= o.d1; d += 1) {
    for (let sl = o.s0; sl <= o.s1; sl += 1) write(d, sl, 'closed', '');
  }
  o.payload.forEach((cellData) => {
    write(r.d0 + cellData.dd, r.s0 + cellData.ss, cellData.status, cellData.reason);
  });
  moveBlocked.value = false;
  // The hours that landed decide what the card offers, so this runs after the
  // writes rather than off the selection change that preceded them.
  resetCardForSelection();
};

/* Mouse up. A sweep leaves a selection behind instead of acting on the spot:
   the slots it covers may be empty, open or held, and which of those was meant
   is a question the board cannot answer on the instructor's behalf. A press
   that never moved is still the old single-slot toggle. */
const handleGlobalMouseUp = () => {
  if (isMovingSelection.value) {
    finishSelectionMove();
    return;
  }
  if (!isDragging.value || !dragSelection.value) return;

  const swept = dragSelection.value;
  isDragging.value = false;

  // A click is a sweep of one half hour. It used to flip the slot open or shut
  // where it stood, which gave no say over reserve, no note and no repeat, and
  // left the card reachable only by dragging. Both gestures now end in the
  // same place, the card, with the same choices in it.
  const day = viewDays.value[swept.fromDay];
  const slotKey = teacher.scheduleSlots[swept.fromSlot]?.key;
  const gone = day && slotKey && teacher.isPastSlot(day.dayKey, slotKey);

  if (dragMoved.value) {
    selection.value = { ...swept };
  } else if (pressedLockedEvent || gone) {
    // Nothing here to edit: a booked lesson opens its own inspector on the
    // click that follows, and an hour that has passed cannot be changed.
    selection.value = null;
  } else {
    selection.value = { ...swept };
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

/**
 * '' | 'choose' — whether the delete sheet is open over the card. A run that
 * repeats is offered two ways out there, since "delete" is genuinely two
 * different actions for it and guessing wrong is not recoverable.
 */
const pendingDelete = ref('');

const selectionWeekdayLong = computed(() => {
  const r = selectionRect.value;
  if (!r) return '';
  const days = viewDays.value.slice(r.d0, r.d1 + 1);
  if (!days.length) return '';
  const full = (d) =>
    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
      d.dateObj.getDay()
    ];
  return days.length === 1
    ? full(days[0])
    : `${full(days[0])}–${full(days[days.length - 1])}`;
});

/**
 * Every delete asks in the sheet.
 *
 * The confirm used to live in the footer as a long "…? Tap again" button with
 * a Keep beside it, which wrapped onto a second line next to Cancel and Save
 * and left four buttons competing in one strip. One question at a time, in
 * front of the card, is easier to read and harder to hit by accident.
 */
const promptDelete = () => {
  pendingDelete.value = 'choose';
};

/**
 * How much time is actually being cleared, said the way a person would say it.
 *
 * The label read "these hours" whatever was picked, which is wrong twice over
 * for a single half-hour slot: it is not hours, and it does not say that the
 * run repeats across several dates when it does.
 */
const durationPhrase = (slots) => {
  const mins = slots * 30;
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

const clearLabel = computed(() => {
  const r = selectionRect.value;
  if (!r) return 'Clear';
  const perDate = durationPhrase(r.s1 - r.s0 + 1);
  const dates = planSummary.value?.count ?? 1;
  return dates > 1 ? `Clear ${perDate} on ${dates} dates` : `Clear ${perDate}`;
});

/**
 * Whether the picked hours are part of the weekly template.
 *
 * If they are, clearing this date alone leaves them coming back next week —
 * so the button has to ask which of the two the instructor meant rather than
 * quietly doing the narrower one.
 */
const selectionRepeats = computed(() => {
  const r = selectionRect.value;
  if (!r) return false;
  let any = false;
  for (let d = r.d0; d <= r.d1; d += 1) {
    const day = viewDays.value[d];
    if (!day) continue;
    for (let sl = r.s0; sl <= r.s1; sl += 1) {
      const slotKey = teacher.scheduleSlots[sl]?.key;
      if (!slotKey) continue;
      if (teacher.getSlotStatus(day.dayKey, slotKey) === 'closed') continue;
      if (!teacher.patternHasSlot(day.dayKey, slotKey)) return false;
      any = true;
    }
  }
  return any;
});

/** "Oct 13", or "Oct 13–15" when the run spans days. */
const selectionDateShort = computed(() => {
  const r = selectionRect.value;
  if (!r) return '';
  const days = viewDays.value.slice(r.d0, r.d1 + 1);
  if (!days.length) return '';
  const fmt = (d) => `${MONTH_NAMES[d.dateObj.getMonth()].slice(0, 3)} ${d.dateObj.getDate()}`;
  return days.length === 1 ? fmt(days[0]) : `${fmt(days[0])}–${days[days.length - 1].dateObj.getDate()}`;
});

/** Take the picked hours out of the template, and out of the week on screen. */
const clearSelectionEveryWeek = () => {
  pendingDelete.value = '';
  const r = selectionRect.value;
  if (!r) return;
  const pairs = [];
  for (let d = r.d0; d <= r.d1; d += 1) {
    const day = viewDays.value[d];
    if (!day) continue;
    for (let sl = r.s0; sl <= r.s1; sl += 1) {
      const slotKey = teacher.scheduleSlots[sl]?.key;
      if (slotKey) pairs.push({ dayKey: day.dayKey, slotKey });
    }
  }
  teacher.clearPatternSlots(pairs);
  // The week in view may hold its own copy of those hours, and the instructor
  // is looking straight at it.
  writePlan('closed', '');
  clearSelection();
};

const clearSelection = () => {
  pendingDelete.value = '';
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
/**
 * The sentence under the dropdown now reports the plan rather than the setting.
 * It used to restate the rule — "Applied every weekday" — for a write that only
 * ever touched the current week, which is how the card came to promise a term's
 * worth of hours and deliver seven days of them.
 */
const repeatSummaryStatement = computed(() => {
  const sum = planSummary.value;
  if (!sum) return 'Nothing left to change — these hours have passed.';
  const dates = `${sum.count} ${sum.count === 1 ? 'date' : 'dates'}`;
  const parts = [`${dates}: ${sum.list}`];
  if (sum.passed) parts.push(`${sum.passed} already passed, skipped`);
  if (sum.capped) parts.push(`stops after ${MAX_REPEAT_WEEKS} weeks`);
  return parts.join(' · ');
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

/** Three months out from the selection — far enough to be useful, near enough to read. */
const defaultEndDate = () => {
  const r = selectionRect.value;
  const base = r && viewDays.value[r.d0] ? new Date(viewDays.value[r.d0].dateObj) : new Date();
  base.setMonth(base.getMonth() + 3);
  return isoDate(base);
};

const openCustomRecurrence = () => {
  repeatDropdownOpen.value = false;
  // Everything the dialog can change, kept so Cancel can put it back. The day
  // chips are the live array the save reads, so without this a cancelled
  // dialog still changed what Save would write.
  recurrenceDraft = {
    days: [...repeatDays.value],
    preset: repeatPreset.value,
    every: customEvery.value,
    ends: customEnds.value,
    endsOn: customEndsOn.value,
    afterN: customAfterN.value,
  };
  // seed day chips from current selection or swept days
  if (repeatDays.value.length === 0) {
    const r = selectionRect.value;
    repeatDays.value = r ? viewDays.value.slice(r.d0, r.d1 + 1).map(d => d.dayKey) : [];
  }
  if (!customEndsOn.value) customEndsOn.value = defaultEndDate();
  showCustomRecurrence.value = true;
};

const cancelCustomRecurrence = () => {
  if (recurrenceDraft) {
    repeatDays.value = [...recurrenceDraft.days];
    repeatPreset.value = recurrenceDraft.preset;
    customEvery.value = recurrenceDraft.every;
    customEnds.value = recurrenceDraft.ends;
    customEndsOn.value = recurrenceDraft.endsOn;
    customAfterN.value = recurrenceDraft.afterN;
    recurrenceDraft = null;
  }
  showCustomRecurrence.value = false;
};

const applyCustomRecurrence = () => {
  recurrenceDraft = null;
  repeatPreset.value = 'custom';
  showCustomRecurrence.value = false;
};

/**
 * The note already on the selected hours, so re-opening them shows what was
 * typed rather than an empty box that would wipe it on the next save. Only a
 * note they all share counts: a mixed run has no single label to show, and
 * guessing one would quietly overwrite the rest.
 */
const existingSelectionLabel = () => {
  const r = selectionRect.value;
  if (!r) return '';
  let found = null;
  for (let d = r.d0; d <= r.d1; d += 1) {
    const day = viewDays.value[d];
    if (!day) continue;
    for (let sl = r.s0; sl <= r.s1; sl += 1) {
      const slotKey = teacher.scheduleSlots[sl]?.key;
      if (!slotKey) continue;
      if (teacher.getSlotStatus(day.dayKey, slotKey) !== 'reserved') continue;
      const note = teacher.getSlotReason(day.dayKey, slotKey);
      const label = note && note !== 'Reserved' ? note : '';
      if (found === null) found = label;
      else if (found !== label) return '';
    }
  }
  return found || '';
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
// The card's height changes with the title field, the repeat row and the two
// confirm states; each of those moves where it should sit.
watch(
  [selection, selectionAction, selectionTitle, pendingDelete, repeatPreset, isRepeatOpen],
  () => nextTick(() => { measureCard(); bumpAnchor(); })
);

/**
 * Point the card at whatever is selected now.
 *
 * Split out of the watch because a drag changes the selection on every row it
 * crosses, and running this each time would clear a half-typed title and reset
 * the repeat row dozens of times on the way to the drop.
 */
const resetCardForSelection = () => {
    const summary = selectionSummary.value;
    const allReserved = summary && summary.slots > 0 && summary.reserved === summary.slots;
    selectionAction.value = allReserved ? 'reserve' : 'open';
    selectionTitle.value = existingSelectionLabel();
    isRepeatOpen.value = false;
    repeatPreset.value = 'none';
    repeatDropdownOpen.value = false;
    showCustomRecurrence.value = false;
    customEvery.value = 1;
    // A dated end is the friendlier default than a year of hours, and the end
    // date is reset with everything else — it used to survive from one
    // selection to the next, so a run could silently inherit last week's limit.
    customEnds.value = 'on';
    customEndsOn.value = defaultEndDate();
    customAfterN.value = 8;
    recurrenceDraft = null;
    repeatDays.value = sweptDayKeys();
};

watch(selection, (newVal) => {
  // Mid-drag the selection is still moving; the card catches up on the drop.
  if (newVal && !isMovingSelection.value) resetCardForSelection();
});

/**
 * Every date this edit will touch, worked out once.
 *
 * The preview and the two write paths all read this, so what the card promises
 * and what it does cannot drift apart — which is exactly what went wrong when
 * the save looked only at the current week while the label said "every 2 weeks
 * until December".
 *
 * `writable` excludes hours that have already begun; `passed` counts them, so
 * the card can say what it skipped instead of quietly doing less than it said.
 */
const recurrencePlan = computed(() => {
  const r = selectionRect.value;
  const empty = { dates: [], writable: [], passed: 0, capped: false };
  if (!r) return empty;

  const swept = viewDays.value.slice(r.d0, r.d1 + 1);
  if (!swept.length) return empty;

  const weekStart = getStartOfWeek(swept[0].dateObj);
  const todayIso = teacher.manilaNow.iso;

  // While the dialog is open its settings are the rule — that is what the
  // preview inside it is reporting on, before Done has been pressed.
  const mode = showCustomRecurrence.value ? 'custom' : repeatPreset.value;

  // Which weekdays, and how far apart the weeks are.
  let dayKeys;
  let everyWeeks = 1;
  if (mode === 'none') {
    dayKeys = swept.map((d) => d.dayKey);
  } else if (mode === 'daily') {
    dayKeys = [...DAY_KEYS];
  } else if (mode === 'weekday') {
    dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri'];
  } else if (mode === 'custom') {
    // No fallback here. With no day chosen the answer is "no dates", and Done
    // is disabled on the back of it — quietly substituting the swept day made
    // an empty row look like a valid rule.
    dayKeys = [...repeatDays.value];
    everyWeeks = clampInt(customEvery.value, 1, 52);
  } else {
    dayKeys = repeatDays.value.length ? [...repeatDays.value] : swept.map((d) => d.dayKey);
  }

  const offsets = DAY_KEYS.map((k, i) => (dayKeys.includes(k) ? i : -1)).filter((i) => i >= 0);
  if (!offsets.length) return empty;

  const oneWeekOnly = mode === 'none';
  const limit = mode === 'custom' && customEnds.value === 'after'
    ? clampInt(customAfterN.value, 1, 999)
    : Infinity;
  const until = mode === 'custom' && customEnds.value === 'on' && customEndsOn.value
    ? customEndsOn.value
    : null;

  const dates = [];
  let capped = false;
  const weeks = oneWeekOnly ? 1 : Math.ceil(MAX_REPEAT_WEEKS / everyWeeks);

  outer: for (let w = 0; w < weeks; w += 1) {
    const base = addDays(weekStart, w * everyWeeks * 7);
    for (const off of offsets) {
      const d = addDays(base, off);
      const iso = isoDate(d);
      if (until && iso > until) break outer;
      dates.push({ iso, dayKey: DAY_KEYS[off], weekStartIso: isoDate(getStartOfWeek(d)), dateObj: d });
      if (dates.length >= limit) break outer;
    }
    if (!oneWeekOnly && w === weeks - 1 && limit === Infinity && !until) capped = true;
  }

  const writable = dates.filter((d) => d.iso >= todayIso);
  return { dates, writable, passed: dates.length - writable.length, capped };
});

const chosenDayNames = computed(() => {
  const names = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
  return repeatDayOrderedKeys.filter((k) => repeatDays.value.includes(k)).map((k) => names[k]).join(', ');
});

const planSummary = computed(() => {
  const plan = recurrencePlan.value;
  if (!plan.writable.length) return null;
  // Without the year, a run that reaches into next year ends on "Sep 25",
  // which reads as earlier than the "Oct 3" it started on.
  const thisYear = Number(teacher.manilaNow.iso.slice(0, 4));
  const fmt = (d) => {
    const y = d.dateObj.getFullYear();
    return `${MONTH_NAMES[d.dateObj.getMonth()].slice(0, 3)} ${d.dateObj.getDate()}${y === thisYear ? '' : ` ${y}`}`;
  };
  const first = plan.writable.slice(0, 3).map(fmt);
  const last = plan.writable.length > 3 ? fmt(plan.writable[plan.writable.length - 1]) : null;
  return {
    count: plan.writable.length,
    passed: plan.passed,
    capped: plan.capped,
    list: last ? `${first.join(', ')} … ${last}` : first.join(', '),
  };
});

/* While the dialog is open the plan has to be read as if its settings were
   already chosen, because that is what the preview is for. They are: the dialog
   edits the live refs and Cancel puts them back. */
const customPreview = computed(() => (showCustomRecurrence.value ? planSummary.value : null));

/** Write the plan. Both Save and Delete go through here. */
const writePlan = (status, reason) => {
  const r = selectionRect.value;
  if (!r) return 0;
  let written = 0;

  recurrencePlan.value.writable.forEach(({ weekStartIso, dayKey }) => {
    for (let sl = r.s0; sl <= r.s1; sl += 1) {
      const slotKey = teacher.scheduleSlots[sl]?.key;
      if (slotKey) written += teacher.setSlotStatusOn(weekStartIso, dayKey, slotKey, status, reason);
    }
  });
  return written;
};

// Save: write the plan the card is showing, nothing else.
const saveSelectionAction = () => {
  const status = selectionAction.value === 'reserve' ? 'reserved' : 'open';
  const reason = selectionAction.value === 'reserve' ? effectiveReserveReason.value : '';
  writePlan(status, reason);
  clearSelection();
};

/**
 * Delete closes every hour in the plan. It used to read `repeatDays` directly,
 * which meant it could erase columns that were never highlighted — including
 * day chips left behind by a cancelled Custom dialog. It now acts on exactly
 * what the card says it will, and says how much that is before doing it.
 */
const deleteSelectionArea = () => {
  pendingDelete.value = '';
  writePlan('closed', '');
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

/**
 * Escape closes the top layer, not the bottom one.
 *
 * There was a single handler that cleared the whole selection, so pressing
 * Escape inside the Custom recurrence dialog unmounted the dialog AND the card
 * underneath it — throwing away the sweep and every setting on the way out.
 */
const onSelectionKeydown = (e) => {
  if (e.key !== 'Escape') return;
  if (showCustomRecurrence.value) { cancelCustomRecurrence(); return; }
  if (repeatDropdownOpen.value) { repeatDropdownOpen.value = false; return; }
  if (pendingDelete.value) { pendingDelete.value = ''; return; }
  if (selectedEvent.value) { selectedEvent.value = null; return; }
  if (selection.value) clearSelection();
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

  measureGridScrollbar();
  scrollContainer.value?.addEventListener('scroll', bumpAnchor, { passive: true });
  window.addEventListener('resize', bumpAnchor);
  if (typeof ResizeObserver !== 'undefined' && scrollContainer.value) {
    gridResizeObserver = new ResizeObserver(measureGridScrollbar);
    gridResizeObserver.observe(scrollContainer.value);
  }
  window.addEventListener('resize', measureGridScrollbar);
});

onUnmounted(() => {
  if (timerId) clearInterval(timerId);
  window.removeEventListener('mouseup', handleGlobalMouseUp);
  window.removeEventListener('mousemove', handleGlobalMouseMove);
  window.removeEventListener('keydown', onSelectionKeydown);
  window.removeEventListener('resize', measureGridScrollbar);
  window.removeEventListener('resize', bumpAnchor);
  scrollContainer.value?.removeEventListener('scroll', bumpAnchor);
  gridResizeObserver?.disconnect();
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
      // "Reserved" is what the store writes when no note was given, so it is a
      // placeholder rather than a label and must not be shown as one.
      const stored = teacher.getSlotReason(dayKey, slotKey);
      const label = stored && stored !== 'Reserved' ? stored : '';
      const reason = stored || 'Reserved Block';
      results.push({
        id: `res-${dayKey}-${slotKey}`,
        dayKey,
        slotKey,
        slotIndex: s,
        top,
        height,
        title: label || 'reserve',
        label,
        startTime: formatSlotTime(s),
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

  return results;
};

const onEventClick = (event) => {
  if (dragMoved.value) return;
  // Availability is edited in the card the same click already opened. Only a
  // booked lesson — which is the student's, not the instructor's to move —
  // still gets the read-only inspector.
  if (event.canDelete) return;
  selectedEvent.value = event;
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
