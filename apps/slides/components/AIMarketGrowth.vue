<template>
  <div class="market-container">
    <div class="chart-wrapper">
      <div class="bars-grid">
        <div
          v-for="(year, index) in chartData"
          :key="year.year"
          class="year-group"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="bars-pair">
            <!-- Gartner Bar (Green) -->
            <div class="bar-wrapper">
              <div
                class="bar gartner-bar"
                :style="{ height: `${(year.gartner / maxValue) * 100}%` }"
              ></div>
            </div>

            <!-- Market Bar (Blue) -->
            <div class="bar-wrapper" v-if="year.market > 0">
              <div
                class="bar market-bar"
                :style="{ height: `${(year.market / maxValue) * 100}%` }"
              ></div>
            </div>
          </div>

          <div class="values-row">
            <span class="value-label">{{ formatValue(year.gartner) }}</span>
            <span class="value-label" v-if="year.market > 0">{{ formatValue(year.market) }}</span>
          </div>

          <div class="year-label">
            {{ year.year }}
            <span v-if="year.note" class="year-note">{{ year.note }}</span>
          </div>
        </div>
      </div>

      <div class="legend">
        <div class="legend-item">
          <div class="legend-color gartner-color"></div>
          <span>Загальні витрати на AI (Gartner)</span>
        </div>
        <div class="legend-item">
          <div class="legend-color market-color"></div>
          <span>Розмір ринку AI</span>
        </div>
      </div>
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

const maxValue = computed(() => {
  return Math.max(...chartData.map(d => Math.max(d.gartner, d.market)))
})

const formatValue = (value: number): string => {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}T`
  }
  return `$${value}B`
}
</script>

<style scoped>
.market-container {
  width: 100%;
  padding: 0.75rem 1rem;
  max-height: 420px;
  overflow: hidden;
}

.chart-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

.bars-grid {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex: 1;
  gap: 1rem;
  padding: 0 0.5rem;
  min-height: 280px;
}

.year-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  animation: fadeInUp 0.6s ease-out backwards;
}

.bars-pair {
  display: flex;
  gap: 0.35rem;
  width: 100%;
  height: 100%;
  align-items: flex-end;
  justify-content: center;
}

.bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
}

.bar {
  width: 100%;
  max-width: 45px;
  border-radius: 6px 6px 0 0;
  position: relative;
  transition: all 0.3s ease;
  animation: growHeight 1.2s ease-out backwards;
}

.bar:hover {
  transform: translateY(-4px);
  filter: brightness(1.2);
}

.gartner-bar {
  background: linear-gradient(180deg, #10b981, #059669);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.market-bar {
  background: linear-gradient(180deg, #3b82f6, #2563eb);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.values-row {
  display: flex;
  gap: 0.35rem;
  justify-content: center;
  padding-top: 0.5rem;
  width: 100%;
}

.value-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #e5e7eb;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
}

.year-label {
  font-size: 1rem;
  font-weight: 700;
  color: #e5e7eb;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-top: 0.5rem;
  width: 100%;
}

.year-note {
  font-size: 0.7rem;
  font-weight: 500;
  color: #9ca3af;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #e5e7eb;
  font-weight: 500;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.gartner-color {
  background: linear-gradient(135deg, #10b981, #059669);
}

.market-color {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
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
  .market-container {
    padding: 0.5rem;
  }

  .bars-grid {
    gap: 0.5rem;
  }

  .bars-pair {
    gap: 0.25rem;
  }

  .bar {
    max-width: 32px;
  }

  .bar-label {
    font-size: 0.65rem;
  }

  .year-label {
    font-size: 0.75rem;
  }

  .legend {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
}
</style>
