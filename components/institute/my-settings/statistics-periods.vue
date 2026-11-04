<script setup lang="ts">
import { isAxiosError } from 'axios'
import { useAuthStore } from '~/store/auth'
import type { StatisticsPeriod } from '~/interfaces/stats/statistics-period.interface'
import type { RegisterPeriodRequest } from '~/dto/request/stats/register-period.request.dto'
import type {
  StatisticsPeriodsResponse,
  RegisterPeriodResponse,
} from '~/dto/response/stats/statistics-period.response.dto'
import {
  periodInstant,
  formatPeriodInstant,
} from '~/utils/helpers/statistics-period-time'

const auth = useAuthStore()
const { $statsApi } = useNuxtApp()
const periods = ref<StatisticsPeriod[]>([])
const loading = ref(false)
const saving = ref(false)
const canManage = ref(false)
const loadError = ref('')
const saveError = ref('')
const success = ref('')
const needsRefresh = ref(false)
const start = ref('')
const end = ref('')
const confirmed = ref(false)
const timeZone = ref('America/Mexico_City')
const zones = [
  ...new Set([
    'America/Mexico_City',
    'America/Cancun',
    'America/Tijuana',
    'America/Hermosillo',
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    'UTC',
  ]),
]
let version = 0
let savingVersion: number | undefined
let request: AbortController | undefined
const instituteId = computed(() => {
  const institute = auth.activeInstitute
  return typeof institute === 'string' ? institute : institute?._id
})
const draft = computed<{ payload?: RegisterPeriodRequest; error: string }>(
  () => {
    if (!start.value || !end.value) return { error: '' }
    try {
      const from = periodInstant(start.value, timeZone.value)
      const until = periodInstant(end.value, timeZone.value)
      const duration = Date.parse(until) - Date.parse(from)
      if (duration <= 0)
        return { error: 'El fin debe ser posterior al inicio.' }
      if (duration > 366 * 86400000)
        return { error: 'El período no puede superar 366 días.' }
      if (
        periods.value.some(
          (p) =>
            Date.parse(p.from) < Date.parse(until) &&
            Date.parse(p.until) > Date.parse(from),
        )
      )
        return {
          error:
            'Este intervalo se solapa con un período registrado. Elige otro intervalo.',
        }
      return { payload: { from, until }, error: '' }
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Revisa las fechas y la zona horaria.',
      }
    }
  },
)
const blocked = computed(
  () =>
    loading.value || saving.value || needsRefresh.value || !!loadError.value,
)
const format = (instant: string) => formatPeriodInstant(instant, timeZone.value)
function message(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    if (error.response?.status === 401)
      return 'Tu sesión ya no es válida. Vuelve a iniciar sesión.'
    if (error.response?.status === 403)
      return 'Tu cuenta no tiene permiso para esta operación en la institución.'
    if (error.response?.status === 409)
      return 'El período se solapa con otro o se alcanzó el límite. Actualiza la lista antes de intentarlo de nuevo.'
    if (error.response?.status === 429)
      return 'Hay varias operaciones en curso. Espera un momento y actualiza la lista.'
  }
  return fallback
}
async function load() {
  const current = ++version
  request?.abort()
  request = new AbortController()
  const signal = request.signal
  loading.value = true
  canManage.value = false
  loadError.value = ''
  try {
    const session = await auth.validateStatisticsSession(signal)
    const { data } = await $statsApi.get<StatisticsPeriodsResponse>(
      '/v1/statistics/periods',
      { signal },
    )
    if (current !== version) return
    if (
      !Array.isArray(data.periods) ||
      data.periods.length > 120 ||
      data.limits?.maxPeriods !== 120 ||
      data.limits?.maxDurationDays !== 366 ||
      data.periods.some(
        (p) =>
          !p ||
          !Number.isFinite(Date.parse(p.from)) ||
          !Number.isFinite(Date.parse(p.until)) ||
          typeof p.closed !== 'boolean',
      )
    )
      throw new Error('Respuesta de períodos inválida.')
    periods.value = data.periods
    canManage.value = session.permissions.includes('statistics:periods:write')
    needsRefresh.value = false
    saveError.value = ''
  } catch (error) {
    if (current !== version) return
    periods.value = []
    loadError.value = message(
      error,
      'No pudimos cargar los períodos. Comprueba que el servicio de estadísticas esté disponible e inténtalo de nuevo.',
    )
  } finally {
    if (current === version) loading.value = false
  }
}
async function save() {
  if (
    blocked.value ||
    !canManage.value ||
    !confirmed.value ||
    !draft.value.payload ||
    periods.value.length >= 120
  )
    return
  const payload = { ...draft.value.payload }
  const current = version
  saving.value = true
  savingVersion = current
  saveError.value = ''
  success.value = ''
  try {
    const session = await auth.validateStatisticsSession(request?.signal)
    if (current !== version) return
    canManage.value = session.permissions.includes('statistics:periods:write')
    if (!canManage.value) {
      saveError.value = 'Tu cuenta ya no tiene permiso para registrar períodos.'
      return
    }
    const { data } = await $statsApi.post<RegisterPeriodResponse>(
      '/v1/statistics/periods',
      payload,
      { signal: request?.signal },
    )
    if (current !== version) return
    if (
      Date.parse(data.period?.from) !== Date.parse(payload.from) ||
      Date.parse(data.period?.until) !== Date.parse(payload.until) ||
      typeof data.period?.closed !== 'boolean' ||
      typeof data.created !== 'boolean'
    )
      throw new Error('No pudimos confirmar el período.')
    start.value = ''
    end.value = ''
    confirmed.value = false
    success.value = data.created
      ? 'Período registrado. Sus fechas quedan reservadas para esta institución.'
      : 'Este período ya estaba registrado. No se creó un duplicado.'
    await load()
  } catch (error) {
    if (current !== version) return
    needsRefresh.value = true
    saveError.value = message(
      error,
      'No pudimos confirmar el registro. Actualiza la lista antes de volver a enviarlo; el período podría haberse guardado.',
    )
  } finally {
    // A context change starts its own loading cycle and clears this flag.
    if (savingVersion === current) {
      saving.value = false
      savingVersion = undefined
    }
  }
}
watch([start, end, timeZone], () => {
  confirmed.value = false
})
watch(
  [instituteId, () => auth.accessToken, () => auth.institutionContextMode],
  () => {
    version++
    request?.abort()
    periods.value = []
    canManage.value = false
    saving.value = false
    savingVersion = undefined
    start.value = ''
    end.value = ''
    confirmed.value = false
    success.value = ''
    saveError.value = ''
    needsRefresh.value = false
    if (instituteId.value && auth.isAuthenticated && !auth.isStudentPreview)
      void load()
    else {
      loading.value = false
      loadError.value =
        'Selecciona una institución e inicia sesión para consultar sus períodos.'
    }
  },
  { immediate: true, flush: 'sync' },
)
onBeforeUnmount(() => {
  version++
  request?.abort()
})
</script>

<template>
  <section
    class="periods-card"
    aria-labelledby="periods-title"
    :aria-busy="loading || saving"
  >
    <header class="periods-heading">
      <div>
        <p class="eyebrow">Estadísticas reales</p>
        <h2 id="periods-title">Períodos de análisis</h2>
      </div>
      <button
        type="button"
        class="secondary"
        :disabled="loading || saving"
        @click="load"
      >
        {{ loading ? 'Actualizando…' : 'Actualizar lista' }}
      </button>
    </header>
    <p class="description">
      Define intervalos para los informes de tu institución. Los períodos no
      pueden solaparse y sus fechas no se pueden editar ni eliminar.
    </p>
    <p v-if="loading" role="status">Cargando períodos y permisos…</p>
    <div v-else-if="loadError" class="feedback error" role="alert">
      {{ loadError }}
    </div>
    <template v-else>
      <div class="zone-field">
        <label for="period-zone">Zona horaria de las fechas</label>
        <select
          id="period-zone"
          v-model="timeZone"
          :disabled="saving || needsRefresh"
          aria-describedby="period-zone-help"
        >
          <option v-for="zone in zones" :key="zone" :value="zone">
            {{ zone.replaceAll('_', ' ') }}
          </option>
        </select>
        <p id="period-zone-help" class="help">
          Se usa para mostrar los períodos y para interpretar las fechas del
          formulario.
        </p>
      </div>
      <p v-if="!periods.length" class="empty">
        Todavía no hay períodos registrados para esta institución.
      </p>
      <ul v-else class="period-list" aria-label="Períodos registrados">
        <li v-for="period in periods" :key="`${period.from}/${period.until}`">
          <div>
            <span class="date-label">Desde</span
            ><time :datetime="period.from">{{ format(period.from) }}</time
            ><span class="date-label">Hasta (sin incluir)</span
            ><time :datetime="period.until">{{ format(period.until) }}</time>
          </div>
          <span class="period-status" :class="{ closed: period.closed }">{{
            period.closed ? 'Cerrado' : 'Aún no cerrado'
          }}</span>
        </li>
      </ul>
      <p class="help">
        {{ periods.length }} de 120 períodos. Solo los períodos cerrados pueden
        utilizarse para publicar informes; las reglas de cobertura y privacidad
        también se aplican.
      </p>
      <p v-if="!canManage" class="readonly">
        Puedes consultar los períodos. Su registro corresponde a la
        administración de tu institución.
      </p>
      <p v-else-if="periods.length >= 120" class="readonly">
        Se alcanzó el límite de períodos de la institución.
      </p>
      <form v-else class="period-form" @submit.prevent="save">
        <h3>Registrar un período</h3>
        <fieldset :disabled="blocked">
          <legend class="sr-only">Fechas del nuevo período</legend>
          <div class="date-fields">
            <div>
              <label for="period-start">Inicio (incluido)</label
              ><input
                id="period-start"
                v-model="start"
                type="datetime-local"
                required
                step="60"
                aria-describedby="period-dates-help period-validation"
                :aria-invalid="!!draft.error"
              />
            </div>
            <div>
              <label for="period-end">Fin (sin incluir)</label
              ><input
                id="period-end"
                v-model="end"
                type="datetime-local"
                required
                step="60"
                aria-describedby="period-dates-help period-validation"
                :aria-invalid="!!draft.error"
              />
            </div>
          </div>
          <p id="period-dates-help" class="help">
            Para incluir un día completo, elige como fin las 00:00 del día
            siguiente. Duración máxima: 366 días. Puedes registrar períodos
            futuros.
          </p>
          <p id="period-validation" class="validation" role="status">
            {{ draft.error }}
          </p>
          <div v-if="draft.payload" class="preview">
            <strong>Revisa el intervalo</strong>
            <p>
              {{ format(draft.payload.from) }} →
              {{ format(draft.payload.until) }} (fin no incluido).
            </p>
            <p>{{ timeZone.replaceAll('_', ' ') }}</p>
          </div>
          <label class="confirmation"
            ><input v-model="confirmed" type="checkbox" required /><span
              >Revisé las fechas y entiendo que este período no se podrá editar
              ni eliminar.</span
            ></label
          >
          <button
            class="primary"
            type="submit"
            :disabled="!draft.payload || !confirmed"
          >
            {{ saving ? 'Registrando…' : 'Registrar período' }}
          </button>
        </fieldset>
      </form>
    </template>
    <p v-if="saveError" class="feedback error" role="alert">{{ saveError }}</p>
    <p class="feedback success" role="status">{{ success }}</p>
  </section>
</template>

<style scoped>
.periods-card {
  max-width: 820px;
  margin-top: 24px;
  padding: 28px;
  border: 1px solid #efebf5;
  border-radius: 24px;
  background: #fff;
  color: #3c2f52;
  font-family: 'Figtree', sans-serif;
}
.periods-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.eyebrow {
  color: #6d5f88;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0 0 6px;
}
h2 {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.35;
}
h3 {
  font-size: 18px;
  margin-bottom: 20px;
}
.description,
.help,
.empty,
.readonly {
  color: #645b71;
  line-height: 1.6;
}
.description {
  margin: 20px 0;
  font-size: 15px;
}
.help {
  font-size: 13px;
  margin: 8px 0 16px;
}
label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}
select,
input[type='datetime-local'] {
  width: 100%;
  min-width: 0;
  min-height: 48px;
  padding: 10px 12px;
  border: 1px solid #746a80;
  border-radius: 12px;
  background: #faf9fc;
  color: #3c2f52;
  font: inherit;
}
.zone-field {
  max-width: 420px;
}
.period-list {
  list-style: none;
  padding: 0;
  margin: 20px 0;
}
.period-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #efebf5;
}
.period-list li > div {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px;
  font-size: 14px;
}
.date-label {
  color: #645b71;
}
.period-status {
  border-radius: 999px;
  background: #f0eaf5;
  color: #5c4a75;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
  white-space: nowrap;
}
.period-status.closed {
  background: #edf6f3;
  color: #2c6a5c;
}
.period-form {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #efebf5;
}
fieldset {
  border: 0;
  padding: 0;
  min-width: 0;
}
.date-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.date-fields > div {
  min-width: 0;
}
button {
  min-height: 44px;
  padding: 10px 18px;
  border-radius: 999px;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.primary {
  background: #3c2f52;
  color: white;
  margin-top: 16px;
}
.primary:hover {
  background: #523f6e;
}
.secondary {
  border: 1px solid #6d5f88;
  color: #3c2f52;
  background: #fff;
}
.secondary:hover {
  background: #f0eaf5;
}
button:disabled,
fieldset:disabled {
  opacity: 0.65;
}
button:disabled,
fieldset:disabled button {
  cursor: not-allowed;
}
button:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 3px solid #3c2f52;
  outline-offset: 3px;
}
.preview {
  padding: 16px;
  border-radius: 12px;
  background: #f0eaf5;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
}
.confirmation {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  line-height: 1.6;
  font-weight: 400;
  cursor: pointer;
}
.confirmation input {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
  accent-color: #3c2f52;
}
.feedback {
  line-height: 1.6;
  font-size: 14px;
  margin-top: 16px;
}
.validation {
  min-height: 24px;
  color: #8a1c1c;
  font-size: 14px;
}
.error {
  color: #8a1c1c;
  background: #fdecec;
  border-radius: 12px;
  padding: 16px;
}
.success {
  color: #2c6a5c;
}
.readonly {
  padding: 16px;
  background: #faf9fc;
  border-radius: 12px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
@media (max-width: 700px) {
  .periods-card {
    padding: 20px;
    border-radius: 20px;
  }
  .date-fields {
    grid-template-columns: 1fr;
  }
  .period-list li {
    align-items: flex-start;
    flex-direction: column;
  }
  .period-list li > div {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  .period-list time {
    margin-bottom: 8px;
  }
  .primary {
    width: 100%;
  }
}
</style>
