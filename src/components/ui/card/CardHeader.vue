<script setup>
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps({ className: { type: String, default: "" } });
const classes = computed(() => cn("flex flex-col space-y-1.5 p-6", props.className));
</script>

<template>
  <div :class="classes"><slot /></div>
</template>
