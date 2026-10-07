<script setup lang="ts">
import QuestionnaireQueueEditor from './questionnaire-queue-editor.vue'
import { isAxiosError } from 'axios'
import { useAuthStore } from '~/store/auth'
import type { InstituteSetting } from '~/interfaces/institute/institute-setting.interface'

const { $axios } = useNuxtApp()
const auth = useAuthStore()
const instituteId = computed(() => {
  const institute = auth.user?.institute
  return typeof institute === 'string' ? institute : institute?._id
})
const setting = ref<InstituteSetting | null>(null)
const loading = ref(true)
const saving = ref(false)
const queueSaving = ref(false)
const loadError = ref('')
const saveError = ref('')
const success = ref('')
let requestVersion = 0

async function loadSettings() {
  const version = ++requestVersion
  const id = instituteId.value
  loading.value = true
  saving.value = false
  queueSaving.value = false
  setting.value = null
  loadError.value = ''
  saveError.value = ''
  success.value = ''
  if (!id) {
    loadError.value =
      'No pudimos identificar tu institución. Vuelve a intentarlo.'
    loading.value = false
    return
  }
  try {
    const { data } = await $axios.get<InstituteSetting>(
      `/institute-setting/institute/${id}`,
    )
    if (version === requestVersion) setting.value = data
  } catch (error) {
    if (version !== requestVersion) return
    if (!isAxiosError(error) || error.response?.status !== 404) {
      loadError.value =
        'No pudimos cargar tus configuraciones. Vuelve a intentarlo.'
    }
  } finally {
    if (version === requestVersion) loading.value = false
  }
}

async function toggleSetting(key: 'isActive' | 'demographicRetakeEnabled') {
  if (
    !setting.value ||
    saving.value ||
    queueSaving.value ||
    saveError.value ||
    !instituteId.value
  )
    return
  const version = requestVersion
  const id = instituteId.value
  saving.value = true
  saveError.value = ''
  success.value = ''
  try {
    const { data } = await $axios.patch<InstituteSetting>(
      `/institute-setting/institute/${id}/${key === 'isActive' ? 'queue-status' : 'demographic-retake'}`,
      { [key]: !setting.value[key] },
    )
    if (version !== requestVersion) return
    setting.value = data
    success.value =
      key === 'isActive'
        ? data.isActive
          ? 'Secuencia de cuestionarios activada.'
          : 'Secuencia de cuestionarios desactivada.'
        : data.demographicRetakeEnabled
          ? 'El alumnado puede actualizar el sociodemográfico sin esperar 90 días.'
          : 'Se restableció la espera de 90 días desde la última respuesta.'
  } catch {
    if (version !== requestVersion) return
    saveError.value =
      'No pudimos confirmar el cambio. Recarga la configuración para consultar su estado antes de intentarlo de nuevo.'
  } finally {
    if (version === requestVersion) saving.value = false
  }
}

function onQueueSaved(value: InstituteSetting) {
  setting.value = value
  success.value = ''
}

watch(instituteId, loadSettings, { immediate: true })
onBeforeUnmount(() => requestVersion++)
</script>

<template>
  <section class="my-settings" aria-labelledby="settings-title">
    <header class="settings-header">
      <p class="eyebrow">Institución</p>
      <h1 id="settings-title">Mis configuraciones</h1>
      <p>Administra las configuraciones disponibles para tu institución.</p>
    </header>

    <div v-if="loading" class="settings-state" role="status">
      Cargando configuraciones…
    </div>
    <div v-else-if="loadError" class="settings-state">
      <p role="alert">{{ loadError }}</p>
      <button class="settings-action" type="button" @click="loadSettings">
        Reintentar
      </button>
    </div>
    <div v-else-if="!setting" class="settings-state">
      <v-icon icon="mdi-tune-variant" size="32" aria-hidden="true" />
      <h2>Aún no tienes configuraciones disponibles</h2>
      <p>
        Cuando se cree una configuración para tu institución, podrás activarla o
        desactivarla aquí.
      </p>
    </div>
    <template v-else>
      <article
        class="setting-card"
        aria-labelledby="queue-title"
        :aria-busy="saving"
      >
        <div class="setting-card__heading">
          <span class="setting-icon" aria-hidden="true">
            <v-icon icon="mdi-format-list-numbered" size="24" />
          </span>
          <div>
            <p class="eyebrow">Cuestionarios</p>
            <h2 id="queue-title">Secuencia de cuestionarios</h2>
          </div>
        </div>
        <p id="queue-description" class="setting-description">
          Activa o desactiva la secuencia personalizada de cuestionarios de tu
          institución. El orden y los cuestionarios configurados se conservan al
          desactivarla.
        </p>
        <p class="queue-count">
          {{ setting.queue.length }}
          {{
            setting.queue.length === 1
              ? 'cuestionario configurado'
              : 'cuestionarios configurados'
          }}
        </p>
        <div class="setting-card__footer">
          <span
            class="setting-status"
            :class="{ 'setting-status--active': setting.isActive }"
          >
            <span aria-hidden="true" class="status-dot" />
            {{ setting.isActive ? 'Activa' : 'Inactiva' }}
          </span>
          <div class="setting-control">
            <span aria-hidden="true">{{
              saving
                ? 'Guardando…'
                : setting.isActive
                  ? 'Desactivar'
                  : 'Activar'
            }}</span>
            <button
              type="button"
              role="switch"
              class="setting-switch"
              :aria-checked="setting.isActive"
              aria-labelledby="queue-title"
              aria-describedby="queue-description"
              :disabled="saving || queueSaving || !!saveError"
              @click="toggleSetting('isActive')"
            >
              <span />
            </button>
          </div>
        </div>
        <QuestionnaireQueueEditor
          v-if="instituteId"
          :key="instituteId"
          :institute-id="instituteId"
          :setting="setting"
          :blocked="saving || !!saveError"
          @busy="queueSaving = $event"
          @saved="onQueueSaved"
        />
      </article>
      <article
        class="setting-card setting-card--demographic"
        aria-labelledby="demographic-retake-title"
        :aria-busy="saving"
      >
        <div class="setting-card__heading">
          <span class="setting-icon" aria-hidden="true"
            ><v-icon icon="mdi-form-select" size="24"
          /></span>
          <div>
            <p class="eyebrow">Cuestionario sociodemográfico</p>
            <h2 id="demographic-retake-title">Permitir nuevas respuestas</h2>
          </div>
        </div>
        <p id="demographic-retake-description" class="setting-description">
          Permite que el alumnado actualice sus respuestas en cualquier momento,
          sin esperar 90 días. Cada envío conserva una nueva versión en el
          historial. Al desactivarlo, la espera se calcula desde la última
          respuesta.
        </p>
        <p class="queue-count">
          Los pasos ya completados de la secuencia se conservan.
        </p>
        <div class="setting-card__footer">
          <span
            class="setting-status"
            :class="{
              'setting-status--active': setting.demographicRetakeEnabled,
            }"
          >
            <span aria-hidden="true" class="status-dot" />
            {{
              setting.demographicRetakeEnabled
                ? 'Sin espera'
                : 'Espera de 90 días'
            }}
          </span>
          <div class="setting-control">
            <span aria-hidden="true">{{
              saving
                ? 'Guardando…'
                : setting.demographicRetakeEnabled
                  ? 'Desactivar'
                  : 'Activar'
            }}</span>
            <button
              type="button"
              role="switch"
              class="setting-switch"
              :aria-checked="setting.demographicRetakeEnabled"
              aria-labelledby="demographic-retake-title"
              aria-describedby="demographic-retake-description"
              :disabled="saving || queueSaving || !!saveError"
              @click="toggleSetting('demographicRetakeEnabled')"
            >
              <span />
            </button>
          </div>
        </div>
      </article>
      <p role="status" class="settings-feedback">
        {{ saving ? 'Guardando configuración…' : success }}
      </p>
      <div v-if="saveError" class="settings-error">
        <p role="alert">{{ saveError }}</p>
        <button class="settings-action" type="button" @click="loadSettings">
          Recargar configuración
        </button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.my-settings {
  padding: 24px 32px 40px;
  color: #3c2f52;
  font-family: 'Figtree', sans-serif;
  max-width: 1280px;
  margin: 0 auto;
}
.settings-header {
  margin-bottom: 28px;
}
.eyebrow {
  color: #6d5f88;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0 0 6px;
}
h1 {
  font-size: 30px;
  font-weight: 700;
  line-height: 1.25;
  margin-bottom: 12px;
}
h2 {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.35;
}
.settings-header > p:last-child,
.setting-description,
.settings-state > p {
  color: #645b71;
  font-size: 15px;
  line-height: 1.65;
}
.setting-card,
.settings-state {
  border: 1px solid #efebf5;
  background: #fff;
  border-radius: 24px;
  padding: 28px;
}
.setting-card {
  max-width: 820px;
}
.setting-card--demographic {
  margin-top: 24px;
}
.setting-card__heading {
  display: flex;
  align-items: center;
  gap: 16px;
}
.setting-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 16px;
  background: #f0ebf8;
  color: #6d5f88;
}
.setting-description {
  margin: 20px 0 16px;
  max-width: 650px;
}
.queue-count {
  font-size: 13px;
  color: #645b71;
}
.setting-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #efebf5;
}
.setting-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 6px 12px;
  background: #f1eef5;
  color: #645b71;
  font-size: 13px;
  font-weight: 600;
}
.setting-status--active {
  background: #e9f4ee;
  color: #286147;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.setting-control {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
}
.setting-switch {
  display: flex;
  align-items: center;
  width: 56px;
  min-height: 44px;
  border-radius: 999px;
  border: 2px solid #746a80;
  background: #746a80;
  padding: 5px;
  cursor: pointer;
}
.setting-switch > span {
  display: block;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fff;
}
.setting-switch[aria-checked='true'] {
  background: #6d5f88;
  border-color: #6d5f88;
  justify-content: flex-end;
}
.setting-switch:disabled {
  opacity: 0.65;
  cursor: wait;
}
button:focus-visible {
  outline: 3px solid #3c2f52;
  outline-offset: 4px;
}
.settings-feedback {
  min-height: 24px;
  margin-top: 16px;
  color: #286147;
  font-size: 14px;
}
.settings-state {
  text-align: center;
  padding: 40px 24px;
}
.settings-state h2 {
  margin: 16px 0 10px;
}
.settings-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 10px 20px;
  margin-top: 16px;
  border-radius: 999px;
  background: #6d5f88;
  color: #fff;
  font-weight: 600;
}
.settings-error {
  color: #983d48;
  font-size: 14px;
  max-width: 820px;
}
@media (max-width: 600px) {
  .my-settings {
    padding: 20px 16px 32px;
  }
  h1 {
    font-size: 26px;
  }
  .setting-card {
    padding: 20px;
    border-radius: 20px;
  }
  h2 {
    font-size: 18px;
  }
  .setting-card__heading {
    gap: 12px;
  }
  .setting-control {
    gap: 8px;
  }
  .setting-card__footer {
    flex-wrap: wrap;
  }
}
</style>
