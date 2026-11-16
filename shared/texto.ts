// Utilidades de texto y fechas comunes a cliente y servidor.

export const ZONA_HORARIA = 'America/Mexico_City'

/** Mayúsculas sin acentos ni espacios repetidos: "José  Pérez" → "JOSE PEREZ". Ñ se conserva. */
export function normalizarNombre(texto: string): string {
  return texto
    .replace(/ñ/gi, '\u0000')
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // marcas diacríticas (acentos, diéresis)
    .replace(/\u0000/g, 'Ñ')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function nombreCompleto(p: { nombre: string, apellidoPaterno: string, apellidoMaterno?: string | null }): string {
  return [p.nombre, p.apellidoPaterno, p.apellidoMaterno].filter(Boolean).join(' ')
}

const fmtFecha = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const fmtFechaHora = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: ZONA_HORARIA })

/** Fecha sin hora (columnas DATE): "5 oct 2026". */
export function formatoFecha(valor: string | Date | null | undefined): string {
  return valor ? fmtFecha.format(new Date(valor)) : '—'
}

/** Instante en hora de Ciudad de México: "5 oct 2026, 4:50 p.m.". */
export function formatoFechaHora(valor: string | Date | null | undefined): string {
  return valor ? fmtFechaHora.format(new Date(valor)) : '—'
}

export type FragmentoTexto = { tipo: 'texto', valor: string } | { tipo: 'enlace', valor: string, url: string }

const RE_URL = /\bhttps?:\/\/[^\s<>"]+/gi

/**
 * Separa un texto plano en fragmentos de texto y enlaces http(s), para mostrarlos sin v-html.
 * La puntuación final pegada a la URL (paréntesis de cierre sin abrir, punto, coma…) queda fuera.
 */
export function fragmentarEnlaces(texto: string): FragmentoTexto[] {
  const fragmentos: FragmentoTexto[] = []
  let ultimo = 0
  for (const m of texto.matchAll(RE_URL)) {
    let url = m[0]
    while (/[.,;:!?)\]]$/.test(url)) {
      if (url.endsWith(')') && (url.match(/\(/g)?.length ?? 0) >= (url.match(/\)/g)?.length ?? 0)) break
      url = url.slice(0, -1)
    }
    const inicio = m.index
    if (inicio > ultimo) fragmentos.push({ tipo: 'texto', valor: texto.slice(ultimo, inicio) })
    fragmentos.push({ tipo: 'enlace', valor: url, url })
    ultimo = inicio + url.length
  }
  if (ultimo < texto.length) fragmentos.push({ tipo: 'texto', valor: texto.slice(ultimo) })
  return fragmentos
}
