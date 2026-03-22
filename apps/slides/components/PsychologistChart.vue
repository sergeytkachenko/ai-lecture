<template>
  <div class="metaphor-container">
    <div class="metaphor-header">
      <p class="subtitle">AI бере на себе рутину — ви фокусуєтесь на людині</p>
    </div>

    <div class="comparison-grid">
      <div class="comparison-item without-ai">
        <div class="panel-header">
          <div class="icon-wrapper">
            <span class="material-icons large-icon">person</span>
          </div>
          <div class="panel-title">Психолог без AI</div>
        </div>
        <div class="tasks-list">
          <div
            v-for="(task, index) in withoutAiTasks"
            :key="task"
            class="task-item"
            :style="{ animationDelay: `${index * 0.15}s` }"
          >
            <span class="material-icons task-icon">close</span>
            <span>{{ task }}</span>
          </div>
        </div>
      </div>

      <div class="divider">
        <span class="material-icons">arrow_forward</span>
      </div>

      <div class="comparison-item with-ai">
        <div class="panel-header">
          <div class="icon-wrapper">
            <span class="material-icons large-icon">person</span>
            <span class="material-icons ai-badge">smart_toy</span>
          </div>
          <div class="panel-title">Психолог з AI</div>
        </div>
        <div class="tasks-list">
          <div
            v-for="(task, index) in withAiTasks"
            :key="task"
            class="task-item"
            :style="{ animationDelay: `${index * 0.15 + 0.5}s` }"
          >
            <span class="material-icons task-icon">check_circle</span>
            <span>{{ task }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const withoutAiTasks = ref([
  'Нотатки вручну',
  'Пошук літератури годинами',
  'Рутинні звіти',
  'Менше часу на клієнта'
])

const withAiTasks = ref([
  'Автоматичні нотатки сесій',
  'Аналіз патернів між сесіями',
  'Підготовка матеріалів за хвилини',
  'Пошук досліджень миттєво'
])
</script>

<style scoped>
.metaphor-container {
  width: 100%;
  padding: 0 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 440px;
  overflow: hidden;
}

.metaphor-header {
  text-align: center;
}

.subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
  font-style: italic;
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.75rem;
  align-items: stretch;
}

.comparison-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 10px;
  background: var(--panel-bg);
  min-height: 280px;
}

.without-ai {
  border: 1px solid var(--without-ai-border);
}

.with-ai {
  border: 1px solid var(--with-ai-border);
}

.panel-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.icon-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.large-icon {
  font-size: 2.5rem;
  color: var(--icon-large-color);
  animation: fadeIn 0.8s ease-out;
}

.ai-badge {
  position: absolute;
  bottom: -0.2rem;
  right: -0.5rem;
  font-size: 1.2rem;
  color: #10b981;
  background: var(--ai-badge-bg);
  border-radius: 50%;
  padding: 0.15rem;
  animation: pulse 2s ease-in-out infinite;
}

.panel-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1;
}

.task-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.85rem;
  line-height: 1.3;
  animation: fadeInRight 0.6s ease-out backwards;
}

.without-ai .task-item {
  color: var(--without-ai-text);
}

.with-ai .task-item {
  color: var(--with-ai-text);
}

.task-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.without-ai .task-icon {
  color: #ef4444;
}

.with-ai .task-icon {
  color: #10b981;
}

.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.divider .material-icons {
  font-size: 2rem;
  animation: slideRight 1.5s ease-in-out infinite;
}

.bottom-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bottom-msg-bg);
  border: 1px solid var(--bottom-msg-border);
  border-radius: 12px;
  animation: fadeIn 1s ease-out 0.8s backwards;
}

.message-icon {
  font-size: 1.8rem;
  color: #60a5fa;
  flex-shrink: 0;
}

.bottom-message p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-primary);
  line-height: 1.5;
  font-weight: 500;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInRight {
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
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes slideRight {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(10px);
  }
}

@media (max-width: 768px) {
  .metaphor-container {
    padding: 1rem;
  }

  .comparison-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .divider {
    transform: rotate(90deg);
  }
}
</style>
