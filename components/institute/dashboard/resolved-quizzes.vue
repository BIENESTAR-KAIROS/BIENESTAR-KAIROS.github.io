<script setup lang="ts">
import { useTheme } from 'vuetify'

const theme = useTheme()
import { Bar } from 'vue-chartjs'

const data = {
  labels: ['25-05', '26-05', '27-05', '28-05', '29-05', '30-05', '31-05'],
  datasets: [
    {
      label: 'Examenes resueltos por día esta semana',
      backgroundColor: [`${theme.current.value.colors.secondary}`],
      data: [15, 5, 6, 23, 2],
    },
  ],
}

const options = {
  responsive: true,
  maintainAspectRatio: false,
}
</script>

<template>
  <Bar :data="data" :options="options" />
</template>
