<script setup lang="ts">
import { required } from '~/utils/helpers/form-rules'

const motives = ref(
  'Ansiedad relacionada con el rendimiento académico y la adaptación a la vida universitaria',
)
const notes = ref('')
const isEditing = ref(false)

const nonText =
  'Aún no se han agregado notas, de clic sobre “Editar” para añadirlas'

function handleClickEdit() {
  isEditing.value = !isEditing.value
}
</script>

<template>
  <v-container>
    <v-row>
      <v-spacer />
      <v-col cols="3" class="d-flex justify-end">
        <v-btn
          class="handlee-regular text-h5 font-weight-thin"
          color="thirdy"
          @click="handleClickEdit"
        >
          {{ isEditing ? 'Guardar' : 'Editar' }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="motives"
          :rules="[required]"
          label="Motivo de la sesión"
          :disabled="!isEditing"
          bg-color="purpleShadow"
          variant="filled"
        />
      </v-col>
      <v-col cols="12">
        <v-textarea
          label="Notas de la sesión"
          variant="solo-filled"
          v-model="notes"
          bg-color="purpleShadow"
          :disabled="!isEditing"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
