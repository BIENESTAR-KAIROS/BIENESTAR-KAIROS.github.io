import type { IInstitute } from '~/interfaces/institute/institute.interface'
import { useAuthStore } from '~/store/auth'

export function useInstituteEmergencyLine() {
  const auth = useAuthStore()
  const { $axios } = useNuxtApp()
  const instituteId = computed(() => {
    const institute = auth.activeInstitute
    return typeof institute === 'string' ? institute : institute?._id
  })
  const phone = ref('')
  const loading = ref(true)
  const failed = ref(false)
  const attempt = ref(0)
  watch(
    [instituteId, attempt],
    async ([id], _previous, onCleanup) => {
      const controller = new AbortController()
      onCleanup(() => controller.abort())
      phone.value = ''
      loading.value = true
      failed.value = false
      try {
        if (!id) return
        const { data } = await $axios.get<IInstitute>(
          '/institute/' + encodeURIComponent(id),
          { signal: controller.signal },
        )
        if (!controller.signal.aborted)
          phone.value = data.emergencyPhone?.trim() ?? ''
      } catch {
        if (!controller.signal.aborted) failed.value = true
      } finally {
        if (!controller.signal.aborted) loading.value = false
      }
    },
    { immediate: true },
  )
  return { instituteId, phone, loading, failed, retry: () => attempt.value++ }
}
