<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import QRCode from 'qrcode';

const props = defineProps<{ url: string }>();
const canvas = ref<HTMLCanvasElement>();

async function render() {
  if (canvas.value) {
    await QRCode.toCanvas(canvas.value, props.url, {
      width: 280,
      margin: 2,
      color: { dark: '#1e293b', light: '#ffffff' },
    });
  }
}

onMounted(render);
watch(() => props.url, render);
</script>

<template>
  <div class="inline-block p-4 bg-white rounded-2xl shadow-lg">
    <canvas ref="canvas" />
    <p class="text-center text-sm text-gray-500 mt-2">{{ url }}</p>
  </div>
</template>
