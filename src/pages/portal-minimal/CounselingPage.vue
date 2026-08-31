<template>
  <div class="p-3.5 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5 sm:space-y-6 animate-in fade-in duration-500 pb-20">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
      <div>
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-zinc-900">Student Counseling</h1>
        <p class="text-xs sm:text-sm text-zinc-500 font-normal mt-0.5">Book 1-on-1 counseling with bilingual advisors to align your study goals and curriculum.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
      <div class="bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3.5 sm:space-y-4">
        <div class="flex items-center gap-3">
          <span class="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-lg shrink-0">🧭</span>
          <div>
            <h2 class="text-sm sm:text-base font-bold text-zinc-900">Curriculum Advisory</h2>
            <p class="text-xs text-zinc-400">Regular progress check & class recommendations</p>
          </div>
        </div>
        <p class="text-xs text-zinc-600 leading-relaxed">
          Need guidance on which teachers or subjects best match your goals? Speak with our head counselor (Japanese or English).
        </p>
        <button class="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs transition active:scale-95 shadow-xs">
          Book Free 20m Consultation
        </button>
      </div>

      <div class="bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3.5 sm:space-y-4">
        <div class="flex items-center gap-3">
          <span class="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-lg shrink-0">🎯</span>
          <div>
            <h2 class="text-sm sm:text-base font-bold text-zinc-900">Level Assessment (GC)</h2>
            <p class="text-xs text-zinc-400">Comprehensive language evaluation</p>
          </div>
        </div>
        <p class="text-xs text-zinc-600 leading-relaxed">
          Evaluate your speaking fluency, pronunciation, and grammatical accuracy against CEFR international benchmarks.
        </p>
        <button class="w-full py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-xs transition active:scale-95">
          Request Evaluation Slot
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
