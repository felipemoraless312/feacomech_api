// Textos de las constancias de las Jornadas 2026, según el tipo de participación.

export type TipoParticipacion = 'ASISTENTE' | 'PONENTE' | 'TALLER' | 'CARTEL' | 'COORDINADOR'

export const PARTICIPACION: Record<TipoParticipacion, { documento: string, etiqueta: string, icono: string, frase: (detalle: string | null) => string }> = {
  ASISTENTE: {
    documento: 'Constancia',
    etiqueta: 'Asistente',
    icono: 'i-lucide-user-check',
    frase: () => 'por su asistencia a las',
  },
  PONENTE: {
    documento: 'Reconocimiento',
    etiqueta: 'Ponente',
    icono: 'i-lucide-mic',
    frase: d => (d ? `por su valiosa participación como ponente con el tema «${d}» en las` : 'por su valiosa participación como ponente en las'),
  },
  TALLER: {
    documento: 'Constancia',
    etiqueta: 'Taller',
    icono: 'i-lucide-hand',
    frase: d => (d ? `por haber acreditado el taller «${d}» en el marco de las` : 'por haber acreditado un taller en el marco de las'),
  },
  CARTEL: {
    documento: 'Constancia',
    etiqueta: 'Cartel científico',
    icono: 'i-lucide-presentation',
    frase: d => (d ? `por la presentación del cartel científico «${d}» en las` : 'por la presentación de un cartel científico en las'),
  },
  COORDINADOR: {
    documento: 'Reconocimiento',
    etiqueta: 'Coordinación',
    icono: 'i-lucide-users',
    frase: d => (d ? `por la coordinación académica del bloque «${d}» en las` : 'por su labor de coordinación académica en las'),
  },
}

/** Firmas de la constancia: Mesa Directiva, Bienio 2026 – 2028. */
export const FIRMAS_JORNADAS = [
  { nombre: 'Dra. Fanny Kramsky Soto', cargo: 'Presidenta' },
  { nombre: 'Dra. María del Carmen Albores Guillén', cargo: 'Secretaria Técnica' },
]
