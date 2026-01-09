import type { CivilStatusEnum } from '~/utils/constants/demographics/civil-status.enum'
import { ConsumptionFrequencyEnum } from '~/utils/constants/demographics/consumption-frecuency.enum'
import type { EmploymentStatusEnum } from '~/utils/constants/demographics/employment-status.enum'
import type { FamilyMonthlyIncomeEnum } from '~/utils/constants/demographics/family-monthly-income.enum'
import type { HousingSituationEnum } from '~/utils/constants/demographics/housing-situation.enum'
import type { PersonalMonthlyIncomeEnum } from '~/utils/constants/demographics/personal-monthly-income.enum'
import { PhysicalActivityEnum } from '~/utils/constants/demographics/physical-activity.enum'

export interface StudentDemographicDataRequestDto {
  zipCode: string
  civilStatus: CivilStatusEnum
  studyYear: number
  housingSituation: HousingSituationEnum
  personalMonthlyIncome: PersonalMonthlyIncomeEnum
  familyMonthlyIncome: FamilyMonthlyIncomeEnum
  employmentStatus: EmploymentStatusEnum
  hasChronicDisease: boolean
  tobaccoConsumption: boolean
  alcoholConsumption: ConsumptionFrequencyEnum
  weeklyPhysicalActivity: PhysicalActivityEnum
}
