import { UserGenderEnum } from '~/interfaces/user/enum/user-gender.enum'
import { CivilStatusEnum } from './demographics/civil-status.enum'
import { StudyYearEnum } from './demographics/study-year.enum'
import { HousingSituationEnum } from './demographics/housing-situation.enum'
import { PersonalMonthlyIncomeEnum } from './demographics/personal-monthly-income.enum'
import { FamilyMonthlyIncomeEnum } from './demographics/family-monthly-income.enum'
import { EmploymentStatusEnum } from './demographics/employment-status.enum'
import { ConsumptionFrequencyEnum } from './demographics/consumption-frecuency.enum'
import { PhysicalActivityEnum } from './demographics/physical-activity.enum'

export function translateGender(gender: string): string {
  const genderTranslations: { [key: string]: UserGenderEnum } = {
    Masculino: UserGenderEnum.MALE,
    Femenino: UserGenderEnum.FEMALE,
    Otro: UserGenderEnum.OTHER,
  }

  return genderTranslations[gender] || ''
}

export const civilStatusTranslations: { [key: string]: CivilStatusEnum } = {
  'Soltero(a)': CivilStatusEnum.SINGLE,
  'Casado(a)': CivilStatusEnum.MARRIED,
  'Unión libre': CivilStatusEnum.FREE_UNION,
  'Divorciado(a)': CivilStatusEnum.DIVORCED,
  'Viudo(a)': CivilStatusEnum.WIDOWED,
}
export function translateCivilStatus(civilStatus: string): string {
  return civilStatusTranslations[civilStatus] || ''
}

export const studyYearTranslations: { [key: string]: number } = {
  'Primer año (1 a 4 trimestre)': StudyYearEnum.FIRST_YEAR,
  'Segundo año (5 a 9 trimestre)': StudyYearEnum.SECOND_YEAR,
  'Tercer año (10 a 14 trimestre)': StudyYearEnum.THIRD_YEAR,
  'Cuarto año (15 a 19 trimestre)': StudyYearEnum.FOURTH_YEAR,
  'Quinto año (20 a 24 trimestre)': StudyYearEnum.FIFTH_YEAR,
}
export function translateStudyYear(studyYear: string): number {
  return studyYearTranslations[studyYear] || 0
}

export const housingSituationTranslations: { [key: string]: string } = {
  'Vivo con mis padres/familia': HousingSituationEnum.PARENTS,
  'Residencia rentada': HousingSituationEnum.ALONE_RENTED,
  'Residencia propia': HousingSituationEnum.ALONE_OWNED,
  'Residencia compartida': HousingSituationEnum.ROOMMATES,
}
export function translateHousingSituation(housingSituation: string): string {
  return housingSituationTranslations[housingSituation] || ''
}

export const personalMonthlyIncomeTranslations: { [key: string]: string } = {
  'Menos de $3,000': PersonalMonthlyIncomeEnum.LESS_THAN_3000,
  '$3,000 - $6,000': PersonalMonthlyIncomeEnum.BETWEEN_3000_6000,
  '$6,000 - $9,000': PersonalMonthlyIncomeEnum.BETWEEN_6000_9000,
  '$9,000 - $12,000': PersonalMonthlyIncomeEnum.BETWEEN_9000_12000,
  'Más de $12,000': PersonalMonthlyIncomeEnum.MORE_THAN_12000,
}
export function translatePersonalMonthlyIncome(income: string): string {
  return personalMonthlyIncomeTranslations[income] || ''
}

export const familyMonthlyIncomeTranslations: { [key: string]: string } = {
  'Menos de $10,000': FamilyMonthlyIncomeEnum.LESS_THAN_10000,
  '$10,000 - $20,000': FamilyMonthlyIncomeEnum.BETWEEN_10000_20000,
  '$20,000 - $30,000': FamilyMonthlyIncomeEnum.BETWEEN_20000_30000,
  '$30,000 - $40,000': FamilyMonthlyIncomeEnum.BETWEEN_30000_40000,
  'Más de $40,000': FamilyMonthlyIncomeEnum.MORE_THAN_40000,
}
export function translateFamilyMonthlyIncome(income: string): string {
  return familyMonthlyIncomeTranslations[income] || ''
}

export const employmentStatusTranslations: { [key: string]: string } = {
  'No trabajo mientras estudio': EmploymentStatusEnum.NOT_WORKING,
  'Menos de 8 horas semanales': EmploymentStatusEnum.LESS_THAN_8_HOURS_WEEK,
  'Entre 8 y 12 horas semanales':
    EmploymentStatusEnum.BETWEEN_8_AND_12_HOURS_WEEK,
  'Entre 12 y 20 horas semanales':
    EmploymentStatusEnum.BETWEEN_12_AND_20_HOURS_WEEK,
  'Más de 20 horas semanales': EmploymentStatusEnum.MORE_THAN_20_HOURS_WEEK,
}
export function translateEmploymentStatus(status: string): string {
  return employmentStatusTranslations[status] || ''
}

export const consumptionFrecuencyTranslations: { [key: string]: string } = {
  Nunca: ConsumptionFrequencyEnum.NEVER,
  'Menos de una vez al mes': ConsumptionFrequencyEnum.LESS_THAN_ONE_PER_MONTH,
  'Una vez al mes': ConsumptionFrequencyEnum.ONCE_PER_MONTH,
  'Una vez a la semana': ConsumptionFrequencyEnum.ONCE_PER_WEEK,
  'Más de una vez a la semana':
    ConsumptionFrequencyEnum.MORE_THAN_ONCE_PER_WEEK,
}
export function translateConsumptionFrequency(frequency: string): string {
  return consumptionFrecuencyTranslations[frequency] || ''
}

export const physicalActivityTranslations: { [key: string]: string } = {
  Nunca: PhysicalActivityEnum.NEVER,
  'De 1 a 4 horas por semana': PhysicalActivityEnum.ONE_TO_FOUR_HOURS_PER_WEEK,
  'De 4 a 6 horas por semana': PhysicalActivityEnum.FOUR_TO_SIX_HOURS_PER_WEEK,
  'De 6 a 8 horas por semana': PhysicalActivityEnum.SIX_TO_EIGHT_HOURS_PER_WEEK,
  'Más de 8 horas por semana':
    PhysicalActivityEnum.MORE_THAN_EIGHT_HOURS_PER_WEEK,
}
export function translatePhysicalActivity(activity: string): string {
  return physicalActivityTranslations[activity] || ''
}
