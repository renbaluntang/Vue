<script setup>
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps({ className: { type: String, default: "" } });
const classes = computed(() => cn("mt-4 text-sm text-muted-foreground", props.className));
</script>

<template>
  <caption :class="classes"><slot /></caption>
</template>
