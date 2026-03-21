<script setup lang="ts">
defineProps<{
  questionId: string;
  text: string;
  options: string[];
  modelValue?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div class="mb-6">
    <h3 class="text-lg font-semibold mb-3 text-gray-800">{{ text }}</h3>
    <div class="space-y-2">
      <button
        v-for="(option, i) in options"
        :key="i"
        @click="emit('update:modelValue', option)"
        class="w-full p-4 rounded-xl text-left text-base font-medium transition-all duration-150"
        :class="modelValue === option
          ? 'bg-indigo-600 text-white shadow-lg'
          : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-indigo-400'"
      >
        {{ option }}
      </button>
    </div>
  </div>
</template>
