<script setup lang="ts">
import { useTheme } from 'vuetify'

const theme = useTheme()
import { Pie } from 'vue-chartjs'

const data = {
  labels: ['Internas', 'Externas'],
  datasets: [
    {
      label: 'Conexiones por día',
      backgroundColor: [`${theme.current.value.colors.secondary}`,`${theme.current.value.colors.greenShadow}`,],
      data: [60, 40]
    }
  ]
}

const options = {
  responsive: true,
  maintainAspectRatio: false
}
</script>

<template>
  <Pie :data="data" :options="options" />
</template>
