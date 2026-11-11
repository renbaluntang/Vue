<template>
  <!-- A corrected passage drawn over the student's own words: removed words
       struck through in red, added words underlined in green. The teacher
       never marks anything up by hand; they edit the text and this works out
       the difference. Used on both sides, so the teacher's preview is exactly
       what the student will see. -->
  <p class="m-0 whitespace-pre-wrap font-paper text-slate-900" :class="sizeClass"><template
    v-for="(seg, k) in segments"
    :key="k"
  ><del
    v-if="seg.type === 'del'"
    class="text-[#B42318]/80 decoration-[#B42318] decoration-[1.5px]"
  ><span class="sr-only">removed: </span>{{ seg.text }}</del><ins
    v-else-if="seg.type === 'ins'"
    class="rounded-[3px] bg-[#0F766E]/10 px-0.5 font-medium text-[#0F766E] no-underline [box-shadow:inset_0_-1.5px_0_#0F766E]"
  ><span class="sr-only">added: </span>{{ seg.text }}</ins><span v-else>{{ seg.text }}</span>{{ seg.gap }}</template></p>
</template>

<script setup>
import { computed } from 'vue';
import { diffWords } from '@/lib/wordDiff';

const props = defineProps({
  /** The passage as the student sent it. */
  original: { type: String, default: '' },
  /** The assessor's corrected version. */
  corrected: { type: String, default: '' },
  /** 'lg' for the reading view, 'sm' for a compact preview. */
  size: { type: String, default: 'lg' },
});

const segments = computed(() => diffWords(props.original, props.corrected));
const sizeClass = computed(() => (props.size === 'sm' ? 'text-[15px] leading-[1.8]' : 'text-[17px] leading-[1.9]'));
</script>
