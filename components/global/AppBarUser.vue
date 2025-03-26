<script setup lang="ts">
const navList = [
  {
    title: "Mi perfil",
    to: "/dashboard",
  },
  {
    title: "Histórico",
    to: "/my-users",
  },
  {
    title: "Actualizar mis datos",
    to: "/stats",
  },
  {
    title: "Contactarme con mi institución",
    to: "/quizzes",
  },
  {
    title: "Aviso de privacidad",
    to: "/login",
  },
  {
    title: "Cerrar sesión",
    to: "/login",
  },
];
</script>

<template>
  <v-navigation-drawer :width="275" class="bg-primary rounded-te-xl">
    <v-sheet class="d-flex justify-space-around bg-transparent mt-5 px-6">
      <v-img src="/logo-white.png" class="logo-img" />
    </v-sheet>

    <v-list-item
      v-for="(navOption, i) in navList"
      :key="i"
      link
      :to="'/user' + navOption.to"
      class="my-5"
      variant="text"
    >
      <v-list-item-title class="catamaran-text text-h6">
        {{ navOption.title }}
      </v-list-item-title>
    </v-list-item>
  </v-navigation-drawer>
</template>

<style scoped>
.logo-img {
  width: 250px !important;
}

.v-list-item-subtitle,
.v-list-item-title {
  text-overflow: initial !important;
  white-space: initial !important;
}
</style>
