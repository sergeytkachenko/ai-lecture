<template>
  <button
    @click="exportToMarkdown"
    class="slidev-icon-btn"
    title="Export all slides to markdown"
  >
    <carbon:download />
  </button>
</template>

<script setup lang="ts">
const exportToMarkdown = async () => {
  try {
    // Fetch the original slides.md file
    const response = await fetch('/slides.md')
    if (!response.ok) {
      throw new Error('Failed to fetch slides.md')
    }

    const slidesContent = await response.text()

    // Create export with metadata
    let markdown = '# AI Lecture - All Slides Export\n\n'
    markdown += `Exported: ${new Date().toLocaleString('uk-UA')}\n\n`
    markdown += '---\n\n'
    markdown += slidesContent

    // Create blob and download
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    a.download = `ai-lecture-slides-${timestamp}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Export failed:', error)
    alert('Export failed. Check console for details.')
  }
}
</script>

<style scoped>
/* No custom styles needed - using Slidev's built-in icon button styles */
</style>
