<script setup lang="ts">
definePageMeta({
  middleware: (to) =>
    navigateTo(
      {
        path: '/user/get-help',
        query: { ...to.query, tab: 'specialists' },
        hash: to.hash,
      },
      { replace: true },
    ),
})
</script>

<template><div /></template>
