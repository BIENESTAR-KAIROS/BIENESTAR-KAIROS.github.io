<script setup lang="ts">
import { MoodEnum, type ICheckInSummary } from '~/interfaces/checkin/check-in.interface'

const props = defineProps<{
  summary: ICheckInSummary | null
  isSubmitting: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', mood: MoodEnum): void
}>()

const pendingMood = ref<MoodEnum | null>(null)

watch(
  () => props.summary,
  (summary) => {
    pendingMood.value = pendingMood.value ?? summary?.mood ?? null
  },
  { immediate: true },
)

const moods = [
  { value: MoodEnum.GOOD, label: 'Bien' },
  { value: MoodEnum.NEUTRAL, label: 'Normal' },
  { value: MoodEnum.HARD, label: 'Difícil' },
]

// Ticks every 30s so the cooldown countdown counts down without a manual refetch.
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 30000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const canCheckInNow = computed(() => {
  if (!props.summary) return true
  if (props.summary.canCheckInNow) return true
  if (!props.summary.nextCheckInAvailableAt) return true
  return new Date(props.summary.nextCheckInAvailableAt).getTime() <= now.value
})

const minutesUntilNextCheckIn = computed(() => {
  if (canCheckInNow.value || !props.summary?.nextCheckInAvailableAt) return 0
  const remainingMs = new Date(props.summary.nextCheckInAvailableAt).getTime() - now.value
  return Math.max(1, Math.ceil(remainingMs / 60000))
})

const canSubmit = computed(
  () => !!pendingMood.value && !props.isSubmitting && canCheckInNow.value,
)

function selectMood(mood: MoodEnum) {
  if (canCheckInNow.value) {
    pendingMood.value = mood
  }
}

function register() {
  if (canSubmit.value && pendingMood.value) {
    emit('submit', pendingMood.value)
  }
}
</script>

<template>
  <div class="check-in-card">
    <div class="check-in-card__copy">
      <span class="check-in-card__title">¿Cómo te sientes hoy?</span>
      <span class="check-in-card__subtitle">
        {{
          canCheckInNow
            ? 'Tarda 10 segundos y ajusta tus recomendaciones de mañana.'
            : `Podrás registrar de nuevo en ${minutesUntilNextCheckIn} min. Puedes anotar cómo te sientes cada hora.`
        }}
      </span>
    </div>

    <div class="check-in-card__actions">
      <div class="check-in-card__moods">
        <button
          v-for="mood in moods"
          :key="mood.value"
          type="button"
          class="check-in-card__mood"
          :class="{ 'check-in-card__mood--active': pendingMood === mood.value }"
          :disabled="!canCheckInNow"
          @click="selectMood(mood.value)"
        >
          <svg
            v-if="mood.value === MoodEnum.GOOD"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#07979F"
            stroke-width="2.75"
            stroke-linecap="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M8 15c1.2 1.2 2.5 1.7 4 1.7s2.8-.5 4-1.7" />
            <path d="M9 9.5h.01M15 9.5h.01" />
          </svg>
          <svg
            v-else-if="mood.value === MoodEnum.NEUTRAL"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#07979F"
            stroke-width="2.75"
            stroke-linecap="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M8.5 15.5h7" />
            <path d="M9 9.5h.01M15 9.5h.01" />
          </svg>
          <svg
            v-else
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#07979F"
            stroke-width="2.75"
            stroke-linecap="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M8 16.5c1.2-1.2 2.5-1.7 4-1.7s2.8.5 4 1.7" />
            <path d="M9 9.5h.01M15 9.5h.01" />
          </svg>
          <span class="check-in-card__mood-label">{{ mood.label }}</span>
        </button>
      </div>

      <button
        type="button"
        class="check-in-card__submit"
        :disabled="!canSubmit"
        @click="register"
      >
        {{
          isSubmitting
            ? 'Guardando…'
            : canCheckInNow
              ? 'Registrar'
              : `Espera ${minutesUntilNextCheckIn} min`
        }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.check-in-card {
  grid-column: 1 / -1;
  background: #fff;
  border-radius: 24px;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
  box-shadow: 0 6px 20px -10px rgba(6, 92, 93, 0.3);
}

.check-in-card__copy {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.check-in-card__title {
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.check-in-card__subtitle {
  font-size: 14px;
  color: #5c7078;
}

.check-in-card__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.check-in-card__moods {
  display: flex;
  gap: 12px;
}

.check-in-card__mood {
  width: 74px;
  height: 74px;
  border-radius: 24px;
  border: 2px solid #e3ecee;
  background: #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-family: 'Figtree', sans-serif;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.check-in-card__mood:hover {
  border-color: #07979f;
  background: #f0fafa;
}

.check-in-card__mood--active {
  border-color: #07979f;
  background: #f0fafa;
}

.check-in-card__mood:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.check-in-card__mood:disabled:hover {
  border-color: #e3ecee;
  background: #fff;
}

.check-in-card__mood--active:disabled,
.check-in-card__mood--active:disabled:hover {
  border-color: #07979f;
  background: #f0fafa;
}

.check-in-card__mood-label {
  font-size: 11px;
  font-weight: 600;
  color: #4b5f68;
}

.check-in-card__submit {
  height: 74px;
  padding: 0 22px;
  border-radius: 999px;
  border: 0;
  background: #065c5d;
  color: #fff;
  font-family: 'Figtree', sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.check-in-card__submit:hover:not(:disabled) {
  background: #07979f;
}

.check-in-card__submit:disabled {
  background: #cfdde1;
  cursor: not-allowed;
}
</style>
