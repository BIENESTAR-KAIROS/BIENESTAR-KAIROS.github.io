<script setup lang="ts">
import { useTheme } from 'vuetify'
import { Pie } from 'vue-chartjs'

const theme = useTheme()

const data = {
  labels: ['Hombre', 'Mujer', 'Otro'],
  datasets: [
    {
      label: 'Conexiones por día',
      backgroundColor: [
        `${theme.current.value.colors.primary}`,
        `${theme.current.value.colors.secondary}`,
        `${theme.current.value.colors.greenShadow}`,
      ],
      data: [30, 40, 30],
    },
  ],
}

const options = {
  responsive: true,
  maintainAspectRatio: false,
}
</script>

<template>
  <Pie :data="data" :options="options" />
</template>
