<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useApi } from '../composables/useApi';
import { useSocketStore } from '../stores/socket';
import BarChart from '../components/BarChart.vue';
import PieChart from '../components/PieChart.vue';
import ComparisonChart from '../components/ComparisonChart.vue';

const route = useRoute();
const code = (route.params.code as string).toUpperCase();
const { get } = useApi();
const socketStore = useSocketStore();

const stats = ref<any[]>([]);
const lecture = ref<any>(null);

async function loadStats() {
  stats.value = await get(`/lectures/${code}/stats`);
}

async function loadLecture() {
  lecture.value = await get(`/lectures/${code}`);
}

const startQuestions = computed(() => stats.value.filter(s => s.question.phase === 'start'));
const endQuestions = computed(() => stats.value.filter(s => s.question.phase === 'end'));

const totalResponses = computed(() => {
  const fps = new Set<string>();
  // Approximate from totals
  return stats.value.reduce((max, s) => Math.max(max, s.total), 0);
});

// Find matching start/end pairs for comparison
const comparisonPairs = computed(() => {
  const pairs: any[] = [];
  for (const startQ of startQuestions.value) {
    const endMatch = endQuestions.value.find(
      e => e.question.text === startQ.question.text && e.question.type === startQ.question.type,
    );
    if (endMatch) {
      pairs.push({ start: startQ, end: endMatch });
    }
  }
  return pairs;
});

// Non-paired end questions (single choice, rating)
const uniqueEndQuestions = computed(() =>
  endQuestions.value.filter(
    e => !startQuestions.value.some(s => s.question.text === e.question.text && s.question.type === e.question.type),
  ),
);

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

function handleStatsUpdate() {
  loadStats();
}

function handleStatusChange(data: { status: string }) {
  if (lecture.value) lecture.value.status = data.status;
  loadStats();
}

onMounted(async () => {
  await Promise.all([loadLecture(), loadStats()]);
  socketStore.joinRoom(code);
  socketStore.on('stats:update', handleStatsUpdate);
  socketStore.on('lecture:status', handleStatusChange);
});

onUnmounted(() => {
  socketStore.off('stats:update', handleStatsUpdate);
  socketStore.off('lecture:status', handleStatusChange);
});

const isPostLecture = computed(() =>
  lecture.value && ['post_lecture', 'closed'].includes(lecture.value.status),
);

const showComparison = computed(() =>
  isPostLecture.value && comparisonPairs.value.some(p => p.end.total > 0),
);
</script>

<template>
  <div class="min-h-screen bg-[#0f172a] text-white p-6 md:p-10">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold">{{ lecture?.title || 'Статистика' }}</h1>
        <p class="text-slate-400">{{ lecture?.speakerName }}</p>
      </div>
      <div class="text-right">
        <div class="text-4xl font-bold text-indigo-400">{{ totalResponses }}</div>
        <div class="text-slate-400 text-sm">відповідей</div>
      </div>
    </div>

    <!-- Comparison View -->
    <div v-if="showComparison" class="space-y-8 mb-10">
      <h2 class="text-2xl font-bold text-emerald-400">Порівняння: до vs після лекції</h2>

      <div v-for="pair in comparisonPairs" :key="pair.start.question.id" class="bg-slate-800/50 rounded-2xl p-6">
        <h3 class="text-xl font-semibold mb-2">{{ pair.start.question.text }}</h3>
        <div class="flex items-center gap-6 mb-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-slate-400">{{ pair.start.average?.toFixed(1) }}</div>
            <div class="text-sm text-slate-500">до</div>
          </div>
          <div class="text-2xl" :class="(pair.end.average || 0) > (pair.start.average || 0) ? 'text-emerald-400' : 'text-red-400'">
            {{ (pair.end.average || 0) > (pair.start.average || 0) ? '↑' : '↓' }}
            {{ Math.abs(((pair.end.average || 0) - (pair.start.average || 0))).toFixed(1) }}
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-emerald-400">{{ pair.end.average?.toFixed(1) }}</div>
            <div class="text-sm text-slate-500">після</div>
          </div>
        </div>
        <ComparisonChart
          :labels="scaleLabels(pair.start.question.config)"
          :beforeValues="scaleValues(pair.start.responses, pair.start.question.config)"
          :afterValues="scaleValues(pair.end.responses, pair.end.question.config)"
        />
      </div>
    </div>

    <!-- START questions (only if no comparison yet) -->
    <div v-if="!showComparison && startQuestions.length" class="space-y-6 mb-10">
      <h2 class="text-xl font-bold text-slate-300">Початкове опитування</h2>
      <div v-for="s in startQuestions" :key="s.question.id" class="bg-slate-800/50 rounded-2xl p-6">
        <h3 class="text-lg font-semibold mb-1">{{ s.question.text }}</h3>
        <div v-if="s.average !== undefined" class="text-4xl font-bold text-indigo-400 mb-3">{{ s.average.toFixed(1) }}</div>
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
        <div class="text-sm text-slate-500 mt-2">{{ s.total }} відповідей</div>
      </div>
    </div>

    <!-- Unique END questions (single choice, rating) -->
    <div v-if="isPostLecture && uniqueEndQuestions.length" class="space-y-6 mb-10">
      <div v-for="s in uniqueEndQuestions" :key="s.question.id" class="bg-slate-800/50 rounded-2xl p-6">
        <h3 class="text-lg font-semibold mb-1">{{ s.question.text }}</h3>
        <div v-if="s.average !== undefined" class="text-5xl font-bold text-emerald-400 mb-3">{{ s.average.toFixed(1) }}<span class="text-lg text-slate-400"> / 10</span></div>
        <PieChart
          v-if="s.question.type === 'single_choice'"
          :labels="s.responses.map((r: any) => r.value)"
          :values="s.responses.map((r: any) => r.count)"
        />
        <BarChart
          v-else
          :labels="scaleLabels(s.question.config)"
          :values="scaleValues(s.responses, s.question.config)"
          color="#10b981"
        />
        <div class="text-sm text-slate-500 mt-2">{{ s.total }} відповідей</div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!stats.length" class="text-center py-20">
      <div class="text-6xl mb-4">📊</div>
      <h2 class="text-xl text-slate-400">Поки немає даних</h2>
      <p class="text-slate-500">Результати з'являться після початку опитування</p>
    </div>
  </div>
</template>
