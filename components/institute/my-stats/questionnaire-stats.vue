<script setup lang="ts">
import { genderLabels } from '~/utils/translations'
import { useQuestionnaireStats } from './use-questionnaire-stats'
import QuestionnaireMetric from './questionnaire-metric.vue'
const {
  questionnaires,
  filterOptions,
  selected,
  revision,
  response,
  version,
  loading,
  catalogLoading,
  error,
  catalogError,
  filters,
  load,
  loadCatalog,
  clearFilters,
} = useQuestionnaireStats()
const options = filterOptions
const number = (n: number | null | undefined) =>
  n == null ? '—' : n.toLocaleString('es-MX', { maximumFractionDigits: 2 })
</script>
<template>
  <section class="questionnaire-stats" :aria-busy="loading || catalogLoading">
    <header>
      <div>
        <h1>Estadísticas</h1>
        <p>Explora lo que mide cada cuestionario de tu institución.</p>
      </div>
      <button
        :disabled="loading || catalogLoading"
        @click="catalogError ? loadCatalog() : load()"
      >
        Actualizar
      </button>
    </header>
    <p v-if="catalogLoading" role="status">Cargando cuestionarios…</p>
    <div v-else-if="catalogError" class="notice notice--error" role="alert">
      {{ catalogError }} <button @click="loadCatalog">Reintentar</button>
    </div>
    <div v-else-if="!questionnaires.length" class="notice" role="status">
      Todavía no hay cuestionarios publicados para esta institución.
    </div>
    <template v-else>
      <form class="filters" @submit.prevent="load">
        <label class="filters__questionnaire"
          >Cuestionario<select v-model="selected">
            <option v-for="q in questionnaires" :key="q.id" :value="q.id">
              {{ q.title }}{{ q.active ? '' : ' · Inactivo' }}
            </option>
          </select></label
        >
        <label
          >Periodo<select v-model="filters.days">
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 90 días</option>
            <option value="180">Últimos 180 días</option>
            <option value="">Todo el historial</option>
          </select></label
        >
        <label
          >Población<select v-model="filters.population">
            <option value="all">Todos los alumnos</option>
            <option value="demo">Solo demo</option>
            <option value="real">Sin demos</option>
          </select></label
        >
        <label
          >Campus<select v-model="filters.campus">
            <option value="">Todos</option>
            <option v-for="item in options?.campus" :key="item" :value="item">
              {{ item }}
            </option>
          </select></label
        >
        <label
          >Facultad<select v-model="filters.department">
            <option value="">Todas</option>
            <option
              v-for="item in options?.department"
              :key="item"
              :value="item"
            >
              {{ item }}
            </option>
          </select></label
        >
        <label
          >Género<select v-model="filters.gender">
            <option value="">Todos</option>
            <option v-for="item in options?.gender" :key="item" :value="item">
              {{ genderLabels[item] || item }}
            </option>
          </select></label
        >
        <label
          >Edad<select v-model="filters.ageRange">
            <option value="">Todas</option>
            <option value="0:17">Menores de 18</option>
            <option value="18:22">18–22 años</option>
            <option value="23:29">23–29 años</option>
            <option value="30:">30 años o más</option>
          </select></label
        >
        <button type="button" @click="clearFilters">Limpiar filtros</button>
      </form>
      <p v-if="loading" class="notice" role="status">
        Cargando estadísticas del cuestionario…
      </p>
      <div v-else-if="error" class="notice notice--error" role="alert">
        {{ error }} <button @click="load">Reintentar</button>
      </div>
      <template v-else-if="response">
        <div v-if="!response.versions.length" class="notice" role="status">
          No hay resultados para este cuestionario con los filtros elegidos.
          <button @click="clearFilters">Ver todo el historial</button>
        </div>
        <template v-else>
          <label v-if="response.versions.length > 1" class="revision"
            >Versión del cuestionario<select v-model="revision">
              <option
                v-for="v in response.versions"
                :key="v.key"
                :value="v.key"
              >
                {{
                  v.revision === 'legacy'
                    ? 'Histórica'
                    : `Revisión ${v.revision}`
                }}
                · Evaluación {{ v.scoringVersion }} ·
                {{ v.respondents }} alumnos
              </option>
            </select></label
          >
          <template v-if="version">
            <p v-if="version.demoRespondents" class="notice" role="status">
              Esta vista incluye {{ number(version.demoRespondents) }} alumnos
              demo con datos sintéticos de ejemplo. No representan resultados
              reales de la institución.
            </p>
            <div class="summary">
              <article>
                <span>Alumnos con resultado</span
                ><strong>{{ number(version.respondents) }}</strong>
                <p>
                  {{ number(version.realRespondents) }} reales ·
                  {{ number(version.demoRespondents) }} demo
                </p>
              </article>
              <article>
                <span>Población seleccionada</span
                ><strong>{{ number(response.totalStudents) }}</strong>
                <p>
                  Alumnos activos de la institución que pueden responder este
                  cuestionario
                </p>
              </article>
              <article>
                <span>Cobertura</span
                ><strong
                  >{{ number(version.coveragePct)
                  }}{{ version.coveragePct === null ? '' : '%' }}</strong
                >
                <p>Una respuesta por alumno en esta versión y periodo</p>
              </article>
            </div>
            <p v-if="!version.sampleSufficient" class="notice" role="status">
              Se necesitan al menos {{ response.minGroupSize }} alumnos para
              mostrar resultados agregados. Amplía el periodo o quita filtros.
            </p>
            <template v-else>
              <h2>{{ response.questionnaire.title }}</h2>
              <p class="context">
                Cada dimensión conserva su unidad y sus interpretaciones. Las
                revisiones se consultan por separado.
              </p>
              <p
                v-if="!version.metrics.some((m) => m.id === 'overall')"
                class="context"
              >
                Este cuestionario no define un puntaje total.
              </p>
              <div class="metrics">
                <QuestionnaireMetric
                  v-for="metric in version.metrics"
                  :key="metric.id"
                  :metric="metric"
                  :min-group-size="response.minGroupSize"
                />
              </div>
              <section v-if="version.questions.length" class="questions">
                <h2>Respuestas por pregunta</h2>
                <p>
                  Conteos de opciones y promedios numéricos. No se muestran
                  textos libres ni fechas individuales.
                </p>
                <details
                  v-for="question in version.questions"
                  :key="question.id"
                >
                  <summary>{{ question.label }}</summary>
                  <p>
                    {{ question.n }}
                    {{
                      question.type === 'multiple_choice'
                        ? 'selecciones (puede haber varias por alumno)'
                        : 'respuestas'
                    }}
                  </p>
                  <p v-if="question.type === 'number'">
                    Promedio: {{ number(question.mean) }}
                  </p>
                  <ul v-else>
                    <li
                      v-for="(option, index) in question.options"
                      :key="index"
                    >
                      {{ option.label }}: {{ option.count }}
                    </li>
                  </ul>
                </details>
              </section>
            </template>
            <p class="updated">
              Actualizado
              {{ new Date(response.generatedAt).toLocaleString('es-MX') }}. Se
              utiliza la última respuesta de cada alumno en el periodo.
            </p>
          </template>
        </template>
      </template>
    </template>
  </section>
</template>
<style scoped>
.questionnaire-stats {
  padding: 24px 32px 40px;
  background: #f5f4f8;
  color: #3c2f52;
  font-family: Figtree, sans-serif;
  min-width: 0;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}
h1 {
  font-size: 20px;
  font-weight: 800;
}
h2 {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 12px;
}
p {
  font-size: 14px;
  line-height: 1.6;
}
header p {
  margin-top: 8px;
}
button,
select {
  min-height: 46px;
  font: inherit;
  font-size: 14px;
  border-radius: 999px;
  border: 2px solid #ded6ea;
  background: #fff;
  color: #3c2f52;
  padding: 10px 16px;
}
button {
  cursor: pointer;
  font-weight: 700;
}
button:hover:not(:disabled) {
  background: #f0eaf5;
}
button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
button:focus-visible,
select:focus-visible,
summary:focus-visible {
  outline: 3px solid #5c4a75;
  outline-offset: 3px;
}
.filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  padding: 24px;
  border-radius: 24px;
  background: #fff;
  border: 1px solid #efebf5;
  margin-bottom: 24px;
  align-items: end;
}
label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  min-width: 0;
}
select {
  width: 100%;
  text-overflow: ellipsis;
}
.filters__questionnaire {
  grid-column: span 2;
}
.revision {
  max-width: 500px;
  margin-bottom: 20px;
}
.notice {
  background: #f0eaf5;
  padding: 20px;
  border-radius: 20px;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
}
.notice button {
  margin: 8px;
}
.notice--error {
  color: #8a3d3d;
  background: #fdf3f3;
}
.summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}
.summary article {
  background: #fff;
  border: 1px solid #efebf5;
  border-radius: 24px;
  padding: 24px;
}
.summary span {
  font-size: 13px;
  font-weight: 700;
}
.summary strong {
  display: block;
  font-size: 38px;
  font-weight: 800;
  margin: 10px 0;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}
.context {
  margin-bottom: 16px;
}
.questions {
  padding: 24px;
  background: #fff;
  border: 1px solid #efebf5;
  border-radius: 24px;
  margin-top: 24px;
}
.questions details {
  border-bottom: 1px solid #efebf5;
  padding: 12px 0;
}
summary {
  min-height: 44px;
  cursor: pointer;
  padding: 12px 0;
  font-size: 14px;
  font-weight: 700;
}
ul {
  padding: 12px 20px;
  font-size: 14px;
  line-height: 1.8;
}
.updated {
  margin-top: 24px;
  color: #5c4a75;
}
@media (max-width: 1100px) {
  .filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .metrics {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 700px) {
  .questionnaire-stats {
    padding: 20px 16px 32px;
  }
  header {
    align-items: flex-start;
    flex-direction: column;
  }
  .filters,
  .summary {
    grid-template-columns: 1fr;
  }
  .filters {
    padding: 20px;
  }
  .filters__questionnaire {
    grid-column: auto;
  }
}
</style>
