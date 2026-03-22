<template>
  <div class="chart-container">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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
  labels: ['2022', '2023', '2024', '2025', '2026', '2029', '2033'],
  datasets: [
    {
      label: 'Витрати на AI (млрд $)',
      data: [120, 240, 500, 1500, 2000, 3300, 3500],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: '#10b981',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#10b981',
      pointHoverBorderWidth: 3
    }
  ]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
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
    title: {
      display: false
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
          let label = context.dataset.label || ''
          if (label) {
            label += ': '
          }
          const value = context.parsed.y
          if (value >= 1000) {
            label += `$${(value / 1000).toFixed(1)}T`
          } else {
            label += `$${value}B`
          }

          // Add context notes
          if (context.dataIndex === 3) {
            return [label, '≈ 6 річних бюджетів України']
          }

          return label
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
      },
      ticks: {
        color: getTextColor(),
        font: {
          size: 14
        },
        callback: function(value: any) {
          if (value >= 1000) {
            return `$${value / 1000}T`
          }
          return `$${value}B`
        }
      }
    },
    x: {
      grid: {
        color: isDark.value ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        color: getTextColor(),
        font: {
          size: 14,
          weight: 'bold'
        }
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
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
