<script setup lang="ts">
import { computed } from 'vue';
import { Pie } from 'vue-chartjs';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
  labels: string[];
  values: number[];
}>();

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      data: props.values,
      backgroundColor: COLORS.slice(0, props.labels.length),
      borderWidth: 2,
      borderColor: '#0f172a',
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: '#cbd5e1', font: { size: 14 }, padding: 16 },
    },
  },
};
</script>

<template>
  <div class="h-72">
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>
