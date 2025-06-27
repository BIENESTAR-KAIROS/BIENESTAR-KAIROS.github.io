<script setup lang="ts">
import TherapyNotes from './therapy-notes.vue'
import UserResults from './user-results.vue'
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="my-4">
          <h1 class="handlee-regular text-h4 font-weight-thin">
            Historia clínica de: Bruno Vitte
          </h1>
        </div>
      </v-col>
      <v-col cols="12">
        <div class="my-4">
          <h2 class="handlee-regular text-h6 font-weight-thin">
            Aquí te mostramos los fragmentos de información de historia clínica
            que tenemos de tu estudiante, te recordamos que esta información es
            confidencial y debe ser tratada con sumo cuidado.
          </h2>
        </div>
      </v-col>
      <v-col cols="12">
        <article class="mb-5">
          <div class="w-50 d-flex flex-row">
            <v-sheet
              class="arrow-date bg-purpleShadow d-flex flex-column justify-center handlee-regular text-h6 font-weight-thin"
            >
              18 de junio 2025
            </v-sheet>
            <div class="arrow-triangle"></div>
          </div>
          <v-container class="mt-5">
            <v-expansion-panels>
              <!-- Panel 1 -->
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <div class="d-flex flex-row align-center">
                    <div class="list-dot"></div>
                    <div class="mx-4">
                      <span class="handlee-regular text-h6 font-weight-thin">
                        Realizó su cuestionario de bienestar emocional Kairos
                      </span>
                    </div>
                  </div>
                  <template v-slot:actions>
                    <v-btn
                      color="purpleShadow"
                      rounded="xl"
                      class="handlee-regular text-h6 font-weight-thin"
                    >
                      Acceder a los resultados
                    </v-btn>
                  </template>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="bg-purpleShadow pa-3">
                  <UserResults />
                </v-expansion-panel-text>
              </v-expansion-panel>

              <!-- Panel 2 -->
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <div class="d-flex flex-row align-center">
                    <div class="list-dot"></div>
                    <div class="mx-4">
                      <span class="handlee-regular text-h6 font-weight-thin">
                        Asistió a una consulta con el Psicólogo institucional.
                      </span>
                    </div>
                  </div>
                  <template v-slot:actions>
                    <v-btn
                      color="purpleShadow"
                      rounded="xl"
                      class="handlee-regular text-h6 font-weight-thin"
                    >
                      Acceder a las notas
                    </v-btn>
                  </template>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-3">
                  <TherapyNotes />
                </v-expansion-panel-text>
              </v-expansion-panel>

              <!-- Panel 3 -->
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <div class="d-flex flex-row align-center">
                    <div class="list-dot"></div>
                    <div class="mx-4">
                      <span class="handlee-regular text-h6 font-weight-thin">
                        Realizó su cuestionario de bienestar emocional Kairos
                      </span>
                    </div>
                  </div>
                  <template v-slot:actions>
                    <v-btn
                      color="purpleShadow"
                      rounded="xl"
                      class="handlee-regular text-h6 font-weight-thin"
                    >
                      Acceder a los resultados
                    </v-btn>
                  </template>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="bg-purpleShadow pa-3">
                  <UserResults />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-container>
        </article>

        <article class="mb-5">
          <div class="w-50 d-flex flex-row">
            <v-sheet
              class="arrow-date bg-purpleShadow d-flex flex-column justify-center handlee-regular text-h6 font-weight-thin"
            >
              2 de junio 2025
            </v-sheet>
            <div class="arrow-triangle"></div>
          </div>
          <v-container class="mt-5">
            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <div class="d-flex flex-row align-center">
                    <div class="list-dot"></div>
                    <div class="mx-4">
                      <span class="handlee-regular text-h6 font-weight-thin">
                        Asistió a una consulta con el Psicólogo institucional.
                      </span>
                    </div>
                  </div>
                  <template v-slot:actions>
                    <v-btn
                      color="purpleShadow"
                      rounded="xl"
                      class="handlee-regular text-h6 font-weight-thin"
                    >
                      Acceder a las notas
                    </v-btn>
                  </template>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pa-3">
                  <TherapyNotes />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-container>
        </article>

        <article class="mb-5">
          <div class="w-50 d-flex flex-row">
            <v-sheet
              class="arrow-date bg-purpleShadow d-flex flex-column justify-center handlee-regular text-h6 font-weight-thin"
            >
              30 de mayo 2025
            </v-sheet>
            <div class="arrow-triangle"></div>
          </div>
          <v-container class="mt-5">
            <v-expansion-panels>
              <!-- Panel 1 -->
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <div class="d-flex flex-row align-center">
                    <div class="list-dot"></div>
                    <div class="mx-4">
                      <span class="handlee-regular text-h6 font-weight-thin">
                        Realizó su cuestionario de bienestar emocional Kairos
                      </span>
                    </div>
                  </div>
                  <template v-slot:actions>
                    <v-btn
                      color="purpleShadow"
                      rounded="xl"
                      class="handlee-regular text-h6 font-weight-thin"
                    >
                      Acceder a los resultados
                    </v-btn>
                  </template>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="bg-purpleShadow pa-3">
                  <UserResults />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-container>
        </article>

        <article class="mb-5">
          <div class="w-50 d-flex flex-row">
            <v-sheet
              class="arrow-date bg-purpleShadow d-flex flex-column justify-center handlee-regular text-h6 font-weight-thin"
            >
              28 de mayo 2025
            </v-sheet>
            <div class="arrow-triangle"></div>
          </div>
          <v-container class="mt-5">
            <v-expansion-panels>
              <!-- Panel 1 -->
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <div class="d-flex flex-row align-center">
                    <div class="list-dot"></div>
                    <div class="mx-4">
                      <span class="handlee-regular text-h6 font-weight-thin">
                        Realizó su cuestionario: Control de adicciones
                      </span>
                    </div>
                  </div>
                  <template v-slot:actions>
                    <v-btn
                      color="purpleShadow"
                      rounded="xl"
                      class="handlee-regular text-h6 font-weight-thin"
                    >
                      Acceder a los resultados
                    </v-btn>
                  </template>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="bg-purpleShadow pa-3">
                  <UserResults />
                </v-expansion-panel-text>
              </v-expansion-panel>

              <!-- Panel 2 -->
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <div class="d-flex flex-row align-center">
                    <div class="list-dot"></div>
                    <div class="mx-4">
                      <span class="handlee-regular text-h6 font-weight-thin">
                        Realizó su cuestionario: Depresión y ansiedad
                      </span>
                    </div>
                  </div>
                  <template v-slot:actions>
                    <v-btn
                      color="purpleShadow"
                      rounded="xl"
                      class="handlee-regular text-h6 font-weight-thin"
                    >
                      Acceder a los resultados
                    </v-btn>
                  </template>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="bg-purpleShadow pa-3">
                  <UserResults />
                </v-expansion-panel-text>
              </v-expansion-panel>

              <!-- Panel 3 -->
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <div class="d-flex flex-row align-center">
                    <div class="list-dot"></div>
                    <div class="mx-4">
                      <span class="handlee-regular text-h6 font-weight-thin">
                        Realizó su cuestionario: Bienestar emocional
                      </span>
                    </div>
                  </div>
                  <template v-slot:actions>
                    <v-btn
                      color="purpleShadow"
                      rounded="xl"
                      class="handlee-regular text-h6 font-weight-thin"
                    >
                      Acceder a los resultados
                    </v-btn>
                  </template>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="bg-purpleShadow pa-3">
                  <UserResults />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-container>
        </article>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="css" scoped>
.arrow-date {
  margin: 0;
  height: 75px;
  padding-left: 1rem;
  padding-right: 1rem;
}

.arrow-triangle {
  margin: 0;
  width: 75px;
  height: 75px;
  border-top: 37px solid transparent;
  border-left: 50px solid;
  border-left-color: rgba(var(--v-theme-purpleShadow));
  border-bottom: 37px solid transparent;
}

.list-dot {
  width: 25px;
  height: 25px;
  background: rgba(var(--v-theme-thirdy));
  border-radius: 100%;
  border-color: rgba(var(--v-theme-thirdy));
}
</style>
