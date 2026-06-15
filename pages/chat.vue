<script setup lang="ts">
definePageMeta({
  layout: 'empty-login',
})

// Hardcoded for now
const HARDCODED_USER_ID = '6975109fbc2e095ec7a37e04'
const HARDCODED_QUESTIONNAIRE_ID = '6865871136aa0b3c141cf766'

interface Message {
  role: 'ai' | 'user'
  text: string
  alerta?: boolean
}

const { $axios } = useNuxtApp()

const messages = ref<Message[]>([
  { role: 'ai', text: '¿Estás listo para empezar?' },
])
const inputText = ref('')
const isLoading = ref(false)
const hasStarted = ref(false)
const alertaRiesgo = ref(false)

const messagesContainer = ref<HTMLElement | null>(null)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendMessage = async (userMessage?: string) => {
  if (isLoading.value) return

  const textToSend = userMessage ?? inputText.value.trim()
  if (!textToSend && hasStarted.value) return

  if (hasStarted.value && textToSend) {
    messages.value.push({ role: 'user', text: textToSend })
    inputText.value = ''
    await scrollToBottom()
  }

  isLoading.value = true

  try {
    const response = await $axios.post<{
      respuestaIa: string
      alerta: boolean
    }>(`/assessment-session/${HARDCODED_USER_ID}/message`, {
      questionnaireId: HARDCODED_QUESTIONNAIRE_ID,
      userMessage: hasStarted.value ? textToSend : undefined,
    })

    const { respuestaIa, alerta } = response.data

    messages.value.push({ role: 'ai', text: respuestaIa, alerta })

    if (alerta) {
      alertaRiesgo.value = true
    }

    hasStarted.value = true
  } catch (error) {
    messages.value.push({
      role: 'ai',
      text: 'Hubo un error al procesar tu respuesta. Intenta de nuevo.',
    })
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <v-container class="chat-page fill-height" fluid>
    <v-row class="fill-height" justify="center">
      <v-col cols="12" sm="10" md="8" lg="6" class="d-flex flex-column">
        <v-card
          class="d-flex flex-column flex-grow-1"
          elevation="2"
          rounded="lg"
        >
          <!-- Header -->
          <v-card-title class="pa-4 bg-primary text-white d-flex align-center">
            <v-icon class="mr-2">mdi-chat-outline</v-icon>
            Evaluación de Bienestar
          </v-card-title>

          <!-- Alert banner -->
          <v-alert
            v-if="alertaRiesgo"
            type="error"
            variant="tonal"
            class="ma-2"
            border="start"
          >
            Se detectó una alerta de riesgo. Por favor comunícate con un
            profesional de salud mental de inmediato.
          </v-alert>

          <!-- Messages area -->
          <div ref="messagesContainer" class="messages-area flex-grow-1 pa-4">
            <div
              v-for="(msg, index) in messages"
              :key="index"
              class="message-wrapper mb-3"
              :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div
                class="message-bubble pa-3"
                :class="{
                  'bg-primary text-white user-bubble': msg.role === 'user',
                  'bg-grey-lighten-3 ai-bubble':
                    msg.role === 'ai' && !msg.alerta,
                  'bg-error-lighten ai-bubble alerta-bubble':
                    msg.role === 'ai' && msg.alerta,
                }"
              >
                <v-icon
                  v-if="msg.role === 'ai'"
                  size="16"
                  class="mr-1 opacity-70"
                >
                  mdi-robot-outline
                </v-icon>
                {{ msg.text }}
              </div>
            </div>

            <!-- Typing indicator -->
            <div v-if="isLoading" class="message-wrapper justify-start mb-3">
              <div class="message-bubble bg-grey-lighten-3 ai-bubble pa-3">
                <v-progress-circular
                  size="16"
                  width="2"
                  indeterminate
                  color="primary"
                  class="mr-2"
                />
                Escribiendo...
              </div>
            </div>
          </div>

          <v-divider />

          <!-- Start button or input -->
          <v-card-actions class="pa-3">
            <template v-if="!hasStarted">
              <v-btn
                color="primary"
                variant="elevated"
                block
                :loading="isLoading"
                @click="sendMessage()"
              >
                <v-icon start>mdi-play-circle-outline</v-icon>
                Empezar evaluación
              </v-btn>
            </template>

            <template v-else>
              <v-textarea
                v-model="inputText"
                placeholder="Escribe tu respuesta..."
                variant="outlined"
                density="compact"
                hide-details
                rows="2"
                auto-grow
                max-rows="4"
                class="flex-grow-1 mr-2"
                :disabled="isLoading"
                @keydown="handleKeydown"
              />
              <v-btn
                color="primary"
                icon
                :disabled="!inputText.trim() || isLoading"
                @click="sendMessage()"
              >
                <v-icon>mdi-send</v-icon>
              </v-btn>
            </template>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.chat-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
}

.messages-area {
  overflow-y: auto;
  max-height: 60vh;
  min-height: 300px;
}

.message-wrapper {
  display: flex;
}

.message-bubble {
  max-width: 80%;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.user-bubble {
  border-bottom-right-radius: 4px;
}

.ai-bubble {
  border-bottom-left-radius: 4px;
}

.alerta-bubble {
  background-color: #ffebee !important;
  border: 1px solid #ef9a9a;
}
</style>
