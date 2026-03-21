<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useApi } from '../composables/useApi';
import { useSocketStore } from '../stores/socket';
import ScaleQuestion from '../components/ScaleQuestion.vue';
import SingleChoiceQuestion from '../components/SingleChoiceQuestion.vue';

const route = useRoute();
const code = (route.params.code as string).toUpperCase();
const { get, post } = useApi();
const socketStore = useSocketStore();

const lecture = ref<any>(null);
const questions = ref<any[]>([]);
const answers = ref<Record<string, string>>({});
const submitted = ref(false);
const submitting = ref(false);


function getFingerprint(): string {
  let fp = localStorage.getItem('lp_fingerprint');
  if (!fp) {
    fp = crypto.randomUUID();
    localStorage.setItem('lp_fingerprint', fp);
  }
  return fp;
}

function hasVotedPhase(phase: string): boolean {
  return localStorage.getItem(`lp_voted_${code}_${phase}`) === '1';
}

function markVotedPhase(phase: string) {
  localStorage.setItem(`lp_voted_${code}_${phase}`, '1');
}


const status = computed(() => lecture.value?.status || 'draft');

const currentPhase = computed(() => {
  const map: Record<string, string> = { pre_lecture: 'start', post_lecture: 'end' };
  return map[status.value] || null;
});

const allAnswered = computed(() => {
  return questions.value.length > 0 && questions.value.every(q => answers.value[q.id]);
});

async function loadLecture() {
  lecture.value = await get(`/lectures/${code}`);
}

async function loadQuestions() {
  if (currentPhase.value && !hasVotedPhase(currentPhase.value)) {
    questions.value = await get(`/lectures/${code}/questions`);
  }
}

async function submitVotes() {
  if (!allAnswered.value || submitting.value) return;
  submitting.value = true;
  try {
    const data = questions.value.map(q => ({
      questionId: q.id,
      value: answers.value[q.id],
    }));
    await post(`/lectures/${code}/responses`, {
      responses: data,
      fingerprint: getFingerprint(),
    });
    markVotedPhase(currentPhase.value!);
    submitted.value = true;
  } catch (err: any) {
    // Only mark as submitted if user already voted (duplicate)
    if (err?.message?.includes('400')) {
      submitted.value = true;
    }
    // Otherwise leave submitted = false so user can retry
  } finally {
    submitting.value = false;
  }
}


async function handleStatusChange(data: { status: string }) {
  if (lecture.value) {
    const previousPhase = currentPhase.value;

    // Auto-submit if user answered all questions but hasn't submitted yet
    if (previousPhase && !submitted.value && !hasVotedPhase(previousPhase) && allAnswered.value) {
      await submitVotes();
    }

    lecture.value.status = data.status;
    submitted.value = false;
    answers.value = {};

    const map: Record<string, string> = { pre_lecture: 'start', post_lecture: 'end' };
    const phase = map[data.status];
    if (phase && !hasVotedPhase(phase)) {
      loadQuestions();
    }
  }
}


onMounted(async () => {
  await loadLecture();
  await loadQuestions();

  // Check if already voted
  if (currentPhase.value && hasVotedPhase(currentPhase.value)) {
    submitted.value = true;
  }

  socketStore.joinRoom(code);
  socketStore.on('lecture:status', handleStatusChange);
});

onUnmounted(() => {
  socketStore.off('lecture:status', handleStatusChange);
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
    <div class="w-full max-w-lg">

      <!-- Draft -->
      <Transition name="fade" mode="out-in">
        <div v-if="status === 'draft'" key="draft" class="text-center py-12">
          <div class="text-6xl mb-4">📚</div>
          <h2 class="text-xl font-semibold text-gray-700 mb-2">Лекція скоро почнеться</h2>
          <p class="text-gray-400">Зачекайте, будь ласка...</p>
          <div class="mt-6 animate-pulse">
            <div class="w-16 h-1 bg-indigo-300 rounded mx-auto" />
          </div>
        </div>

        <!-- Pre-lecture / Post-lecture questions -->
        <div v-else-if="(status === 'pre_lecture' || status === 'post_lecture') && !submitted && !hasVotedPhase(currentPhase!)" key="questions" class="bg-white rounded-2xl shadow-lg p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-6">
            {{ status === 'pre_lecture' ? 'Опитування перед лекцією' : 'Опитування після лекції' }}
          </h2>

          <template v-for="q in questions" :key="q.id">
            <ScaleQuestion
              v-if="q.type === 'scale'"
              :questionId="q.id"
              :text="q.text"
              :min="(q.config as any).min"
              :max="(q.config as any).max"
              :minLabel="(q.config as any).minLabel"
              :maxLabel="(q.config as any).maxLabel"
              v-model="answers[q.id]"
            />
            <SingleChoiceQuestion
              v-if="q.type === 'single_choice'"
              :questionId="q.id"
              :text="q.text"
              :options="(q.config as any).options"
              v-model="answers[q.id]"
            />
          </template>

          <button
            @click="submitVotes"
            :disabled="!allAnswered || submitting"
            class="w-full py-4 mt-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 transition disabled:opacity-40"
          >
            {{ submitting ? 'Надсилаємо...' : 'Надіслати відповіді' }}
          </button>
        </div>

        <!-- Submitted / In progress -->
        <div v-else-if="status === 'in_progress' || submitted" key="waiting" class="text-center py-12">
          <div>
            <div class="text-6xl mb-4">🎓</div>
            <h2 class="text-xl font-semibold text-gray-700 mb-2">Дякуємо! Лекція йде...</h2>
            <p class="text-gray-400">Очікуйте нових питань</p>
            <div class="mt-6">
              <div class="flex justify-center gap-1">
                <div class="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 0ms" />
                <div class="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 150ms" />
                <div class="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 300ms" />
              </div>
            </div>
          </div>
        </div>

        <!-- Closed -->
        <div v-else-if="status === 'closed'" key="closed" class="text-center py-12">
          <div class="text-6xl mb-4">🎉</div>
          <h2 class="text-xl font-semibold text-gray-700 mb-2">Дякуємо за участь!</h2>
          <a :href="`/stats/${code}`" class="text-indigo-600 hover:underline mt-4 inline-block">Переглянути результати</a>
        </div>

        <!-- Already voted fallback -->
        <div v-else key="voted" class="text-center py-12">
          <div class="text-6xl mb-4">✅</div>
          <h2 class="text-xl font-semibold text-gray-700 mb-2">Ви вже відповіли</h2>
          <p class="text-gray-400">Дякуємо за ваші відповіді</p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
