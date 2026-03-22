<template>
  <div class="market-growth-container">
    <!-- Legend -->
    <div class="legend">
      <div class="legend-item">
        <div class="legend-dot green"></div>
        <span>Загальні витрати на AI (Gartner)</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot blue"></div>
        <span>Розмір ринку AI</span>
      </div>
    </div>

    <!-- Chart -->
    <div class="chart-area">
      <div
        v-for="(year, index) in chartData"
        :key="year.year"
        class="year-column"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <!-- Bars Container -->
        <div class="bars-container">
          <!-- Gartner Bar -->
          <div class="bar-group">
            <div class="bar-value green-text">{{ formatValue(year.gartner) }}</div>
            <div
              class="bar green-bar"
              :style="{ height: `${getBarHeight(year.gartner)}px` }"
            ></div>
          </div>

          <!-- Market Bar -->
          <div class="bar-group" v-if="year.market > 0">
            <div class="bar-value blue-text">{{ formatValue(year.market) }}</div>
            <div
              class="bar blue-bar"
              :style="{ height: `${getBarHeight(year.market)}px` }"
            ></div>
          </div>
        </div>

        <!-- Year Label -->
        <div class="year-info">
          <div class="year">{{ year.year }}</div>
          <div class="year-subtitle" v-if="year.note">{{ year.note }}</div>
        </div>
      </div>
    </div>

    <!-- Source -->
    <div class="source">
      Джерела: Gartner, Statista, Grand View Research
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const chartData = [
  { year: 2022, gartner: 120, market: 0 },
  { year: 2023, gartner: 240, market: 0 },
  { year: 2024, gartner: 500, market: 280 },
  { year: 2025, gartner: 1500, market: 390, note: '≈ ВВП Іспанії' },
  { year: 2026, gartner: 2000, market: 680, note: 'прогноз' },
  { year: 2029, gartner: 3300, market: 1800, note: 'прогноз' },
  { year: 2033, gartner: 3500, market: 4800, note: '×10 за декаду' }
]

const maxValue = 4800 // Maximum value for scaling
const maxBarHeight = 280 // Maximum bar height in pixels

const getBarHeight = (value: number): number => {
  return (value / maxValue) * maxBarHeight
}

const formatValue = (value: number): string => {
  if (value >= 1000) {
    const trillions = value / 1000
    return `$${trillions.toFixed(1)}T`
  }
  return `$${value}B`
}
</script>

<style scoped>
.market-growth-container {
  width: 100%;
  padding: 0.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.legend {
  display: flex;
  gap: 2rem;
  padding-left: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-dot.green {
  background: #10b981;
}

.legend-dot.blue {
  background: #3b82f6;
}

.chart-area {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 320px;
  padding: 0 0.5rem;
  gap: 0.75rem;
}

.year-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  animation: fadeInUp 0.6s ease-out backwards;
}

.bars-container {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
  min-height: 280px;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.bar-value {
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
}

.green-text {
  color: #10b981;
}

.blue-text {
  color: #60a5fa;
}

.bar {
  width: 50px;
  border-radius: 6px 6px 0 0;
  position: relative;
  transition: all 0.3s ease;
  animation: growHeight 1.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

.bar:hover {
  filter: brightness(1.15);
}

.green-bar {
  background: linear-gradient(180deg, #34d399 0%, #10b981 100%);
}

.blue-bar {
  background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
}

.year-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
}

.year {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.year-subtitle {
  font-size: 0.65rem;
  color: var(--text-secondary);
  font-weight: 500;
  opacity: var(--text-secondary-opacity);
}

.source {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-align: right;
  padding-right: 1rem;
  opacity: var(--text-tertiary-opacity);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes growHeight {
  from {
    height: 0;
  }
}

@media (max-width: 768px) {
  .market-growth-container {
    padding: 0.5rem;
  }

  .chart-area {
    height: 300px;
    gap: 0.5rem;
  }

  .bars-container {
    gap: 0.25rem;
    min-height: 250px;
  }

  .bar {
    width: 35px;
  }

  .bar-value {
    font-size: 0.7rem;
  }

  .year {
    font-size: 0.9rem;
  }

  .year-subtitle {
    font-size: 0.6rem;
  }
}
</style>
