<template>
  <div class="chart-container">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

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
  labels: ['Світове населення', 'Україна'],
  datasets: [
    {
      label: 'Щоденне використання AI (%)',
      data: [21, 25], // 21% world, higher in Ukraine
      backgroundColor: [
        'rgba(139, 92, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)'
      ],
      borderColor: [
        'rgba(139, 92, 246, 1)',
        'rgba(16, 185, 129, 1)'
      ],
      borderWidth: 2,
      borderRadius: 8,
      hoverBackgroundColor: [
        'rgba(139, 92, 246, 0.9)',
        'rgba(16, 185, 129, 0.9)'
      ]
    }
  ]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: getTextColor(),
        font: {
          size: 12,
          weight: 'bold'
        },
        padding: 10,
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
          const value = context.parsed.x
          const label = `${value}% користуються AI щодня`

          if (context.dataIndex === 1) {
            return [label, 'Україна - вище світового рівня! 🇺🇦']
          }

          return label
        }
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      max: 100,
      grid: {
        color: isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
      },
      ticks: {
        color: getTextColor(),
        font: {
          size: 14
        },
        callback: function(value: any) {
          return `${value}%`
        }
      }
    },
    y: {
      grid: {
        display: false
      },
      ticks: {
        color: getTextColor(),
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }
  },
  animation: {
    duration: 2000,
    easing: 'easeOutQuart'
  }
}))
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 380px;
  padding: 1rem;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .chart-container {
    height: 300px;
    padding: 0.5rem;
  }
}
</style>
