<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-y-auto transform scale-100 transition-transform duration-300 animate-in zoom-in-95 max-h-[94vh] supports-[max-height:100dvh]:max-h-[94dvh]">
      <!-- Header -->
      <div class="bg-gradient-to-br from-brighture-gold to-emerald-600 p-6 text-white text-center relative">
        <button @click="$emit('close')" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition">
          ✕
        </button>
        <div class="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center text-3xl mb-3 shadow-inner">
          ⚡
        </div>
        <h2 class="text-2xl font-bold tracking-tight">Free Conversation</h2>
        <p class="text-emerald-100 text-sm mt-1">Start a 25-minute lesson right now.</p>
      </div>

      <!-- Body -->
      <div v-if="!isConfirmed" class="p-6 space-y-6">
        <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
          <div class="flex justify-between items-center text-sm">
            <span class="text-slate-500 font-semibold">Lesson Time:</span>
            <span class="text-slate-800 font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-md">Starts Now</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-slate-500 font-semibold">Teacher:</span>
            <span class="text-slate-800 font-bold flex items-center gap-1">
              <span class="w-4 h-4 rounded-full bg-slate-200 animate-spin"></span>
              Auto-assigned
            </span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-slate-500 font-semibold">Subject:</span>
            <span class="text-slate-800 font-bold">Free Conversation</span>
          </div>
          <div class="flex justify-between items-center text-sm border-t border-slate-200 pt-3 mt-3">
            <span class="text-slate-500 font-semibold">Cost:</span>
            <span class="text-amber-600 font-black text-lg">5 pts</span>
          </div>
        </div>

        <div class="text-center text-xs text-slate-400 font-medium px-4">
          A teacher will be automatically selected based on availability. By booking, 5 points will be deducted immediately.
        </div>

        <button 
          @click="confirmBooking"
          :disabled="isProcessing"
          class="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-lg shadow-md transition-all hover:bg-slate-800 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span v-if="isProcessing" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ isProcessing ? 'Finding Teacher...' : 'Book Now' }}
        </button>
      </div>

      <!-- Success State -->
      <div v-else class="p-8 text-center space-y-4">
        <div class="w-20 h-20 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl shadow-inner animate-bounce">
          🎉
        </div>
        <h3 class="text-2xl font-bold text-slate-800">Booked Successfully!</h3>
        <p class="text-slate-500 font-medium">Your Free Conversation starts immediately. Please join the Google Meet room.</p>
        
        <div class="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mt-4">
          <p class="text-xs text-emerald-500 font-bold uppercase tracking-wider mb-1">Assigned Teacher</p>
          <div class="flex items-center justify-center gap-2">
            <img :src="teacherImage('Jane Pasanting')" alt="Jane Pasanting" class="w-8 h-8 rounded-full object-cover" />
            <span class="font-bold text-slate-700">Jane Pasanting</span>
          </div>
        </div>

        <button 
          @click="$emit('close')"
          class="w-full mt-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold shadow-md transition-all hover:bg-emerald-700"
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
