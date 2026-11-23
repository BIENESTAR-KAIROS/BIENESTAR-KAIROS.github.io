<script setup lang="ts">
import DemoComparison from '~/components/institute/my-stats/demo-comparison.vue'
import { useAuthStore } from '~/store/auth'
import { useDemoStats } from './use-demo-stats'
import DemoReport from './demo-report.vue'
import { demoJobLabels } from '~/utils/translations/demo'
const auth = useAuthStore()
const {
  catalog,
  questionnaireId,
  selected,
  loading,
  consulting,
  loadError,
  queryError,
  status,
  report,
  labels,
  load,
  consult,
} = useDemoStats()
const jobLabel = computed(() =>
  !status.value || status.value.jobState === 'not_generated'
    ? 'Sin generación solicitada'
    : demoJobLabels[status.value.jobState],
)
</script>
<template>
  <section class="demo-page" :aria-busy="loading || consulting">
    <header class="heading">
      <div>
        <p class="eyebrow">Datos demo</p>
        <h1>Mis estadísticas</h1>
        <p>
          Explora ejemplos de tu institución. Los resultados sintéticos se
          consultan por separado de los
          {{ auth.terms.members.toLowerCase() }} reales.
        </p>
      </div>
      <button type="button" :disabled="loading || consulting" @click="load">
        Actualizar opciones
      </button>
    </header>
    <p v-if="loading" class="panel" role="status">
      Cargando cuestionarios y permisos…
    </p>
    <div v-else-if="loadError" class="panel error" role="alert">
      {{ loadError }} <button type="button" @click="load">Reintentar</button>
    </div>
    <template v-else>
      <p v-if="!catalog.length" class="panel" role="status">
        No hay cuestionarios compatibles publicados para esta institución.
      </p>
      <form v-else class="panel controls" @submit.prevent="consult">
        <label for="institution-demo-questionnaire"
          >Cuestionario
          <select
            id="institution-demo-questionnaire"
            v-model="questionnaireId"
            :disabled="consulting"
          >
            <option v-for="q in catalog" :key="q.id" :value="q.id">
              {{ q.title }}
            </option>
          </select>
        </label>
        <button
          class="primary"
          type="submit"
          :disabled="consulting || !selected"
        >
          {{
            consulting ? 'Consultando…' : 'Consultar demo / actualizar estado'
          }}
        </button>
        <p>
          La asignación de usuarios y los ajustes de distribución los administra
          el equipo KAIROS.
        </p>
      </form>
      <p v-if="consulting" class="panel" role="status">
        Verificando la asignación y los resultados demo…
      </p>
      <p v-if="queryError" class="panel error" role="alert">{{ queryError }}</p>
      <div v-if="status && !consulting" class="panel" role="status">
        <h2>Estado de la demo: {{ jobLabel }}</h2>
        <p v-if="status.cleanupPending">
          Se están retirando datos anteriores. La limpieza se realiza en segundo
          plano.
        </p>
        <p
          v-if="
            report &&
            ['queued', 'running', 'prepared'].includes(status.jobState)
          "
        >
          Se está preparando una nueva generación. El informe mostrado
          corresponde a la generación completa anterior que sigue activa.
        </p>
        <p v-else-if="!status.hasActiveGeneration">
          Todavía no hay un informe activo. Vuelve a consultar en unos momentos;
          si la solicitud está cancelada o no se completó, pide al administrador
          KAIROS que revise la configuración.
        </p>
      </div>
      <DemoComparison
        v-if="report && selected"
        :key="
          [report.institutionId, questionnaireId, report.generationId].join('-')
        "
        :institution="report.institutionId"
        :questionnaire="questionnaireId"
        :generation="report.generationId"
        :participants="report.participants"
        :metrics="report.metrics"
        :labels="labels"
      />
      <DemoReport
        v-if="report && selected"
        :report="report"
        :labels="labels"
        :title="selected.title"
      />
      <p
        v-else-if="catalog.length && !status && !queryError && !consulting"
        class="panel"
      >
        Selecciona un cuestionario y pulsa «Consultar demo / actualizar estado».
      </p>
    </template>
  </section>
</template>
<style scoped>
.demo-page {
  padding: 24px 32px 40px;
  display: grid;
  gap: 24px;
  min-width: 0;
  color: #3c2f52;
  font-family: 'Figtree', sans-serif;
}
.heading {
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
  letter-spacing: 0.1em;
  font-weight: 700;
}
.panel {
  padding: 24px;
  border: 1px solid #efebf5;
  border-radius: 20px;
  background: #fff;
  min-width: 0;
}
.controls {
  display: flex;
  align-items: end;
  gap: 16px;
  flex-wrap: wrap;
}
.controls label {
  display: grid;
  gap: 8px;
  flex: 1 1 300px;
  min-width: 0;
  font-size: 14px;
  font-weight: 700;
}
.controls p {
  flex-basis: 100%;
}
select {
  width: 100%;
  min-width: 0;
  height: 50px;
  border: 2px solid #ece7f3;
  border-radius: 14px;
  padding: 0 12px;
  background: #faf9fc;
  color: #3c2f52;
}
button {
  min-height: 44px;
  padding: 10px 20px;
  border: 2px solid #ded6ea;
  border-radius: 999px;
  background: #fff;
  color: #3c2f52;
  font-weight: 700;
  font-size: 14px;
}
button.primary {
  background: #3c2f52;
  color: #fff;
  border-color: #3c2f52;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
button:focus-visible,
select:focus-visible {
  outline: 3px solid #5c4a75;
  outline-offset: 3px;
}
.error {
  color: #b3261e;
}
@media (max-width: 700px) {
  .demo-page {
    padding: 20px 16px 32px;
  }
  .heading {
    flex-direction: column;
  }
  .controls {
    align-items: stretch;
  }
  .controls label,
  .controls button {
    flex-basis: 100%;
  }
  .panel {
    padding: 20px;
  }
}
</style>
