<template>
  <div class="global-container">
    <div class="content-grid">
      <!-- Left side - Donut Chart -->
      <div class="chart-section">
        <div class="donut-chart">
          <svg viewBox="0 0 200 200" class="donut-svg">
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              stroke-width="24"
            />
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="url(#gradient)"
              stroke-width="24"
              stroke-dasharray="502.4"
              :stroke-dashoffset="dashOffset"
              stroke-linecap="round"
              transform="rotate(-90 100 100)"
              class="animated-circle"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#3b82f6;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
              </linearGradient>
            </defs>
          </svg>
          <div class="chart-center">
            <div class="percentage">21%</div>
            <div class="percentage-label">щодня</div>
          </div>
        </div>
      </div>

      <!-- Right side - Stats -->
      <div class="stats-section">
        <div class="stat-item daily">
          <div class="stat-number">1.7 млрд</div>
          <div class="stat-description">
            людей використовують AI <strong>щодня</strong> — більше, ніж населення Китаю
          </div>
        </div>

        <div class="stat-item growth">
          <div class="stat-badge">×9</div>
          <div class="stat-description">
            зростання ChatGPT за 3 роки — <strong>від 100 млн до 900 млн</strong> щотижня
          </div>
        </div>

        <div class="stat-item investment">
          <div class="stat-number">48%</div>
          <div class="stat-description">
            усіх венчурних інвестицій у 2025 пішли в <strong>AI-компанії</strong> — кожен 2-й долар
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const percentage = 21
const circumference = 2 * Math.PI * 80
const dashOffset = computed(() => circumference - (circumference * percentage) / 100)
</script>

<style scoped>
.global-container {
  width: 100%;
  padding: 0.75rem 1rem;
  max-height: 440px;
  overflow: hidden;
}

.content-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 2.5rem;
  align-items: center;
}

/* Chart Section */
.chart-section {
  display: flex;
  justify-content: center;
  align-items: center;
}

.donut-chart {
  position: relative;
  width: 280px;
  height: 280px;
}

.donut-svg {
  width: 100%;
  height: 100%;
}

.animated-circle {
  transition: stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1);
}

.chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.percentage {
  font-size: 4rem;
  font-weight: 700;
  background: linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.percentage-label {
  font-size: 1.1rem;
  color: var(--text-secondary);
  font-weight: 600;
  margin-top: 0.5rem;
  opacity: var(--text-secondary-opacity);
}

/* Stats Section */
.stats-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  padding: 1rem 1.25rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border-left: 3px solid;
  transition: all 0.3s ease;
  animation: slideInRight 0.6s ease-out backwards;
}

.stat-item:nth-child(2) {
  animation-delay: 0.1s;
}

.stat-item:nth-child(3) {
  animation-delay: 0.2s;
}

.stat-item:nth-child(4) {
  animation-delay: 0.3s;
}

.stat-item.daily {
  border-left-color: #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(255, 255, 255, 0.02));
}

.stat-item.regular {
  border-left-color: #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(255, 255, 255, 0.02));
}

.stat-item.growth {
  border-left-color: #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(255, 255, 255, 0.02));
}

.stat-item.investment {
  border-left-color: #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(255, 255, 255, 0.02));
}

.stat-item:hover {
  transform: translateX(4px);
  background: rgba(255, 255, 255, 0.08);
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1;
}

.daily .stat-number {
  color: #10b981;
}

.regular .stat-number {
  color: #f59e0b;
}

.investment .stat-number {
  color: #ef4444;
}

.stat-badge {
  display: inline-block;
  font-size: 1.6rem;
  font-weight: 700;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.15);
  padding: 0.35rem 0.85rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.stat-description {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.5;
  opacity: var(--text-secondary-opacity);
}

.stat-description strong {
  color: var(--text-primary);
  font-weight: 700;
  opacity: 1;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Light theme overrides */
[data-theme="light"] .donut-chart circle:first-of-type {
  stroke: rgba(0, 0, 0, 0.08);
}


[data-theme="light"] .stat-item {
  background: rgba(0, 0, 0, 0.04);
}

[data-theme="light"] .stat-item.daily {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(0, 0, 0, 0.02));
}

[data-theme="light"] .stat-item.regular {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(0, 0, 0, 0.02));
}

[data-theme="light"] .stat-item.growth {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(0, 0, 0, 0.02));
}

[data-theme="light"] .stat-item.investment {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(0, 0, 0, 0.02));
}

[data-theme="light"] .stat-item:hover {
  background: rgba(0, 0, 0, 0.08);
}


[data-theme="light"] .stat-badge {
  background: rgba(59, 130, 246, 0.15);
}

@media (max-width: 768px) {
  .global-container {
    padding: 0.5rem;
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .donut-chart {
    width: 220px;
    height: 220px;
  }

  .percentage {
    font-size: 3rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .stat-description {
    font-size: 0.85rem;
  }
}
</style>
