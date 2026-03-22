import { defineAppSetup } from '@slidev/types'

export default defineAppSetup(({ app, router }) => {
  // Initialize theme from localStorage or default to light
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('slidev-theme') || 'light'
    document.documentElement.setAttribute('data-theme', savedTheme)
  }
})
