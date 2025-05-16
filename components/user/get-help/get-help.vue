<script setup lang="ts">
WellnesPractices
import { ref } from 'vue'
import WellnesPractices from './wellnes-practices.vue';
import GuidedMeditations from './guided-meditations.vue';
import MeetSpecialist from './meet-specialist.vue';

const tab = ref(null)
const tabContent = [
  null,
  WellnesPractices,
  GuidedMeditations,
  MeetSpecialist,
]
</script>

<template>
  <template>
    <v-card class="help-card border-s-0 mt-2" elevation="0">
      <v-tabs
        v-model="tab"
        align-tabs="center"
        color="greenShadow"
      >
        <v-tab :value="1">Prácticas del bienestar</v-tab>
        <v-tab :value="2">Meditaciones guiadas</v-tab>
        <v-tab :value="3">Conoce especialistas</v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item
          v-for="n in 3"
          :key="n"
          :value="n"
        >
          <div class="pa-2">
          <component
            :is="tabContent[n]"
          />
          </div>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>
  </template>
</template>

<style scoped>
.help-card{
  background-color: #ffffff00;
}
</style>
