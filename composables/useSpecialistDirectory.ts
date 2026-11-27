import type { SpecialistEntry } from '~/interfaces/specialist/specialist.interface'
import { useAuthStore } from '~/store/auth'

export function useSpecialistDirectory() {
  const auth = useAuthStore()
  const { $axios } = useNuxtApp()
  const entries = ref<SpecialistEntry[]>([])
  const loading = ref(true)
  const error = ref(false)
  const attempt = ref(0)

  watch(
    [() => auth.activeInstitute, () => auth.user?._id, attempt],
    async (_value, _previous, onCleanup) => {
      const controller = new AbortController()
      onCleanup(() => controller.abort())
      entries.value = []
      loading.value = true
      error.value = false
      try {
        const { data } = await $axios.get<SpecialistEntry[]>('/specialist', {
          signal: controller.signal,
        })
        if (!controller.signal.aborted) entries.value = data
      } catch {
        if (!controller.signal.aborted) error.value = true
      } finally {
        if (!controller.signal.aborted) loading.value = false
      }
    },
    { immediate: true },
  )
  return { entries, loading, error, retry: () => attempt.value++ }
}
