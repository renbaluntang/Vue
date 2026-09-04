<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-y-auto transform scale-100 transition-transform duration-300 animate-in zoom-in-95 max-h-[94vh] supports-[max-height:100dvh]:max-h-[94dvh]">
      <!-- Header -->
      <div class="relative overflow-hidden rounded-t-3xl border-b border-white/10 p-6 text-white text-center bg-[radial-gradient(120%_140%_at_90%_10%,rgba(255,205,0,0.18)_0%,rgba(255,205,0,0.04)_40%,transparent_70%),radial-gradient(70%_90%_at_0%_100%,rgba(51,65,85,0.25)_0%,transparent_60%),linear-gradient(135deg,#131722_0%,#1a202c_48%,#0b0e14_100%)]">
        <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <button @click="$emit('close')" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition">
          ✕
        </button>
        <div class="w-14 h-14 mx-auto bg-white/[0.08] border border-white/10 rounded-2xl flex items-center justify-center text-2xl mb-3 shadow-inner">
          ⚡
        </div>
        <div class="flex items-center justify-center gap-2">
          <h2 class="text-xl sm:text-2xl font-black tracking-tight">Talk Now</h2>
          <span class="rounded-full bg-brighture-gold px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-brighture-ink shadow-sm">
            Instant
          </span>
        </div>
        <p class="text-slate-300 text-xs sm:text-sm mt-1">Start a 25-minute lesson right now.</p>
      </div>

      <!-- Body -->
      <div v-if="!isConfirmed" class="p-6 space-y-6">
        <div class="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-3">
          <div class="flex justify-between items-center text-sm">
            <span class="text-slate-500 font-semibold">Lesson Time:</span>
            <span class="font-bold bg-brighture-cream text-brighture-bronze px-2.5 py-0.5 rounded-lg border border-brighture-gold/30 text-xs">Starts Now</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-slate-500 font-semibold">Teacher:</span>
            <span class="text-slate-800 font-bold flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              Auto-assigned
            </span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-slate-500 font-semibold">Subject:</span>
            <span class="text-slate-800 font-bold">Talk Now</span>
          </div>
          <div class="flex justify-between items-center text-sm border-t border-slate-200 pt-3 mt-3">
            <span class="text-slate-500 font-semibold">Cost:</span>
            <span class="text-brighture-bronze font-black text-lg">5 pts</span>
          </div>
        </div>

        <div class="text-center text-xs text-slate-400 font-medium px-4">
          A teacher will be automatically selected based on availability. By booking, 5 points will be deducted immediately.
        </div>

        <button 
          @click="confirmBooking"
          :disabled="isProcessing"
          class="w-full py-4 rounded-2xl bg-brighture-gold text-brighture-ink font-bold text-base shadow-md shadow-brighture-amber/30 transition-all hover:bg-brighture-gold-deep hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span v-if="isProcessing" class="w-5 h-5 border-2 border-brighture-ink/30 border-t-brighture-ink rounded-full animate-spin"></span>
          {{ isProcessing ? 'Finding Teacher...' : 'Book Now' }}
        </button>
      </div>

      <!-- Success State -->
      <div v-else class="p-8 text-center space-y-4">
        <div class="w-20 h-20 mx-auto bg-amber-50 border border-amber-200 text-amber-500 rounded-full flex items-center justify-center text-4xl shadow-inner animate-bounce">
          🎉
        </div>
        <h3 class="text-2xl font-black text-slate-900">Booked Successfully!</h3>
        <p class="text-slate-500 font-medium text-sm">Your Talk Now lesson starts immediately. Please join the Google Meet room.</p>
        
        <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mt-4">
          <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Assigned Teacher</p>
          <div class="flex items-center justify-center gap-2">
            <img :src="teacherImage('Jane Pasanting')" alt="Jane Pasanting" class="w-8 h-8 rounded-full object-cover border border-slate-200" />
            <span class="font-bold text-slate-800">Jane Pasanting</span>
          </div>
        </div>

        <button 
          @click="$emit('close')"
          class="w-full mt-6 py-3.5 rounded-2xl bg-brighture-gold text-brighture-ink font-bold shadow-md hover:bg-brighture-gold-deep transition-all active:scale-95"
        >
          Join Google Meet
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { teacherImage } from '@/lib/teacherImages';
import { ref, watch } from 'vue';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close']);

const isProcessing = ref(false);
const isConfirmed = ref(false);

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    isProcessing.value = false;
    isConfirmed.value = false;
  }
});

const confirmBooking = () => {
  isProcessing.value = true;
  setTimeout(() => {
    isProcessing.value = false;
    isConfirmed.value = true;
  }, 1500);
};
</script>
