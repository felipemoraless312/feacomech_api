import type { TonoEstado } from '~/components/EstadoPunto.vue'

/** Tono del punto de estado para cada estado de afiliación de una organización. */
export const TONO_AFILIACION: Record<string, TonoEstado> = {
  EN_TRAMITE: 'info',
  AFILIADA: 'exito',
  SUSPENDIDA: 'alerta',
  BAJA: 'neutro',
}

export const TONO_MEMBRESIA: Record<string, TonoEstado> = {
  SOLICITADA: 'info',
  ACTIVA: 'exito',
  RECHAZADA: 'error',
  BAJA: 'neutro',
}

export const TONO_VALIDACION: Record<string, TonoEstado> = {
  PENDIENTE: 'alerta',
  VALIDADO: 'exito',
  RECHAZADO: 'error',
}

export const NOMBRE_VALIDACION: Record<string, string> = {
  PENDIENTE: 'Por validar',
  VALIDADO: 'Validado',
  RECHAZADO: 'Con observaciones',
}

/** Fecha de una columna DATE ("2026-11-01T00:00:00.000Z") en formato corto. */
export function fechaCorta(v: string | Date | null | undefined) {
  if (!v) return '—'
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(v))
}
