<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '../composables/useApi';

const router = useRouter();
const { post } = useApi();
const title = ref('');
const speakerName = ref('');
const loading = ref(false);
const error = ref('');

async function submit() {
  if (!title.value || !speakerName.value) return;
  loading.value = true;
  error.value = '';
  try {
    const result = await post('/lectures', {
      title: title.value,
      speakerName: speakerName.value,
    });
    router.push(`/admin/${result.adminToken}`);
  } catch (e: any) {
    error.value = 'Помилка створення лекції';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Lecture Poll</h1>
      <p class="text-gray-500 mb-8">Створіть нову лекцію для опитування</p>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Назва лекції</label>
          <input
            v-model="title"
            type="text"
            required
            class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            placeholder="AI в психології"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ім'я спікера</label>
          <input
            v-model="speakerName"
            type="text"
            required
            class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            placeholder="Ваше ім'я"
          />
        </div>

        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {{ loading ? 'Створення...' : 'Створити лекцію' }}
        </button>
      </form>
    </div>
  </div>
</template>
