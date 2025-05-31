<script setup lang="ts">
import { useTheme } from 'vuetify'

const theme = useTheme()
import { Line } from 'vue-chartjs'

const data = {
  labels: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  datasets: [
    {
      label: 'Conexiones por día',
      backgroundColor: `${theme.current.value.colors.greenShadow}`,
      data: [20, 10, 50, 35, 23]
    }
  ]
}

const options = {
  responsive: true,
  maintainAspectRatio: false
}
</script>

<template>
  <Line :data="data" :options="options" />
</template>
