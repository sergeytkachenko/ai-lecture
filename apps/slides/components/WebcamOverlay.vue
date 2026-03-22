<template>
  <Transition name="fade">
    <div v-if="isVisible" class="webcam-overlay" :style="overlayStyle">
      <div class="webcam-container" ref="container">
        <video
          ref="videoElement"
          autoplay
          playsinline
          muted
          class="webcam-video"
        ></video>
        <div class="webcam-controls">
          <button @click="toggleCamera" class="control-btn" :title="isStreaming ? 'Stop camera' : 'Start camera'">
            <span v-if="isStreaming">⏸</span>
            <span v-else>▶️</span>
          </button>
          <button @click="close" class="control-btn" title="Close">✕</button>
        </div>
        <div class="resize-handle" @mousedown="startResize"></div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isVisible = ref(false)
const isStreaming = ref(false)
const videoElement = ref<HTMLVideoElement | null>(null)
const container = ref<HTMLDivElement | null>(null)
const stream = ref<MediaStream | null>(null)

const overlayStyle = ref({
  bottom: '20px',
  right: '20px',
  width: '200px',
  height: '150px'
})

let resizing = false
let startX = 0
let startY = 0
let startWidth = 0
let startHeight = 0

const startCamera = async () => {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
      audio: false
    })

    if (videoElement.value) {
      videoElement.value.srcObject = mediaStream
      stream.value = mediaStream
      isStreaming.value = true
    }
  } catch (error) {
    console.error('Error accessing camera:', error)
    alert('Cannot access camera. Please check permissions.')
  }
}

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
  if (videoElement.value) {
    videoElement.value.srcObject = null
  }
  isStreaming.value = false
}

const toggleCamera = () => {
  if (isStreaming.value) {
    stopCamera()
  } else {
    startCamera()
  }
}

const close = () => {
  stopCamera()
  isVisible.value = false
}

const startResize = (e: MouseEvent) => {
  resizing = true
  startX = e.clientX
  startY = e.clientY
  startWidth = container.value?.offsetWidth || 200
  startHeight = container.value?.offsetHeight || 150

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const handleResize = (e: MouseEvent) => {
  if (!resizing) return

  const deltaX = e.clientX - startX
  const deltaY = e.clientY - startY

  overlayStyle.value.width = Math.max(150, startWidth + deltaX) + 'px'
  overlayStyle.value.height = Math.max(100, startHeight + deltaY) + 'px'
}

const stopResize = () => {
  resizing = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// Keyboard shortcut to toggle webcam (Ctrl/Cmd + W)
const handleKeyPress = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
    e.preventDefault()
    isVisible.value = !isVisible.value
    if (isVisible.value && !isStreaming.value) {
      startCamera()
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  stopCamera()
  document.removeEventListener('keydown', handleKeyPress)
})

// Auto-start on mount (optional)
// Uncomment next lines to auto-start camera
// onMounted(() => {
//   isVisible.value = true
//   startCamera()
// })
</script>

<style scoped>
.webcam-overlay {
  position: fixed;
  z-index: 9999;
  pointer-events: auto;
}

.webcam-container {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: #000;
}

.webcam-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1); /* Mirror the video */
}

.webcam-controls {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.webcam-container:hover .webcam-controls {
  opacity: 1;
}

.control-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: background 0.2s;
}

.control-btn:hover {
  background: rgba(0, 0, 0, 0.9);
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  cursor: nwse-resize;
  background: linear-gradient(135deg, transparent 50%, rgba(255, 255, 255, 0.3) 50%);
  opacity: 0;
  transition: opacity 0.3s;
}

.webcam-container:hover .resize-handle {
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media print {
  .webcam-overlay {
    display: none;
  }
}
</style>
