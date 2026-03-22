<template>
  <div class="chart-container">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const isDark = ref(true)

const getTextColor = () => {
  return getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
}

const updateTheme = () => {
  isDark.value = document.documentElement.getAttribute('data-theme') !== 'light'
}

onMounted(() => {
  updateTheme()
  const observer = new MutationObserver(updateTheme)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
  onUnmounted(() => observer.disconnect())
})

const chartData = computed(() => ({
  labels: ['Користувачі ChatGPT', 'Решта населення світу'],
  datasets: [
    {
      data: [900, 7100], // 900M ChatGPT users vs ~8B world population
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        isDark.value ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'
      ],
      borderWidth: 2,
      hoverOffset: 20
    }
  ]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: getTextColor(),
        font: {
          size: 12,
          weight: 'bold'
        },
        padding: 12,
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      backgroundColor: isDark.value ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
      titleColor: isDark.value ? '#fff' : '#000',
      bodyColor: isDark.value ? '#fff' : '#000',
      borderColor: isDark.value ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
      borderWidth: 1,
      padding: 16,
      titleFont: {
        size: 16,
        weight: 'bold'
      },
      bodyFont: {
        size: 14
      },
      callbacks: {
        label: function(context: any) {
          const label = context.label || ''
          const value = context.parsed
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)

          if (context.dataIndex === 0) {
            return [
              `${label}: ${value}M`,
              `${percentage}% населення`,
              'Це як кожен українець ×20'
            ]
          }

          return `${label}: ${percentage}%`
        }
      }
    }
  },
  cutout: '65%',
  animation: {
    animateRotate: true,
    animateScale: true,
    duration: 2000
  }
}))
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 380px;
  padding: 1rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .chart-container {
    height: 300px;
    padding: 0.5rem;
  }
}
</style>
