<script setup lang="ts">
import DailyAnswerVolume from './daily-answer-volume.vue';
import ResolvedQuizzes from './resolved-quizzes.vue';
import TerapyBalance from './terapy-balance.vue';

const days = [30, 90, 15, 8]
const selectedDays = ref(days[0])
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <div class="my-4">
          <h1 class="handlee-regular text-h4 font-weight-thin"> Bienvenido de nuevo, {nombre} </h1>
        </div>
      </v-col>
      <v-col cols="12">
        <div class="my-4">
          <h2 class="handlee-regular text-h6 font-weight-thin">
            Esta es la información general de tu población y sus parámetros, son aquellos detalles que Kairos considera que debes de saber de tu población, si quieres ver información a tu medida, accede a “Mis estadísticas”.
          </h2>
        </div>
      </v-col>
      <v-container>
        <v-row no-gutters>
          <v-col cols="12">
            <v-row no-gutters>
              <v-col cols="5" lg="3">
                <span class="catamaran-regular font-body-1">Datos referenciados de los últimos:</span>
              </v-col>
              <v-col cols="3" md="2" lg="1">
                <v-select
                  label="días"
                  :items="days"
                  variant="solo"
                  bg-color="purpleShadow"
                  v-model="selectedDays"
                  rounded="xxxl"
                >
                </v-select>
              </v-col>
              <v-col>
                <span class="ms-2 catamaran-regular font-body-1">días.</span>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="6" lg="3">
            <v-card color="purpleShadow pa-4" rounded="xl" height="110" elevation="5">
              <div class="d-flex flex-column justify-space-evenly align-center h-100">
                <span class="catamaran-regular font-body-1"> Cuestionarios contestados </span>
                <div class="d-flex flex-row align-center">
                  <v-icon class="text-success me-2 text-h3 font-weight-bold"> mdi-arrow-up </v-icon>
                  <span class="catamaran-regular text-h5"> { value } </span>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card color="purpleShadow pa-4" rounded="xl" height="110" elevation="5">
              <div class="d-flex flex-column justify-space-evenly align-center h-100">
                <span class="catamaran-regular font-body-1"> Sesiones iniciadas </span>
                <div class="d-flex flex-row align-center">
                  <v-icon class="text-success me-2 text-h3 font-weight-bold"> mdi-arrow-up </v-icon>
                  <span class="catamaran-regular text-h5"> { value } </span>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card color="purpleShadow pa-4" rounded="xl" height="110" elevation="5">
              <div class="d-flex flex-column justify-space-evenly align-center h-100">
                <span class="catamaran-regular font-body-1"> Terapeutas agendados </span>
                <div class="d-flex flex-row align-center">
                  <v-icon class="text-error me-2 text-h3 font-weight-bold"> mdi-arrow-down </v-icon>
                  <span class="catamaran-regular text-h5"> { value } </span>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card color="purpleShadow pa-4" rounded="xl" height="110" elevation="5">
              <div class="d-flex flex-column justify-space-evenly align-center h-100">
                <span class="catamaran-regular font-body-1"> Meditaciones hechas </span>
                <div class="d-flex flex-row align-center">
                  <v-icon class="text-success me-2 text-h3 font-weight-bold"> mdi-arrow-up </v-icon>
                  <span class="catamaran-regular text-h5"> { value } </span>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="4">
            <v-card color="purpleShadow pa-4" rounded="xl" height="250" elevation="5">
              <div class="d-flex flex-column justify-space-evenly align-center h-100 text-center">
                <span class="catamaran-regular font-body-1"> Volumen diario de respuestas </span>
                <div class="d-flex flex-row align-center">
                  <DailyAnswerVolume />
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card color="purpleShadow pa-4" rounded="xl" height="250" elevation="5">
              <div class="d-flex flex-column justify-space-evenly align-center h-100 text-center">
                <span class="catamaran-regular font-body-1"> Balance de terapias internas y externas </span>
                <div class="d-flex flex-row align-center h-85">
                  <TerapyBalance />
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card color="purpleShadow pa-4" rounded="xl" height="250" elevation="5">
              <div class="d-flex flex-column justify-space-evenly align-center h-100 text-center">
                <span class="catamaran-regular font-body-1"> Balance de cuestionarios resueltos </span>
                <div class="d-flex flex-row align-center h-85 w-85">
                  <ResolvedQuizzes />
                </div>
              </div>
            </v-card>
          </v-col>
            <v-col cols="12" md="6" lg="2">
            <v-card color="purpleShadow pa-4" rounded="xl" height="250" elevation="5">
              <div class="d-flex flex-column justify-space-evenly align-center h-100 text-center">
                <span class="catamaran-regular font-body-1"> Días desde el último cuestionario </span>
                <div class="d-flex flex-row align-center justify-center h-85 w-85">
                  { value }
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-row>
  </v-container>
</template>
