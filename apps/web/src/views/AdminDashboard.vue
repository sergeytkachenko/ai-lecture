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
  <div class="h-screen bg-gray-50 p-4 flex flex-col overflow-hidden" v-if="lecture">
    <!-- Header -->
    <div class="mb-4 shrink-0">
      <h1 class="text-2xl font-bold text-gray-900">{{ lecture.title }}</h1>
      <p class="text-gray-500">{{ lecture.speakerName }} &middot; Код: <span class="font-mono font-bold text-indigo-600 text-lg">{{ lecture.code }}</span></p>
    </div>

    <div class="grid grid-cols-3 gap-4 flex-1 min-h-0">
      <!-- QR Code for Poll -->
      <div class="bg-white rounded-2xl shadow p-4 text-center flex flex-col overflow-auto">
        <h3 class="text-sm font-semibold text-gray-700 mb-2 shrink-0">QR-код для опитування</h3>
        <div class="flex-1 flex items-center justify-center min-h-0">
          <QrCode :url="joinUrl" />
        </div>
        <div class="mt-2 space-y-1 shrink-0">
          <a :href="statsUrl" target="_blank" class="block text-indigo-600 hover:underline text-sm">Публічна статистика (проектор)</a>
          <a :href="adminStatsUrl" target="_blank" class="block text-indigo-600 hover:underline text-sm">Детальна статистика</a>
        </div>
      </div>

      <!-- QR Code for Presentation -->
      <div class="bg-white rounded-2xl shadow p-4 text-center flex flex-col overflow-auto">
        <h3 class="text-sm font-semibold text-gray-700 mb-2 shrink-0">QR-код презентації</h3>
        <div class="flex-1 flex items-center justify-center min-h-0">
          <QrCode v-if="lecture.presentationLink" :url="lecture.presentationLink" />
          <div v-else class="text-gray-400 text-sm">Посилання не вказано</div>
        </div>

        <!-- Presentation Link Edit -->
        <div class="mt-2 pt-2 border-t border-gray-100 shrink-0">
          <div v-if="!isEditingLink">
            <a
              v-if="lecture.presentationLink"
              :href="lecture.presentationLink"
              target="_blank"
              class="text-indigo-600 hover:underline text-sm break-all"
            >{{ lecture.presentationLink }}</a>
            <span v-else class="text-gray-400 text-sm">Посилання не вказано</span>
            <button
              @click="isEditingLink = true"
              class="ml-2 text-xs text-gray-400 hover:text-indigo-600"
            >{{ lecture.presentationLink ? 'Змінити' : 'Додати' }}</button>
          </div>
          <div v-else class="space-y-2">
            <input
              v-model="presentationLinkInput"
              type="url"
              placeholder="https://..."
              class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div class="flex gap-2">
              <button
                @click="savePresentationLink"
                class="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
              >Зберегти</button>
              <button
                @click="isEditingLink = false; presentationLinkInput = lecture.presentationLink || ''"
                class="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
              >Скасувати</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Phase Control -->
      <div class="bg-white rounded-2xl shadow p-4 flex flex-col overflow-auto">
        <h2 class="text-lg font-semibold mb-3 shrink-0">Фази лекції</h2>
        <div class="space-y-1.5 mb-4 flex-1 min-h-0">
          <div
            v-for="(phase, i) in PHASES"
            :key="phase"
            class="flex items-center gap-3 p-2 rounded-lg"
            :class="i === currentPhaseIndex ? 'bg-indigo-50 border border-indigo-200' : i < currentPhaseIndex ? 'text-gray-400' : ''"
          >
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              :class="i < currentPhaseIndex ? 'bg-green-500 text-white' : i === currentPhaseIndex ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'"
            >
              {{ i < currentPhaseIndex ? '✓' : i + 1 }}
            </div>
            <span class="text-sm" :class="i === currentPhaseIndex ? 'font-semibold text-indigo-700' : ''">{{ PHASE_LABELS[phase] }}</span>
          </div>
        </div>

        <div class="shrink-0">
          <button
            v-if="currentPhaseIndex < PHASES.length - 1"
            @click="nextPhase"
            class="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Перейти до: {{ PHASE_LABELS[PHASES[currentPhaseIndex + 1]] }}
          </button>

          <div class="mt-3 p-2 bg-gray-50 rounded-lg text-center">
            <span class="text-2xl font-bold text-indigo-600">{{ responseCount }}</span>
            <span class="text-gray-500 ml-2">відповідей</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
