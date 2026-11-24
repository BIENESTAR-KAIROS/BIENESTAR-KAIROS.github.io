<script setup lang="ts">
import DemoComparison from '~/components/institute/my-stats/demo-comparison.vue'
import DemoAssignment from '~/components/admin/users/DemoAssignment.vue'
import DemoProfileFields from './DemoProfileFields.vue'
import DemoReport from './DemoReport.vue'
import { useDemoSetup } from './use-demo-setup'
import { demoJobLabels } from '~/utils/translations/demo'
const {
  institutions,
  institutionId,
  questionnaireId,
  catalog,
  inspection,
  report,
  labels,
  defaultProfile,
  dimensionProfiles,
  loadingInstitutions,
  loadingCatalog,
  loading,
  writing,
  assignmentBusy,
  reportLoading,
  error,
  directoryError,
  reportError,
  message,
  pending,
  cancellationUncertain,
  selectedInstitution,
  selectedQuestionnaire,
  locked,
  job,
  inProgress,
  overLimit,
  overlapping,
  canSubmit,
  dimensionName,
  loadInstitutions,
  loadCatalog,
  loadInspection,
  submit,
  cancelJob,
  consult,
  toggleDimension,
  assignmentChanged,
  stopRetrying,
} = useDemoSetup()
const cancelConfirmation = ref(false)
watch([institutionId, questionnaireId, () => job.value?.id], () => {
  cancelConfirmation.value = false
})
async function confirmCancel() {
  cancelConfirmation.value = false
  await cancelJob()
}
</script>
<template>
  <main class="admin-users demo-setup">
    <header class="demo-heading">
      <div>
        <p class="demo-eyebrow">Administración general</p>
        <h1>Configuración demo</h1>
        <p>
          Asigna usuarios de ejemplo y prepara los resultados que mostrarás en
          cada cuestionario.
        </p>
      </div>
      <NuxtLink to="/admin/users" class="user-secondary">Ver usuarios</NuxtLink>
    </header>
    <section
      class="user-panel"
      aria-labelledby="demo-institution-title"
      :aria-busy="loadingInstitutions"
    >
      <h2 id="demo-institution-title">Institución de la demo</h2>
      <p>
        La asignación y las estadísticas se configuran para la institución que
        elijas aquí.
      </p>
      <label class="demo-institution-select"
        >Institución
        <select
          v-model="institutionId"
          :disabled="locked || loadingInstitutions"
        >
          <option value="">Elige una institución</option>
          <option v-for="i in institutions" :key="i._id" :value="i._id">
            {{ i.name }}{{ i.active ? '' : ' (inactiva)' }}
          </option>
        </select>
      </label>
      <p v-if="loadingInstitutions" role="status">Cargando instituciones…</p>
      <p v-else-if="directoryError" class="user-error" role="alert">
        {{ directoryError }}
        <button @click="loadInstitutions">Reintentar</button>
      </p>
      <p v-else-if="!institutions.length">
        Todavía no hay instituciones disponibles.
      </p>
      <p
        v-if="selectedInstitution && !selectedInstitution.active"
        class="demo-warning"
        role="status"
      >
        La institución está inactiva. Actívala antes de configurar o consultar
        demos.
      </p>
    </section>
    <template v-if="selectedInstitution">
      <DemoAssignment
        :key="selectedInstitution._id"
        :institutions="institutions"
        :institution-id="institutionId"
        :disabled="
          writing ||
          !!pending ||
          cancellationUncertain ||
          loading ||
          reportLoading
        "
        @busy="assignmentBusy = $event"
        @changed="assignmentChanged"
      />
      <section
        v-if="selectedInstitution.active"
        class="user-panel"
        aria-labelledby="demo-controls-title"
        :aria-busy="loading || writing"
      >
        <span class="user-badge">Datos sintéticos</span>
        <h2 id="demo-controls-title">Estadísticas de la demo</h2>
        <p>
          Elige un cuestionario activo y publicado. Los controles orientan las
          respuestas y el cuestionario determina sus puntuaciones finales. Para
          comparar resultados, genera una demo del Sociodemográfico vinculado y
          otra del cuestionario que quieras analizar con la misma asignación.
        </p>
        <div class="user-actions">
          <label
            >Cuestionario
            <select
              v-model="questionnaireId"
              :disabled="locked || loadingCatalog"
            >
              <option value="">Elige un cuestionario</option>
              <option v-for="q in catalog" :key="q.id" :value="q.id">
                {{ q.title }}
              </option>
            </select>
          </label>
          <button
            class="user-secondary"
            :disabled="locked || loadingCatalog || loading || reportLoading"
            @click="questionnaireId ? loadInspection() : loadCatalog()"
          >
            Actualizar estado
          </button>
        </div>
        <p v-if="loadingCatalog" role="status">Cargando cuestionarios…</p>
        <p v-else-if="!catalog.length && !error">
          No hay cuestionarios activos y publicados compatibles con esta
          sección.
        </p>
        <p v-if="loading" role="status">
          Comprobando la asignación y la configuración…
        </p>
        <p v-if="error" class="user-error" role="alert">{{ error }}</p>
        <p v-if="message" class="user-notice" role="status">{{ message }}</p>
        <div v-if="pending && !writing" class="demo-warning" role="alert">
          <h3>Solicitud pendiente de confirmar</h3>
          <p>
            Puede haberse guardado aunque no recibimos la respuesta. Reintenta
            la misma solicitud para confirmarla sin crear otra demo.
          </p>
          <button
            class="user-primary"
            :disabled="loading || reportLoading"
            @click="submit"
          >
            Reintentar la misma solicitud
          </button>
          <button
            class="user-secondary"
            :disabled="loading || reportLoading"
            @click="stopRetrying"
          >
            Dejar de reintentar y comprobar estado
          </button>
        </div>
        <div v-if="cancellationUncertain" class="demo-warning" role="alert">
          <p>
            No pudimos confirmar la cancelación. Actualiza el estado antes de
            continuar.
          </p>
          <button
            class="user-secondary"
            :disabled="loading"
            @click="loadInspection()"
          >
            Comprobar cancelación
          </button>
          <button
            class="user-secondary"
            :disabled="loading"
            @click="stopRetrying"
          >
            Continuar sin confirmación
          </button>
        </div>
        <template v-if="inspection">
          <div class="demo-summary">
            <div>
              <strong>{{
                inspection.assignment.count.toLocaleString('es-MX')
              }}</strong
              ><span>Usuarios demo asignados</span>
            </div>
            <div>
              <strong>{{ inspection.state.latestVersion || '—' }}</strong
              ><span>Última configuración</span>
            </div>
            <div>
              <strong class="demo-job-label">{{
                job ? demoJobLabels[job.state] : 'Sin solicitudes'
              }}</strong
              ><span>Estado de generación</span>
            </div>
          </div>
          <p v-if="overLimit" class="demo-warning" role="status">
            Este cuestionario admite hasta
            {{ inspection.maxParticipants.toLocaleString('es-MX') }}
            participantes demo por informe. Reduce la cantidad asignada antes de
            solicitar una generación.
          </p>
          <p v-if="inProgress" class="user-notice" role="status">
            {{
              job?.state === 'queued'
                ? 'La solicitud está guardada y en espera de procesamiento. Se ejecutará automáticamente cuando el servicio de generación esté disponible.'
                : 'La nueva generación está en preparación. Se mostrará cuando esté completa.'
            }}
            Puedes actualizar el estado para consultar el avance.
          </p>
          <p
            v-if="inspection.state.cleanupPending"
            class="demo-warning"
            role="status"
          >
            Hay una limpieza automática pendiente antes de generar otra demo.
            Los resultados activos se conservan. Actualiza el estado en unos
            momentos; si no cambia, solicita al equipo KAIROS revisar el
            servicio.
          </p>
          <p v-if="job?.state === 'failed'" class="demo-warning" role="status">
            La generación no se completó. Actualiza el estado y solicita al
            equipo KAIROS revisar el trabajo antes de volver a generar.
          </p>
          <form @submit.prevent="submit">
            <fieldset
              class="demo-config"
              :disabled="
                locked ||
                loading ||
                reportLoading ||
                inProgress ||
                inspection.state.cleanupPending ||
                overLimit
              "
            >
              <legend>Distribución de las respuestas</legend>
              <p>
                Esta distribución se aplica a todas las preguntas puntuables sin
                ajuste específico. Las opciones, las ponderaciones y las
                preguntas condicionadas pueden cambiar la distribución final.
              </p>
              <DemoProfileFields id="demo-default" v-model="defaultProfile" />
              <details
                v-if="inspection.dimensionIds.length"
                class="demo-dimension-controls"
              >
                <summary>
                  Ajustar por dimensión ({{ inspection.dimensionIds.length }})
                </summary>
                <p>
                  Activa solo las dimensiones que necesiten una distribución
                  distinta. Si comparten preguntas, un ajuste también puede
                  afectar a otra dimensión. No se admiten dos ajustes que
                  compartan preguntas.
                </p>
                <div
                  v-for="(id, index) in inspection.dimensionIds"
                  :key="id"
                  class="demo-dimension"
                >
                  <label class="demo-checkbox"
                    ><input
                      type="checkbox"
                      :checked="!!dimensionProfiles[id]"
                      @change="
                        toggleDimension(
                          id,
                          ($event.target as HTMLInputElement).checked,
                        )
                      "
                    />{{ dimensionName(id, index) }}</label
                  >
                  <DemoProfileFields
                    v-if="dimensionProfiles[id]"
                    :id="`demo-${id}`"
                    :model-value="dimensionProfiles[id]!"
                    @update:model-value="dimensionProfiles[id] = $event"
                  />
                  <p v-else class="demo-help">Usa la distribución base.</p>
                </div>
              </details>
              <p v-else>
                No hay dimensiones independientes para ajustar en este
                cuestionario.
              </p>
            </fieldset>
            <p v-if="overlapping" class="user-error" role="alert">
              Hay dimensiones seleccionadas que comparten preguntas. Desactiva
              uno de esos ajustes antes de continuar.
            </p>
            <p class="demo-help">
              Al completarse, una nueva generación reemplazará la demo activa.
              Hasta entonces se conservarán los resultados actuales. No modifica
              respuestas reales.
            </p>
            <button type="submit" class="user-primary" :disabled="!canSubmit">
              {{
                writing
                  ? 'Guardando solicitud…'
                  : 'Guardar y solicitar generación'
              }}
            </button>
          </form>
          <div v-if="inProgress" class="demo-cancel">
            <button
              v-if="!cancelConfirmation"
              type="button"
              class="user-secondary"
              :disabled="locked || loading || reportLoading"
              @click="cancelConfirmation = true"
            >
              Cancelar trabajo
            </button>
            <div v-else role="group" aria-label="Confirmar cancelación">
              <p>
                ¿Cancelar la generación en preparación? La demo activa seguirá
                disponible.
              </p>
              <div class="user-actions">
                <button
                  class="user-secondary"
                  :disabled="locked"
                  @click="confirmCancel"
                >
                  Confirmar cancelación</button
                ><button
                  class="user-secondary"
                  :disabled="locked"
                  @click="cancelConfirmation = false"
                >
                  Conservar trabajo
                </button>
              </div>
            </div>
          </div>
          <div class="demo-consult">
            <h3>Resultados activos</h3>
            <p v-if="!inspection.state.activeGenerationId">
              Todavía no hay una generación completa y activa de este
              cuestionario. Los ejemplos anteriores de la plataforma no se
              incluyen automáticamente aquí.
            </p>
            <template v-else
              ><p>
                Consulta las estadísticas obtenidas con la última generación
                completa.
              </p>
              <button
                class="user-secondary"
                :disabled="locked || loading || reportLoading"
                @click="consult"
              >
                {{
                  reportLoading
                    ? 'Calculando estadísticas…'
                    : 'Ver estadísticas demo'
                }}
              </button></template
            >
            <p v-if="reportError" class="user-error" role="alert">
              {{ reportError }} Actualiza el estado antes de volver a consultar.
            </p>
          </div>
        </template>
      </section>
      <DemoComparison
        v-if="report && inspection && selectedQuestionnaire"
        :key="[institutionId, questionnaireId, report.generationId].join('-')"
        :institution="institutionId"
        :questionnaire="questionnaireId"
        :generation="report.generationId"
        :participants="report.participants"
        :metrics="report.metrics"
        admin
        :labels="
          report.configuration.definitionRevision ===
          inspection.revision.definitionRevision
            ? labels
            : { metrics: {}, questions: {} }
        "
      />
      <DemoReport
        v-if="report && inspection && selectedQuestionnaire"
        :report="report"
        :labels="labels"
        :title="selectedQuestionnaire.title"
        :current-revision="inspection.revision.definitionRevision"
      />
    </template>
    <p v-else class="demo-empty">
      Selecciona una institución para ver su asignación y preparar una demo.
    </p>
  </main>
</template>
<style src="../users/users.css"></style>
<style src="./demo.css"></style>
