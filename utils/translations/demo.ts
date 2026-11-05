import { isAxiosError } from 'axios'
import type {
  DemoDistribution,
  DemoProfile,
  DemoJob,
} from '~/interfaces/stats/demo.interface'
export const demoDistributions: { value: DemoDistribution; label: string }[] = [
  { value: 'uniform', label: 'Uniforme' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Hacia puntuaciones bajas' },
  { value: 'high', label: 'Hacia puntuaciones altas' },
]
export const demoJobLabels: Record<DemoJob['state'], string> = {
  queued: 'En espera',
  running: 'Generando resultados',
  prepared: 'Preparando activación',
  completed: 'Completado',
  failed: 'No completado',
  cancelled: 'Cancelado',
}
export function demoProfileLabel(p: DemoProfile): string {
  const label =
    demoDistributions.find((d) => d.value === p.distribution)?.label ||
    'Sin distribución'
  if (p.distribution === 'normal')
    return `${label} · centro ${Math.round(p.center * 100)}% · dispersión ${Math.round(p.spread * 100)}%`
  if (p.distribution === 'low' || p.distribution === 'high')
    return `${label} · intensidad ${p.strength}`
  return label
}
export function demoError(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.response?.status === 401)
      return 'Tu sesión ya no es válida. Vuelve a iniciar sesión.'
    if (error.response?.status === 403)
      return 'Se requiere acceso de administrador general y una institución activa.'
    const messages: Record<string, string> = {
      demo_assignment_unavailable:
        'No hay una asignación demo vigente. Asigna usuarios a esta institución y vuelve a consultar.',
      demo_assignment_changed:
        'La asignación de usuarios cambió. Actualiza el estado antes de preparar otra demo.',
      demo_generation_unavailable:
        'Todavía no hay una generación completa y activa para este cuestionario.',
      demo_conflict:
        'La configuración, el cuestionario o el trabajo cambiaron. Actualiza el estado antes de continuar.',
      demo_cleanup_required:
        'Hay resultados anteriores pendientes de limpieza automática. Actualiza el estado en unos momentos antes de generar otra demo.',
      demo_limit_exceeded:
        'La demo supera el límite de consulta de este cuestionario. Reduce la cantidad de usuarios asignados; no se mostrará una muestra parcial.',
      unsupported_demo_questionnaire:
        'Este cuestionario todavía no es compatible con la simulación de respuestas.',
      conflicting_demo_dimensions:
        'No se pueden ajustar por separado dimensiones que comparten preguntas. Conserva un solo ajuste para esas dimensiones.',
      invalid_demo_request:
        'Revisa los valores de la configuración antes de enviarla.',
      demo_busy:
        'Hay otra operación demo en curso. Espera un momento y vuelve a intentarlo.',
      demo_timeout:
        'La operación tardó más de lo esperado. No pudimos confirmar su resultado.',
    }
    const code: unknown = error.response?.data?.code
    if (typeof code === 'string' && messages[code]) return messages[code]!
  }
  return 'No pudimos obtener o confirmar la información. Comprueba la disponibilidad de los servicios y vuelve a intentarlo.'
}
