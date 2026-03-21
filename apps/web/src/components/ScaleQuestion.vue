<script setup lang="ts">
defineProps<{
  questionId: string;
  text: string;
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  modelValue?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div class="mb-6">
    <h3 class="text-lg font-semibold mb-3 text-gray-800">{{ text }}</h3>
    <div class="flex items-center gap-1 mb-2">
      <button
        v-for="n in (max - min + 1)"
        :key="n + min - 1"
        @click="emit('update:modelValue', String(n + min - 1))"
        class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg text-lg font-bold transition-all duration-150"
        :class="modelValue === String(n + min - 1)
          ? 'bg-indigo-600 text-white shadow-lg scale-110'
          : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-indigo-400'"
      >
        {{ n + min - 1 }}
      </button>
    </div>
    <div class="flex justify-between text-xs text-gray-500 px-1">
      <span>{{ minLabel }}</span>
      <span>{{ maxLabel }}</span>
    </div>
  </div>
</template>
