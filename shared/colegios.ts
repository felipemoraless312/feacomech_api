// Colegios y asociaciones afiliados a la FEACOMECH con su presidencia vigente (lista de
// presidentes de colegios, noviembre de 2026). El seed «datos reales» los da de alta en el
// directorio (/directorio/<slug>); `clave` coincide con MESA_DIRECTIVA_2026.presidentes[].colegio.
// Los nombres oficiales y siglas que constan en los currículums recibidos sustituyen al genérico.

export interface ColegioAfiliado {
  clave: string
  slug: string
  nombre: string
  siglas?: string
  tipo: 'COLEGIO' | 'ASOCIACION'
  municipio?: string
  /** Inicio de la presidencia vigente (aprox. si no consta en el currículum). */
  presidenciaDesde?: string
  /** Nombre del periodo de la presidencia, si consta. */
  periodo?: string
}

export const COLEGIOS_AFILIADOS: ColegioAfiliado[] = [
  { clave: 'Anatomopatología', slug: 'colegio-de-anatomopatologia', nombre: 'Colegio de Anatomopatología', tipo: 'COLEGIO' },
  { clave: 'Anestesiología', slug: 'colegio-de-anestesiologia-del-estado-de-chiapas', nombre: 'Colegio de Anestesiología del Estado de Chiapas', siglas: 'COANECH', tipo: 'COLEGIO', presidenciaDesde: '2025-01-01', periodo: '2025–2027' },
  { clave: 'Angiología', slug: 'colegio-de-angiologia', nombre: 'Colegio de Angiología', tipo: 'COLEGIO' },
  { clave: 'Cardiología', slug: 'colegio-de-cardiologia', nombre: 'Colegio de Cardiología', tipo: 'COLEGIO' },
  { clave: 'Cirugía Plástica', slug: 'colegio-de-cirugia-plastica', nombre: 'Colegio de Cirugía Plástica', tipo: 'COLEGIO' },
  { clave: 'Asociación Médica de Comitán', slug: 'asociacion-medica-de-comitan', nombre: 'Asociación Médica de Comitán', tipo: 'ASOCIACION', municipio: 'Comitán de Domínguez' },
  { clave: 'Cirujanos Dentistas', slug: 'colegio-de-cirujanos-dentistas', nombre: 'Colegio de Cirujanos Dentistas', tipo: 'COLEGIO' },
  // Ya existía en la base (coorganizador del Simposio de Dermatología 2024).
  { clave: 'Dermatología', slug: 'colegio-de-dermatologia-de-chiapas', nombre: 'Colegio de Dermatología de Chiapas', tipo: 'COLEGIO', municipio: 'Tuxtla Gutiérrez' },
  { clave: 'Ginecólogas/os y Obstetras', slug: 'colegio-de-ginecologas-os-y-obstetras', nombre: 'Colegio de Ginecólogas/os y Obstetras', tipo: 'COLEGIO' },
  { clave: 'Medicina Familiar', slug: 'colegio-de-medicina-familiar', nombre: 'Colegio de Medicina Familiar', tipo: 'COLEGIO' },
  { clave: 'Medicina General', slug: 'colegio-de-medicina-general', nombre: 'Colegio de Medicina General', tipo: 'COLEGIO' },
  { clave: 'Neurociencias', slug: 'colegio-de-neurociencias', nombre: 'Colegio de Neurociencias', tipo: 'COLEGIO' },
  { clave: 'Oftalmología', slug: 'colegio-de-oftalmologos-del-estado-de-chiapas', nombre: 'Colegio de Oftalmólogos del Estado de Chiapas', tipo: 'COLEGIO', municipio: 'Tuxtla Gutiérrez', presidenciaDesde: '2026-01-01', periodo: '2026–2027' },
  { clave: 'Otorrinolaringología', slug: 'colegio-de-otorrinolaringologia', nombre: 'Colegio de Otorrinolaringología', tipo: 'COLEGIO' },
  { clave: 'Pediatría', slug: 'colegio-de-pediatria', nombre: 'Colegio de Pediatría', tipo: 'COLEGIO' },
  { clave: 'Psicología', slug: 'colegio-de-psicologia', nombre: 'Colegio de Psicología', tipo: 'COLEGIO' },
  { clave: 'Químicos', slug: 'colegio-de-quimicos', nombre: 'Colegio de Químicos', tipo: 'COLEGIO' },
  { clave: 'Reumatología', slug: 'colegio-de-reumatologia', nombre: 'Colegio de Reumatología', tipo: 'COLEGIO' },
  { clave: 'San Cristóbal de las Casas', slug: 'colegio-de-san-cristobal-de-las-casas', nombre: 'Colegio de San Cristóbal de las Casas', tipo: 'COLEGIO', municipio: 'San Cristóbal de las Casas' },
  { clave: 'Trabajo Social', slug: 'colegio-de-trabajo-social', nombre: 'Colegio de Trabajo Social', tipo: 'COLEGIO' },
  { clave: 'Traumatología', slug: 'colegio-de-ortopedia-y-traumatologia-de-chiapas', nombre: 'Colegio de Ortopedia y Traumatología de Chiapas', siglas: 'COTECH', tipo: 'COLEGIO', municipio: 'Tuxtla Gutiérrez' },
  { clave: 'Médicos Ecografistas de Chiapas', slug: 'colegio-de-medicos-ecografistas-de-chiapas', nombre: 'Colegio de Médicos Ecografistas de Chiapas', tipo: 'COLEGIO' },
  { clave: 'Urgenciólogos', slug: 'colegio-de-urgenciologos', nombre: 'Colegio de Urgenciólogos', tipo: 'COLEGIO' },
]

/** Colegio de un presidente (por la clave de MESA_DIRECTIVA_2026.presidentes). */
export const colegioPorClave = (clave: string) => COLEGIOS_AFILIADOS.find(c => c.clave === clave)
