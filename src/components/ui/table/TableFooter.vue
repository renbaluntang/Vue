<script setup>
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps({ className: { type: String, default: "" } });
const classes = computed(() => cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", props.className));
</script>

<template>
  <tfoot :class="classes"><slot /></tfoot>
</template>
