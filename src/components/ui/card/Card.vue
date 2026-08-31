<script setup>
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps({ className: { type: String, default: "" } });
const classes = computed(() => cn("rounded-xl border bg-card text-card-foreground shadow", props.className));
</script>

<template>
  <div :class="classes"><slot /></div>
</template>
