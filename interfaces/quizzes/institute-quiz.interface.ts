/**
 * Contratos de la pantalla "Mis cuestionarios" del instituto.
 *
 * La lista viene de `GET /questionnaire?institutionId=…` (escanor) y el conteo
 * de respuestas de `GET /questionnaires/:id/statistics`, que todavía vive en la
 * API vieja y hoy no responde. Son dos llamadas distintas porque el listado no
 * trae respuestas: se piden por cuestionario y la tarjeta se dibuja igual si
 * ese conteo no llega.
 */

export interface IInstituteQuizGroup {
  id: string
  name: string
  description?: string
}

export interface IInstituteQuizInstitution {
  id: string
  name: string
  businessName?: string
}

export interface IInstituteQuizCreator {
  id: string
  email: string
  /** Nombre y apellido del autor, cuando la cuenta todavía existe. */
  name?: string
}

/** Un cuestionario tal como lo devuelve el listado. */
export interface IInstituteQuizListItem {
  id: string
  title: string
  description?: string
  active: boolean
  creationDate?: string
  modificationDate?: string
  institution: IInstituteQuizInstitution | null
  creator: IInstituteQuizCreator | null
  questionsCount: number
  assignedGroups: IInstituteQuizGroup[]
  assignedGroupsCount: number
}

export interface IInstituteQuizListResponse {
  questionnaires: IInstituteQuizListItem[]
  count: number
}

export interface IQuizStatisticsResponse {
  questionnaire: {
    id: string
    title: string
    active: boolean
  }
  responses: {
    /** Respuestas completadas. */
    total: number
    /** Alumnos en los grupos asignados; 0 cuando el cuestionario es abierto. */
    potential: number
    responseRate: number
  }
}

export interface IInstituteQuizResponses {
  total: number
  potential: number
  responseRate: number
}

/** El modelo que dibuja cada tarjeta, ya resuelto y en español. */
export interface IInstituteQuizCard {
  id: string
  title: string
  description: string
  active: boolean
  /**
   * Un cuestionario que no pertenece a tu institución —la base que diseña
   * Kairos— se ve pero no se toca. Hoy el listado se pide filtrado por
   * institución, así que siempre llega en `false`; la tarjeta ya sabe pintarlo.
   */
  readonly: boolean
  questionsCount: number
  groups: IInstituteQuizGroup[]
  /** "Toda la institución" o los grupos a los que se asignó. */
  audienceLabel: string
  /** `null` mientras el conteo carga o si la API lo negó. */
  responses: IInstituteQuizResponses | null
  /** "Actualizado el 4 de sep" — o `null` si el cuestionario no trae fechas. */
  updatedLabel: string | null
}
