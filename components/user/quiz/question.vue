<script setup lang="ts">
import { QuestionType } from '~/store/quiz'
import type { IQuizResponse } from '~/store/quiz'

defineProps<{
  question: IQuizResponse
}>()
</script>

<template>
  <div class="w-85 text-center text-h6 yantramanav-regular">
    <span>
      {{ question.question }}
    </span>
  </div>
  <div class="w-75">
    <v-row no-gutters class="w-100">
      <div v-if="question.type === QuestionType.RATE" class="w-100">
        <v-col cols="6" md="2">
          <span class="catamaran-text text-body-1 font-weight-regular">
            En desacuerdo
          </span>
        </v-col>
        <v-col
          class="d-flex justify-center"
          cols="12"
          md=""
          order="last"
          order-md="2"
        >
          <v-slider
            v-model="question.answer as number"
            :max="5"
            :min="1"
            :step="1"
            :thumb-label="true"
            color="secondary"
          ></v-slider>
        </v-col>
        <v-col cols="6" md="2" class="d-flex justify-end" order-md="last">
          <span class="catamaran-text text-body-1 font-weight-regular"
            >De acuerdo</span
          >
        </v-col>
      </div>
      <div v-else-if="question.type === QuestionType.DATE" class="w-100">
        <v-col cols="12">
          <v-text-field
            v-model="question.answer as Date"
            type="date"
            color="secondary"
            :label="question.question"
          ></v-text-field>
        </v-col>
      </div>
      <div
        v-else-if="question.type === QuestionType.MULTIPLE_CHOICE"
        class="w-100"
      >
        <v-col cols="12">
          <v-radio-group v-model="question.answer as string" color="secondary">
            <div
              class="d-flex flex-column align-center justify-space-evenly w-100"
            >
              <div v-for="(option, index) in question.options" :key="index">
                <v-radio
                  :label="option.option.text"
                  :value="option.option.value"
                  class="catamaran-text text-body-1 font-weight-regular"
                />
                <div v-if="option.subquestions" class="">
                  <div v-show="question.answer === option.option.value">
                    <div v-for="subOption in option.subquestions">
                      <v-sheet
                        class="w-100 h-100 overflow-auto d-flex flex-column justify-space-evenly align-center"
                      >
                        <Question :question="subOption" />
                      </v-sheet>
                    </div>
                  </div>
                </div>
                <hr />
              </div>
            </div>
          </v-radio-group>
        </v-col>
      </div>
    </v-row>
  </div>
</template>
