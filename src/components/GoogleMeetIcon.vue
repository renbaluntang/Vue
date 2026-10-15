<template>
  <!-- Flat camera: a yellow body with a much rounder top-left corner, a pink
       glow where the orange lens joins it, and a white dot bottom-left.
       Decorative: the button label says what it does. -->
  <svg
    viewBox="0 0 560 436"
    class="shrink-0"
    :class="sizeClass"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient :id="bodyId" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#FFC93A" />
        <stop offset="1" stop-color="#FFD83D" />
      </linearGradient>
      <radialGradient :id="glowId" cx="403" cy="226" r="190" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FFB2DC" />
        <stop offset="0.35" stop-color="#FFC6B0" stop-opacity="0.75" />
        <stop offset="1" stop-color="#FFD83D" stop-opacity="0" />
      </radialGradient>
    </defs>
    <path d="M403 136 L493 72 Q518 56 540 70 Q558 82 558 110 V326 Q558 354 540 366 Q518 380 493 364 L403 300 Z" fill="#FFA630" />
    <path :d="BODY" :fill="`url(#${bodyId})`" />
    <path :d="BODY" :fill="`url(#${glowId})`" />
    <circle cx="95" cy="342" r="45" fill="#ffffff" />
  </svg>
</template>

<script setup>
import { computed, useId } from 'vue';

const props = defineProps({
  /** 'sm' for compact rows, 'md' for regular buttons, 'lg' for hero buttons. */
  size: { type: String, default: 'md' },
});

// Gradient ids must be unique per instance, or every icon on the page
// would point at the first one's gradients.
const uid = useId();
const bodyId = `meet-body-${uid}`;
const glowId = `meet-glow-${uid}`;

/** Top-left radius 140, the other corners about 50. */
const BODY = 'M140 0 H348 A55 55 0 0 1 403 55 V380 A55 55 0 0 1 348 435 H50 A50 50 0 0 1 0 385 V140 A140 140 0 0 1 140 0 Z';

const SIZES = { sm: 'h-[13px] w-[17px]', md: 'h-[15px] w-[19px]', lg: 'h-[19px] w-[24px]' };
const sizeClass = computed(() => SIZES[props.size] ?? SIZES.md);
</script>
