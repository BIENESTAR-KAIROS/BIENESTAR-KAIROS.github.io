<script setup lang="ts">
import { NuxtLink } from '#components'
import { useAuthStore } from '~/store/auth'

const authStore = useAuthStore()

const options = [
  {
    title: 'Queremos conocerte',
    link: '/user/quiz',
    image: '/image-dashboard-16.png',
  },
  //  {
  //    title: 'Prácticas del bienestar',
  //    link: '/user/wellnes-practices',
  //    image: '/image-dashboard-17.png',
  //  },
  //  {
  //    title: 'Maditaciones guiadas',
  //    link: '/user/guided-meditation',
  //    image: '/image-dashboard-18.png',
  //  },
  {
    title: 'Queremos ayudarte',
    link: '/user/get-help',
    image: '/image-dashboard-19.png',
  },
  {
    title: 'Recomendaciones',
    link: '/user/recomendations',
    image: '/image-dashboard-20.png',
  },
  /*{
    title: 'Noticias importantes',
    link: '/user/news',
    image: '/image-dashboard-21.png',
  },*/
]

const userName = computed(() => authStore.user?.name)

onMounted(() => {
  console.log(authStore.user)
})
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="my-4">
          <h1 class="handlee-regular text-h3 font-weight-thin">
            Buen día, {{ userName }}
          </h1>
        </div>
      </v-col>
      <v-col cols="12">
        <div class="my-4">
          <h2 class="handlee-regular text-h4 font-weight-thin">
            ¿Qué quieres hacer hoy?
          </h2>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="(option, i) in options" :key="i" cols="12" md="4">
        <NuxtLink :href="option.link" class="text-decoration-none">
          <v-sheet
            rounded="lg"
            height="250"
            class="px-4 py-2 pt-5 d-flex flex-column justify-center align-center text-center"
            :elevation="5"
          >
            <span class="text-h5 catamaran-regular">{{ option.title }}</span>
            <v-img :src="option.image" height="122" width="122" />
          </v-sheet>
        </NuxtLink>
      </v-col>
    </v-row>
  </v-container>
</template>
