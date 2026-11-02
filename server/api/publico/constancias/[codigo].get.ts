import { verificarConstancia } from '~~/server/services/eventos'

/** Verificación pública de constancias (lo que abre el QR). */
export default defineEventHandler((event) => {
  exigirFrecuencia(`verificar:${contextoDe(event).ip}`, 60, 60_000)
  const codigo = (getRouterParam(event, 'codigo') ?? '').toUpperCase()
  if (!/^[A-Z0-9]{10}$/.test(codigo)) return { valida: false }
  return verificarConstancia(codigo)
})
