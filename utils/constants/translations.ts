import { UserGenderEnum } from '~/interfaces/user/enum/user-gender.enum'

export function translateGender(gender: string): string {
  const genderTranslations: { [key: string]: UserGenderEnum } = {
    'Masculino': UserGenderEnum.MALE,
    'Femenino': UserGenderEnum.FEMALE,
    'Otro': UserGenderEnum.OTHER,
  }

  return genderTranslations[gender] || ''
}
