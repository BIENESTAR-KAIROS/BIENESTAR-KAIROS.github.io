<script setup lang="ts">
import { useTheme } from 'vuetify'

const theme = useTheme()
import { Bar } from 'vue-chartjs'

const data = {
  labels: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
  datasets: [
    {
      label: 'Respuestas por edad',
      backgroundColor: [
        `${theme.current.value.colors.secondary}`
      ],
      data: [1, 8, 15, 5, 6, 23, 35, 22, 26, 5, 2],
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
