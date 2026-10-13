<template>
  <div class="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8">
    <header class="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div class="min-w-0">
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-brighture-bronze">Teaching record</p>
        <h1 class="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Your teaching, in focus.</h1>
        <p class="mt-1 text-sm text-slate-500">See the work that students return for, and where your teaching time is going.</p>
      </div>

      <div class="inline-flex shrink-0 self-start rounded-2xl border border-slate-200 bg-white p-1 shadow-sm sm:self-auto">
        <button
          v-for="range in teacher.analytics.ranges"
          :key="range"
          type="button"
          @click="activeRange = range"
          class="rounded-xl px-3 py-1.5 text-xs font-bold transition"
          :class="activeRange === range ? 'bg-brighture-gold text-brighture-ink shadow-sm' : 'text-slate-500 hover:text-slate-900'"
        >
          {{ range }}
        </button>
      </div>
    </header>

    <!-- ===== Headline figures ===== -->
    <section class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div v-for="card in kpis" :key="card.label" class="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div class="flex items-center justify-between gap-2">
          <p class="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{{ card.label }}</p>
          <span class="grid h-8 w-8 place-items-center rounded-xl" :class="card.iconBg">
            <i :class="card.icon" class="text-sm"></i>
          </span>
        </div>
        <p class="mt-2 text-2xl font-black tracking-tight text-slate-950">{{ card.value }}</p>
        <p v-if="card.hint" class="mt-0.5 text-[11px] text-slate-400">{{ card.hint }}</p>
      </div>
    </section>

    <div class="grid gap-5 xl:grid-cols-3">
      <!-- ===== Capacity =====
           One ratio against a limit, so it is drawn as a meter: a single arc
           on a lighter step of its own ramp, not two series competing. The
           total sits inside the ring, which is what the ring is for. -->
      <section class="min-w-0 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <h2 class="text-base font-black text-slate-900">Class summary</h2>
        <p class="mt-0.5 text-[11px] font-medium text-slate-400 tabular-nums">{{ weekRangeLabel }}</p>

        <!-- Two thick rounded segments with a gap between them, set in a
             faint outer ring around a raised white disc. Booked is hatched so
             it reads apart from the open share by pattern, not by shade alone. -->
        <div class="relative mx-auto mt-6 grid h-[175px] w-[175px] place-items-center rounded-full border border-slate-100">
          <svg viewBox="0 0 120 120" class="h-full w-full -rotate-90" role="img" :aria-label="capacityLabel">
            <defs>
              <pattern id="bookedHatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="5" height="5" fill="#ffffff" />
                <rect width="2.6" height="5" fill="#1d7bf0" />
              </pattern>
            </defs>
            <circle
              v-for="seg in capacity.segments"
              :key="seg.key"
              cx="60" cy="60" :r="RING_R"
              fill="none"
              :stroke="seg.stroke"
              :stroke-width="RING_W"
              stroke-linecap="round"
              :stroke-dasharray="seg.dash"
              :stroke-dashoffset="seg.offset"
            />
          </svg>

          <div class="absolute h-[115px] w-[115px] rounded-full border border-slate-100 bg-white"></div>

          <div class="absolute text-center flex flex-col items-center">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booked Slots</span>
            <p class="text-3xl font-black leading-none text-slate-900 mt-0.5">{{ capacity.booked }}</p>
            <p class="mt-1 text-[11px] font-bold text-slate-400">of {{ capacity.open }} total</p>
          </div>
        </div>

        <ul class="mt-6 space-y-3">
          <li class="flex items-center gap-2.5">
            <span
              class="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-[#1d7bf0]/40"
              style="background: repeating-linear-gradient(135deg, #1d7bf0 0 1.5px, #ffffff 1.5px 3px)"
            ></span>
            <span class="text-xs font-black text-slate-900 tabular-nums">{{ capacity.booked }}</span>
            <span class="min-w-0 truncate text-xs font-medium text-slate-500">Booked class</span>
          </li>
          <li class="flex items-center gap-2.5">
            <span class="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-sky-300/70" style="background:#bae6fd"></span>
            <span class="text-xs font-black text-slate-900 tabular-nums">{{ capacity.free }}</span>
            <span class="min-w-0 truncate text-xs font-medium text-slate-500">Still open</span>
          </li>
        </ul>

        <p v-if="!capacity.open" class="mt-4 text-xs text-slate-500">
          No hours opened in this period. Students cannot book you until there are some.
        </p>
      </section>
      <!-- ===== Volume / Slot booking rate Bar Chart (Styled matching reference image) ===== -->
      <section class="min-w-0 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs xl:col-span-2">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Slots open vs booked</p>
            <h2 class="mt-0.5 text-base sm:text-lg font-black text-slate-900">Slot booking rate</h2>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600">
              <span class="text-emerald-600 font-black">{{ overallBookingRate }}%</span> booked
              <span class="text-slate-400 font-normal">({{ totalBookedSlots }}/{{ totalOpenSlots }})</span>
            </span>
          </div>
        </div>

        <!-- Chart Grid area with horizontal grid lines and styled bars matching reference -->
        <div class="mt-6 pt-2">
          <!-- Main Chart Layout: Y-Axis on left, Plot area on right with bars aligned flush to bottom -->
          <div class="flex items-stretch gap-3">
            
            <!-- Y-Axis Labels: Number of Open Slots instead of percentage -->
            <div class="flex flex-col justify-between text-[11px] font-bold text-slate-400 tabular-nums w-8 text-right py-0 select-none h-48">
              <span v-for="tick in axisSlotsTicks" :key="tick">{{ tick }}</span>
            </div>

            <!-- Plot Area: 5 Horizontal Gridlines + Bars sitting flush on the 0 slots baseline -->
            <div class="relative flex-1 h-48">
              
              <!-- Background Gridlines -->
              <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div class="border-b border-slate-100 w-full"></div>
                <div class="border-b border-slate-100 w-full"></div>
                <div class="border-b border-slate-100 w-full"></div>
                <div class="border-b border-slate-100 w-full"></div>
                <div class="border-b-2 border-slate-200 w-full"></div>
              </div>

              <!-- Bars container: flex items-end ensures all bars are perfectly aligned flush to the bottom baseline -->
              <div class="absolute inset-0 flex items-end justify-around px-2 sm:px-6">
                <div
                  v-for="point in data.series"
                  :key="point.label"
                  class="flex flex-col items-center flex-1 max-w-[38px] sm:max-w-[46px] group relative h-full justify-end"
                >
                  <!-- Interactive Hover Tooltip -->
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-black whitespace-nowrap z-20 pointer-events-none shadow-md">
                    {{ pointBooked(point) }} / {{ pointTotal(point) }} slots ({{ pointPercentage(point) }}%)
                  </div>

                  <!-- Stacked Bar: The open slot pillar height is 100% mathematically proportional to maxSlotsAxis -->
                  <div class="w-full flex flex-col items-center justify-end relative">
                    <!-- Floating Slot Count Tag (e.g. 5/10) directly above the cap line -->
                    <div class="absolute -top-6 inset-x-0 text-center whitespace-nowrap pointer-events-none">
                      <span class="text-xs font-black text-slate-800 tabular-nums">
                        {{ pointBooked(point) }}<span class="text-[10px] text-slate-400 font-bold">/{{ pointTotal(point) }}</span>
                      </span>
                    </div>

                    <!-- 1. Floating horizontal accent cap line -->
                    <div class="w-full h-[3.5px] rounded-full bg-[#1875f0] shadow-xs mb-[2px]"></div>

                    <!-- 2. Vertical Bar Pillar representing Total Open Slots (light blue track) -->
                    <!-- Height is EXACTLY (pointTotal / maxSlotsAxis) * 192px so 10 slots matches the 10-line precisely -->
                    <div
                      class="w-full rounded-t-[7px] bg-[#c2e7fd] relative flex flex-col justify-end overflow-hidden shadow-inner"
                      :style="{ height: `${Math.round((pointTotal(point) / maxSlotsAxis) * 180)}px` }"
                      :title="`${pointBooked(point)} booked of ${pointTotal(point)} open slots (${pointPercentage(point)}%)`"
                    >
                      <!-- Booked portion filling from the bottom up in rich vibrant blue (same as donut meter) -->
                      <div
                        class="w-full rounded-t-[5px] bg-[#1976d2] transition-all duration-500 shadow-sm"
                        :style="{ height: `${pointPercentage(point)}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- X-Axis Labels aligned directly below each bar column -->
          <div class="flex items-center pl-11 pr-2 sm:pr-6 mt-3">
            <div
              v-for="point in data.series"
              :key="point.label"
              class="flex-1 text-center"
            >
              <p class="text-xs font-black text-slate-800">{{ point.label }}</p>
              <p class="text-[11px] font-bold text-slate-500 tabular-nums">
                {{ pointBooked(point) }} of {{ pointTotal(point) }}
              </p>
              <p class="text-[10px] font-black text-[#1877f2] tabular-nums mt-0.5">{{ pointPercentage(point) }}%</p>
            </div>
          </div>
        </div>

        <!-- Legend Footer -->
        <div class="mt-8 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] font-bold text-slate-500">
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-[#1976d2]"></span> Booked Slots
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-[#c2e7fd]"></span> Open Capacity
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-1 rounded-full bg-[#1875f0]"></span> Capacity Cap
            </span>
          </div>
          <span class="text-slate-400 font-medium">Auto-updated from live schedule</span>
        </div>
      </section>

      <!-- ===== PEAK DEMAND: PEAK HOURS & PEAK DAYS SECTION ===== -->
      <!-- Peak Day Analytics (Donut/Bar Card) -->
      <section class="min-w-0 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between gap-2">
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.16em] text-brighture-bronze">Weekly Demand Pattern</p>
              <h2 class="mt-0.5 text-base sm:text-lg font-black text-slate-900">Peak Day</h2>
            </div>
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-black">
              <i class="fa-solid fa-fire text-amber-500"></i>
              {{ data.peakDay?.name || 'Thursday' }}
            </span>
          </div>

          <!-- Peak Day Highlight Banner -->
          <div class="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-amber-100/50 border border-amber-200/60 flex items-center justify-between">
            <div>
              <p class="text-[11px] font-bold text-amber-800">Busiest Day Rate</p>
              <p class="text-xl font-black text-slate-900 mt-0.5">{{ data.peakDay?.share || '25%' }} <span class="text-xs font-semibold text-slate-500">of bookings</span></p>
            </div>
            <div class="text-right">
              <span class="text-[10px] uppercase font-black tracking-wider text-amber-700">Insight</span>
              <p class="text-xs font-bold text-slate-700 max-w-[150px] leading-tight">{{ data.peakDay?.note || 'Highest booking rate' }}</p>
            </div>
          </div>

          <!-- Peak Day Breakdown: one column per weekday. Every day but the
               peak is a hatched ghost, so the eye lands on the one solid bar;
               the dotted line is the daily average, tagged in the left gutter
               so the tag never sits on a bar. -->
          <div class="mt-6">
            <div class="relative h-40 pl-14">
              <div
                class="pointer-events-none absolute inset-x-0 z-20 flex translate-y-1/2 items-center"
                :style="{ bottom: `${peakChart.avgPct}%` }"
              >
                <span class="avg-tag relative shrink-0 rounded-l-md bg-slate-900 py-0.5 pl-1.5 pr-2.5 text-[10px] font-bold text-white tabular-nums">
                  Avg {{ peakChart.avg }}
                </span>
                <span class="flex-1 border-t-2 border-dotted border-slate-400/80"></span>
              </div>

              <div class="flex h-full items-end justify-between gap-1.5">
                <div
                  v-for="d in data.peakDays"
                  :key="d.day"
                  class="relative flex h-full flex-1 items-end justify-center"
                >
                  <span
                    v-if="d.isPeak"
                    class="absolute z-30 whitespace-nowrap text-xs font-black text-slate-900 tabular-nums"
                    :style="{ bottom: `calc(${peakChart.pct(d.lessons)}% + 6px)` }"
                  >{{ d.lessons }} classes</span>
                  <div
                    class="w-full max-w-[34px] rounded-t-lg transition-all duration-500"
                    :class="d.isPeak ? 'bar-peak' : 'bar-ghost'"
                    :style="{ height: `${Math.max(3, peakChart.pct(d.lessons))}%` }"
                    :title="`${d.full}: ${d.lessons} classes`"
                  ></div>
                </div>
              </div>
            </div>

            <div class="mt-2 flex justify-between gap-1.5 pl-14">
              <span
                v-for="d in data.peakDays"
                :key="d.day"
                class="flex-1 text-center text-[11px] font-bold"
                :class="d.isPeak ? 'text-[#4285f4]' : 'text-slate-400'"
              >{{ d.day }}</span>
            </div>
          </div>
        </div>

        <p class="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
          Opening more slots on <strong class="text-slate-700">{{ data.peakDay?.name }}</strong> typically fills in &lt; 24h.
        </p>
      </section>

      <!-- Peak Hours Area Graph (2 Columns Wide on XL - Styled matching user's reference image) -->
      <section class="min-w-0 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs xl:col-span-2 flex flex-col justify-between">
        <div>
          <!-- Header with Title & Legend in top-right like user's reference -->
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Time-of-day traffic</p>
              <h2 class="mt-0.5 text-base sm:text-lg font-black text-slate-900">Peak Hours</h2>
              <!-- Says outright that the curve is a total over the whole range,
                   not one day: a single day never holds 64 classes at 2PM. -->
              <p class="mt-0.5 text-xs font-medium text-slate-500">
                Classes at each hour, all days {{ rangePhrase }} added together
              </p>
            </div>

            <!-- Legend, naming the range so the chart reads with the switch -->
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/70 px-3 py-1 rounded-xl shadow-2xs">
                <span class="w-3 h-3 rounded-full bg-[#4285f4] shadow-xs"></span>
                <span>Classes · {{ weekRangeLabel }}</span>
              </span>
            </div>
          </div>

          <!-- Main Chart Container matching user reference image -->
          <div class="mt-6 pt-2">
            <div class="flex items-stretch gap-2 sm:gap-3">
              <!-- Y-Axis Labels: 75, 50, 25, 0 (Identical to reference image) -->
              <div class="flex flex-col justify-between text-[11px] font-bold text-slate-400 tabular-nums w-6 sm:w-7 text-right select-none h-48 py-0.5">
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>

              <!-- Plot Area with horizontal gridlines and SVG area wave -->
              <div class="relative flex-1 h-48">
                <!-- Horizontal Gridlines matching reference -->
                <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div class="border-b border-slate-200/70 w-full"></div>
                  <div class="border-b border-slate-200/70 w-full"></div>
                  <div class="border-b border-slate-200/70 w-full"></div>
                  <div class="border-b border-slate-300 w-full"></div>
                </div>

                <!-- SVG Area and Line Curve (Exact match to reference) -->
                <svg
                  viewBox="0 0 1000 220"
                  preserveAspectRatio="none"
                  class="absolute inset-0 h-full w-full overflow-visible"
                >
                  <defs>
                    <!-- Soft light blue fill matching reference -->
                    <linearGradient id="peakAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#4285f4" stop-opacity="0.22" />
                      <stop offset="100%" stop-color="#4285f4" stop-opacity="0.08" />
                    </linearGradient>
                  </defs>

                  <!-- Shaded Area polygon under curve -->
                  <path
                    :d="peakAreaPath"
                    fill="url(#peakAreaGradient)"
                  />

                  <!-- Smooth Solid Blue Stroke line -->
                  <path
                    :d="peakLinePath"
                    fill="none"
                    stroke="#4285f4"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />

                  <!-- Data Point Nodes (Interactive on Hover) -->
                  <g v-for="(pt, idx) in peakSvgCoords" :key="idx">
                    <!-- Invisible wider hover hit target -->
                    <circle
                      :cx="pt.x"
                      :cy="pt.y"
                      r="12"
                      fill="transparent"
                      class="cursor-pointer"
                      @mouseenter="hoveredPeakPoint = pt"
                      @mouseleave="hoveredPeakPoint = null"
                    />
                  </g>
                </svg>

                <!-- Point dots for the peak and the hovered hour. Drawn in HTML,
                     not in the SVG, because the SVG stretches to fit and would
                     squash a circle into an oval. -->
                <span
                  v-for="pt in peakSvgCoords.filter((p) => p.isPeak || hoveredPeakPoint?.time === p.time)"
                  :key="`dot-${pt.time}`"
                  class="pointer-events-none absolute z-30 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4285f4] ring-2 ring-white"
                  :style="{ left: `${pt.x / 10}%`, top: `${(pt.y / 220) * 100}%` }"
                ></span>

                <!-- The peak, marked the way the Peak Day bars mark theirs: a
                     dotted line at its height, tagged on the left where the
                     night hours leave the plot empty, and its count above the
                     point. Hidden while hovering so it does not collide with
                     the tooltip. -->
                <template v-if="peakMark && !hoveredPeakPoint">
                  <div
                    class="pointer-events-none absolute inset-x-0 z-20 flex -translate-y-1/2 items-center"
                    :style="{ top: `${peakMark.topPct}%` }"
                  >
                    <span class="avg-tag relative shrink-0 rounded-l-md bg-slate-900 py-0.5 pl-1.5 pr-2.5 text-[10px] font-bold text-white tabular-nums">
                      Peak {{ peakMark.time }}
                    </span>
                    <span class="flex-1 border-t-2 border-dotted border-slate-400/80"></span>
                  </div>
                  <span
                    class="pointer-events-none absolute z-30 -translate-x-1/2 whitespace-nowrap text-xs font-black text-slate-900 tabular-nums"
                    :style="{ left: `${peakMark.leftPct}%`, bottom: `calc(${100 - peakMark.topPct}% + 10px)` }"
                  >{{ peakMark.value }} classes</span>
                </template>

                <!-- Floating Tooltip on Hover -->
                <div
                  v-if="hoveredPeakPoint"
                  class="absolute -top-9 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-black pointer-events-none shadow-md whitespace-nowrap transition-all -translate-x-1/2 z-30"
                  :style="{ left: `${hoveredPeakPoint.x / 10}%` }"
                >
                  {{ hoveredPeakPoint.time }}: {{ hoveredPeakPoint.value }} {{ hoveredPeakPoint.value === 1 ? 'class' : 'classes' }}
                </div>
              </div>
            </div>

            <!-- Bottom X-Axis Ticks & Labels matching reference: 1AM, 4AM, 7AM, 10AM, 1PM, 4PM, 7PM, 10PM -->
            <div class="relative pl-8 sm:pl-10 mt-1">
              <!-- Subtle tick marks row -->
              <div class="flex justify-between px-0.5 text-slate-300 pointer-events-none">
                <span v-for="(pt, idx) in peakSvgCoords" :key="idx" class="w-[1px] h-1.5 bg-slate-200"></span>
              </div>

              <!-- Main Labels placed at key intervals matching user image -->
              <div class="flex justify-between text-[10px] sm:text-[11px] font-semibold text-slate-500 pt-1 select-none">
                <span>1AM</span>
                <span>4AM</span>
                <span>7AM</span>
                <span>10AM</span>
                <span>1PM</span>
                <span>4PM</span>
                <span>7PM</span>
                <span>10PM</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Note with Quick Metrics -->
        <div class="mt-6 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] font-bold text-slate-500">
          <div class="flex items-center gap-3">
            <span class="text-slate-700">
              Peak Volume: <strong class="text-[#4285f4] font-black">{{ data.peakHour?.slot || '2PM (64 classes)' }}</strong>
            </span>
            <span class="text-slate-300">&bull;</span>
            <span class="text-slate-600">
              Active Window: <strong>{{ data.peakHour?.window || '2PM – 4PM' }}</strong>
            </span>
          </div>
          <span class="text-slate-400 font-medium">Total per hour, {{ rangePhrase }}</span>
        </div>
      </section>

      <!-- ===== Ratings ===== -->
      <section class="min-w-0 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Student voice</p>
        <h2 class="mt-1 text-base font-black text-slate-900">Rating breakdown</h2>
        <p class="mt-1 text-3xl font-black text-slate-900">
          {{ data.rating }}
          <span class="align-middle text-base font-bold text-amber-500">★</span>
        </p>
        <p class="text-[11px] text-slate-400">from {{ totalRatings }} rated lessons</p>

        <ul class="mt-4 space-y-2">
          <li v-for="row in data.ratings" :key="row.stars" class="flex items-center gap-2.5">
            <span class="w-8 shrink-0 text-[11px] font-bold text-slate-500 tabular-nums">{{ row.stars }}★</span>
            <div class="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-amber-400"
                :style="{ width: `${share(row.count, totalRatings)}%` }"
              ></div>
            </div>
            <span class="w-8 shrink-0 text-right text-[11px] font-bold text-slate-700 tabular-nums">{{ row.count }}</span>
          </li>
        </ul>
      </section>

      <!-- ===== Subject mix ===== -->
      <section class="min-w-0 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-2 sm:p-6">
        <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Curriculum balance</p>
        <h2 class="mt-1 text-base font-black text-slate-900">Subject mix</h2>

        <ul class="mt-4 space-y-3">
          <li v-for="subject in data.subjects" :key="subject.code" class="flex items-center gap-3">
            <span class="w-12 shrink-0 rounded-lg bg-slate-100 px-1.5 py-1 text-center text-[10px] font-black text-slate-600">
              {{ subject.code }}
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex items-baseline justify-between gap-2">
                <p class="truncate text-xs font-bold text-slate-700">{{ subject.label }}</p>
                <p class="shrink-0 text-[11px] font-bold text-slate-500 tabular-nums">
                  {{ subject.lessons }} · {{ share(subject.lessons, data.lessons) }}%
                </p>
              </div>
              <div class="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-brighture-gold to-brighture-gold-deep"
                  :style="{ width: `${share(subject.lessons, data.lessons)}%` }"
                ></div>
              </div>
            </div>
          </li>
        </ul>
      </section>

      <!-- ===== Attendance ===== -->
      <section class="min-w-0 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Reliability</p>
        <h2 class="mt-1 text-base font-black text-slate-900">Attendance</h2>
        <p class="mt-1 text-3xl font-black text-slate-900">{{ data.completionRate }}%</p>
        <p class="text-[11px] text-slate-400">of scheduled lessons completed</p>

        <!-- One stacked bar, because these four numbers are parts of a whole. -->
        <div class="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            v-for="row in data.attendance.filter((r) => r.count)"
            :key="row.label"
            class="h-full first:rounded-l-full last:rounded-r-full"
            :class="toneBg[row.tone]"
            :style="{ width: `${share(row.count, attendanceTotal)}%` }"
            :title="`${row.label}: ${row.count}`"
          ></div>
        </div>

        <ul class="mt-4 space-y-2">
          <li v-for="row in data.attendance" :key="row.label" class="flex items-center gap-2.5">
            <span class="h-2.5 w-2.5 shrink-0 rounded-sm" :class="toneBg[row.tone]"></span>
            <span class="min-w-0 flex-1 truncate text-xs font-semibold text-slate-600">{{ row.label }}</span>
            <span class="shrink-0 text-xs font-bold text-slate-800 tabular-nums">{{ row.count }}</span>
          </li>
        </ul>
      </section>

    </div>

    <p class="text-[11px] text-slate-400">
      Figures cover {{ activeRange.toLowerCase() }} and exclude lessons still upcoming.
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTeacherStore } from '../../stores/useTeacherStore';

const teacher = useTeacherStore();

const activeRange = ref(teacher.analytics.ranges[0]);
const data = computed(() => teacher.analytics.byRange[activeRange.value]);

const kpis = computed(() => [
  {
    label: 'Lessons taught', value: data.value.lessons, icon: 'fa-solid fa-chalkboard-user text-sky-600', iconBg: 'bg-sky-50',
  },
  {
    label: 'Hours taught', value: data.value.hours, icon: 'fa-solid fa-clock text-indigo-600', iconBg: 'bg-indigo-50',
  },
  {
    label: 'Students',
    value: data.value.students,
    hint: 'taught in this period',
    icon: 'fa-solid fa-user-group text-rose-500',
    iconBg: 'bg-rose-50',
  },
  {
    label: 'Returning students',
    value: `${data.value.repeatShare}%`,
    hint: 'booked you again',
    icon: 'fa-solid fa-repeat text-emerald-500',
    iconBg: 'bg-emerald-50',
  },
]);

// Peak Day columns. The busiest day reaches 78% of the track, leaving headroom
// for the count printed above it.
const peakChart = computed(() => {
  const days = data.value.peakDays || [];
  const max = Math.max(1, ...days.map((d) => d.lessons));
  const pct = (n) => (n / max) * 78;
  const mean = days.length ? days.reduce((sum, d) => sum + d.lessons, 0) / days.length : 0;
  return { pct, avg: mean.toFixed(1), avgPct: pct(mean) };
});

const totalRatings = computed(() => data.value.ratings.reduce((sum, row) => sum + row.count, 0));
const attendanceTotal = computed(() => data.value.attendance.reduce((sum, row) => sum + row.count, 0));

/** Guarded so an empty range renders a flat bar instead of NaN. */
const share = (value, total) => (total ? Math.round((value / total) * 100) : 0);

const pointBooked = (point) => point.booked ?? point.lessons ?? 0;
const pointTotal = (point) => point.total ?? point.lessons ?? 1;
const pointPercentage = (point) => {
  const total = pointTotal(point);
  const booked = pointBooked(point);
  if (!total) return 0;
  return Math.min(100, Math.max(0, Math.round((booked / total) * 100)));
};

const totalBookedSlots = computed(() => {
  return data.value.series.reduce((sum, p) => sum + pointBooked(p), 0);
});

const totalOpenSlots = computed(() => {
  return data.value.series.reduce((sum, p) => sum + pointTotal(p), 0);
});

const overallBookingRate = computed(() => {
  if (!totalOpenSlots.value) return 0;
  return Math.round((totalBookedSlots.value / totalOpenSlots.value) * 100);
});

const maxSlotsAxis = computed(() => {
  const max = Math.max(...data.value.series.map(p => pointTotal(p)), 1);
  if (max <= 12) return 12; // Gives clean ticks: 12, 9, 6, 3, 0 (so 10 and 11 slots clearly rise past 8/9!)
  if (max <= 16) return 16; // Ticks: 16, 12, 8, 4, 0
  if (max <= 20) return 20; // Ticks: 20, 15, 10, 5, 0
  return Math.ceil(max / 4) * 4;
});

const axisSlotsTicks = computed(() => {
  const max = maxSlotsAxis.value;
  const step = max / 4;
  return [
    max,
    Math.round(step * 3),
    Math.round(step * 2),
    Math.round(step * 1),
    0,
  ];
});

/* The ring: booked and still-open as two separate arcs with a gap between
   them. Round caps reach half the stroke past each end of a dash, so each
   dash is shortened by a full stroke width on top of the gap. */
// Snug between the outer outline (r 60 in viewBox units) and the white
// disc (115px of 175px), leaving the same ~3px gap inside and out.
const RING_R = 49.5;
const RING_W = 16;
const RING_C = 2 * Math.PI * RING_R;
const RING_GAP = 2;

/** The selected range as it reads mid-sentence: "all days this week". */
const rangePhrase = computed(() => (
  activeRange.value === 'Last 3 months' ? 'in the last 3 months' : activeRange.value.toLowerCase()
));

/** The dates behind "This week"; the longer ranges name themselves. */
const weekRangeLabel = computed(() => {
  if (activeRange.value !== 'This week') return activeRange.value;
  const [y, m, d] = teacher.thisWeekStart.split('-').map(Number);
  const from = new Date(y, m - 1, d);
  const to = new Date(y, m - 1, d + 6);
  const mon = (x) => x.toLocaleDateString('en-US', { month: 'short' });
  const head = from.getMonth() === to.getMonth() ? `${from.getDate()}` : `${from.getDate()} ${mon(from)}`;
  return `${head} \u2192 ${to.getDate()} ${mon(to)} ${to.getFullYear()}`;
});

const capacityLabel = computed(
  () => `${capacity.value.booked} of ${capacity.value.open} open slots booked, ${activeRange.value.toLowerCase()}`
);

const capacity = computed(() => {
  const open = data.value.capacity?.open ?? 0;
  const booked = Math.min(data.value.capacity?.booked ?? 0, open);
  const free = Math.max(0, open - booked);
  const hours = open / 2;

  const parts = [
    { key: 'booked', value: booked, stroke: 'url(#bookedHatch)' },
    { key: 'open', value: free, stroke: '#bae6fd' },
  ].filter((p) => p.value > 0);

  // A lone share is a closed ring and needs no gap or caps.
  let start = 0;
  const segments = parts.map((p) => {
    const arc = (p.value / open) * RING_C;
    const seg = parts.length === 1
      ? { key: p.key, stroke: p.stroke, dash: `${RING_C} 0`, offset: 0 }
      : {
        key: p.key,
        stroke: p.stroke,
        dash: `${Math.max(0.01, arc - RING_GAP - RING_W)} ${RING_C}`,
        offset: -(start + (RING_GAP + RING_W) / 2),
      };
    start += arc;
    return seg;
  });

  return {
    open,
    booked,
    free,
    hours: Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`,
    segments,
  };
});

const toneBg = {
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
  amber: 'bg-amber-400',
  slate: 'bg-slate-300',
};

// SVG Area Chart calculations for Peak Hours (Matching reference exactly)
const hoveredPeakPoint = ref(null);

const peakPoints = computed(() => {
  return data.value?.peakHours || [];
});

const peakSvgCoords = computed(() => {
  const points = peakPoints.value;
  if (!points || !points.length) return [];
  const W = 1000;
  const H = 220;
  const maxY = 75; // 75 classes scale matching reference image Y-axis
  const n = points.length;

  return points.map((p, i) => {
    const x = Math.round((i / (n - 1)) * W);
    // Y-axis inverted in SVG: 0 at top, H at bottom
    const y = Math.round(H - (Math.min(maxY, p.value) / maxY) * H);
    return { ...p, x, y };
  });
});

// The hour flagged as the peak, or the highest one if none is flagged, in
// percentages of the plot so the HTML overlay lines up with the SVG.
const peakMark = computed(() => {
  const coords = peakSvgCoords.value;
  if (!coords.length) return null;
  const pt = coords.find((p) => p.isPeak)
    || coords.reduce((best, p) => (p.value > best.value ? p : best));
  return { ...pt, leftPct: pt.x / 10, topPct: (pt.y / 220) * 100 };
});

const peakLinePath = computed(() => {
  const coords = peakSvgCoords.value;
  if (!coords.length) return '';
  return coords.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');
});

const peakAreaPath = computed(() => {
  const line = peakLinePath.value;
  if (!line) return '';
  const W = 1000;
  const H = 220;
  return `${line} L ${W} ${H} L 0 ${H} Z`;
});
</script>

<style scoped>
/* Non-peak days: diagonal hatching on a pale track, as a ghost of a bar. */
.bar-ghost {
  background-color: #f1f5f9;
  background-image: repeating-linear-gradient(135deg, #cbd5e1 0 1.5px, transparent 1.5px 7px);
}

/* The peak: solid blue with a faint version of the same hatching, so it
   reads as the same kind of bar, filled in. */
.bar-peak {
  background-color: #4285f4;
  background-image: repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0 1.5px, transparent 1.5px 7px);
}

/* The average tag's arrow, pointing along the dotted line. */
.avg-tag::after {
  content: '';
  position: absolute;
  top: 0;
  right: -8px;
  border-style: solid;
  border-width: 9px 0 9px 8px;
  border-color: transparent transparent transparent #0f172a;
}
</style>
