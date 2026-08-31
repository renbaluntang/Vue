<script setup>
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps({
  value: { type: Number, default: 0 },
  className: { type: String, default: "" },
});

const classes = computed(() => cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", props.className));
const indicatorStyle = computed(() => ({ transform: `translateX(-${100 - (props.value || 0)}%)` }));
</script>

<template>
  <div :class="classes" role="progressbar" :aria-valuenow="value" aria-valuemin="0" aria-valuemax="100">
    <div class="h-full w-full flex-1 bg-primary transition-all" :style="indicatorStyle" />
  </div>
</template>
