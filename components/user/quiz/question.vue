<script setup lang="ts">
import { QuestionType } from '~/store/quiz'
import type { IQuizResponse } from '~/store/quiz'

const props = defineProps<{
  question: IQuizResponse
}>()

onMounted(() => {
  //console.log('question mounted', props.question)
})
const onSelectAnswer = () => {
  //alert('answer selected')
}
</script>

<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <div class="w-100 text-left text-h6 yantramanav-regular">
          <span>
            {{ question.question }}
          </span>
        </div>
        <v-container class="py-0 px-0" fluid>
          <v-row no-gutters>
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
              <v-container fluid class="pa-0">
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-radio-group
                      v-model="question.answer as number"
                      color="secondary"
                      @update:model-value="onSelectAnswer()"
                    >
                      <div
                        class="d-flex flex-column align-start justify-space-evenly w-100"
                      >
                        <div
                          v-for="(option, index) in question.options"
                          :key="index"
                        >
                          <v-radio
                            :label="option.option.text"
                            :value="option.option.weight"
                            class="catamaran-text text-body-1 font-weight-regular"
                          />
                        </div>
                        <div
                          v-for="(option, index) in question.options"
                          :key="index"
                          class="w-100"
                        >
                          <div v-if="option.subquestions">
                            <div
                              v-show="question.answer === option.option.weight"
                            >
                              <div v-for="subOption in option.subquestions">
                                <Question :question="subOption" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </v-radio-group>
                  </v-col>
                </v-row>
              </v-container>
            </div>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>
