<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import QRCode from 'qrcode';

const props = defineProps<{ url: string }>();
const canvas = ref<HTMLCanvasElement>();

const fullUrl = computed(() => {
  try {
    return new URL(props.url, window.location.origin).href;
  } catch {
    return props.url;
  }
});

async function render() {
  if (canvas.value) {
    await QRCode.toCanvas(canvas.value, fullUrl.value, {
      width: 280,
      margin: 2,
      color: { dark: '#1e293b', light: '#ffffff' },
    });
  }
}

onMounted(render);
watch(fullUrl, render);
</script>

<template>
  <div class="inline-block p-4 bg-white rounded-2xl shadow-lg">
    <canvas ref="canvas" />
    <p class="text-center text-sm text-gray-500 mt-2">{{ fullUrl }}</p>
  </div>
</template>
