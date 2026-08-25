<script setup lang="ts">
interface IUpcomingAppointment {
  _id: string
  appointmentDate: string
  psychologistId?: { name?: string; email?: string }
}

const { $axios } = useNuxtApp()

const appointment = ref<IUpcomingAppointment | null>(null)
const isLoading = ref(false)

const appointmentDate = computed(() =>
  appointment.value ? new Date(appointment.value.appointmentDate) : null,
)

const dateLabel = computed(() => {
  if (!appointmentDate.value) return ''

  const weekday = appointmentDate.value
    .toLocaleDateString('es-MX', { weekday: 'long' })
    .replace(/^\w/, (c) => c.toUpperCase())
  const day = appointmentDate.value.getDate()
  const time = appointmentDate.value.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  return `${weekday} ${day}, ${time} h`
})

const specialistName = computed(() => appointment.value?.psychologistId?.name || 'Tu especialista')

async function fetchUpcomingAppointment() {
  try {
    isLoading.value = true
    const response = await $axios.get<IUpcomingAppointment[]>('/calendary/upcoming', {
      params: { role: 'patient' },
    })

    appointment.value = response.data[0] ?? null
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchUpcomingAppointment)
</script>

<template>
  <div v-if="appointment" class="next-appointment">
    <span class="next-appointment__title">Tu próxima cita</span>
    <div class="next-appointment__row">
      <img src="/calendar.png" alt="" class="next-appointment__icon" />
      <div class="next-appointment__copy">
        <span class="next-appointment__date">{{ dateLabel }}</span>
        <span class="next-appointment__specialist">{{ specialistName }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.next-appointment {
  background: #f0eaf5;
  border-radius: 24px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.next-appointment__title {
  font-size: 16px;
  font-weight: 700;
  color: #4a3a63;
}

.next-appointment__row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.next-appointment__icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.next-appointment__copy {
  display: flex;
  flex-direction: column;
}

.next-appointment__date {
  font-size: 15px;
  font-weight: 700;
  color: #3c2f52;
}

.next-appointment__specialist {
  font-size: 13px;
  color: #6a5a85;
}
</style>
