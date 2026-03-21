<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useApi } from '../composables/useApi';
import BarChart from '../components/BarChart.vue';

const route = useRoute();
const adminToken = route.params.adminToken as string;
const { get } = useApi();

const stats = ref<any[]>([]);

async function loadStats() {
  stats.value = await get(`/admin/${adminToken}/stats`);
}

const exportUrl = computed(() => `/api/admin/${adminToken}/export.csv`);

function scaleLabels(config: any): string[] {
  const labels: string[] = [];
  for (let i = config.min; i <= config.max; i++) labels.push(String(i));
  return labels;
}

function scaleValues(responses: any[], config: any): number[] {
  const counts: Record<string, number> = {};
  for (let i = config.min; i <= config.max; i++) counts[String(i)] = 0;
  for (const r of responses) counts[r.value] = (counts[r.value] || 0) + r.count;
  return Object.values(counts);
}

onMounted(loadStats);
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-8">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Детальна статистика</h1>
        <a :href="exportUrl" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
          Завантажити CSV
        </a>
      </div>

      <div v-for="s in stats" :key="s.question.id" class="bg-white rounded-2xl shadow p-6 mb-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded"
              :class="{
                'bg-blue-100 text-blue-700': s.question.phase === 'start',
                'bg-green-100 text-green-700': s.question.phase === 'end',
              }"
            >{{ s.question.phase }}</span>
            <h3 class="text-lg font-semibold text-gray-800 mt-2">{{ s.question.text }}</h3>
          </div>
          <div class="text-right text-sm text-gray-500">
            <div>{{ s.total }} відповідей</div>
            <div v-if="s.average !== undefined">Середнє: <span class="font-bold text-indigo-600">{{ s.average.toFixed(2) }}</span></div>
            <div v-if="s.median !== undefined">Медіана: <span class="font-bold">{{ s.median }}</span></div>
            <div v-if="s.stdDev !== undefined">Ст. відхилення: <span class="font-bold">{{ s.stdDev }}</span></div>
          </div>
        </div>

        <BarChart
          v-if="s.question.type === 'scale'"
          :labels="scaleLabels(s.question.config)"
          :values="scaleValues(s.responses, s.question.config)"
          color="#6366f1"
        />
        <BarChart
          v-else
          :labels="s.responses.map((r: any) => r.value)"
          :values="s.responses.map((r: any) => r.count)"
          color="#6366f1"
          :horizontal="true"
        />

        <!-- Individual responses table -->
        <details class="mt-4">
          <summary class="text-sm text-gray-500 cursor-pointer hover:text-indigo-600">
            Показати індивідуальні відповіді ({{ s.individualResponses?.length || 0 }})
          </summary>
          <table class="w-full mt-2 text-sm">
            <thead>
              <tr class="text-left text-gray-400 border-b">
                <th class="py-2">Fingerprint</th>
                <th class="py-2">Значення</th>
                <th class="py-2">Час</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in s.individualResponses" :key="i" class="border-b border-gray-100">
                <td class="py-2 font-mono text-xs text-gray-400">{{ r.fingerprint?.slice(0, 8) }}...</td>
                <td class="py-2">{{ r.value }}</td>
                <td class="py-2 text-gray-400">{{ new Date(r.createdAt).toLocaleString('uk-UA') }}</td>
              </tr>
            </tbody>
          </table>
        </details>
      </div>

      <div v-if="!stats.length" class="text-center py-12 text-gray-400">
        Поки немає даних
      </div>
    </div>
  </div>
</template>
