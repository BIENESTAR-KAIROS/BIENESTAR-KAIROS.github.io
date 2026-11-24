import type { IInstitute } from '~/interfaces/institute/institute.interface'

const school = {
  member: 'Alumno',
  members: 'Alumnos',
  site: 'Campus',
  department: 'Facultad',
  role: 'Carrera',
  roles: 'Carreras',
  affiliation: 'Datos académicos',
}
const company = {
  member: 'Empleado',
  members: 'Empleados',
  site: 'Sede',
  department: 'Área',
  role: 'Puesto',
  roles: 'Puestos',
  affiliation: 'Datos laborales',
}
export const institutionTerms = (type?: IInstitute['institutionType']) =>
  type === 'company' ? company : school

export function availableCampuses(institute?: IInstitute | null) {
  return (institute?.campuses ?? []).filter(
    (campus) =>
      campus.active !== false &&
      campus.departments?.some((department) => department.careers?.length),
  )
}
