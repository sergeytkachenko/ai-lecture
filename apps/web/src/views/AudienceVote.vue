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
const error = ref<string | null>(null);


async function getFingerprint(): Promise<string> {
  let fp = localStorage.getItem('lp_fingerprint');
  if (!fp) {
    // Get UUID from backend
    try {
      const result = await get('/utils/uuid');
      fp = result.uuid;
    } catch (err) {
      console.error('[AudienceVote] Failed to get UUID from backend, using fallback', err);
      // Fallback: generate UUID client-side
      fp = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
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
  console.log('[AudienceVote] loadLecture code=%s', code);
  lecture.value = await get(`/lectures/${code}`);
  console.log('[AudienceVote] lecture loaded status=%s id=%s', lecture.value?.status, lecture.value?.id);
}

async function loadQuestions() {
  console.log('[AudienceVote] loadQuestions phase=%s hasVoted=%s', currentPhase.value, currentPhase.value ? hasVotedPhase(currentPhase.value) : 'n/a');
  if (currentPhase.value && !hasVotedPhase(currentPhase.value)) {
    questions.value = await get(`/lectures/${code}/questions`);
    console.log('[AudienceVote] questions loaded count=%d ids=%s', questions.value.length, questions.value.map(q => q.id).join(','));
  }
}

async function submitVotes() {
  console.log('[AudienceVote] submitVotes called allAnswered=%s submitting=%s phase=%s', allAnswered.value, submitting.value, currentPhase.value);
  if (!allAnswered.value || submitting.value) {
    console.log('[AudienceVote] submitVotes skipped: allAnswered=%s submitting=%s', allAnswered.value, submitting.value);
    return;
  }
  submitting.value = true;
  error.value = null;
  try {
    const data = questions.value.map(q => ({
      questionId: q.id,
      value: answers.value[q.id],
    }));
    const fingerprint = await getFingerprint();
    console.log('[AudienceVote] submitting %d responses fingerprint=%s data=%o', data.length, fingerprint, data);
    await post(`/lectures/${code}/responses`, {
      responses: data,
      fingerprint,
    });
    console.log('[AudienceVote] responses submitted successfully, marking phase=%s as voted', currentPhase.value);
    markVotedPhase(currentPhase.value!);
    submitted.value = true;
  } catch (err: any) {
    console.error('[AudienceVote] submitVotes error:', err?.message || err);
    // Only mark as submitted if user already voted (duplicate)
    if (err?.message?.includes('400')) {
      console.log('[AudienceVote] duplicate vote detected, marking as submitted');
      submitted.value = true;
    } else {
      // Show error to user for retry
      const errorDetails = err?.message || err?.toString() || 'Невідома помилка';
      error.value = `Не вдалося надіслати відповіді: ${errorDetails}. Оновіть сторінку і спробуйте ще раз.`;
    }
  } finally {
    submitting.value = false;
  }
}


async function handleStatusChange(data: { status: string }) {
  console.log('[AudienceVote] handleStatusChange newStatus=%s currentStatus=%s', data.status, status.value);
  if (lecture.value) {
    const previousPhase = currentPhase.value;

    // Auto-submit if user answered all questions but hasn't submitted yet
    if (previousPhase && !submitted.value && !hasVotedPhase(previousPhase) && allAnswered.value) {
      console.log('[AudienceVote] auto-submitting answers before status transition (phase=%s, answeredQuestions=%d)', previousPhase, questions.value.length);
      await submitVotes();
    } else {
      console.log('[AudienceVote] no auto-submit: previousPhase=%s submitted=%s hasVoted=%s allAnswered=%s', previousPhase, submitted.value, previousPhase ? hasVotedPhase(previousPhase) : 'n/a', allAnswered.value);
    }

    lecture.value.status = data.status;
    submitted.value = false;
    answers.value = {};
    error.value = null;

    const map: Record<string, string> = { pre_lecture: 'start', post_lecture: 'end' };
    const phase = map[data.status];
    if (phase && !hasVotedPhase(phase)) {
      console.log('[AudienceVote] loading questions for new phase=%s', phase);
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

          <!-- Error message -->
          <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div class="flex items-start gap-3">
              <div class="text-2xl">⚠️</div>
              <div class="flex-1">
                <p class="text-red-800 font-medium">{{ error }}</p>
              </div>
            </div>
          </div>

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
