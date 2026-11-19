// Colegios y asociaciones afiliados a la FEACOMECH con su presidencia vigente (lista de
// presidentes de colegios, noviembre de 2026). El seed «datos reales» los da de alta en el
// directorio (/directorio/<slug>); `clave` coincide con MESA_DIRECTIVA_2026.presidentes[].colegio.
// Nombres oficiales y siglas tomados de los currículums recibidos y de los logotipos de la
// página «Colegios médicos asociados» del temario de las Jornadas 2026.

export interface ColegioAfiliado {
  clave: string
  slug: string
  nombre: string
  /** Nombre con el que se registró antes; el seed lo sustituye si nadie lo cambió en la plataforma. */
  nombreAnterior?: string
  siglas?: string
  tipo: 'COLEGIO' | 'ASOCIACION'
  municipio?: string
  /** Inicio de la presidencia vigente (aprox. si no consta en el currículum). */
  presidenciaDesde?: string
  /** Nombre del periodo de la presidencia, si consta. */
  periodo?: string
  /** Hay logotipo estático en /img/colegios/<slug>.webp (recortado del temario). */
  logo?: boolean
}

const COLEGIOS: ColegioAfiliado[] = [
  { clave: 'Anatomopatología', slug: 'colegio-de-anatomopatologia', nombre: 'Colegio de Médicos Anatomopatólogos del Estado de Chiapas, A.C.', nombreAnterior: 'Colegio de Anatomopatología', tipo: 'COLEGIO', logo: true },
  { clave: 'Anestesiología', slug: 'colegio-de-anestesiologia-del-estado-de-chiapas', nombre: 'Colegio de Anestesiología del Estado de Chiapas', siglas: 'COANECH', tipo: 'COLEGIO', presidenciaDesde: '2025-01-01', periodo: '2025–2027', logo: true },
  { clave: 'Angiología', slug: 'colegio-de-angiologia', nombre: 'Colegio de Angiólogos, Cirujanos Vasculares y Endovasculares de Chiapas', nombreAnterior: 'Colegio de Angiología', siglas: 'CACVECH', tipo: 'COLEGIO', logo: true },
  { clave: 'Cardiología', slug: 'colegio-de-cardiologia', nombre: 'Colegio de Cardiología', tipo: 'COLEGIO' },
  { clave: 'Cirugía Plástica', slug: 'colegio-de-cirugia-plastica', nombre: 'Colegio de Cirujanos Plásticos, Estéticos y Reconstructivos del Estado de Chiapas, A.C.', nombreAnterior: 'Colegio de Cirugía Plástica', tipo: 'COLEGIO', logo: true },
  { clave: 'Asociación Médica de Comitán', slug: 'asociacion-medica-de-comitan', nombre: 'Asociación Médica de Comitán, A.C.', nombreAnterior: 'Asociación Médica de Comitán', tipo: 'ASOCIACION', municipio: 'Comitán de Domínguez', logo: true },
  { clave: 'Cirujanos Dentistas', slug: 'colegio-de-cirujanos-dentistas', nombre: 'Colegio de Cirujanos Dentistas de la Zona Centro de Chiapas, A.C.', nombreAnterior: 'Colegio de Cirujanos Dentistas', tipo: 'COLEGIO', logo: true },
  // Ya existía en la base (coorganizador del Simposio de Dermatología 2024).
  { clave: 'Dermatología', slug: 'colegio-de-dermatologia-de-chiapas', nombre: 'Colegio de Chiapas de Dermatología, A.C.', nombreAnterior: 'Colegio de Dermatología de Chiapas', tipo: 'COLEGIO', municipio: 'Tuxtla Gutiérrez', logo: true },
  { clave: 'Ginecólogas/os y Obstetras', slug: 'colegio-de-ginecologas-os-y-obstetras', nombre: 'Colegio de Ginecólogas, Ginecólogos y Obstetras en Chiapas, A.C.', nombreAnterior: 'Colegio de Ginecólogas/os y Obstetras', tipo: 'COLEGIO', logo: true },
  { clave: 'Medicina Familiar', slug: 'colegio-de-medicina-familiar', nombre: 'Colegio de Especialistas en Medicina Familiar del Estado de Chiapas', nombreAnterior: 'Colegio de Medicina Familiar', tipo: 'COLEGIO', logo: true },
  { clave: 'Medicina General', slug: 'colegio-de-medicina-general', nombre: 'Colegio de Medicina General y Profesionales de Salud del Estado de Chiapas', nombreAnterior: 'Colegio de Medicina General', siglas: 'COMEGPSECH', tipo: 'COLEGIO', logo: true },
  { clave: 'Neurociencias', slug: 'colegio-de-neurociencias', nombre: 'Colegio de Neurociencias del Estado de Chiapas, A.C.', nombreAnterior: 'Colegio de Neurociencias', siglas: 'CONECH', tipo: 'COLEGIO', logo: true },
  { clave: 'Oftalmología', slug: 'colegio-de-oftalmologos-del-estado-de-chiapas', nombre: 'Colegio de Oftalmólogos del Estado de Chiapas', tipo: 'COLEGIO', municipio: 'Tuxtla Gutiérrez', presidenciaDesde: '2026-01-01', periodo: '2026–2027', logo: true },
  { clave: 'Otorrinolaringología', slug: 'colegio-de-otorrinolaringologia', nombre: 'Colegio de Otorrinolaringología y Cirugía de Cabeza y Cuello del Estado de Chiapas, A.C.', nombreAnterior: 'Colegio de Otorrinolaringología', tipo: 'COLEGIO', logo: true },
  { clave: 'Pediatría', slug: 'colegio-de-pediatria', nombre: 'Colegio de Pediatría del Estado de Chiapas Centro, A.C.', nombreAnterior: 'Colegio de Pediatría', tipo: 'COLEGIO', logo: true },
  { clave: 'Psicología', slug: 'colegio-de-psicologia', nombre: 'Colegio de Profesionales en Psicología del Estado de Chiapas', nombreAnterior: 'Colegio de Psicología', siglas: 'COPPSECH', tipo: 'COLEGIO', logo: true },
  { clave: 'Químicos', slug: 'colegio-de-quimicos', nombre: 'Colegio de Químicos de Chiapas', nombreAnterior: 'Colegio de Químicos', tipo: 'COLEGIO', logo: true },
  { clave: 'Reumatología', slug: 'colegio-de-reumatologia', nombre: 'Colegio de Reumatología', tipo: 'COLEGIO', logo: true },
  { clave: 'San Cristóbal de las Casas', slug: 'colegio-de-san-cristobal-de-las-casas', nombre: 'Colegio Médico de San Cristóbal, A.C. «Dr. Clemente Robles Castillo»', nombreAnterior: 'Colegio de San Cristóbal de las Casas', tipo: 'COLEGIO', municipio: 'San Cristóbal de las Casas', logo: true },
  { clave: 'Trabajo Social', slug: 'colegio-de-trabajo-social', nombre: 'Colegio de Trabajadores Sociales del Estado de Chiapas', nombreAnterior: 'Colegio de Trabajo Social', siglas: 'COTRASECH', tipo: 'COLEGIO', logo: true },
  { clave: 'Traumatología', slug: 'colegio-de-ortopedia-y-traumatologia-de-chiapas', nombre: 'Colegio de Ortopedia y Traumatología de Chiapas', siglas: 'COTECH', tipo: 'COLEGIO', municipio: 'Tuxtla Gutiérrez', logo: true },
  { clave: 'Médicos Ecografistas de Chiapas', slug: 'colegio-de-medicos-ecografistas-de-chiapas', nombre: 'Colegio de Médicos en Ecografía Diagnóstica del Estado de Chiapas, A.C.', nombreAnterior: 'Colegio de Médicos Ecografistas de Chiapas', siglas: 'COMEDECH', tipo: 'COLEGIO', logo: true },
  { clave: 'Urgenciólogos', slug: 'colegio-de-urgenciologos', nombre: 'Colegio de Medicina de Urgencias Chiapas, A.C.', nombreAnterior: 'Colegio de Urgenciólogos', tipo: 'COLEGIO', logo: true },
]

export const COLEGIOS_AFILIADOS = COLEGIOS

/** Colegio de un presidente (por la clave de MESA_DIRECTIVA_2026.presidentes). */
export const colegioPorClave = (clave: string) => COLEGIOS.find(c => c.clave === clave)

/** Logotipo estático de un colegio del directorio, por su slug (si se tiene). */
export function logoColegio(slug: string): string | undefined {
  return COLEGIOS.find(c => c.slug === slug)?.logo ? `/img/colegios/${slug}.webp` : undefined
}

/** Colegios con logotipo, para el carrusel de la portada. */
export const LOGOS_COLEGIOS = COLEGIOS.filter(c => c.logo).map(c => ({ slug: c.slug, nombre: c.nombre, logo: `/img/colegios/${c.slug}.webp` }))
