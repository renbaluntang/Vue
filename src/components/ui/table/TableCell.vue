<script setup>
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps({ className: { type: String, default: "" } });
const classes = computed(() =>
  cn("p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", props.className)
);
</script>

<template>
  <td :class="classes"><slot /></td>
</template>
