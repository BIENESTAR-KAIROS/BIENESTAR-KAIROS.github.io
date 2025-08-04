export default interface AuthRegisterDto {
  type: string
  email: string
  password: string
  institutionId: string
  studentData: CreateStudentDataDto
}

export interface CreateStudentDataDto {
  name: string
  lastName: string
  age?: number
  gender?: string
  groupIds?: string[]
}
