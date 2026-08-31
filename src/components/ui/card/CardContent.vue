<script setup>
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps({ className: { type: String, default: "" } });
const classes = computed(() => cn("p-6 pt-0", props.className));
</script>

<template>
  <div :class="classes"><slot /></div>
</template>
