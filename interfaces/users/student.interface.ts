export interface IStudentData {
  name: string
  lastName: string
  age: number
  gender: string
  // TODO verify if objectId === string
  groupIds: string[] // Mongo object id array
  demographicData: Record<string, unknown>
  demographicSurveyCompleted: boolean
}
