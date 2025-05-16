<script setup lang="ts">
const specialists = [
  {
    title: 'Daniela Alcázar Giordano',
    image: '/image-specialist-22.png',
    specialities: ['Adultos y adolescentes', 'Experiencia en trauma', 'Trabaja en grupos', 'Sexualidad'],
    schedule: ['La Condesa, CDMX', 'Virtual (Zoom)'],
    contact: ['5559698752'],
  },
  {
    title: 'Adrian San Juan Valois',
    image: '/image-specialist-22.png',
    specialities: ['Adolescentes y niños', 'Trabaja en grupos', 'Sexualidad', 'Drogadicción'],
    schedule: ['GAM, CDMX', 'Ecatepec, Edo. Mex.', 'Virtual (Zoom)'],
    contact: ['5559698752', 'adri.sjv@outlook.es'],
  },
]
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="my-4">
          <h1 class="handlee-regular text-h3 font-weight-thin">
            Conoce especialistas
          </h1>
        </div>
      </v-col>
      <v-col cols="12">
        <div class="my-3">
          <span class="catamaran-regular text-subtitle-1">
            Con base en la información que nos has proporcionado en tus cuestionarios, tenemos algunas recomendaciones de prácticas aprobadas por nuestros especialistas que te ayudarán a mejorar tu bienestar.
          </span>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="(specialist, i) in specialists"
        :key="i"
        cols="12"
        md="3"
        lg="4"
      >
        <v-sheet
          rounded="xl"
          height="700"
          class="px-4 py-2 pt-5 d-flex flex-column justify-space-around align-center text-center bg-purpleShadow"
          :elevation="5"
        >
          <div class="d-flex flex-column justify-center align-center">
            <v-img :src="specialist.image" height="96" width="96"/>
            <span class="text-h4 handlee-regular font-weight-thin">{{ specialist.title }}</span>
          </div>
          <div class="d-flex flex-column justify-space-between">
            <div class="d-b">
              <div class="d-flex flex-row align-center">
                <div>
                  <v-img src="/image-specialist-23.png" height="40" width="40"/>
                </div>
                <span class="text-subtitle-1 catamaran-regular">Especialidades:</span>
              </div>
              <div class="d-flex flex-row align-center flex-wrap">
                <v-chip 
                  v-for="(speciality, j) in specialist.specialities"
                  :key="j"
                  class="bg-thirdy me-2 mt-2 yantramanav-thin"
                >
                  {{ speciality }}
                </v-chip>
              </div>
            </div>
            <div class="mt-5">
              <div class="d-flex flex-row align-center">
                <div>
                  <v-img src="/image-specialist-24.png" height="40" width="40"/>
                </div>
                <span class="text-subtitle-1 catamaran-regular">Citas:</span>
              </div>
              <div class="d-flex flex-row align-center flex-wrap">
                <v-chip 
                  v-for="(schedule, j) in specialist.schedule"
                  :key="j"
                  class="bg-thirdy me-2 mt-2 yantramanav-thin"
                >
                  {{ schedule }}
                </v-chip>
              </div>
            </div>
            <div class="mt-5">
              <div class="d-flex flex-row align-center">
                <div>
                  <v-img src="/image-specialist-25.png" height="40" width="40"/>
                </div>
                <span class="text-subtitle-1 catamaran-regular">Contacto:</span>
              </div>
              <div class="d-flex flex-row align-center flex-wrap">
                <v-chip 
                  v-for="(contact, j) in specialist.contact"
                  :key="j"
                  class="bg-thirdy me-2 mt-2 yantramanav-thin"
                >
                  {{ contact }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
