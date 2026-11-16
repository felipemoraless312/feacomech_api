import { verificarCredencial } from '~~/server/services/credencial'

/** Verificación pública de la credencial digital (lo que abre el QR). */
export default defineEventHandler((event) => {
  exigirFrecuencia(`verificar:${contextoDe(event).ip}`, 60, 60_000)
  setResponseHeaders(event, { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' })
  return verificarCredencial(getRouterParam(event, 'codigo') ?? '')
})
