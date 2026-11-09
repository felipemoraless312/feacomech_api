// VII Jornadas Académicas FEACOMECH y Simposio de Dermatología 2026.
// Fuente: documentos oficiales del Comité organizador (public/jornadas/*.pdf) y el Linktree
// de la Federación. Al cambiar algo aquí cambia el micrositio (/jornadas-2026) y el evento sembrado.

export const JORNADAS_2026 = {
  slug: 'jornadas-academicas-feacomech-2026',
  edicion: 'VII',
  titulo: 'Jornadas Académicas FEACOMECH',
  subtitulo: 'Simposio de Dermatología',
  anio: 2026,
  bienio: 'Bienio 2026 – 2028 «Dr. Issel Gutiérrez Mandujano»',
  fechas: '26, 27 y 28 de noviembre de 2026',
  inicio: '2026-11-26T08:00:00-06:00',
  fin: '2026-11-28T16:00:00-06:00',
  cierreInscripciones: '2026-11-15T23:59:00-06:00',

  sede: {
    nombre: 'Centro de Convenciones Polyforum Chiapas',
    direccion: 'Andrés Serra Rojas S/N, El Retiro, 29040 Tuxtla Gutiérrez, Chiapas',
    mapa: 'https://www.google.com/maps?cid=14121331016171171610',
    mapaEmbebido: 'https://maps.google.com/maps?q=Polyforum%20Chiapas%2C%20Andr%C3%A9s%20Serra%20Rojas%2C%20El%20Retiro%2C%20Tuxtla%20Guti%C3%A9rrez&z=16&output=embed',
  },

  contacto: {
    telefono: '961 267 3656',
    whatsapp: 'https://wa.me/529612673656',
    facebook: 'https://www.facebook.com/feacomech',
    correoCarteles: 'fkramsky@gmail.com',
  },

  /** Cuotas de inscripción en MXN. La reducida aplicó hasta el 15 de octubre. */
  cuotas: {
    limiteReducida: '2026-10-15T23:59:00-06:00',
    categorias: [
      { nombre: 'Médicos colegiados', nota: 'Integrantes de un colegio o asociación afiliada', reducida: 500, regular: 600 },
      { nombre: 'Médicos no colegiados', nota: 'Médicos generales y especialistas', reducida: 600, regular: 700 },
      { nombre: 'Estudiantes y áreas afines a la salud', nota: 'Con credencial vigente', reducida: 450, regular: 550 },
    ],
  },

  talleres: {
    costo: 400,
    lista: [
      { dia: 'Jueves 26 de noviembre', fecha: '2026-11-26', titulo: 'Electrocardiografía para Médicos Generales', icono: 'i-lucide-heart-pulse', horario: '16:00–18:00 h', imparte: 'Dr. Arturo Piña Flores, cardiólogo intervencionista', lugar: 'Salón Misolha' },
      { dia: 'Viernes 27 de noviembre', fecha: '2026-11-27', titulo: 'Accesos Vasculares', icono: 'i-lucide-syringe', horario: '16:00–18:00 h', imparte: 'Dr. Víctor Manuel Blanco Martínez, accesos vasculares ecoguiados', lugar: 'Salón Misolha' },
    ],
  },

  cena: { titulo: 'Cena de Gala FEACOMECH', lugar: 'Salón Palenque', costo: 1000, cuando: 'Sábado 28 de noviembre, 20:30 h', detalle: 'Con la toma de protesta de la nueva Mesa Directiva, Bienio 2026 – 2028.' },

  pago: {
    titular: 'Federación de Asociaciones y Colegios Médicos del Estado de Chiapas A.C.',
    banco: 'BBVA',
    cuenta: '0108 4802 22',
    clabe: '0121 0000 1084 80222 1',
    ventaFisica: {
      lugar: 'Dermathelia Clínica Dermatológica',
      direccion: 'Blvd. San Cristóbal #139, Col. Moctezuma, Tuxtla Gutiérrez, Chiapas',
    },
    factura: 'Si requiere factura, solicítela en el mismo mes de la compra del boleto y envíe sus datos fiscales.',
  },

  carteles: {
    recepcionDesde: '2026-09-15',
    recepcionHasta: '2026-10-30T23:59:00-06:00',
    dirigidoA: [
      'Médicos residentes de cualquier especialidad',
      'Médicos generales y de Medicina Familiar',
      'Médicos de otras especialidades',
      'Trabajadores de áreas afines a la salud',
    ],
    normas: [
      'Metodología cualitativa, cuantitativa o mixta.',
      'Un autor y hasta 2 coautores; subrayar a quien presentará. Nombres como aparecen en la INE.',
      'Resumen de hasta 300 palabras; título descriptivo sin abreviaturas, máximo 15 palabras.',
      'Estructura: objetivo general, metodología, muestreo, resultados, conclusiones y referencias.',
      'Aprobación del Comité de Investigación y de Ética de su institución (número de registro).',
    ],
    cartel: [
      '120 cm de alto × 90 cm de ancho, una sola pieza, en papel bond o fotográfico.',
      'Arial o Times New Roman en negro: título 70 pt, subtítulos 36–46 pt, texto 24–26 pt.',
      'Fondo claro, sólo las tablas y gráficas necesarias y correo del autor al pie.',
      'Sin referencias, agradecimientos ni palabras clave; se sugiere un código QR al trabajo completo.',
    ],
    presentacion: 'Exposición presencial de 12 minutos: 10 de presentación y 2 de preguntas del jurado. Retirar el cartel el 28 de noviembre antes de las 16:00 h.',
    evaluacion: 'Dos investigadores médicos del área evalúan el resumen y la presentación con instrumentos validados.',
    beneficios: [
      'Respuesta por correo en un máximo de 7 días, con oficio y número de folio.',
      'Beca en la inscripción para quien presenta un trabajo aceptado.',
      'Tres primeros lugares con diploma y premio; constancia con valor curricular para todos.',
    ],
  },

  colegios: [
    'Colegio de Chiapas de Dermatología',
    'Colegio de Profesionales de la Salud de Chiapas (CONEPSECH)',
    'Colegio de Especialistas en Medicina Familiar del Estado de Chiapas',
    'Colegio de Neurociencias del Estado de Chiapas (CONECH)',
    'Colegio de Anestesiología del Estado de Chiapas',
    'Colegio de Angiología, Cirujanos Vasculares y Endovasculares de Chiapas (CACVECH)',
    'Colegio de Trabajadores Sociales del Estado de Chiapas (COTRASECH)',
    'Colegio de Cirujanos Plásticos, Estéticos y Reconstructivos del Estado de Chiapas',
    'Colegio de Medicina de Urgencias Chiapas',
    'Colegio de Químicos de Chiapas',
    'Colegio de Profesionales en Psicología del Estado de Chiapas (COPPSECH)',
    'Colegio de Médicos en Ecografía Diagnóstica de Chiapas (COMEDECH)',
    'Colegio de Ginecólogos y Obstetras en Chiapas',
    'Colegio de Médicos Anatomopatólogos del Estado de Chiapas',
    'Colegio de Oftalmólogos del Estado de Chiapas',
    'Colegio de Pediatría del Estado de Chiapas, Centro',
    'Colegio de Ortopedia y Traumatología de Chiapas (COTECH)',
    'Colegio de Reumatología',
    'Colegio de Cirujanos Dentistas de la Zona Centro de Chiapas',
    'Colegio de Otorrinolaringología y Cirugía de Cabeza y Cuello del Estado de Chiapas',
    'Colegio Médico de San Cristóbal «Dr. Clemente Robles Castillo»',
    'Asociación Médica de Comitán',
    'Universidad Politécnica de Chiapas',
  ],

  avales: ['Asociación Médica Mundial (WMA)', 'Colegio Médico de México (FENACOME)', 'Confederación Médica Latinoamericana y del Caribe'],

  patrocinadores: [
    'La Roche-Posay', 'Vichy', 'CeraVe', 'Elementré', 'Segle', 'Odellā', 'PiSA Farmacéutica', 'Bioderma', 'LEO Pharma', 'MartiDerm', 'ISDIN',
    'Catalysis', 'Dermix', 'Pierre Fabre', 'SVR', 'Uppharma', 'Gallantdale', 'Galderma', 'Genové', 'Colorescience', 'Patyka',
    'Acuderm', 'LabPiña', 'Lab Lam', 'Sanatorio Santa Cecilia', 'H&M Biomedical', 'ICSMISH', 'Megalabs',
    'Laboratorios Rovisan', 'Medical Legal Center', 'Armstrong', 'Instituto Avantilia', 'M8 Pharmaceuticals', 'Orthomaster', 'Chopo', 'Etrederm',
  ],

  documentos: [
    { titulo: 'Temario completo', archivo: '/jornadas/temario.pdf', icono: 'i-lucide-calendar-range' },
    { titulo: 'Inscripciones y datos de pago', archivo: '/jornadas/inscripciones-y-pagos.pdf', icono: 'i-lucide-receipt-text' },
    { titulo: 'Convocatoria de carteles científicos', archivo: '/jornadas/convocatoria-carteles.pdf', icono: 'i-lucide-presentation' },
  ],
} as const

export const pesos = (n: number) => `$${n.toLocaleString('es-MX')}`
