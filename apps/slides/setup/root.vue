<script setup lang="ts">
import { defineCustomNav } from '@slidev/client'

const exportToMarkdown = async () => {
  try {
    const response = await fetch('/slides.md')
    if (!response.ok) {
      throw new Error('Failed to fetch slides.md')
    }

    const slidesContent = await response.text()

    let markdown = '# AI Lecture - All Slides Export\n\n'
    markdown += `Exported: ${new Date().toLocaleString('uk-UA')}\n\n`
    markdown += '---\n\n'
    markdown += slidesContent

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

defineCustomNav((nav) => {
  nav.push({
    icon: 'carbon:download',
    title: 'Export to Markdown',
    onClick: exportToMarkdown,
  })
})
</script>
