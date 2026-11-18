import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import type {
  CatalogQuestionnaire,
  CatalogSelection,
} from '~/interfaces/quizzes/catalog.interface'

export const useQuestionnaireCart = defineStore('questionnaire-cart', () => {
  const auth = useAuthStore()
  const { $axios } = useNuxtApp()
  const institutionId = computed(() => {
    const institution = auth.activeInstitute
    return typeof institution === 'string' ? institution : institution?._id
  })
  const items = ref<CatalogSelection[]>([])
  const busy = ref(false)
  const message = ref('')
  const error = ref('')
  let generation = 0
  watch(
    [() => auth.user?._id, institutionId],
    () => {
      generation++
      items.value = []
      busy.value = false
      message.value = ''
      error.value = ''
    },
    { flush: 'sync' },
  )
  function add(q: CatalogQuestionnaire) {
    if (
      !institutionId.value ||
      busy.value ||
      items.value.some((item) => item.id === q._id)
    )
      return
    message.value = ''
    items.value.push({
      id: q._id,
      title: q.title,
      revision: q.__v ?? 0,
      mode: 'reference',
    })
  }
  async function checkout() {
    const id = institutionId.value
    if (!id || !items.value.length || busy.value) return
    const request = generation
    busy.value = true
    error.value = ''
    message.value = ''
    try {
      await $axios.post(`/questionnaire/catalog/${id}/checkout`, {
        items: items.value.map(({ id, revision, mode }) => ({
          id,
          revision,
          mode,
        })),
      })
      if (generation === request) {
        items.value = []
        message.value = 'Los cuestionarios se agregaron a Mis cuestionarios.'
      }
    } catch {
      if (generation === request)
        error.value =
          'No pudimos confirmar el carrito. Si una guía cambió, quítala y vuelve a seleccionarla desde el catálogo actualizado.'
    } finally {
      if (generation === request) busy.value = false
    }
  }
  return { institutionId, items, busy, message, error, add, checkout }
})
