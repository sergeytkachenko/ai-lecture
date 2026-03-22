<template>
  <div class="theme-switcher">
    <button @click="toggleTheme" class="theme-button" :title="currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'">
      <svg v-if="currentTheme === 'light'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const currentTheme = ref('light')

const toggleTheme = () => {
  const newTheme = currentTheme.value === 'light' ? 'dark' : 'light'
  currentTheme.value = newTheme
  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('slidev-theme', newTheme)
}

onMounted(() => {
  const savedTheme = localStorage.getItem('slidev-theme') || 'light'
  currentTheme.value = savedTheme
  document.documentElement.setAttribute('data-theme', savedTheme)
})
</script>

<style scoped>
.theme-switcher {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
}

.theme-button {
  background: var(--theme-switcher-bg);
  border: 1px solid var(--theme-switcher-border);
  border-radius: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: var(--theme-switcher-text);
}

.theme-button:hover {
  background: var(--theme-switcher-hover-bg);
  transform: scale(1.1);
}

.theme-button svg {
  width: 20px;
  height: 20px;
}
</style>
