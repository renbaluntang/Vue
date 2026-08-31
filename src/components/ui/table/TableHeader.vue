<script setup>
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps({ className: { type: String, default: "" } });
const classes = computed(() => cn("[&_tr]:border-b", props.className));
</script>

<template>
  <thead :class="classes"><slot /></thead>
</template>
