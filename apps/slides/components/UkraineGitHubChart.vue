<template>
  <div class="ranking-container">
    <div class="ranking-header">
      <h3>Українські IT компанії в Open-Source AI проєктах</h3>
      <div class="github-badge">
        <span class="material-icons">code</span>
        <span>GitHub Rankings</span>
      </div>
    </div>

    <div class="ranking-list">
      <div
        v-for="(company, index) in companies"
        :key="company.name"
        class="rank-item"
        :style="{ animationDelay: `${index * 0.15}s` }"
      >
        <div class="rank-position">
          <span class="rank-number">{{ index + 1 }}</span>
          <div class="medal" :class="`medal-${index + 1}`">
            <span class="material-icons">{{ getMedalIcon(index) }}</span>
          </div>
        </div>

        <div class="company-info">
          <div class="company-name">{{ company.name }}</div>
          <div class="company-desc">{{ company.description }}</div>
        </div>

        <div class="contributions">
          <div class="contrib-bar">
            <div
              class="contrib-fill"
              :style="{ width: `${company.percentage}%` }"
            ></div>
          </div>
          <div class="contrib-label">{{ company.repos }} проєктів</div>
        </div>
      </div>
    </div>

    <div class="ranking-footer">
      <span class="material-icons">emoji_events</span>
      <span>Топ-5 компаній України в AI екосистемі</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const companies = ref([
  {
    name: 'Genesis',
    description: 'AI/ML платформи та інструменти',
    repos: 15,
    percentage: 100
  },
  {
    name: 'EPAM Ukraine',
    description: 'Enterprise AI рішення',
    repos: 12,
    percentage: 80
  },
  {
    name: 'SoftServe',
    description: 'AI для бізнесу',
    repos: 10,
    percentage: 67
  },
  {
    name: 'N-iX',
    description: 'Data Science & AI',
    repos: 8,
    percentage: 53
  },
  {
    name: 'Grammarly',
    description: 'NLP та мовні моделі',
    repos: 7,
    percentage: 47
  }
])

const getMedalIcon = (index: number): string => {
  if (index === 0) return 'workspace_premium'
  if (index === 1) return 'military_tech'
  if (index === 2) return 'stars'
  return 'verified'
}
</script>

<style scoped>
.ranking-container {
  width: 100%;
  padding: 0 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  max-height: 400px;
  overflow: hidden;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.ranking-header h3 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

.github-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
}

.github-badge .material-icons {
  font-size: 1.2rem;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.rank-item {
  display: grid;
  grid-template-columns: 65px 1fr 150px;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem 0.65rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border-left: 2px solid transparent;
  transition: all 0.3s ease;
  animation: slideInLeft 0.6s ease-out backwards;
}

.rank-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(8px);
}

.rank-item:nth-child(1) {
  border-left-color: #ffd700;
}

.rank-item:nth-child(2) {
  border-left-color: #c0c0c0;
}

.rank-item:nth-child(3) {
  border-left-color: #cd7f32;
}

.rank-item:nth-child(n+4) {
  border-left-color: #3b82f6;
}

.rank-position {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rank-number {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  min-width: 30px;
  text-align: center;
}

.medal {
  display: flex;
  align-items: center;
  justify-content: center;
}

.medal .material-icons {
  font-size: 1.3rem;
}

.medal-1 .material-icons {
  color: #ffd700;
}

.medal-2 .material-icons {
  color: #c0c0c0;
}

.medal-3 .material-icons {
  color: #cd7f32;
}

.medal-4 .material-icons,
.medal-5 .material-icons {
  color: #3b82f6;
}

.company-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.company-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

.company-desc {
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: var(--text-secondary-opacity);
}

.contributions {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.contrib-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.contrib-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #3b82f6);
  border-radius: 6px;
  transition: width 1.5s ease-out;
  animation: growWidth 1.5s ease-out;
}

.contrib-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: right;
  opacity: var(--text-secondary-opacity);
}

.ranking-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.4rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #10b981;
}

.ranking-footer .material-icons {
  font-size: 1rem;
  color: #ffd700;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes growWidth {
  from {
    width: 0;
  }
}

/* Light theme overrides */
[data-theme="light"] .ranking-header {
  border-bottom-color: rgba(0, 0, 0, 0.2);
}

[data-theme="light"] .ranking-header h3 {
}

[data-theme="light"] .github-badge {
  background: rgba(0, 0, 0, 0.08);
}

[data-theme="light"] .rank-item {
  background: rgba(0, 0, 0, 0.04);
}

[data-theme="light"] .rank-item:hover {
  background: rgba(0, 0, 0, 0.08);
}

[data-theme="light"] .rank-number {
}

[data-theme="light"] .company-name {
}

[data-theme="light"] .company-desc {
}

[data-theme="light"] .contrib-bar {
  background: rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .contrib-label {
}

[data-theme="light"] .ranking-footer {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.4);
}

@media (max-width: 768px) {
  .ranking-container {
    padding: 1rem;
  }

  .ranking-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .rank-item {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .rank-position {
    justify-content: space-between;
  }

  .contributions {
    width: 100%;
  }
}
</style>
