<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip as ChartJsTooltip,
} from "chart.js";
import { cn } from "@/lib/utils";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, ChartJsTooltip);

const props = defineProps({
  data: { type: Array, required: true },
  config: { type: Object, required: true },
  // Which config keys to draw and in what order (last = drawn on top). Defaults to
  // Object.keys(config), but callers that care about stacking order (e.g. drawing a
  // "taken" line over a "cancelled" line) should pass it explicitly.
  seriesOrder: { type: Array, default: null },
  className: { type: String, default: "" },
});

const canvasRef = ref(null);
let chartInstance = null;

function resolveColor(color) {
  const match = typeof color === "string" && color.match(/var\((--[\w-]+)\)/);
  if (!match) return color;
  const value = getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim();
  return value ? color.replace(match[0], value) : color;
}

function withAlpha(hslColor, alpha) {
  return hslColor.replace(/\)\s*$/, ` / ${alpha})`);
}

function makeGradient(ctx, chartArea, color, opacityTop, opacityBottom) {
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, withAlpha(color, opacityTop));
  gradient.addColorStop(1, withAlpha(color, opacityBottom));
  return gradient;
}

function buildChartData() {
  const keys = props.seriesOrder ?? Object.keys(props.config);
  const labels = props.data.map((row) => row.label);
  return {
    labels,
    datasets: keys.map((key) => {
      const color = resolveColor(props.config[key]?.color ?? "currentColor");
      return {
        key,
        label: props.config[key]?.label ?? key,
        data: props.data.map((row) => row[key]),
        borderColor: color,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: color,
        backgroundColor: (context) => {
          const { chart } = context;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "transparent";
          return makeGradient(ctx, chartArea, color, 0.4, 0.05);
        },
      };
    }),
  };
}

function buildOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { padding: 8 } },
      y: { display: false, grid: { display: false } },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(255,255,255,0.96)",
        borderColor: "rgba(0,0,0,0.08)",
        borderWidth: 1,
        titleColor: "#0f172a",
        bodyColor: "#0f172a",
        padding: 10,
        usePointStyle: true,
        boxPadding: 4,
      },
    },
  };
}

onMounted(() => {
  chartInstance = new Chart(canvasRef.value, {
    type: "line",
    data: buildChartData(),
    options: buildOptions(),
  });
});

watch(
  () => [props.data, props.config, props.seriesOrder],
  () => {
    if (!chartInstance) return;
    chartInstance.data = buildChartData();
    chartInstance.update();
  },
  { deep: true }
);

onBeforeUnmount(() => {
  chartInstance?.destroy();
  chartInstance = null;
});
</script>

<template>
  <div :class="cn('relative', className)">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>
