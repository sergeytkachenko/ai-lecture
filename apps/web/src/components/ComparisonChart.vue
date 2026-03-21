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
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const props = defineProps<{
  labels: string[];
  beforeValues: number[];
  afterValues: number[];
  beforeLabel?: string;
  afterLabel?: string;
}>();

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.beforeLabel || 'До лекції',
      data: props.beforeValues,
      backgroundColor: '#64748b',
      borderRadius: 6,
    },
    {
      label: props.afterLabel || 'Після лекції',
      data: props.afterValues,
      backgroundColor: '#10b981',
      borderRadius: 6,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#cbd5e1', font: { size: 14 }, padding: 16 },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 14 } } },
    y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', font: { size: 14 }, stepSize: 1 } },
  },
};
</script>

<template>
  <div class="h-72">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
