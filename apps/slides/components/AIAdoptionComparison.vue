<template>
  <div class="adoption-container">
    <div class="comparison-grid">
      <!-- ChatGPT Card -->
      <div class="service-card chatgpt">
        <div class="card-header">
          <h3>ChatGPT</h3>
          <span class="provider">OpenAI</span>
        </div>

        <div class="main-stat">
          <div class="stat-number">900 млн</div>
          <div class="stat-label">щотижневих активних користувачів</div>
        </div>

        <div class="growth-bars">
          <div class="bar-item">
            <span class="year">2023</span>
            <div class="bar-track">
              <div class="bar-fill chatgpt-color" style="width: 11.1%"></div>
            </div>
            <span class="bar-value-external">100M</span>
          </div>
          <div class="bar-item">
            <span class="year">2026</span>
            <div class="bar-track">
              <div class="bar-fill chatgpt-color" style="width: 100%"></div>
            </div>
            <span class="bar-value-external">900M</span>
          </div>
        </div>

        <div class="context-note">
          <span class="material-icons">public</span>
          <span>Більшеніж все населення Європи. Зростання ×9 за 3 роки</span>
        </div>
      </div>

      <!-- Google Gemini Card -->
      <div class="service-card gemini">
        <div class="card-header">
          <h3>Google Gemini</h3>
          <span class="provider">Google</span>
        </div>

        <div class="main-stat">
          <div class="stat-number">450 млн</div>
          <div class="stat-label">щомісячних активних користувачів</div>
        </div>

        <div class="growth-bars">
          <div class="bar-item">
            <span class="year">MAU</span>
            <div class="bar-track">
              <div class="bar-fill gemini-color" style="width: 100%"></div>
            </div>
            <span class="bar-value-external">450M</span>
          </div>
        </div>

        <div class="context-note">
          <span class="material-icons">flag</span>
          <span>Населення США + Канади разом. Інтеграція з екосистемою Google</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.adoption-container {
  width: 100%;
  padding: 0.5rem 1rem;
  max-height: 420px;
  overflow: hidden;
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.service-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-top: 3px solid;
  transition: all 0.3s ease;
}

[data-theme="light"] .service-card {
  background: rgba(0, 0, 0, 0.04);
}

.service-card.chatgpt {
  border-top-color: #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(255, 255, 255, 0.02));
}

[data-theme="light"] .service-card.chatgpt {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(0, 0, 0, 0.02));
}

.service-card.gemini {
  border-top-color: #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(255, 255, 255, 0.02));
}

[data-theme="light"] .service-card.gemini {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(0, 0, 0, 0.02));
}

.service-card:hover {
  transform: translateY(-4px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

[data-theme="light"] .card-header {
  border-bottom-color: rgba(0, 0, 0, 0.1);
}

.card-header h3 {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

.provider {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
  opacity: var(--text-secondary-opacity);
}

.main-stat {
  text-align: center;
  padding: 1rem 0;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.chatgpt .stat-number {
  background: linear-gradient(135deg, #10b981, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gemini .stat-number {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  opacity: var(--text-secondary-opacity);
}

.growth-bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.year {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 50px;
  opacity: var(--text-secondary-opacity);
}

.bar-track {
  flex: 1;
  height: 28px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  overflow: visible;
  position: relative;
}

[data-theme="light"] .bar-track {
  background: rgba(0, 0, 0, 0.08);
}

.bar-fill {
  height: 100%;
  border-radius: 14px;
  transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  animation: growBar 1.5s ease-out;
}

.chatgpt-color {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.gemini-color {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.bar-value-external {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
  min-width: 50px;
  text-align: right;
}

.context-note {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
  opacity: var(--text-secondary-opacity);
}

[data-theme="light"] .context-note {
  background: rgba(0, 0, 0, 0.04);
}

.context-note .material-icons {
  font-size: 1.2rem;
  color: #10b981;
  flex-shrink: 0;
}

.gemini .context-note .material-icons {
  color: #3b82f6;
}

@keyframes growBar {
  from {
    width: 0;
  }
}

@media (max-width: 768px) {
  .adoption-container {
    padding: 0.5rem;
  }

  .comparison-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .card-header h3 {
    font-size: 1.2rem;
  }

  .stat-number {
    font-size: 2rem;
  }
}
</style>
