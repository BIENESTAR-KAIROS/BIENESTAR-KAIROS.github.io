<script setup lang="ts">
import axios from 'axios'
import { useAuthStore } from '~/store/auth'
import { UserRolEnum } from '~/interfaces/user/enum/user-rol.enum'
import type {
  ManagedRecommendation,
  RecommendationCatalog,
  RecommendationQuestionnaire,
} from '~/interfaces/quizzes/recommendation-management.interface'
const { $axios } = useNuxtApp()
const auth = useAuthStore()
const isAdmin = computed(
  () => auth.user?.roles.includes(UserRolEnum.KAIROS_ADMIN) ?? false,
)
const catalog = ref<RecommendationCatalog>({
  recommendations: [],
  questionnaires: [],
  institutions: [],
})
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const message = ref('')
const search = ref('')
const originFilter = ref('all')
const editing = ref(false)
const heading = ref<HTMLElement | null>(null)
const form = ref(emptyForm())
const availableQuestionnaires = ref<RecommendationQuestionnaire[]>([])
const loadingOptions = ref(false)
let optionsRequest = 0
async function loadQuestionnaires() {
  const request = ++optionsRequest
  loadingOptions.value = true
  availableQuestionnaires.value = []
  try {
    const params =
      form.value.origin === 'institution'
        ? { instituteId: form.value.instituteId }
        : {}
    if (form.value.origin === 'institution' && !form.value.instituteId) return
    const { data } = await $axios.get<RecommendationQuestionnaire[]>(
      '/recommendation/questionnaires',
      { params },
    )
    if (request === optionsRequest) availableQuestionnaires.value = data
  } catch (e) {
    if (request === optionsRequest) error.value = errorText(e)
  } finally {
    if (request === optionsRequest) loadingOptions.value = false
  }
}
watch(
  () => [form.value.origin, form.value.instituteId],
  () => {
    if (editing.value) void loadQuestionnaires()
  },
)
function emptyForm() {
  return {
    id: '',
    revision: 0,
    origin: isAdmin.value ? 'kairos' : 'institution',
    instituteId:
      typeof auth.user?.institute === 'string'
        ? auth.user.institute
        : (auth.user?.institute?._id ?? ''),
    questionnaireId: '',
    target: 'overall',
    dimensionId: '',
    min: '',
    max: '',
    priority: 0,
    yieldToInstitutionOnTie: false,
    recommendation: '',
    category: 'N/A',
    level: '',
    implementationTime: '',
    isActive: true,
  }
}
const categories = [
  'N/A',
  'Resiliencia',
  'Relaciones Sociales',
  'Estado de Ánimo',
  'Autopercepción',
  'Propósito de la vida',
  'Autonomía',
  'Balance vida personal y estudios',
]
const questionnaire = computed(() =>
  catalog.value.questionnaires.find((q) => q.id === form.value.questionnaireId),
)
const filtered = computed(() =>
  catalog.value.recommendations.filter(
    (r) =>
      (originFilter.value === 'all' || r.origin === originFilter.value) &&
      `${r.recommendation} ${title(r.questionnaireId)}`
        .toLocaleLowerCase()
        .includes(search.value.toLocaleLowerCase()),
  ),
)
function title(id: string) {
  return (
    catalog.value.questionnaires.find((q) => q.id === id)?.title ??
    'Cuestionario pendiente de seleccionar'
  )
}
function owner(r: ManagedRecommendation) {
  return r.origin === 'kairos'
    ? 'KAIROS'
    : r.origin === 'unclassified'
      ? 'Pendiente de clasificación'
      : (catalog.value.institutions.find((i) => i._id === r.instituteId)
          ?.name ?? 'Institución')
}
function targetLabel(r: ManagedRecommendation) {
  return r.target === 'dimension'
    ? (catalog.value.questionnaires
        .find((q) => q.id === r.questionnaireId)
        ?.dimensions.find((d) => d.id === r.dimensionId)?.label ??
        'Dimensión no disponible')
    : 'Puntaje total'
}
function errorText(e: unknown) {
  const text: unknown = axios.isAxiosError(e) ? e.response?.data?.message : null
  return typeof text === 'string'
    ? text
    : Array.isArray(text)
      ? text.join(' · ')
      : 'No pudimos completar la operación. Vuelve a intentarlo.'
}
async function load() {
  loading.value = true
  error.value = ''
  try {
    catalog.value = (
      await $axios.get<RecommendationCatalog>('/recommendation')
    ).data
  } catch (e) {
    error.value = errorText(e)
  } finally {
    loading.value = false
  }
}
async function open(r?: ManagedRecommendation) {
  message.value = ''
  error.value = ''
  form.value = emptyForm()
  if (r)
    form.value = {
      id: r._id,
      revision: r.revision ?? 0,
      origin: r.origin === 'unclassified' ? '' : r.origin,
      instituteId: r.instituteId ?? '',
      questionnaireId: r.questionnaireId ?? '',
      target: r.target ?? 'overall',
      dimensionId: r.dimensionId ?? '',
      min: r.forResultBetween?.min?.toString() ?? '',
      max: r.forResultBetween?.max?.toString() ?? '',
      priority: r.priority ?? 0,
      yieldToInstitutionOnTie: r.yieldToInstitutionOnTie ?? false,
      recommendation: r.recommendation ?? '',
      category: categories.includes(r.category) ? r.category : 'N/A',
      level: ['leve', 'moderado', 'alto'].includes(r.level) ? r.level : '',
      implementationTime: [
        'mañana',
        'tarde',
        'noche',
        'día',
        'semana',
        'mes',
      ].includes(r.implementationTime)
        ? r.implementationTime
        : '',
      isActive: r.isActive,
    }
  editing.value = true
  await loadQuestionnaires()
  await nextTick()
  heading.value?.focus()
  heading.value?.scrollIntoView({ block: 'start', behavior: 'smooth' })
}
function changeQuestionnaire() {
  form.value.dimensionId = ''
  form.value.target = questionnaire.value?.hasOverall ? 'overall' : 'dimension'
}
async function save() {
  if (saving.value || loadingOptions.value) return
  const f = form.value
  if (
    !f.min.trim() ||
    !f.max.trim() ||
    !Number.isFinite(Number(f.min)) ||
    !Number.isFinite(Number(f.max)) ||
    Number(f.min) > Number(f.max)
  ) {
    error.value = 'El límite mínimo debe ser menor o igual que el máximo.'
    return
  }
  saving.value = true
  error.value = ''
  const payload = {
    origin: f.origin,
    ...(f.origin === 'institution' ? { instituteId: f.instituteId } : {}),
    questionnaireId: f.questionnaireId,
    target: f.target,
    ...(f.target === 'dimension' ? { dimensionId: f.dimensionId } : {}),
    forResultBetween: { min: Number(f.min), max: Number(f.max) },
    priority: Number(f.priority),
    yieldToInstitutionOnTie: f.origin === 'kairos' && f.yieldToInstitutionOnTie,
    recommendation: f.recommendation.trim(),
    category: f.category,
    level: f.level,
    implementationTime: f.implementationTime,
    isActive: f.isActive,
    revision: f.revision,
  }
  try {
    if (f.id) await $axios.patch(`/recommendation/${f.id}`, payload)
    else await $axios.post('/recommendation', payload)
    editing.value = false
    await load()
    message.value = 'Recomendación guardada.'
  } catch (e) {
    error.value = errorText(e)
  } finally {
    saving.value = false
  }
}
onMounted(load)
</script>

<template>
  <main class="recommendations">
    <header class="recommendations__header">
      <div>
        <p>
          {{ isAdmin ? 'Administración de KAIROS' : 'Panel institucional' }}
        </p>
        <h1>Recomendaciones</h1>
        <p>
          Configura el acompañamiento que se asigna al guardar cada
          cuestionario.
        </p>
      </div>
      <v-btn color="#3c2f52" :disabled="loading || saving" @click="open()"
        >Nueva recomendación</v-btn
      >
    </header>
    <div class="recommendations__notice">
      <p>
        Se selecciona la prioridad más alta por cada total o dimensión. Los
        límites del rango están incluidos.
      </p>
      <p>
        Si KAIROS y la institución empatan, se asignan ambas, salvo que KAIROS
        configure ceder ante la institucional. En un empate dentro del mismo
        origen, se usa la recomendación creada primero.
      </p>
      <p v-if="isAdmin">
        Las recomendaciones pendientes de clasificación no se asignarán a nuevas
        aplicaciones hasta que completes su configuración.
      </p>
    </div>
    <p v-if="message" role="status">{{ message }}</p>
    <p v-if="error" class="recommendations__error" role="alert">{{ error }}</p>
    <form v-if="editing" class="recommendations__panel" @submit.prevent="save">
      <h2 ref="heading" tabindex="-1">
        {{ form.id ? 'Editar recomendación' : 'Nueva recomendación' }}
      </h2>
      <fieldset :disabled="saving">
        <div class="recommendations__grid">
          <label v-if="isAdmin"
            >Origen<select v-model="form.origin" required>
              <option disabled value="">Selecciona el origen</option>
              <option value="kairos">KAIROS</option>
              <option value="institution">Institución</option>
            </select></label
          >
          <label v-if="form.origin === 'institution'"
            >Institución<select
              v-model="form.instituteId"
              required
              :disabled="!isAdmin"
            >
              <option disabled value="">Selecciona una institución</option>
              <option
                v-for="i in catalog.institutions"
                :key="i._id"
                :value="i._id"
              >
                {{ i.name }}
              </option>
            </select></label
          >
          <label
            >Cuestionario<select
              v-model="form.questionnaireId"
              :disabled="loadingOptions"
              required
              @change="changeQuestionnaire"
            >
              <option disabled value="">Selecciona un cuestionario</option>
              <option
                v-for="q in availableQuestionnaires"
                :key="q.id"
                :value="q.id"
              >
                {{ q.title }}
              </option>
            </select></label
          >
          <label
            >Evaluar por<select v-model="form.target" required>
              <option v-if="questionnaire?.hasOverall" value="overall">
                Puntaje total
              </option>
              <option v-if="questionnaire?.dimensions.length" value="dimension">
                Dimensión
              </option>
            </select></label
          >
          <label v-if="form.target === 'dimension'"
            >Dimensión<select v-model="form.dimensionId" required>
              <option disabled value="">Selecciona una dimensión</option>
              <option
                v-for="d in questionnaire?.dimensions ?? []"
                :key="d.id"
                :value="d.id"
              >
                {{ d.label }}
              </option>
            </select></label
          >
          <label
            >Puntaje mínimo<input
              v-model="form.min"
              type="number"
              step="any"
              required
          /></label>
          <label
            >Puntaje máximo<input
              v-model="form.max"
              type="number"
              step="any"
              required
          /></label>
          <label
            >Prioridad<input
              v-model.number="form.priority"
              type="number"
              min="0"
              step="1"
              required
            /><small>Un número mayor tiene preferencia.</small></label
          >
          <label
            >Categoría<select v-model="form.category" required>
              <option v-for="c in categories" :key="c">{{ c }}</option>
            </select></label
          >
          <label
            >Nivel<select v-model="form.level" required>
              <option disabled value="">Selecciona el nivel</option>
              <option value="leve">Leve</option>
              <option value="moderado">Moderado</option>
              <option value="alto">Alto</option>
            </select></label
          >
          <label
            >Momento o frecuencia<select
              v-model="form.implementationTime"
              required
            >
              <option disabled value="">Selecciona una opción</option>
              <option
                v-for="time in [
                  'mañana',
                  'tarde',
                  'noche',
                  'día',
                  'semana',
                  'mes',
                ]"
                :key="time"
              >
                {{ time }}
              </option>
            </select></label
          >
        </div>
        <label
          >Texto de la recomendación<textarea
            v-model="form.recommendation"
            rows="5"
            maxlength="5000"
            required
          />
        </label>
        <label
          v-if="isAdmin && form.origin === 'kairos'"
          class="recommendations__check"
          ><input v-model="form.yieldToInstitutionOnTie" type="checkbox" />En un
          empate, asignar solo la recomendación institucional</label
        >
        <label class="recommendations__check"
          ><input v-model="form.isActive" type="checkbox" />Activa para nuevas
          aplicaciones</label
        >
        <p>
          El cuestionario debe tener habilitada la opción «Asignar
          recomendaciones». Si ningún rango coincide, el resultado se guarda sin
          recomendación.
        </p>
        <div class="recommendations__actions">
          <v-btn variant="outlined" :disabled="saving" @click="editing = false"
            >Cancelar</v-btn
          ><v-btn
            color="#3c2f52"
            type="submit"
            :loading="saving"
            :disabled="
              loadingOptions ||
              !availableQuestionnaires.some(
                (q) => q.id === form.questionnaireId,
              )
            "
            >Guardar recomendación</v-btn
          >
        </div>
      </fieldset>
    </form>
    <section
      class="recommendations__panel"
      aria-label="Recomendaciones configuradas"
    >
      <div class="recommendations__grid">
        <label
          >Buscar<input
            v-model="search"
            type="search"
            placeholder="Texto o cuestionario" /></label
        ><label v-if="isAdmin"
          >Filtrar por origen<select v-model="originFilter">
            <option value="all">Todos</option>
            <option value="unclassified">Pendientes de clasificación</option>
            <option value="kairos">KAIROS</option>
            <option value="institution">Institución</option>
          </select></label
        >
      </div>
      <p v-if="loading" role="status">Cargando recomendaciones…</p>
      <v-btn v-else-if="error && !editing" variant="outlined" @click="load"
        >Volver a cargar</v-btn
      >
      <p v-else-if="!filtered.length">
        No hay recomendaciones para esta búsqueda.
      </p>
      <article v-for="r in filtered" :key="r._id" class="recommendations__item">
        <div>
          <strong>{{ owner(r) }}</strong
          ><span> · {{ r.isActive ? 'Activa' : 'Inactiva' }}</span>
          <h3>{{ title(r.questionnaireId) }}</h3>
          <p>
            {{ targetLabel(r) }} · {{ r.forResultBetween?.min ?? '—' }} a
            {{ r.forResultBetween?.max ?? '—' }} · Prioridad
            {{ r.priority ?? 0 }}
          </p>
          <p class="recommendations__text">{{ r.recommendation }}</p>
        </div>
        <v-btn
          variant="outlined"
          :disabled="saving"
          :aria-label="`Editar recomendación de ${owner(r)} para ${title(r.questionnaireId)}`"
          @click="open(r)"
          >{{ r.origin === 'unclassified' ? 'Clasificar' : 'Editar' }}</v-btn
        >
      </article>
    </section>
  </main>
</template>

<style scoped>
.recommendations {
  padding: 32px;
  color: #3c2f52;
  font-family: 'Figtree', sans-serif;
  max-width: 1280px;
  margin: auto;
}
.recommendations__header,
.recommendations__item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;
}
h1 {
  font-size: 28px;
  margin: 8px 0;
}
h2 {
  font-size: 22px;
  margin-bottom: 20px;
}
h3 {
  font-size: 18px;
  margin: 8px 0;
}
p {
  line-height: 1.6;
  margin: 8px 0;
}
.recommendations__notice {
  margin: 24px 0;
  padding: 16px 20px;
  background: #ede9f3;
  border-radius: 16px;
}
.recommendations__panel {
  margin-top: 24px;
  padding: 24px;
  background: white;
  border: 1px solid #ddd5e7;
  border-radius: 20px;
}
.recommendations__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}
label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 16px;
}
input,
select,
textarea {
  width: 100%;
  padding: 12px;
  min-height: 46px;
  border: 1px solid #84758f;
  border-radius: 8px;
  background: white;
  color: #3c2f52;
  font: inherit;
}
input:disabled,
select:disabled {
  background: #f5f4f8;
}
.recommendations__check {
  flex-direction: row;
  align-items: center;
}
.recommendations__check input {
  width: 20px;
  min-height: 20px;
  accent-color: #3c2f52;
}
fieldset {
  border: 0;
  min-width: 0;
}
small {
  font-weight: 400;
}
.recommendations__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
.recommendations__item {
  border-top: 1px solid #ddd5e7;
  padding: 24px 0;
}
.recommendations__item > div {
  flex: 1 1 250px;
  min-width: 0;
}
.recommendations__text {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.recommendations__error {
  color: #a12626;
}
:is(input, select, textarea, button, h2):focus-visible {
  outline: 3px solid #655080;
  outline-offset: 3px;
}
@media (max-width: 700px) {
  .recommendations {
    padding: 20px 16px;
  }
  .recommendations__grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .recommendations__panel {
    padding: 20px 16px;
  }
}
</style>
