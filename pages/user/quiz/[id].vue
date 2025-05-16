<script setup lang="ts">
const route = useRoute()
</script>

<template>
  The quiz number is {{ route.params.id }}
</template>
