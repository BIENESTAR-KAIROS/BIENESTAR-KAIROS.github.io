<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import { usePublicationStats } from './use-publication-stats'
import PublicationReport from './publication-report.vue'
import { formatPeriodInstant } from '~/utils/helpers/statistics-period-time'
const auth = useAuthStore()
const {
  catalog,
  periods,
  closedPeriods,
  questionnaireId,
  selected,
  revisionMode,
  previousRevision,
  revisionValid,
  periodKey,
  loading,
  consulting,
  loadError,
  queryError,
  result,
  labels,
  canConsult,
  load,
  consult,
} = usePublicationStats()
const date = (value: string) =>
  formatPeriodInstant(value, 'America/Mexico_City')
</script>

<template>
  <section class="publication-page" :aria-busy="loading || consulting">
    <header class="page-heading">
      <div>
        <p class="eyebrow">{{ auth.terms.members }} reales</p>
        <h1>Mis estadísticas</h1>
        <p>
          Consulta los resultados de cada cuestionario sin combinar revisiones
          ni datos demo.
        </p>
      </div>
      <button
        type="button"
        class="secondary"
        :disabled="loading || consulting"
        @click="load"
      >
        Actualizar opciones
      </button>
    </header>
    <p v-if="loading" class="panel" role="status">
      Cargando cuestionarios, períodos y permisos…
    </p>
    <div v-else-if="loadError" class="panel error" role="alert">
      {{ loadError }}
      <button type="button" class="secondary" @click="load">Reintentar</button>
    </div>
    <template v-else>
      <div v-if="!catalog.length" class="panel" role="status">
        <h2>No hay cuestionarios compatibles publicados</h2>
        <p>
          Los informes requieren cuestionarios con la definición y puntuación
          compatibles con esta analítica.
        </p>
        <NuxtLink to="/institute/quizzes">Ver mis cuestionarios</NuxtLink>
      </div>
      <div v-if="!closedPeriods.length" class="panel" role="status">
        <h2>
          {{
            periods.length
              ? 'Todavía no hay períodos cerrados'
              : 'Todavía no hay períodos registrados'
          }}
        </h2>
        <p>
          {{
            periods.length
              ? 'Podrás consultar un período cuando llegue su fecha de fin.'
              : 'Registra el intervalo de análisis en Mis configuraciones. Si no tienes permisos, solicítalo a quien administra la institución.'
          }}
        </p>
        <NuxtLink to="/institute/settings"
          >Ver configuración de períodos</NuxtLink
        >
      </div>
      <form
        v-if="catalog.length && closedPeriods.length"
        class="panel"
        @submit.prevent="consult"
      >
        <h2>Seleccionar informe</h2>
        <div class="filters">
          <label
            >Cuestionario<select
              v-model="questionnaireId"
              :disabled="consulting"
            >
              <option v-for="q in catalog" :key="q.id" :value="q.id">
                {{ q.title }}{{ q.active ? '' : ' · Inactivo' }}
              </option>
            </select></label
          >
          <label
            >Revisión<select v-model="revisionMode" :disabled="consulting">
              <option value="current">Actual ({{ selected?.revision }})</option>
              <option value="previous">Otra revisión conocida</option>
            </select></label
          >
          <label v-if="revisionMode === 'previous'"
            >Número de revisión<input
              v-model="previousRevision"
              inputmode="numeric"
              pattern="0|[1-9][0-9]*"
              maxlength="16"
              :disabled="consulting"
              aria-describedby="revision-help"
              :aria-invalid="!!previousRevision && !revisionValid"
          /></label>
          <label class="period"
            >Período cerrado<select v-model="periodKey" :disabled="consulting">
              <option v-for="p in closedPeriods" :key="p.from" :value="p.from">
                {{ date(p.from) }} → {{ date(p.until) }}
              </option>
            </select></label
          >
        </div>
        <p v-if="revisionMode === 'previous'" id="revision-help">
          Indica el número de una revisión anterior conocida, entre 0 y
          {{ selected?.revision }}. El catálogo solo proporciona la revisión
          actual; no se combinarán revisiones.
        </p>
        <p class="help">
          Fechas en America/Mexico_City. El inicio está incluido y el fin no.
          Los períodos abiertos no están disponibles para consulta.
        </p>
        <p class="notice">
          La primera consulta con datos suficientes fija el informe del período.
          Después se conserva el mismo resultado, incluso si llegan respuestas
          tardías.
        </p>
        <button type="submit" :disabled="!canConsult">
          {{ consulting ? 'Consultando informe…' : 'Consultar informe' }}
        </button>
      </form>
      <p v-if="consulting" role="status">Validando y consultando el informe…</p>
      <div v-if="queryError" class="panel error" role="alert">
        {{ queryError }}
      </div>
      <PublicationReport
        v-if="result"
        :response="result"
        :members-label="auth.terms.members"
        :labels="labels"
        :title="selected?.title || 'Cuestionario'"
      />
      <p v-else-if="canConsult && !queryError" role="status">
        Selecciona el alcance y pulsa «Consultar informe» para ver sus
        resultados.
      </p>
    </template>
  </section>
</template>

<style scoped>
.publication-page {
  padding: 24px 32px 40px;
  display: grid;
  gap: 24px;
  color: #3c2f52;
  font-family: 'Figtree', sans-serif;
  min-width: 0;
}
.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 20px;
}
h1 {
  font-size: 21px;
  font-weight: 800;
}
h2 {
  font-size: 18px;
  font-weight: 800;
}
p {
  font-size: 14px;
  line-height: 1.6;
  margin-top: 12px;
}
.eyebrow {
  margin-top: 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 800;
}
.panel {
  padding: 24px;
  border: 1px solid #efebf5;
  border-radius: 24px;
  background: white;
  min-width: 0;
}
.filters {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 20px;
}
.period {
  grid-column: 1 / -1;
}
label {
  display: grid;
  align-content: start;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  min-width: 0;
}
select,
input {
  width: 100%;
  min-width: 0;
  min-height: 48px;
  border: 2px solid #ded6ea;
  border-radius: 16px;
  padding: 10px 12px;
  background: #faf9fc;
  color: #3c2f52;
  font: inherit;
}
button {
  min-height: 44px;
  border-radius: 999px;
  padding: 10px 20px;
  background: #3c2f52;
  color: white;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  border: 2px solid #3c2f52;
  cursor: pointer;
}
form > button {
  margin-top: 20px;
}
.secondary {
  background: white;
  color: #3c2f52;
  border-color: #ded6ea;
}
button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
:is(button, select, input, a):focus-visible {
  outline: 3px solid #5c4a75;
  outline-offset: 3px;
}
a {
  display: inline-block;
  color: #5c4a75;
  text-underline-offset: 3px;
  padding: 12px 0;
  font-weight: 700;
}
.help {
  color: #6b6080;
}
.notice {
  background: #f0eaf5;
  border-radius: 16px;
  padding: 16px;
}
.error {
  background: #fdf3f3;
  color: #8a3d3d;
}
.error button {
  margin-left: 12px;
}
@media (max-width: 700px) {
  .publication-page {
    padding: 20px 16px 32px;
  }
  .page-heading {
    flex-direction: column;
  }
  .filters {
    grid-template-columns: minmax(0, 1fr);
  }
  .panel {
    padding: 20px;
  }
}
</style>
