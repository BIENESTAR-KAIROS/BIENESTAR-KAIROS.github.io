<script setup lang="ts">
import type { QuestionnaireAnswerByUserResponseDto } from '~/dto/response/questionnaire-answer/questionniare-answer-by-user.response.dto'
import { useAuthStore } from '~/store/auth'

const authStore = useAuthStore()
const { $axios } = useNuxtApp()

const questionnaireAnswers = ref<QuestionnaireAnswerByUserResponseDto[]>([])

onMounted(async () => {
  try {
    if (authStore.user) {
      const response = await $axios.get<QuestionnaireAnswerByUserResponseDto[]>(
        `/questionnaire-answer/user/${authStore.user._id}/all/`,
      )

      questionnaireAnswers.value = response.data
    }
  } catch (error) {
    console.log(error)
    alert('Error al obtener la información del usuario.')
  }
})
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="my-4">
          <h1 class="handlee-regular text-h2 font-weight-thin">Mi historial</h1>
        </div>
        <p class="catamaran-regular">
          Aqui te mostraremos las respuestas de los cuestionarios que has
          llenado una vez que tu institución las apruebe.
          <br />
          Para nosotros tu bienestar siempre es lo más importante, queremos que
          te sientas bien. Por lo que te recomendamos que vayas a la sección
          "Queremos ayudarte" y tomes alguna de las meditaciones guiadas
          mientras esperas.
        </p>
      </v-col>
      <v-col cols="12" v-if="questionnaireAnswers.length === 0">
        <p class="catamaran-regular text-h3">
          Aún no has llenado ningún cuestionario.
        </p>
      </v-col>
      <v-col cols="12" v-else>
        <v-table>
          <thead>
            <tr>
              <th class="text-left font-weight-bold">Cuestionario</th>
              <th class="text-left font-weight-bold">Fecha de respuesta</th>
              <!--
                <th class="text-left font-weight-bold">Ver respuestas</th>
              -->
            </tr>
          </thead>
          <tbody>
            <tr v-for="(answer, index) in questionnaireAnswers" :key="index">
              <td>{{ answer.questionnaireId.title }}</td>
              <td>
                {{
                  new Date(answer.submittedAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                }}
              </td>
              <!--
                <td>
                  <NuxtLink
                    :to="`/user/history/${answer.questionnaireId.id}`"
                    class="text--primary"
                  >
                    Ver respuestas
                  </NuxtLink>
                </td>
              -->
            </tr>
          </tbody>
        </v-table>
      </v-col>
      <v-col cols="12">
        <p class="catamaran-regular">
          Para volver, da clic en el osito.
          <br />
          <br />
          <br />
          Recuerda que la Universidad Panamericana pone a tu disposición la
          Unidad de Psicología Clínica para cualquier cosa que necesites.
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>
