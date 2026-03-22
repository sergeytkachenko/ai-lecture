<template>
  <div class="time-saving-container">
    <div class="header">
      <h3>Економія часу з AI</h3>
      <div class="time-badge">
        <span class="material-icons">schedule</span>
        <span>Щоденна економія</span>
      </div>
    </div>

    <div class="time-display">
      <div class="time-value">{{ animatedMinutes }}</div>
      <div class="time-label">хвилин на день</div>
    </div>

    <div class="progress-section">
      <div class="progress-bar-container">
        <div class="progress-labels">
          <span>0 хв</span>
          <span>30 хв</span>
          <span class="highlight">{{ targetMinutes }} хв</span>
        </div>
        <div class="progress-track">
          <div
            class="progress-fill"
            :style="{ width: `${progressPercent}%` }"
          >
            <div class="progress-glow"></div>
          </div>
          <div class="progress-marker" :style="{ left: `${progressPercent}%` }">
            <span class="material-icons">access_time</span>
          </div>
        </div>
        <div class="progress-scale">
          <div v-for="i in 13" :key="i" class="scale-mark"></div>
        </div>
      </div>
    </div>

    <div class="activities-grid">
      <div
        v-for="(activity, index) in activities"
        :key="activity.name"
        class="activity-card"
        :style="{ animationDelay: `${index * 0.15 + 1}s` }"
      >
        <span class="material-icons activity-icon">{{ activity.icon }}</span>
        <div class="activity-info">
          <div class="activity-name">{{ activity.name }}</div>
          <div class="activity-time">~{{ activity.minutes }} хв</div>
        </div>
      </div>
    </div>

    <div class="daily-impact">
      <div class="impact-item">
        <span class="material-icons">event</span>
        <div class="impact-text">
          <strong>{{ hoursPerMonth }}</strong> годин на місяць
        </div>
      </div>
      <div class="impact-item">
        <span class="material-icons">calendar_month</span>
        <div class="impact-text">
          <strong>{{ daysPerYear }}</strong> днів на рік
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const targetMinutes = 50 // Average of 40-60
const animatedMinutes = ref(0)
const progressPercent = computed(() => (animatedMinutes.value / 60) * 100)

const hoursPerMonth = computed(() => Math.round((animatedMinutes.value * 30) / 60))
const daysPerYear = computed(() => Math.round((animatedMinutes.value * 365) / 60 / 24))

const activities = ref([
  { name: 'Написання листів', icon: 'mail', minutes: 15 },
  { name: 'Пошук інформації', icon: 'search', minutes: 12 },
  { name: 'Аналіз даних', icon: 'analytics', minutes: 10 },
  { name: 'Планування', icon: 'event_note', minutes: 8 },
  { name: 'Інше', icon: 'more_horiz', minutes: 5 }
])

onMounted(() => {
  const duration = 2500
  const steps = 60
  const increment = targetMinutes / steps
  const interval = duration / steps

  let current = 0
  const timer = setInterval(() => {
    current += increment
    if (current >= targetMinutes) {
      animatedMinutes.value = targetMinutes
      clearInterval(timer)
    } else {
      animatedMinutes.value = Math.floor(current)
    }
  }, interval)
})
</script>

<style scoped>
.time-saving-container {
  width: 100%;
  padding: 0 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 420px;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.header h3 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

.time-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  background: rgba(59, 130, 246, 0.2);
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  color: #3b82f6;
}

.time-display {
  text-align: center;
  padding: 0.65rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.2));
  border-radius: 10px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.time-value {
  font-size: 2.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.time-label {
  font-size: 0.85rem;
  color: #ffffff;
  margin-top: 0.2rem;
  opacity: 0.7;
}

.progress-section {
  padding: 0.35rem 0;
}

.progress-bar-container {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #ffffff;
  padding: 0 0.35rem;
  opacity: 0.7;
}

.progress-labels .highlight {
  color: #10b981;
  font-weight: 700;
}

.progress-track {
  position: relative;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9px;
  overflow: visible;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  border-radius: 12px;
  transition: width 2.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.progress-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 50px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3));
  animation: shimmer 2s ease-in-out infinite;
}

.progress-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  transition: left 2.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-marker .material-icons {
  font-size: 1.5rem;
  color: #10b981;
  animation: bounce 1s ease-in-out infinite;
}

.progress-scale {
  display: flex;
  justify-content: space-between;
  padding: 0 0.35rem;
}

.scale-mark {
  width: 1px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.5rem;
}

.activity-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease-out backwards;
}

.activity-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
}

.activity-icon {
  font-size: 1.2rem;
  color: #3b82f6;
}

.activity-info {
  display: flex;
  flex-direction: column;
}

.activity-name {
  font-size: 0.85rem;
  color: var(--text-primary);
  font-weight: 600;
}

.activity-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: var(--text-secondary-opacity);
}

.daily-impact {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.5rem;
  padding-top: 0.35rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.impact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 6px;
}

.impact-item .material-icons {
  font-size: 1.4rem;
  color: #10b981;
}

.impact-text {
  font-size: 0.75rem;
  color: var(--text-primary);
}

.impact-text strong {
  font-size: 1rem;
  color: #10b981;
  font-weight: 700;
}

@keyframes shimmer {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
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

/* Light theme overrides */
[data-theme="light"] .header {
  border-bottom-color: rgba(0, 0, 0, 0.2);
}


[data-theme="light"] .time-badge {
  background: rgba(59, 130, 246, 0.15);
}

[data-theme="light"] .time-display {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(16, 185, 129, 0.15));
  border-color: rgba(59, 130, 246, 0.4);
}

[data-theme="light"] .time-label {
}

[data-theme="light"] .progress-labels {
}

[data-theme="light"] .progress-track {
  background: rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .scale-mark {
  background: rgba(0, 0, 0, 0.2);
}

[data-theme="light"] .activity-card {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .activity-card:hover {
  background: rgba(0, 0, 0, 0.08);
}

[data-theme="light"] .activity-name {
}

[data-theme="light"] .activity-time {
}

[data-theme="light"] .daily-impact {
  border-top-color: rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .impact-item {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.4);
}

[data-theme="light"] .impact-text {
}

@media (max-width: 768px) {
  .time-saving-container {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .time-value {
    font-size: 3.5rem;
  }

  .activities-grid {
    grid-template-columns: 1fr;
  }
}
</style>
