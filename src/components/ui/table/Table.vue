<script setup>
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps({ className: { type: String, default: "" } });
const classes = computed(() => cn("w-full caption-bottom text-sm", props.className));
</script>

<template>
  <div class="relative w-full overflow-auto">
    <table :class="classes"><slot /></table>
  </div>
</template>
