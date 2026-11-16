// Puerta de acceso: la plataforma privada no está a la vista.
//
// Con NUXT_CLAVE_ACCESO definida, todo lo privado (/plataforma, /imprimir y la API que no es
// pública) responde 404 —igual que una página inexistente— a quien no tenga sesión ni la
// cookie de la puerta. La cookie se obtiene:
//   - visitando el enlace secreto  /acceso/<NUXT_CLAVE_ACCESO>  (lo reparte la Federación);
//   - con un enlace vigente de invitación o recuperación de contraseña (llegó por correo);
//   - automáticamente, si ya se tiene una sesión abierta.
// Es una capa adicional: las credenciales, el bloqueo por intentos y los permisos siguen
// validándose igual. Cambiar la clave invalida todas las cookies de la puerta (no las sesiones).
import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

export const COOKIE_PUERTA = 'feacomech-acceso'
/** Cookie legible por el navegador sólo para mostrar el enlace «Plataforma» en el portal. */
export const COOKIE_AVISO = 'feacomech-afiliado'
export const PREFIJO_ENLACE = '/acceso/'

const VIGENCIA_S = 400 * 86_400 // máximo que admiten los navegadores
const LONGITUD_MINIMA = 24

/** APIs que el portal público o los enlaces del correo usan sin sesión. */
const API_PUBLICA = ['/api/publico/', '/api/archivos/', '/api/_', '/api/auth/token/', '/api/auth/restablecer']

export function claveAcceso(): string {
  return String(useRuntimeConfig().claveAcceso ?? '').trim()
}

export function puertaActiva(): boolean {
  return claveAcceso().length >= LONGITUD_MINIMA
}

/** Ruta sin query, decodificada, sin barras repetidas y en minúsculas (Vue Router no distingue mayúsculas). */
export function rutaNormalizada(path: string): string {
  let ruta = path.split('?')[0] ?? '/'
  try {
    ruta = decodeURIComponent(ruta)
  }
  catch {
    // Codificación inválida: se evalúa tal cual.
  }
  return ruta.replace(/\/{2,}/g, '/').toLowerCase()
}

/** ¿La ruta (normalizada) pertenece a la parte privada que la puerta oculta? */
export function esPrivada(ruta: string): boolean {
  if (ruta.startsWith('/plataforma') || ruta.startsWith('/imprimir')) return true
  if (ruta === '/api' || ruta.startsWith('/api/')) return !API_PUBLICA.some(p => ruta.startsWith(p))
  return false
}

/** Enlace de activación o recuperación del correo: se deja pasar si trae un token con formato válido. */
export function esEnlaceDeCorreo(ruta: string, token: unknown): boolean {
  return (ruta === '/plataforma/restablecer' || ruta === '/plataforma/restablecer/')
    && typeof token === 'string' && /^[\w-]{43}$/.test(token)
}

function firma(clave: string, secreto: string): string {
  return createHmac('sha256', secreto).update(`puerta:${clave}`).digest('base64url')
}

function iguales(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

function valorEsperado(): string {
  return firma(claveAcceso(), String(useRuntimeConfig().session.password))
}

/** ¿La clave del enlace secreto es la correcta? (comparación en tiempo constante) */
export function esClaveCorrecta(candidata: string): boolean {
  const clave = claveAcceso()
  // Se comparan firmas (misma longitud) para no revelar la longitud de la clave.
  return !!clave && iguales(firma(candidata, 'comparacion'), firma(clave, 'comparacion'))
}

export function tienePuerta(event: H3Event): boolean {
  const valor = getCookie(event, COOKIE_PUERTA)
  return !!valor && iguales(valor, valorEsperado())
}

/** Entrega (o renueva) la cookie de la puerta. No hace nada si la puerta no está activa. */
export function abrirPuerta(event: H3Event) {
  if (!puertaActiva()) return
  const opciones = { path: '/', sameSite: 'lax' as const, secure: !import.meta.dev, maxAge: VIGENCIA_S }
  setCookie(event, COOKIE_PUERTA, valorEsperado(), { ...opciones, httpOnly: true })
  setCookie(event, COOKIE_AVISO, '1', { ...opciones, httpOnly: false })
}

/** El mismo 404 que da cualquier ruta inexistente (API de Nitro o página de Vue Router). */
export function noEncontrado(path: string) {
  return path.startsWith('/api')
    ? createError({ statusCode: 404, statusMessage: 'Page Not Found' })
    : createError({ statusCode: 404, statusMessage: `Page not found: ${path}`, data: { path } })
}
