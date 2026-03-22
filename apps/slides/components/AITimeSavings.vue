<template>
  <div class="time-savings-container">
    <div class="stats-grid">
      <!-- Average User -->
      <div class="stat-card average-user">
        <div class="icon-wrapper">
          <span class="material-icons">bolt</span>
        </div>
        <div class="stat-content">
          <div class="stat-label">Середній користувач AI (2025)</div>
          <div class="stat-value">40–60 хв / день</div>
        </div>
      </div>

      <!-- Weekly Savings -->
      <div class="stat-card weekly">
        <div class="icon-wrapper">
          <span class="material-icons">event</span>
        </div>
        <div class="stat-content">
          <div class="stat-label">Це за тиждень</div>
          <div class="stat-value">+5 годин вільного часу</div>
        </div>
      </div>

      <!-- Heavy User -->
      <div class="stat-card heavy-user">
        <div class="icon-wrapper">
          <span class="material-icons">rocket_launch</span>
        </div>
        <div class="stat-content">
          <div class="stat-label">Досвідчений користувач (heavy user)</div>
          <div class="stat-value">+10 годин / тиждень</div>
        </div>
      </div>
    </div>

    <!-- Visual Calendar -->
    <div class="calendar-section">
      <div class="calendar-header">
        <span class="material-icons">lightbulb</span>
        <div class="insight-text">
          <strong>+10 годин на тиждень</strong> — це цілий додатковий робочий день.
          <br/>
          Замість п'ятничних звітів — ви вже вдома о 14:00.
        </div>
      </div>

      <div class="calendar-visual">
        <div class="week-title">Робочий тиждень (40 год) — кожна клітинка = 2 години</div>
        <div class="calendar-grid">
          <div
            v-for="i in 20"
            :key="i"
            class="hour-cell"
            :class="{ 'saved': i > 15, 'heavy-saved': i > 15 && heavyUserMode }"
          ></div>
        </div>
        <div class="calendar-legend">
          <div class="legend-item">
            <div class="legend-box regular"></div>
            <span>Робочий час</span>
          </div>
          <div class="legend-item">
            <div class="legend-box saved"></div>
            <span>Заощаджено heavy user (+10 год)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const heavyUserMode = ref(false)

onMounted(() => {
  // Animation trigger
  setTimeout(() => {
    heavyUserMode.value = true
  }, 500)
})
</script>

<style scoped>
.time-savings-container {
  width: 100%;
  padding: 0.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 380px;
  overflow: hidden;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  background: var(--card-bg);
  border-left: 3px solid;
  transition: all 0.3s ease;
  animation: slideInLeft 0.5s ease-out backwards;
}

.stat-card:nth-child(2) {
  animation-delay: 0.1s;
}

.stat-card:nth-child(3) {
  animation-delay: 0.2s;
}

.stat-card.average-user {
  border-left-color: #10b981;
  background: var(--green-tint-bg);
}

.stat-card.weekly {
  border-left-color: #3b82f6;
  background: var(--blue-tint-bg);
}

.stat-card.heavy-user {
  border-left-color: #f59e0b;
  background: var(--orange-tint-bg);
}

.stat-card:hover {
  transform: translateX(4px);
  background: var(--card-bg-hover);
}

.icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.average-user .icon-wrapper {
  background: rgba(16, 185, 129, 0.15);
}

.weekly .icon-wrapper {
  background: rgba(59, 130, 246, 0.15);
}

.heavy-user .icon-wrapper {
  background: rgba(245, 158, 11, 0.15);
}

.icon-wrapper .material-icons {
  font-size: 1.25rem;
}

.average-user .material-icons {
  color: #10b981;
}

.weekly .material-icons {
  color: #3b82f6;
}

.heavy-user .material-icons {
  color: #f59e0b;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
}

.calendar-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--card-border);
}

.calendar-header {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.6rem;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 6px;
  border-left: 3px solid #f59e0b;
}

.calendar-header .material-icons {
  font-size: 1.25rem;
  color: #f59e0b;
  flex-shrink: 0;
}

.insight-text {
  font-size: 0.75rem;
  color: var(--text-primary);
  line-height: 1.4;
}

.insight-text strong {
  color: #f59e0b;
  font-weight: 700;
}

.calendar-visual {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.week-title {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-align: center;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 0.4rem;
  padding: 0.4rem;
  max-width: 100%;
  margin: 0 auto;
}

.hour-cell {
  aspect-ratio: 1;
  background: rgba(148, 163, 184, 0.15);
  border-radius: 8px;
  border: 2px solid rgba(148, 163, 184, 0.3);
  transition: all 0.3s ease;
  min-width: 60px;
  min-height: 60px;
}

.hour-cell.saved {
  background: rgba(245, 158, 11, 0.3);
  border-color: rgba(245, 158, 11, 0.5);
  animation: pulse 2s ease-in-out infinite;
}

.hour-cell.heavy-saved {
  background: rgba(245, 158, 11, 0.6);
  border-color: #f59e0b;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.5);
}

.calendar-legend {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  padding-top: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.legend-box {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid var(--legend-border);
}

.legend-box.regular {
  background: rgba(148, 163, 184, 0.15);
  border-color: rgba(148, 163, 184, 0.3);
}

.legend-box.saved {
  background: rgba(245, 158, 11, 0.5);
  border-color: #f59e0b;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

@media (max-width: 768px) {
  .time-savings-container {
    padding: 0.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .calendar-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
