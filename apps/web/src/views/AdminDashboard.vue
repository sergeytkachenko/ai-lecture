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
const presentationLinkInput = ref('');
const isEditingLink = ref(false);


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


async function loadLecture() {
  lecture.value = await get(`/admin/${adminToken}`);
  presentationLinkInput.value = lecture.value?.presentationLink || '';
}

async function savePresentationLink() {
  const link = presentationLinkInput.value.trim() || null;
  await patch(`/admin/${adminToken}/presentation-link`, { presentationLink: link });
  lecture.value.presentationLink = link;
  isEditingLink.value = false;
}

async function nextPhase() {
  const next = PHASES[currentPhaseIndex.value + 1];
  if (!next) return;
  await patch(`/admin/${adminToken}/status`, { status: next });
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

          <!-- Presentation Link -->
          <div class="mt-4 pt-4 border-t border-gray-100">
            <h3 class="text-sm font-semibold text-gray-700 mb-2">Посилання на презентацію</h3>
            <div v-if="!isEditingLink">
              <a
                v-if="lecture.presentationLink"
                :href="lecture.presentationLink"
                target="_blank"
                class="text-indigo-600 hover:underline text-sm break-all"
              >{{ lecture.presentationLink }}</a>
              <span v-else class="text-gray-400 text-sm">Не вказано</span>
              <button
                @click="isEditingLink = true"
                class="ml-2 text-xs text-gray-400 hover:text-indigo-600"
              >{{ lecture.presentationLink ? 'Змінити' : 'Додати' }}</button>
            </div>
            <div v-else class="flex gap-2">
              <input
                v-model="presentationLinkInput"
                type="url"
                placeholder="https://..."
                class="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                @click="savePresentationLink"
                class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
              >Зберегти</button>
              <button
                @click="isEditingLink = false; presentationLinkInput = lecture.presentationLink || ''"
                class="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
              >Скасувати</button>
            </div>
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


    </div>
  </div>
</template>
