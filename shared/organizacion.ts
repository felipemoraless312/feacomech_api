// Contenido institucional del portal (documento «Página web de la FEACOMECH»).
// Textos editoriales que aún no se capturan en la plataforma. Lo que dependa de datos
// (misión, visión, colegios, noticias) sigue viniendo de la base.

import { MESA_DIRECTIVA_2026 } from './jornadas2026-programa'

/** Fotografía de la presidenta recortada al rostro para avatares (original: /img/personas/fanny-kramsky.jpg). */
export const FOTO_PRESIDENTA = '/img/personas/fanny-kramsky-rostro.jpg'

/** Mensaje de bienvenida de la presidencia. BORRADOR: pendiente de revisión por la Dra. Kramsky. */
export const BIENVENIDA = {
  autora: 'Dra. Fanny Kramsky Soto',
  foto: FOTO_PRESIDENTA,
  cargo: 'Presidenta de la FEACOMECH · Bienio 2026–2028',
  parrafos: [
    'Les doy la más cordial bienvenida a la Federación de Asociaciones y Colegios Médicos del Estado de Chiapas, la casa común de los colegios y asociaciones de profesionales de la salud de nuestro estado.',
    'Nuestra Federación nace de una convicción: unidos somos más fuertes. Juntos defendemos el ejercicio digno y seguro de nuestras profesiones, impulsamos la actualización académica permanente y tendemos puentes con las instituciones para que la población chiapaneca reciba una atención de mayor calidad.',
    'En este bienio trabajaremos para que cada colegio agremiado y cada profesional encuentre en la Federación respaldo legal, oportunidades de formación y certificación, y un espacio de encuentro con colegas de todas las especialidades y regiones del estado.',
    'Les invito a conocer nuestro trabajo, a participar en nuestras actividades y a sumarse a esta gran comunidad de la salud en Chiapas.',
  ],
}

/** Objetivo general (se complementa con misión, visión y objetivos capturados en la plataforma). */
export const OBJETIVO_GENERAL
  = 'Agrupar, representar y fortalecer a los colegios y asociaciones de profesionales de la salud del Estado de Chiapas, promoviendo la actualización académica, la ética profesional y la defensa del acto médico en beneficio de sus agremiados y de la sociedad.'

export interface Integrante { cargo: string, nombre: string, resena?: string, foto?: string }

/**
 * Fotografías disponibles por nombre (las demás muestran iniciales). Son recortes al rostro
 * en /public/img/personas; el archivo original se conserva junto a cada uno sin el sufijo «_rostro».
 */
const FOTOS: Record<string, string> = {
  'Dra. Fanny Kramsky Soto': FOTO_PRESIDENTA,
  'Dr. José Ricardo Tovilla Victoria': '/img/personas/jose-ricardo-tovilla-victoria-rostro.jpg',
  'Dr. Hernán León Velasco': '/img/personas/hernan-leon-velasco-rostro.jpg',
  'Dr. Didier Gómez Trujillo': '/img/personas/didier-gomez-trujillo-rostro.jpg',
  'Dr. Alexander Arroyo Núñez': '/img/personas/alexander-arroyo-nunez-rostro.jpg',
}

/**
 * Fotos sin fondo en /public/img/personas/recortes (busto, 560×700, WebP transparente), para
 * mostrar a la persona sobre el escudo de la Federación en su página. Se generan con rembg
 * (modelo u2net_human_seg); si no hay, se usa el retrato con marco de arco.
 */
const RECORTES: Record<string, string> = {
  'Dra. Fanny Kramsky Soto': '/img/personas/recortes/fanny-kramsky.webp',
  'Dr. Alexander Arroyo Núñez': '/img/personas/recortes/alexander-arroyo-nunez.webp',
  'Dr. Hernán León Velasco': '/img/personas/recortes/hernan-leon-velasco.webp',
  'Dr. José Ricardo Tovilla Victoria': '/img/personas/recortes/jose-ricardo-tovilla-victoria.webp',
}

/** Retratos verticales para la página de cada persona (si no hay, se usa el recorte al rostro). */
const RETRATOS: Record<string, string> = {
  'Dra. Fanny Kramsky Soto': '/img/personas/fanny-kramsky.jpg',
  'Dr. Hernán León Velasco': '/img/personas/hernan-leon-velasco.jpg',
  'Dr. José Ricardo Tovilla Victoria': '/img/personas/jose-ricardo-tovilla-victoria.jpg',
  'Dr. Alexander Arroyo Núñez': '/img/personas/alexander-arroyo-nunez.jpg',
}

/**
 * Reseñas curriculares de la mesa directiva, por nombre. Párrafos separados por una línea en
 * blanco. Se agregan conforme cada integrante entrega su perfil (documento revisado y corregido).
 */
const RESENAS: Record<string, string> = {
  // «Perfil profesional Alexander Arroyo Núñez FEACOMECH.docx», noviembre de 2026.
  'Dr. Alexander Arroyo Núñez': [
    'Profesor e investigador en ingeniería con más de 25 años de trayectoria ininterrumpida en el desarrollo tecnológico. Su carrera se distingue por su dedicación a la investigación, la docencia y el avance científico; en la Federación aporta su experiencia como asesor tecnológico de la comunidad de profesionales de la salud.',
    'Es ingeniero en Electrónica por el Instituto Tecnológico de Tuxtla Gutiérrez, maestro en Ciencias en Ingeniería Electrónica por la Universidad Politécnica de Valencia (España) y doctor en Ingeniería Aplicada por la Universidad TENAM. Ha cursado además estudios de posgrado, alta especialidad y diplomados en instituciones nacionales e internacionales.',
    'Durante casi diez años fue jefe de proyectos en un grupo de investigación del Instituto ITACA, en la Ciudad Politécnica de la Innovación de la Universidad Politécnica de Valencia. Fue director de Ingeniería Biomédica en la Universidad Politécnica de Chiapas por más de siete años y, a nivel nacional, coordinó el diseño curricular del programa de Ingeniería Biomédica del subsistema de Universidades Tecnológicas y Politécnicas.',
    'Es autor de múltiples artículos científicos y ha sido ponente en congresos nacionales e internacionales. Ha contribuido a la formación de numerosas generaciones de ingenieros en Biomédica y Mecatrónica. Por su aportación y apoyo a la FEACOMECH, fue invitado a integrar la Mesa Directiva como Secretario Administrativo para el bienio 2026–2028.',
  ].join('\n\n'),
}

/** Mesa directiva vigente. Las reseñas curriculares se agregan conforme se reciban. */
export const MESA_DIRECTIVA: { periodo: string, integrantes: Integrante[] } = {
  periodo: 'Bienio 2026–2028',
  integrantes: MESA_DIRECTIVA_2026.cargos.map(c => ({ ...c, foto: FOTOS[c.nombre], resena: RESENAS[c.nombre] })),
}

/** Consejo consultivo: integrado por los expresidentes de la Federación. */
export const CONSEJO_CONSULTIVO: Integrante[] = MESA_DIRECTIVA_2026.consejo.map((c) => {
  const nombre = c.nombre.replace('Radamez', 'Radamés').replace('Dr. Ricardo Tovilla', 'Dr. José Ricardo Tovilla')
  return { cargo: c.finado ? 'Consejero (†)' : 'Consejero', nombre, foto: FOTOS[nombre] }
})

export interface Expresidente {
  nombre: string
  periodo: string
  /** Año para ordenar; null si aún no está documentado. */
  desde: number | null
  finado?: boolean
  resena?: string
  logros?: string[]
  foto?: string
}

/** Presidentes de la Federación, del más antiguo al más reciente. */
const LISTA_EXPRESIDENTES: Expresidente[] = [
  {
    nombre: 'Dr. Hernán León Velasco',
    periodo: 'Periodo por documentar',
    desde: null,
    resena: 'Expresidente de la Federación. La gestión 2022–2024 llevó su nombre en reconocimiento a su trayectoria.',
  },
  {
    nombre: 'Dr. José Ricardo Tovilla Victoria',
    periodo: '2020 – 2022',
    desde: 2020,
    finado: true,
    resena: 'Presidente de la Federación durante la pandemia de COVID-19.',
    logros: [
      'Pronunciamiento ante el Gobierno del Estado sobre la reapertura durante la pandemia (2020).',
      'Firma del convenio con el Congreso del Estado para acciones de capacitación y promoción en salud pública (enero de 2021).',
      'La Federación llegó a agrupar 28 colegios.',
    ],
  },
  {
    nombre: 'Dr. Radamés Ramírez Cano',
    periodo: '2022 – 2024',
    desde: 2022,
    resena: 'Encabezó la gestión «Dr. Hernán León Velasco».',
  },
  {
    nombre: 'Dr. Didier Gómez Trujillo',
    periodo: '2024 – 2026',
    desde: 2024,
    resena: 'Médico especialista en ortopedia y traumatología, originario de Ocozocoautla. Expresidente del Colegio de Traumatología y Ortopedia de Chiapas (COTECH) y exvocal de la Federación Mexicana de Colegios de Ortopedia y Traumatología (FEMECOT), que lo reconoció en 2022 y 2023. Autor de «Letras tiernas» (2002), «Caminando entre versos» (2004) e «Historia del Hospital Regional» (2006).',
    logros: [
      'Simposio de Dermatología con el Colegio de Dermatología de Chiapas (2024).',
      'Participación en el programa «Me emociona tu salud» de consultas con descuento.',
      'Incorporación al proyecto «Nueva Era en Salud» de la Secretaría de Salud estatal (2025).',
      'Pronunciamiento contra la criminalización del acto médico (2025).',
      'Jornadas Médicas FEACOMECH 2025 y VII Jornadas Académicas 2026.',
    ],
  },
]

export const EXPRESIDENTES: Expresidente[] = LISTA_EXPRESIDENTES.map(e => ({ ...e, foto: e.foto ?? FOTOS[e.nombre] }))

/** Presidencia en funciones (cierra la línea del tiempo de expresidentes). */
export const PRESIDENCIA_ACTUAL = { nombre: 'Dra. Fanny Kramsky Soto', periodo: '2026 – 2028', foto: FOTO_PRESIDENTA }

export const BENEFICIOS = [
  {
    icono: 'i-lucide-scale',
    titulo: 'Asesoría legal',
    texto: 'Orientación jurídica ante quejas, demandas y procesos relacionados con el ejercicio profesional, y respaldo de la Federación en la defensa del acto médico.',
  },
  {
    icono: 'i-lucide-calendar-check',
    titulo: 'Apoyo en la organización de eventos',
    texto: 'Acompañamiento a los colegios en congresos, simposios y jornadas: aval académico, difusión, logística, sedes y emisión de constancias.',
  },
  {
    icono: 'i-lucide-graduation-cap',
    titulo: 'Cursos y certificaciones',
    texto: 'Programa de educación médica continua con valor curricular, talleres y vinculación con los consejos de certificación de cada especialidad.',
  },
  {
    icono: 'i-lucide-ticket-percent',
    titulo: 'Promociones, convenios y eventos',
    texto: 'Derecho a todas las promociones y convenios que la Federación celebre con empresas e instituciones, y acceso preferente a sus eventos.',
  },
]

export const ADMISION = {
  colegio: {
    titulo: '¿Cómo puede incorporar mi colegio a la Federación?',
    intro: 'Pueden afiliarse los colegios y asociaciones de profesionales de la salud legalmente constituidos en el Estado de Chiapas.',
    pasos: [
      { titulo: 'Solicitud', texto: 'Envíe una solicitud por escrito, firmada por la presidencia del colegio, dirigida a la Mesa Directiva de la Federación.' },
      { titulo: 'Documentación', texto: 'Acta constitutiva y estatutos, acta de la mesa directiva vigente, padrón de agremiados y datos de contacto del colegio.' },
      { titulo: 'Revisión', texto: 'La Mesa Directiva revisa el expediente y, en su caso, presenta la solicitud para su aprobación.' },
      { titulo: 'Incorporación', texto: 'Una vez aprobada, el colegio se integra al directorio de la Federación y su presidencia se suma a las sesiones de trabajo.' },
    ],
  },
  individual: {
    titulo: '¿Cómo me incorporo de manera individual como profesional de la salud?',
    intro: 'La afiliación individual se realiza a través de un colegio o asociación agremiada a la Federación.',
    pasos: [
      { titulo: 'Elija su colegio', texto: 'Consulte el directorio de colegios agremiados y ubique el de su especialidad o región.' },
      { titulo: 'Afíliese al colegio', texto: 'Contacte a su mesa directiva y cubra los requisitos de membresía del colegio.' },
      { titulo: 'Registro en la plataforma', texto: 'Su colegio lo da de alta en la plataforma de la Federación, donde tendrá su perfil profesional, constancias y acceso a la comunidad.' },
    ],
    nota: 'Si en su especialidad o región aún no existe un colegio agremiado, escríbanos y le orientaremos.',
  },
}

/**
 * Logotipos de instituciones con las que hay vinculación, en /public/img/vinculacion (cuadrados,
 * fondo blanco). Se usan mientras el vínculo no tenga un logo subido desde la plataforma; los
 * originales recibidos están en docs/imagenes-originales/vinculacion.
 */
const LOGOS_VINCULOS: { claves: string[], logo: string, horizontal?: string }[] = [
  { claves: ['congreso', 'chiapas'], logo: '/img/vinculacion/congreso-chiapas.webp', horizontal: '/img/vinculacion/congreso-chiapas-horizontal.webp' },
  { claves: ['secretaria', 'salud'], logo: '/img/vinculacion/salud-chiapas.webp' },
]

const sinAcentos = (t: string) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/**
 * Logo estático de una institución vinculada, por su nombre (tolera acentos y mayúsculas).
 * `horizontal` da la versión completa con texto, si existe, para espacios anchos.
 */
export function logoVinculo(nombre: string, forma: 'cuadrado' | 'horizontal' = 'cuadrado'): string | undefined {
  const n = sinAcentos(nombre)
  const l = LOGOS_VINCULOS.find(l => l.claves.every(c => n.includes(c)))
  return forma === 'horizontal' ? (l?.horizontal ?? l?.logo) : l?.logo
}

// -----------------------------------------------------------------------------
//  Personas con página propia: /organizacion/<slug>
// -----------------------------------------------------------------------------

export interface Persona extends Integrante {
  /** Identificador de la dirección: nombre sin título, sin acentos y con guiones. */
  slug: string
  organo: 'Mesa directiva' | 'Consejo consultivo'
  periodo: string
  /** Foto vertical para la página (o el recorte al rostro). */
  retrato?: string
  /** La misma foto sin fondo (PNG/WebP transparente): se muestra sobre el escudo. */
  recorte?: string
}

/** «Dr. Alexander Arroyo Núñez» → «alexander-arroyo-nunez». */
export function slugPersona(nombre: string): string {
  return sinAcentos(nombre)
    .split(/\s+/)
    .filter(p => p && !p.endsWith('.'))
    .join('-')
    .replace(/[^a-z0-9-]/g, '')
}

const comoPersona = (i: Integrante, organo: Persona['organo'], periodo: string): Persona => ({
  ...i,
  slug: slugPersona(i.nombre),
  organo,
  periodo,
  retrato: RETRATOS[i.nombre] ?? i.foto,
  recorte: RECORTES[i.nombre],
})

/** Mesa directiva y consejo consultivo. Los consejeros toman su reseña de la galería de expresidentes. */
export const PERSONAS: Persona[] = [
  ...MESA_DIRECTIVA.integrantes.map(i => comoPersona(i, 'Mesa directiva', MESA_DIRECTIVA.periodo)),
  ...CONSEJO_CONSULTIVO.map(i => comoPersona(
    { ...i, resena: i.resena ?? EXPRESIDENTES.find(e => e.nombre === i.nombre)?.resena },
    'Consejo consultivo',
    MESA_DIRECTIVA.periodo,
  )),
]

export function buscarPersona(slug: string): Persona | undefined {
  return PERSONAS.find(p => p.slug === slug)
}
