<script setup>
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps({ className: { type: String, default: "" } });
const classes = computed(() =>
  cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", props.className)
);
</script>

<template>
  <tr :class="classes"><slot /></tr>
</template>
