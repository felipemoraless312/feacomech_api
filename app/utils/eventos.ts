import { ZONA_HORARIA } from '#shared/texto'

const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('es-MX', { ...o, timeZone: ZONA_HORARIA })
const dia = fmt({ day: 'numeric', month: 'long', year: 'numeric' })
const diaMes = fmt({ day: 'numeric', month: 'long' })
const hora = fmt({ hour: 'numeric', minute: '2-digit' })
const clave = fmt({ year: 'numeric', month: '2-digit', day: '2-digit' })

/** "20 de noviembre de 2026, 9:00 a 14:00" o "20 de noviembre al 22 de noviembre de 2026". */
export function rangoEvento(inicio: string | Date, fin: string | Date) {
  const i = new Date(inicio)
  const f = new Date(fin)
  if (clave.format(i) === clave.format(f)) return `${dia.format(i)}, ${hora.format(i)} a ${hora.format(f)}`
  return `${diaMes.format(i)} al ${dia.format(f)}`
}

export const horaEvento = (v: string | Date) => hora.format(new Date(v))
export const diaEvento = (v: string | Date) => fmt({ weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(v))
/** "2026-11-20" (UTC de una columna DATE) → "vie 20 nov". */
export const diaCorto = (iso: string) => new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`))
