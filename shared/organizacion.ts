// Contenido institucional del portal (documento «Página web de la FEACOMECH»).
// Textos editoriales que aún no se capturan en la plataforma. Lo que dependa de datos
// (misión, visión, colegios, noticias) sigue viniendo de la base.

import { MESA_DIRECTIVA_2026 } from './jornadas2026-programa'

/** Mensaje de bienvenida de la presidencia. BORRADOR: pendiente de revisión por la Dra. Kramsky. */
export const BIENVENIDA = {
  autora: 'Dra. Fanny Kramsky Soto',
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

export interface Integrante { cargo: string, nombre: string, resena?: string }

/** Mesa directiva vigente. Las reseñas curriculares se agregan conforme se reciban. */
export const MESA_DIRECTIVA: { periodo: string, integrantes: Integrante[] } = {
  periodo: 'Bienio 2026–2028',
  integrantes: MESA_DIRECTIVA_2026.cargos.map(c => ({ ...c })),
}

/** Consejo consultivo: integrado por los expresidentes de la Federación. */
export const CONSEJO_CONSULTIVO: Integrante[] = MESA_DIRECTIVA_2026.consejo.map(c => ({
  cargo: c.finado ? 'Consejero (†)' : 'Consejero',
  nombre: c.nombre.replace('Radamez', 'Radamés').replace('Dr. Ricardo Tovilla', 'Dr. José Ricardo Tovilla'),
}))

export interface Expresidente {
  nombre: string
  periodo: string
  /** Año para ordenar; null si aún no está documentado. */
  desde: number | null
  finado?: boolean
  resena?: string
  logros?: string[]
}

/** Presidentes de la Federación, del más antiguo al más reciente. */
export const EXPRESIDENTES: Expresidente[] = [
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

/** Presidencia en funciones (cierra la línea del tiempo de expresidentes). */
export const PRESIDENCIA_ACTUAL = { nombre: 'Dra. Fanny Kramsky Soto', periodo: '2026 – 2028' }

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
