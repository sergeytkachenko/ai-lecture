<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const props = defineProps<{
  labels: string[];
  values: number[];
  color?: string;
  horizontal?: boolean;
}>();

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      data: props.values,
      backgroundColor: props.color || '#6366f1',
      borderRadius: 6,
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: props.horizontal ? 'y' as const : 'x' as const,
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 14 } } },
    y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', font: { size: 14 }, stepSize: 1 } },
  },
}));
</script>

<template>
  <div class="h-64">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
