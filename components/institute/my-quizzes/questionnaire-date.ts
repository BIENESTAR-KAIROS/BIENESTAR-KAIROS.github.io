const effectiveDay = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'long',
  timeZone: 'America/Mexico_City',
})

export const formatQuestionnaireDate = (date: string) =>
  effectiveDay.format(new Date(date))
