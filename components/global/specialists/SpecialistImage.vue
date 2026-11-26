<script setup lang="ts">
const props = defineProps<{ image: string }>()
const failed = ref(false)
watch(
  () => props.image,
  () => {
    failed.value = false
  },
)
</script>

<template>
  <img
    :src="image && !failed ? image : '/image-specialist-22.png'"
    alt=""
    referrerpolicy="no-referrer"
    @error="failed = true"
  />
</template>
