import type { AdminUser } from '~/interfaces/user/admin-user.interface'
import type { RegistrationInstitute } from '~/interfaces/institution/registration-institute.interface'

export function genderLabel(value?: string) {
  const key = value?.split('.').pop()?.toLowerCase()
  return (
    (
      { male: 'Masculino', female: 'Femenino', other: 'Otro' } as Record<
        string,
        string
      >
    )[key || ''] || 'Sin registro'
  )
}
export function userName(user: AdminUser) {
  return (
    [user.name, user.lastName, user.surName].filter(Boolean).join(' ') ||
    user.email
  )
}
export function institutionLabels(
  user: AdminUser,
  institutions: RegistrationInstitute[],
) {
  const ids = new Set(
    [
      user.institute,
      ...(user.isDemo ? user.demoInstitutionIds || [] : []),
    ].filter(Boolean),
  )
  const names = institutions.filter((i) => ids.has(i._id)).map((i) => i.name)
  return names.length
    ? names.join(', ')
    : user.isDemo
      ? 'Demo sin asignar'
      : 'Sin institución'
}
export function dateLabel(value?: string) {
  return value ? new Date(value).toLocaleDateString('es-MX') : 'Sin registro'
}
