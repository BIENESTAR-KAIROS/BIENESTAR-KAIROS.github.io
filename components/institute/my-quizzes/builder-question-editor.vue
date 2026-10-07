<script setup lang="ts">
import type {
  BuilderQuestion,
  BuilderQuestionType,
  BuilderOption,
} from '~/interfaces/quizzes/quiz-builder.interface'
import {
  createOption,
  createQuestion,
  hasOptions,
  questionTypes,
  presentations,
} from './quiz-builder-model'

const question = defineModel<BuilderQuestion>({ required: true })
defineProps<{ nested?: boolean }>()
const emit = defineEmits<{ announce: [message: string] }>()

function changeType(type: BuilderQuestionType) {
  if (
    !hasOptions(type) &&
    question.value.options.some((option) => option.children.length)
  ) {
    emit(
      'announce',
      'Elimina las subpreguntas antes de cambiar a un tipo sin opciones.',
    )
    return
  }
  question.value.type = type
  question.value.presentation = presentations[type][0].value
  question.value.scoringMethod = type === 'number' ? 'direct' : 'sum'
  if (type === 'text' || type === 'date')
    question.value.scoringMode = 'informational'
}

function moveOption(index: number, direction: number) {
  const options = question.value.options
  const target = index + direction
  if (target < 0 || target >= options.length) return
  const [option] = options.splice(index, 1)
  options.splice(target, 0, option)
  emit('announce', `Opción movida a la posición ${target + 1}.`)
}

function removeOption(index: number) {
  question.value.options.splice(index, 1)
  question.value.maxAnswers = Math.min(
    question.value.maxAnswers,
    question.value.options.length,
  )
  emit('announce', 'Opción eliminada junto con sus subpreguntas y reglas.')
}

function addChild(option: BuilderOption) {
  option.children.push(createQuestion())
  emit('announce', 'Subpregunta añadida a esta opción.')
}
</script>

<template>
  <div class="qb-editor">
    <section class="qb-panel">
      <div class="qb-section-heading">
        <h2>{{ nested ? 'Tipo de subpregunta' : '1 · Tipo de pregunta' }}</h2>
        <p v-if="!nested">Elige cómo responderá el alumno.</p>
      </div>
      <div
        class="qb-types"
        :class="{ 'qb-types--nested': nested }"
        role="group"
        aria-label="Tipo de pregunta"
      >
        <button
          v-for="type in questionTypes"
          :key="type.value"
          type="button"
          class="qb-type"
          :class="{ 'is-selected': question.type === type.value }"
          :aria-pressed="question.type === type.value"
          @click="changeType(type.value)"
        >
          <v-icon :icon="type.icon" size="22" aria-hidden="true" />
          <span>{{ type.label }}</span>
        </button>
      </div>
      <label class="qb-field"
        ><span>Presentación</span>
        <select v-model="question.presentation">
          <option
            v-for="item in presentations[question.type]"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </option>
        </select>
      </label>
    </section>

    <section class="qb-panel">
      <h2>{{ nested ? 'Enunciado' : '2 · Enunciado' }}</h2>
      <label class="qb-field">
        <span>Pregunta</span>
        <textarea
          v-model="question.text"
          rows="2"
          placeholder="Escribe aquí tu pregunta"
          maxlength="500"
        />
      </label>
      <label class="qb-field">
        <span>Texto de ayuda <small>(opcional)</small></span>
        <input
          v-model="question.help"
          placeholder="Añade una indicación para responder"
          maxlength="300"
        />
      </label>
      <div class="qb-fields">
        <label class="qb-field"
          ><span>Bloque (opcional)</span
          ><input
            v-model="question.block"
            maxlength="100"
            placeholder="Ej. Alcohol"
        /></label>
        <label class="qb-field"
          ><span>Puntuación</span>
          <select
            v-model="question.scoringMode"
            :disabled="question.type === 'text' || question.type === 'date'"
          >
            <option value="informational">Solo informativa</option>
            <option value="scored">Aporta a la calificación</option>
          </select>
        </label>
        <label
          v-if="
            question.type === 'multiple_choice' &&
            question.scoringMode === 'scored'
          "
          class="qb-field"
          ><span>Combinar opciones</span>
          <select v-model="question.scoringMethod">
            <option value="sum">Sumar</option>
            <option value="mean">Promediar</option>
            <option value="max">Mayor puntuación</option>
          </select>
        </label>
        <div class="qb-field">
          <span>Obligatoria</span>
          <label class="qb-toggle"
            ><input
              v-model="question.required"
              type="checkbox"
              role="switch"
              aria-label="Pregunta obligatoria"
            /><span aria-hidden="true" />{{
              question.required ? 'Sí' : 'No'
            }}</label
          >
        </div>
      </div>
      <p class="qb-muted">
        La obligatoriedad se aplica solo cuando la pregunta es visible. Las
        preguntas informativas no aportan puntos.
      </p>
      <p
        v-if="question.type === 'number' && question.scoringMode === 'scored'"
        class="qb-muted"
      >
        El valor numérico de la respuesta será su puntuación.
      </p>
    </section>

    <section class="qb-panel">
      <div class="qb-row">
        <div class="qb-section-heading">
          <h2>
            {{ nested ? '' : '3 · '
            }}{{
              hasOptions(question.type)
                ? 'Opciones de respuesta'
                : 'Configuración de respuesta'
            }}
          </h2>
          <p v-if="hasOptions(question.type)">
            Usa las flechas para reordenar. Deja el valor vacío si no puntúa.
          </p>
        </div>
        <span v-if="hasOptions(question.type)" class="qb-badge"
          >{{ question.options.length }} opciones</span
        >
      </div>
      <template v-if="hasOptions(question.type)">
        <div
          v-for="(option, index) in question.options"
          :key="option.id"
          class="qb-option"
          :class="{ 'qb-option--branch': option.children.length }"
        >
          <div class="qb-option-main">
            <span class="qb-letter">{{ String.fromCharCode(65 + index) }}</span>
            <label class="qb-field qb-option-text"
              ><span class="qb-sr-only">Opción {{ index + 1 }}</span
              ><input
                v-model="option.text"
                :placeholder="`Opción ${index + 1}`"
                maxlength="200"
            /></label>
            <label class="qb-field qb-score"
              ><span>Valor</span
              ><input
                v-model.number="option.score"
                type="number"
                min="0"
                step="any"
                :disabled="question.scoringMode !== 'scored'"
                placeholder="—"
                :aria-label="`Valor de la opción ${index + 1}`"
            /></label>
            <div class="qb-option-actions">
              <button
                type="button"
                class="qb-icon"
                :disabled="index === 0"
                :aria-label="`Subir opción ${index + 1}`"
                @click="moveOption(index, -1)"
              >
                <v-icon icon="mdi-arrow-up" size="18" />
              </button>
              <button
                type="button"
                class="qb-icon"
                :disabled="index === question.options.length - 1"
                :aria-label="`Bajar opción ${index + 1}`"
                @click="moveOption(index, 1)"
              >
                <v-icon icon="mdi-arrow-down" size="18" />
              </button>
              <button
                type="button"
                class="qb-icon qb-danger"
                :disabled="question.options.length <= 2"
                :aria-label="`Eliminar opción ${index + 1} y sus subpreguntas`"
                @click="removeOption(index)"
              >
                <v-icon icon="mdi-trash-can-outline" size="18" />
              </button>
            </div>
          </div>
          <div class="qb-option-footer">
            <button
              type="button"
              class="qb-button qb-button--small qb-button--dashed"
              @click="addChild(option)"
            >
              <v-icon icon="mdi-subdirectory-arrow-right" size="16" /> Añadir
              subpregunta
            </button>
            <span v-if="option.children.length" class="qb-badge"
              >{{ option.children.length }} subpreguntas</span
            >
          </div>
          <div v-if="option.children.length" class="qb-children">
            <div
              v-for="(child, childIndex) in option.children"
              :key="child.id"
              class="qb-child"
            >
              <div class="qb-row">
                <h3>Subpregunta {{ index + 1 }}.{{ childIndex + 1 }}</h3>
                <button
                  type="button"
                  class="qb-icon qb-danger"
                  :aria-label="`Eliminar subpregunta ${index + 1}.${childIndex + 1}`"
                  @click="option.children.splice(childIndex, 1)"
                >
                  <v-icon icon="mdi-trash-can-outline" size="18" />
                </button>
              </div>
              <p class="qb-muted">
                Se muestra al elegir «{{
                  option.text || `Opción ${index + 1}`
                }}».
              </p>
              <BuilderQuestionEditor
                v-model="option.children[childIndex]"
                nested
                @announce="emit('announce', $event)"
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          class="qb-button qb-button--dashed"
          @click="question.options.push(createOption())"
        >
          + Añadir opción
        </button>
        <label v-if="question.type === 'multiple_choice'" class="qb-field">
          <span>Máximo de respuestas</span>
          <select v-model.number="question.maxAnswers">
            <option
              v-for="count in question.options.length"
              :key="count"
              :value="count"
            >
              {{ count }}
            </option>
          </select>
        </label>
        <p v-if="question.presentation === 'scale'" class="qb-muted">
          Cada opción es un punto de la escala. Puedes editar su etiqueta y
          valor.
        </p>
      </template>
      <div v-else-if="question.type === 'number'" class="qb-fields">
        <label class="qb-field"
          ><span>Valor mínimo</span
          ><input v-model.number="question.min" type="number"
        /></label>
        <label class="qb-field"
          ><span>Valor máximo</span
          ><input
            v-model.number="question.max"
            type="number"
            :min="question.min"
        /></label>
        <p v-if="question.min >= question.max" class="qb-error" role="alert">
          El máximo debe ser mayor que el mínimo.
        </p>
      </div>
      <label v-else-if="question.type === 'text'" class="qb-field"
        ><span>Límite de caracteres</span
        ><input
          v-model.number="question.maxLength"
          type="number"
          min="1"
          max="5000"
        /><small>Entre 1 y 5,000 caracteres.</small></label
      >
    </section>
  </div>
</template>
