export interface ISpecialist {
  title: string
  image: string
  specialities: string[]
  schedule: string[]
  contact: string[]
}

export const specialists: ISpecialist[] = [
  {
    title: 'Unidad psicológica clínica de la UP',
    image: '/image-specialist-22.png',
    specialities: [
      'Terapia familiar y de pareja',
      'Psicoterapia individual',
      'Evaluaciones neuropsicológicas',
      'Sexualidad',
    ],
    schedule: [
      'Jerez 20, esquina Valencia, Col. Insurgentes Mixcoac Delegación Benito Juárez',
    ],
    contact: [
      'mx_psicologiaclinica@up.edu.mx',
      '5554821600 ext 6430',
      '5579922313',
    ],
  },
]
