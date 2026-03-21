<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useApi } from '../composables/useApi';
import { useSocketStore } from '../stores/socket';
import QrCode from '../components/QrCode.vue';

const route = useRoute();
const { get, post, patch } = useApi();
const socketStore = useSocketStore();

const adminToken = route.params.adminToken as string;
const lecture = ref<any>(null);
const responseCount = ref(0);
const battleText = ref('');
const battleOptions = ref(['', '', '', '']);
const battleLoading = ref(false);

const PHASES = ['draft', 'pre_lecture', 'in_progress', 'post_lecture', 'closed'];
const PHASE_LABELS: Record<string, string> = {
  draft: 'Чернетка',
  pre_lecture: 'Початкове опитування',
  in_progress: 'Лекція йде',
  post_lecture: 'Кінцеве опитування',
  closed: 'Завершено',
};

const joinUrl = computed(() => {
  if (!lecture.value) return '';
  return `${window.location.origin}/join/${lecture.value.code}`;
});

const statsUrl = computed(() => {
  if (!lecture.value) return '';
  return `/stats/${lecture.value.code}`;
});

const adminStatsUrl = computed(() => `/admin/${adminToken}/stats`);

const currentPhaseIndex = computed(() =>
  lecture.value ? PHASES.indexOf(lecture.value.status) : 0,
);

const activeBattleQuestions = computed(() =>
  lecture.value?.questions?.filter((q: any) => q.phase === 'battle' && q.isActive) || [],
);

const closedBattleQuestions = computed(() =>
  lecture.value?.questions?.filter((q: any) => q.phase === 'battle' && !q.isActive) || [],
);

async function loadLecture() {
  lecture.value = await get(`/admin/${adminToken}`);
}

async function nextPhase() {
  const next = PHASES[currentPhaseIndex.value + 1];
  if (!next) return;
  await patch(`/admin/${adminToken}/status`, { status: next });
  await loadLecture();
}

async function pushBattle() {
  const opts = battleOptions.value.filter(o => o.trim());
  if (!battleText.value.trim() || opts.length < 2) return;
  battleLoading.value = true;
  try {
    await post(`/admin/${adminToken}/battle`, {
      text: battleText.value,
      options: opts,
    });
    battleText.value = '';
    battleOptions.value = ['', '', '', ''];
    await loadLecture();
  } finally {
    battleLoading.value = false;
  }
}

async function closeBattle(questionId: string) {
  await patch(`/admin/${adminToken}/battle/${questionId}`, { isActive: false });
  await loadLecture();
}

function handleCount(data: { count: number }) {
  responseCount.value = data.count;
}

onMounted(async () => {
  await loadLecture();
  if (lecture.value) {
    socketStore.joinRoom(lecture.value.code);
    socketStore.on('responses:count', handleCount);
  }
});

onUnmounted(() => {
  socketStore.off('responses:count', handleCount);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-8" v-if="lecture">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">{{ lecture.title }}</h1>
        <p class="text-gray-500">{{ lecture.speakerName }} &middot; Код: <span class="font-mono font-bold text-indigo-600 text-lg">{{ lecture.code }}</span></p>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <!-- QR & Links -->
        <div class="bg-white rounded-2xl shadow p-6 text-center">
          <QrCode :url="joinUrl" />
          <div class="mt-4 space-y-2">
            <a :href="statsUrl" target="_blank" class="block text-indigo-600 hover:underline text-sm">Публічна статистика (проектор)</a>
            <a :href="adminStatsUrl" target="_blank" class="block text-indigo-600 hover:underline text-sm">Детальна статистика</a>
          </div>
        </div>

        <!-- Phase Control -->
        <div class="bg-white rounded-2xl shadow p-6">
          <h2 class="text-lg font-semibold mb-4">Фази лекції</h2>
          <div class="space-y-2 mb-6">
            <div
              v-for="(phase, i) in PHASES"
              :key="phase"
              class="flex items-center gap-3 p-3 rounded-lg"
              :class="i === currentPhaseIndex ? 'bg-indigo-50 border border-indigo-200' : i < currentPhaseIndex ? 'text-gray-400' : ''"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                :class="i < currentPhaseIndex ? 'bg-green-500 text-white' : i === currentPhaseIndex ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'"
              >
                {{ i < currentPhaseIndex ? '✓' : i + 1 }}
              </div>
              <span :class="i === currentPhaseIndex ? 'font-semibold text-indigo-700' : ''">{{ PHASE_LABELS[phase] }}</span>
            </div>
          </div>

          <button
            v-if="currentPhaseIndex < PHASES.length - 1"
            @click="nextPhase"
            class="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Перейти до: {{ PHASE_LABELS[PHASES[currentPhaseIndex + 1]] }}
          </button>

          <div class="mt-4 p-3 bg-gray-50 rounded-lg text-center">
            <span class="text-2xl font-bold text-indigo-600">{{ responseCount }}</span>
            <span class="text-gray-500 ml-2">відповідей</span>
          </div>
        </div>
      </div>

      <!-- AI Battle Panel -->
      <div v-if="lecture.status === 'in_progress'" class="mt-6 bg-white rounded-2xl shadow p-6">
        <h2 class="text-lg font-semibold mb-4">AI Battle — Клінічні кейси</h2>

        <!-- Active battles -->
        <div v-for="q in activeBattleQuestions" :key="q.id" class="mb-4 p-4 border border-yellow-200 bg-yellow-50 rounded-xl">
          <p class="font-medium mb-2">{{ q.text }}</p>
          <div class="flex flex-wrap gap-2 mb-3">
            <span v-for="opt in (q.config as any).options" :key="opt" class="px-3 py-1 bg-white rounded-full text-sm border">{{ opt }}</span>
          </div>
          <button @click="closeBattle(q.id)" class="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition">
            Закрити раунд
          </button>
        </div>

        <!-- Closed battles -->
        <div v-for="q in closedBattleQuestions" :key="q.id" class="mb-2 p-3 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-500">{{ q.text }} — <span class="text-green-600 font-medium">завершено</span></p>
        </div>

        <!-- New battle form -->
        <div class="mt-4 border-t pt-4">
          <h3 class="font-medium mb-3">Нове питання</h3>
          <textarea
            v-model="battleText"
            rows="3"
            class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-3"
            placeholder="Пацієнт: жінка 28р, безсоння 3 міс..."
          />
          <div class="space-y-2 mb-3">
            <div v-for="(_, i) in battleOptions" :key="i" class="flex gap-2">
              <span class="py-2 text-gray-400 text-sm w-6">{{ i + 1 }}.</span>
              <input
                v-model="battleOptions[i]"
                class="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                :placeholder="`Варіант ${i + 1}`"
              />
            </div>
          </div>
          <button
            @click="pushBattle"
            :disabled="battleLoading"
            class="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {{ battleLoading ? 'Надсилаємо...' : 'Надіслати аудиторії' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
