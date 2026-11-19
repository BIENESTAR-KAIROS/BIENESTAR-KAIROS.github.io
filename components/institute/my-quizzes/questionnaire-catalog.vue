<script setup lang="ts">
import { formatQuestionnaireDate } from './questionnaire-date'
import { useQuestionnaireCart } from '~/store/questionnaire-cart'
import type { CatalogQuestionnaire } from '~/interfaces/quizzes/catalog.interface'
import BuilderDefinitionView from './builder-definition-view.vue'
const props = defineProps<{ global?: boolean }>()
const cart = useQuestionnaireCart()
const { $axios } = useNuxtApp()
const entries = ref<CatalogQuestionnaire[]>([])
const preview = ref('')
const loading = ref(true)
const busy = ref(false)
const error = ref('')
const notice = ref('')
let version = 0
async function load() {
  const request = ++version
  loading.value = true
  error.value = ''
  try {
    const { data } = await $axios.get<CatalogQuestionnaire[]>(
      props.global
        ? '/questionnaire/catalog/global'
        : '/questionnaire/catalog/available',
    )
    if (request === version) entries.value = data
  } catch {
    if (request === version) error.value = 'No pudimos cargar el catálogo.'
  } finally {
    if (request === version) loading.value = false
  }
}
watch(
  () => cart.institutionId,
  () => {
    preview.value = ''
    notice.value = ''
    entries.value = []
    void load()
  },
  { immediate: true },
)
function add(q: CatalogQuestionnaire) {
  cart.add(q)
  notice.value = 'Cuestionario agregado al carrito.'
}
async function toggle(q: CatalogQuestionnaire) {
  if (busy.value) return
  busy.value = true
  error.value = ''
  notice.value = ''
  try {
    await $axios.patch('/questionnaire/' + q._id + '/active', {
      revision: q.__v ?? 0,
      active: !q.active,
    })
    await load()
  } catch {
    error.value = 'No se pudo cambiar el estado. Recarga el catálogo.'
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <main class="catalog" :class="{ 'catalog--global': global }">
    <header>
      <h1>
        {{ global ? 'Cuestionarios globales' : 'Cuestionarios disponibles' }}
      </h1>
      <NuxtLink v-if="global" to="/admin/quizzes/new"
        >Crear cuestionario global</NuxtLink
      >
      <NuxtLink v-else to="/institute/quizzes">Mis cuestionarios</NuxtLink>
    </header>
    <p v-if="loading" role="status">Cargando cuestionarios…</p>
    <div v-if="error" role="alert">
      {{ error }}
      <button type="button" @click="load">Recargar catálogo</button>
    </div>
    <p v-if="notice && cart.items.length" role="status">{{ notice }}</p>
    <p v-if="!loading && !error && !entries.length">
      Todavía no hay cuestionarios disponibles.
    </p>
    <section class="cards" aria-label="Catálogo">
      <article v-for="q in entries" :key="q._id">
        <h2>{{ q.title }}</h2>
        <p>{{ q.description }}</p>
        <p v-if="global">
          {{
            q.status === 'draft'
              ? 'Borrador'
              : q.active
                ? 'Publicado · Activo'
                : 'Publicado · Inactivo'
          }}
        </p>
        <p v-if="q.scheduledFor">
          Cambio programado para el
          {{ formatQuestionnaireDate(q.scheduledFor) }}.
        </p>
        <div class="actions">
          <button type="button" @click="preview = q._id">Explorar</button>
          <template v-if="global"
            ><NuxtLink :to="'/admin/quizzes/' + q._id + '/edit'">{{
              q.status === 'draft' ? 'Editar y publicar' : 'Editar'
            }}</NuxtLink>
            <button
              v-if="q.status === 'published'"
              type="button"
              :disabled="busy"
              @click="toggle(q)"
            >
              {{ q.active ? 'Desactivar' : 'Activar' }}
            </button></template
          >
          <button
            v-else
            type="button"
            :disabled="
              cart.busy ||
              !cart.institutionId ||
              cart.items.some((item) => item.id === q._id)
            "
            @click="add(q)"
          >
            {{
              cart.items.some((item) => item.id === q._id)
                ? 'En el carrito'
                : 'Agregar al carrito'
            }}
          </button>
        </div>
      </article>
    </section>
    <v-dialog
      :model-value="!!preview"
      max-width="960"
      @update:model-value="
        (open) => {
          if (!open) preview = ''
        }
      "
      ><BuilderDefinitionView
        v-if="preview"
        :id="preview"
        :key="preview"
        @close="preview = ''"
    /></v-dialog>
  </main>
</template>
<style scoped>
.catalog {
  --accent: #523f6e;
  color: #3c2f52;
  font-family: Figtree, sans-serif;
  padding: clamp(16px, 3vw, 36px);
  max-width: 1280px;
  margin: auto;
}
.catalog--global {
  --accent: #04474a;
  color: #0e2a36;
}
.catalog header,
.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 16px;
  margin-top: 24px;
}
.cards article {
  padding: 22px;
  border-radius: 20px;
  background: white;
  border: 1px solid #ded6ea;
}
.catalog p {
  margin: 12px 0;
}
.catalog button,
.catalog a,
.catalog select {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 8px 16px;
  border-radius: 24px;
  border: 1px solid var(--accent);
  color: var(--accent);
  text-decoration: none;
  background: white;
}
.catalog button:disabled {
  opacity: 0.55;
}
.catalog :focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}
.catalog h1 {
  font-size: clamp(23px, 4vw, 30px);
}
.catalog h2 {
  font-size: 19px;
}
</style>
