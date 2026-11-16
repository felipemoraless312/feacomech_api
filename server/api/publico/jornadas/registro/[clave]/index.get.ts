import { estadoRegistro, exigirClave } from '~~/server/services/registro-asistentes'

/** Estado del registro en sede (enlace oculto): días del evento y si hoy se aceptan ingresos. */
export default defineEventHandler((event) => {
  exigirClave(getRouterParam(event, 'clave'))
  return estadoRegistro()
})
