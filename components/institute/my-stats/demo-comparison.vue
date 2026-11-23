<script setup lang="ts">
import { isAxiosError } from 'axios'
import type { DemoComparison } from '~/interfaces/stats/demo-comparison.interface'
import type {
  PublicationMetric,
  PublicationLabels,
} from '~/interfaces/stats/statistics-publication.interface'
import { demoID } from '~/utils/helpers/demo'
import { institutionDemoError } from './use-demo-stats'

const props = defineProps<{
  admin?: boolean
  institution: string
  questionnaire: string
  generation: string
  participants: number
  metrics: PublicationMetric[]
  labels: PublicationLabels
}>()
const { $statsApi } = useNuxtApp()
const allowed = computed(() =>
  props.metrics.filter((m) => m.publicationStatus === 'published' && m.values),
)
const options = shallowRef<DemoComparison>()
const result = shallowRef<DemoComparison>()
const question = ref(''),
  metric = ref('')
const selected = computed(() =>
  options.value?.questions.find((q) => q.id === question.value),
)
const busy = ref(false),
  error = ref('')
const format = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 3 })
let request: AbortController | undefined
watch(
  [question, metric],
  () => {
    result.value = undefined
    error.value = ''
  },
  { flush: 'sync' },
)
onBeforeUnmount(() => request?.abort())

async function load(compare: boolean) {
  request?.abort()
  const controller = new AbortController()
  request = controller
  busy.value = true
  error.value = ''
  result.value = undefined
  try {
    const base = props.admin ? '/v1/demos' : '/v1/statistics/demos'
    const { data } = await $statsApi.get<DemoComparison>(
      `${base}/questionnaires/${props.questionnaire}/comparison`,
      {
        headers: props.admin
          ? { 'X-Kairos-Institution': props.institution }
          : {},
        params: {
          generation: props.generation,
          ...(compare
            ? {
                profileGeneration: options.value?.profileGenerationId,
                question: question.value,
                metric: metric.value,
              }
            : {}),
        },
        signal: controller.signal,
      },
    )
    if (controller.signal.aborted) return
    if (
      data?.synthetic !== true ||
      data.institutionId !== props.institution ||
      data.questionnaireId !== props.questionnaire ||
      data.generationId !== props.generation ||
      data.participants !== props.participants ||
      !demoID(data.profileId) ||
      !demoID(data.profileGenerationId) ||
      !Array.isArray(data.questions) ||
      data.questions.length > 100 ||
      !data.questions.every(
        (q) =>
          demoID(q.id) &&
          typeof q.text === 'string' &&
          ['number', 'single_choice', 'multiple_choice'].includes(q.kind),
      )
    )
      throw Error()
    if (compare) {
      if (
        data.questionId !== question.value ||
        data.metricId !== metric.value ||
        data.profileId !== options.value?.profileId ||
        data.profileGenerationId !== options.value?.profileGenerationId ||
        !Number.isSafeInteger(data.paired) ||
        data.paired < 0 ||
        data.paired > props.participants ||
        !Array.isArray(data.groups) ||
        data.groups.length > 100 ||
        !data.groups.every(
          (g) =>
            typeof g.label === 'string' &&
            Number.isSafeInteger(g.count) &&
            g.count >= 0 &&
            g.count <= data.paired &&
            (g.count ? Number.isFinite(g.mean) : g.mean === null),
        ) ||
        !(
          data.pearson === null ||
          (Number.isFinite(data.pearson) && Math.abs(data.pearson) <= 1)
        ) ||
        !(
          data.etaSquared === null ||
          (Number.isFinite(data.etaSquared) &&
            data.etaSquared >= 0 &&
            data.etaSquared <= 1)
        )
      )
        throw Error()
      result.value = data
    } else {
      options.value = data
      question.value = data.questions[0]?.id || ''
      metric.value =
        (allowed.value.find((m) => m.kind === 'overall') || allowed.value[0])
          ?.id || ''
    }
  } catch (e) {
    if (controller.signal.aborted) return
    const code = isAxiosError(e) ? e.response?.data?.code : ''
    const messages: Record<string, string> = {
      demo_profile_unassigned:
        'La institución aún no tiene un Sociodemográfico vinculado en el constructor.',
      demo_profile_is_target:
        'Elige el cuestionario cuyo resultado quieres comparar con el Sociodemográfico.',
      demo_profile_generation_required: props.admin
        ? 'Selecciona el Sociodemográfico en Configuración demo y genera sus resultados para esta asignación.'
        : 'Pide al equipo KAIROS que genere el Sociodemográfico en Configuración demo para esta asignación.',
      demo_conflict:
        'Cambió la generación activa. Actualiza el informe del cuestionario y vuelve a elegir la pregunta.',
    }
    error.value = messages[code] || institutionDemoError(e)
  } finally {
    if (!controller.signal.aborted) busy.value = false
  }
}
</script>
<template>
  <section
    class="comparison"
    :class="{ admin }"
    :aria-busy="busy"
    aria-labelledby="comparison-title"
  >
    <h2 id="comparison-title">Comparar con el Sociodemográfico</h2>
    <p v-if="!allowed.length">
      Este cuestionario necesita un resultado general o de dimensión publicado
      para hacer el cruce.
    </p>
    <template v-else>
      <button
        v-if="!options"
        type="button"
        :disabled="busy"
        @click="load(false)"
      >
        Elegir pregunta del Sociodemográfico
      </button>
      <form v-else-if="options.questions.length" @submit.prevent="load(true)">
        <label
          >Resultado del cuestionario
          <select v-model="metric" :disabled="busy">
            <option v-for="(m, i) in allowed" :key="m.id" :value="m.id">
              {{
                labels.metrics[m.id] ||
                (m.kind === 'overall'
                  ? 'Resultado general'
                  : 'Dimensión ' + (i + 1))
              }}
            </option>
          </select>
        </label>
        <label
          >Pregunta del Sociodemográfico
          <select v-model="question" :disabled="busy">
            <option v-for="q in options.questions" :key="q.id" :value="q.id">
              {{ q.text }}
            </option>
          </select>
        </label>
        <button type="submit" :disabled="busy || !metric || !question">
          Comparar resultados
        </button>
      </form>
      <p v-else>
        El Sociodemográfico vinculado necesita una pregunta numérica o de
        selección para hacer el cruce.
      </p>
      <p v-if="busy" role="status">Consultando datos demo…</p>
      <p v-if="error" role="alert">{{ error }}</p>
      <div v-if="result" aria-live="polite">
        <p>
          <strong
            >{{ result.paired }} de {{ result.participants }} participantes
            demo</strong
          >
          tienen una respuesta y un puntaje válidos para esta comparación.
        </p>
        <template v-if="result.paired">
          <p v-if="selected?.kind === 'number'">
            {{
              result.pearson === null
                ? 'El coeficiente de Pearson requiere variación en ambas medidas y al menos dos pares.'
                : 'Correlación de Pearson (r) = ' +
                  format.format(result.pearson)
            }}
          </p>
          <template v-else>
            <p v-if="selected?.kind === 'multiple_choice'">
              Una persona puede contar en varias opciones si eligió más de una
              respuesta.
            </p>
            <table>
              <caption>
                Puntaje por respuesta a «{{
                  selected?.text
                }}»
              </caption>
              <thead>
                <tr>
                  <th scope="col">Respuesta</th>
                  <th scope="col">Participantes</th>
                  <th scope="col">Puntaje medio</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(g, i) in result.groups" :key="i">
                  <th scope="row">{{ g.label }}</th>
                  <td>{{ g.count }}</td>
                  <td>{{ g.mean === null ? '—' : format.format(g.mean) }}</td>
                </tr>
              </tbody>
            </table>
            <p v-if="result.etaSquared !== null">
              El {{ format.format(result.etaSquared * 100) }} % de la variación
              del puntaje corresponde a diferencias entre las medias de los
              grupos (η²).
            </p>
          </template>
        </template>
      </div>
    </template>
  </section>
</template>
<style scoped>
.comparison {
  --ink: #3c2f52;
  color: var(--ink);
  background: white;
  border: 1px solid #e5dfee;
  border-radius: 20px;
  padding: clamp(16px, 3vw, 24px);
  display: grid;
  gap: 16px;
  min-width: 0;
}
.comparison.admin {
  --ink: #04474a;
}
h2 {
  font-size: 18px;
}
form {
  display: flex;
  align-items: end;
  flex-wrap: wrap;
  gap: 16px;
}
label {
  display: grid;
  gap: 6px;
  min-width: 0;
  flex: 1 1 250px;
  font-weight: 700;
}
button,
select {
  min-height: 44px;
  border: 1px solid currentColor;
  padding: 8px 12px;
  font: inherit;
}
select {
  width: 100%;
  min-width: 0;
  background: white;
  border-radius: 10px;
}
button {
  justify-self: start;
  border-radius: 30px;
  color: white;
  background: var(--ink);
  font-weight: 700;
}
button:disabled {
  opacity: 0.65;
}
:focus-visible {
  outline: 3px solid var(--ink);
  outline-offset: 3px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  overflow-wrap: anywhere;
}
caption {
  text-align: left;
  font-weight: 700;
  padding: 8px 0;
}
th,
td {
  text-align: start;
  padding: 8px 4px;
  border-bottom: 1px solid #ded9e4;
}
td {
  font-variant-numeric: tabular-nums;
}
[role='alert'] {
  color: #982821;
}
</style>
