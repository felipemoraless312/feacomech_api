// Información pública REAL de FEACOMECH, recopilada de fuentes en internet (noviembre de 2026).
//   npm run db:datos-reales
// Cada dato cita su fuente. Las fechas que no constan con exactitud en las fuentes se marcan
// como aproximadas y deben validarse con las actas de la Federación. Idempotente.
//
// Fuentes:
//  [S] Secretaría de Salud de Chiapas, 8 ene 2025 — saludchiapas.gob.mx/noticias/post/federacion-de-asociaciones-y-colegios-medicos-de-chiapas-se-suma-al-proyecto-de-la-nueva-era-en-salud
//  [L] La Silla Rota, 13 jun 2025 — lasillarota.com/estados/2025/6/13/jonatan-el-nino-que-quedo-en-estado-vegetativo-…-452511.html
//  [D] Diario de Chiapas — «Alto a la criminalización» y «‘Lealtad y trabajo’, nueva directiva de la FEACOMECH»
//  [7] Sie7e de Chiapas, 4 sep 2024 — «Anuncian el Simposio de Dermatología en Tuxtla»
//  [N] Notinúcleo, 14 ene 2021 — «Congreso firma convenio con Federación de Asociaciones y Colegios Médicos»
//  [F] Página oficial de Facebook: facebook.com/feacomech (Tuxtla Gutiérrez; feacomechiapas@gmail.com)
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../server/generated/prisma/client'
import { JORNADAS_2026 as J } from '../../shared/jornadas2026'
import { PROGRAMA_2026 } from '../../shared/jornadas2026-programa'

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })
const dia = (iso: string) => new Date(`${iso}T00:00:00Z`)
const hora = (v: string) => new Date(`${v}:00-06:00`)

const URL_SALUD = 'https://saludchiapas.gob.mx/noticias/post/federacion-de-asociaciones-y-colegios-medicos-de-chiapas-se-suma-al-proyecto-de-la-nueva-era-en-salud'
const URL_SILLA = 'https://lasillarota.com/estados/2025/6/13/jonatan-el-nino-que-quedo-en-estado-vegetativo-tras-un-diagnostico-tardio-en-hospital-del-issste-en-chiapas-452511.html'
const URL_SIE7E = 'https://www.sie7edechiapas.com/post/anuncian-el-simposio-de-dermatolog%C3%ADa-en-tuxtla'
const URL_NOTINUCLEO = 'https://notinucleo.com/estado/congreso-firma-convenio-con-federacion-de-asociaciones-y-colegios-medicos/'
const URL_PROCESO = 'https://www.proceso.com.mx/nacional/2020/6/30/medicos-piden-reconsiderar-nueva-normalidad-en-chiapas-245301.html'
const URL_NOTILEGIS = 'https://comunicacionsocial.diputados.gob.mx/index.php/notilegis/anuncia-guillermo-rafael-santiago-programa-me-emociona-tu-salud-en-tuxtla-gutierrez-para-brindar-consultas-con-descuento-a-gente-de-bajos-recursos'
const URL_ULTIMATUM = 'https://ultimatumchiapas.com.mx/2024/07/19/didier-gomez/'
const URL_HERALDO_2026 = 'https://heraldodemexico.com.mx/nacional/2026/10/30/tuxtla-gutierrez-recibira-el-primer-congreso-internacional-de-emergencias-obstetricas-en-chiapas-919582.html'

/** Contenido destacado de la portada (cifras con fuente, trayectoria, cita, líneas, agenda). */
async function portada() {
  const valor = {
    cifras: [
      { valor: '1978', etiqueta: 'Año de origen como Colegio Médico', nota: 'Secretaría de Salud de Chiapas, 2025' },
      { valor: '28', etiqueta: 'Colegios agrupados', nota: 'Notinúcleo, enero de 2021' },
      { valor: '800+', etiqueta: 'Socios', nota: 'Notinúcleo, enero de 2021' },
      { valor: '300', etiqueta: 'Miembros', nota: 'Secretaría de Salud de Chiapas, enero de 2025' },
    ],
    hitos: [
      { anio: '1978', titulo: 'Nace como Colegio Médico', texto: 'El 30 de marzo de 1978 surge como Colegio Médico en Chiapas.' },
      { anio: '2012', titulo: 'Se constituye como Federación', texto: 'Eleva su denominación a Federación de Asociaciones y Colegios Médicos del Estado de Chiapas.' },
      { anio: '2020', titulo: 'Voz médica ante la pandemia', texto: 'Bajo la presidencia del Dr. José Ricardo Tovilla Victoria, pide al Gobierno del Estado reconsiderar la reapertura durante la COVID-19 y reforzar el uso de cubrebocas y la sana distancia.' },
      { anio: '2021', titulo: 'Convenio con el Congreso del Estado', texto: 'Firma un convenio de capacitación y promoción en salud pública; agrupa entonces 28 colegios.' },
      { anio: '2022', titulo: 'Gestión «Dr. Hernán León Velasco»', texto: 'Rinde protesta el Dr. Radamés Ramírez Cano para el periodo 2022–2024, que honra a un expresidente de la Federación.' },
      { anio: '2024', titulo: 'Simposio de Dermatología y salud accesible', texto: 'Con el Colegio de Dermatología de Chiapas organiza un simposio para 400 asistentes; en noviembre se anuncia el programa «Me emociona tu salud» de consultas con descuento.' },
      { anio: '2025', titulo: 'Nueva Era en Salud y defensa del acto médico', texto: 'Se suma al proyecto de la Secretaría de Salud, se pronuncia contra la criminalización del acto médico y celebra las Jornadas Médicas FEACOMECH 2025.' },
    ],
    cita: {
      texto: 'La salud es la prioridad que nos une.',
      autor: 'Dr. Didier Gómez Trujillo',
      cargo: 'Presidente de la FEACOMECH · enero de 2025',
    },
    lineas: [
      { icono: 'i-lucide-heart-pulse', titulo: 'Hábitos saludables', texto: 'Campañas de promoción de la salud para la población chiapaneca.' },
      { icono: 'i-lucide-microscope', titulo: 'Investigación', texto: 'Fomento a la investigación médica en el estado.' },
      { icono: 'i-lucide-graduation-cap', titulo: 'Educación médica continua', texto: 'Actualización de los profesionales mediante eventos académicos.' },
      { icono: 'i-lucide-chart-pie', titulo: 'Censo médico estatal', texto: 'Censo de profesionales de la salud por especialidad y disciplina.' },
      { icono: 'i-lucide-book-open', titulo: 'Planes de estudio', texto: 'Participación en el diseño curricular de las instituciones educativas afines a la salud.' },
      { icono: 'i-lucide-badge-check', titulo: 'Ejercicio regulado', texto: 'Regularización de quienes ejercen sin cédula profesional y de los establecimientos médicos.' },
    ],
    agenda: [
      { fecha: '2026-12-11', fin: '2026-12-12', titulo: 'Primer Congreso Internacional de Emergencias Obstétricas en Chiapas', lugar: 'Tuxtla Gutiérrez', organiza: 'Comité organizador del congreso (evento externo)', url: URL_HERALDO_2026 },
    ],
  }
  // No pisa una portada que ya editó la Federación (sólo una vacía o inexistente).
  const fila = await prisma.parametro.findUnique({ where: { clave: 'portada' } })
  const actual = fila?.valor as { cifras?: unknown[], hitos?: unknown[] } | undefined
  if (actual?.cifras?.length || actual?.hitos?.length) {
    console.log('  Portada ya configurada: no se sobrescribe.')
    return
  }
  await prisma.parametro.upsert({ where: { clave: 'portada' }, create: { clave: 'portada', valor }, update: { valor } })
  console.log('  Portada cargada.')
}

async function institucion() {
  const fila = await prisma.parametro.findUniqueOrThrow({ where: { clave: 'institucion' } })
  const actual = fila.valor as Record<string, string>
  const valor = {
    ...actual,
    nombre: 'Federación de Asociaciones y Colegios Médicos del Estado de Chiapas, A.C.',
    siglas: 'FEACOMECH',
    lema: 'Por la dignificación y unión profesional',
    ciudad: 'Tuxtla Gutiérrez, Chiapas',
    email: actual.email || 'feacomechiapas@gmail.com',
    facebook: 'https://www.facebook.com/feacomech/',
    presentacion: [
      'La Federación de Asociaciones y Colegios Médicos del Estado de Chiapas, A.C. (FEACOMECH) agrupa a colegios y asociaciones médicas de la entidad, con sede en Tuxtla Gutiérrez.',
      'Promueve la actualización académica de los profesionales de la salud, la vinculación con las instituciones públicas y la defensa del ejercicio digno de la medicina. De acuerdo con información difundida en enero de 2025, la integran 300 miembros.',
    ].join('\n\n'),
    historia: [
      'La Federación tiene su origen el 30 de marzo de 1978, cuando surgió como Colegio Médico. En 2012 elevó su denominación a Federación de Asociaciones y Colegios Médicos.',
      'En junio de 2020, en plena pandemia de COVID-19, la Federación pidió por carta al Gobierno del Estado reconsiderar la reapertura de actividades y reforzar el uso de cubrebocas y la sana distancia.',
      'En enero de 2021, bajo la presidencia del Dr. José Ricardo Tovilla Victoria, firmó un convenio con el Congreso del Estado de Chiapas para desarrollar acciones de capacitación y promoción en salud pública. En ese acto se informó que la Federación agrupaba 28 colegios.',
      'En 2022 rindió protesta como presidente el Dr. Radamés Ramírez Cano, en una gestión 2022–2024 que llevó el nombre del Dr. Hernán León Velasco, expresidente de la Federación.',
      'Bajo la presidencia del Dr. Didier Gómez Trujillo, en 2024 organizó con el Colegio de Dermatología de Chiapas un simposio sobre las dermatosis más frecuentes del estado y participó en el programa «Me emociona tu salud» de consultas con descuento; en enero de 2025 se sumó al proyecto «Nueva Era en Salud» de la Secretaría de Salud estatal, y en 2025 se pronunció públicamente contra la criminalización del acto médico. Ese mismo año celebró las Jornadas Médicas FEACOMECH 2025.',
      'Fuentes: Secretaría de Salud de Chiapas (2025), Proceso (2020), Notinúcleo (2021), Diario de Chiapas, Sie7e de Chiapas (2024), Notilegis (2024), Ultimátum Chiapas (2024) y La Silla Rota (2025).',
    ].join('\n\n'),
    objetivos: [
      'Líneas de trabajo que la Federación presentó a la Secretaría de Salud del Estado en enero de 2025:',
      '• Implementar campañas de hábitos saludables.\n• Fomentar la investigación.\n• Actualizar a los profesionales de la salud mediante eventos académicos.\n• Realizar un censo estatal de profesionales de la salud por especialidad y disciplina.\n• Participar en el diseño de los planes de estudio de las instituciones educativas afines a la salud.\n• Promover la regularización de quienes ejercen sin cédula profesional y de los establecimientos médicos.',
    ].join('\n\n'),
  }
  await prisma.parametro.update({ where: { clave: 'institucion' }, data: { valor } })
  console.log('  Datos institucionales actualizados.')
}

async function estructura() {
  const mesa = await prisma.organo.findFirst({ where: { organizacionId: null, tipo: 'MESA_DIRECTIVA' } })
  if (!mesa) throw new Error('Falta la estructura base: ejecute npm run db:seed')
  const presidencia = await prisma.cargo.findFirstOrThrow({ where: { organoId: mesa.id, nombre: 'Presidencia' } })
  const enlace = await prisma.cargo.findFirst({ where: { organoId: mesa.id, nombre: 'Coordinación de Enlace Legislativo' } })
    ?? await prisma.cargo.create({ data: { organoId: mesa.id, nombre: 'Coordinación de Enlace Legislativo', orden: 9, superiorId: presidencia.id, activo: false } })

  const aprox = 'Fechas aproximadas a partir de notas de prensa; deben validarse con las actas de la Federación.'
  const periodo = async (nombre: string, inicio: string, fin: string | null) =>
    await prisma.periodo.findFirst({ where: { organizacionId: null, nombre } })
    ?? await prisma.periodo.create({ data: { nombre, inicio: dia(inicio), fin: fin ? dia(fin) : null, descripcion: aprox } })

  const p2020 = await periodo('2020–2022', '2020-01-01', '2021-12-31')
  const p2022 = await periodo('2022–2024 «Dr. Hernán León Velasco»', '2022-01-01', '2024-08-31')
  const actual = await periodo('Gestión actual', '2024-09-01', null)

  const nombrar = async (d: { cargoId: string, periodoId: string, nombre: string, inicio: string, fin: string | null, estado: 'VIGENTE' | 'CONCLUIDO', descripcion: string }) => {
    if (await prisma.nombramiento.findFirst({ where: { cargoId: d.cargoId, nombrePersona: d.nombre } })) return
    await prisma.nombramiento.create({
      data: { cargoId: d.cargoId, periodoId: d.periodoId, nombrePersona: d.nombre, inicio: dia(d.inicio), fin: d.fin ? dia(d.fin) : null, estado: d.estado, publicado: true, descripcion: d.descripcion },
    })
  }
  await nombrar({ cargoId: presidencia.id, periodoId: p2020.id, nombre: 'Dr. José Ricardo Tovilla Victoria', inicio: '2020-01-01', fin: '2021-12-31', estado: 'CONCLUIDO', descripcion: 'Presidente de la Federación; en enero de 2021 encabezó la firma del convenio con el Congreso del Estado.' })
  await nombrar({ cargoId: enlace.id, periodoId: p2020.id, nombre: 'Humberto Idelfonso Hernández Rojas', inicio: '2020-01-01', fin: '2021-12-31', estado: 'CONCLUIDO', descripcion: 'Coordinador de Enlace Legislativo de la Federación (2021).' })
  await nombrar({ cargoId: presidencia.id, periodoId: p2022.id, nombre: 'Dr. Radamés Ramírez Cano', inicio: '2022-01-01', fin: '2024-08-31', estado: 'CONCLUIDO', descripcion: 'Presidente de la Federación en la gestión 2022–2024.' })
  await nombrar({ cargoId: presidencia.id, periodoId: actual.id, nombre: 'Dr. Didier Gómez Trujillo', inicio: '2024-09-01', fin: null, estado: 'VIGENTE', descripcion: 'Médico especialista en ortopedia y traumatología. Presidente de la Federación según comunicados públicos de 2024 y 2025.' })
  // Ultimátum Chiapas (19 jul 2024) ya lo presenta como presidente: se ajustan fechas aproximadas.
  await prisma.periodo.update({ where: { id: p2022.id }, data: { fin: dia('2024-06-30') } })
  await prisma.periodo.update({ where: { id: actual.id }, data: { inicio: dia('2024-07-01') } })
  await prisma.nombramiento.updateMany({ where: { cargoId: presidencia.id, nombrePersona: 'Dr. Radamés Ramírez Cano' }, data: { fin: dia('2024-06-30') } })
  await prisma.nombramiento.updateMany({
    where: { cargoId: presidencia.id, nombrePersona: 'Dr. Didier Gómez Trujillo' },
    data: {
      inicio: dia('2024-07-01'),
      descripcion: 'Médico especialista en ortopedia y traumatología, originario de Ocozocoautla. Expresidente del Colegio de Traumatología y Ortopedia de Chiapas (COTECH), exvocal de la Federación Mexicana de Colegios de Ortopedia y Traumatología (FEMECOT), que lo reconoció en 2022 y 2023 por su aporte a la ortopedia nacional. Autor de «Letras tiernas» (2002), «Caminando entre versos» (2004) e «Historia del Hospital Regional» (2006). Fuente: Ultimátum Chiapas, 19 de julio de 2024.',
    },
  })
  await prisma.nombramiento.updateMany({
    where: { cargoId: presidencia.id, nombrePersona: 'Dr. José Ricardo Tovilla Victoria' },
    data: { descripcion: 'Presidente de la Federación. En 2020 encabezó el pronunciamiento ante la reapertura durante la pandemia y en enero de 2021 la firma del convenio con el Congreso del Estado.' },
  })
  console.log('  Mesa directiva: presidencias 2020–2022, 2022–2024 y actual.')
}

async function organizaciones() {
  const slug = 'colegio-de-dermatologia-de-chiapas'
  let o = await prisma.organizacion.findUnique({ where: { slug } })
  if (!o) {
    o = await prisma.organizacion.create({
      data: {
        slug,
        tipo: 'COLEGIO',
        nombre: 'Colegio de Dermatología de Chiapas',
        municipio: 'Tuxtla Gutiérrez',
        descripcion: 'Colegio de médicos dermatólogos de Chiapas. En 2024, presidido por la Dra. Fanny Kramsky Soto, organizó junto con la Federación el Simposio de Dermatología en Tuxtla Gutiérrez.',
        estadoAfiliacion: 'EN_TRAMITE',
        afiliaciones: { create: { estado: 'EN_TRAMITE', desde: dia('2024-09-04'), motivo: 'Registrado a partir de información pública (coorganizador de un evento con la Federación). Falta confirmar su afiliación formal.' } },
        grupo: { create: { tipo: 'ORGANIZACION', privacidad: 'PRIVADO', nombre: 'Colegio de Dermatología de Chiapas', slug: `org-${slug}`, descripcion: 'Espacio de comunicación de los integrantes de la organización.' } },
      },
    })
    console.log('  Organización: Colegio de Dermatología de Chiapas (afiliación por confirmar).')
  }
  return o
}

async function evento(dermatologia: { id: string }) {
  const slug = 'simposio-de-dermatologia-2024'
  if (await prisma.evento.findUnique({ where: { slug } })) return
  await prisma.evento.create({
    data: {
      slug,
      tipo: 'CONFERENCIA',
      titulo: 'Simposio de Dermatología: las 10 dermatosis más frecuentes de Chiapas',
      descripcion: [
        'Simposio organizado por la Federación de Asociaciones y Colegios Médicos del Estado de Chiapas y el Colegio de Dermatología de Chiapas, dirigido a médicos generales, especialistas, estudiantes y personal de enfermería.',
        'Abordó las diez dermatosis más frecuentes en Chiapas, con conferencias magistrales. Tuvo cupo presencial de 400 personas y transmisión en línea para quienes viven fuera de la capital.',
        `Fuente: Sie7e de Chiapas, 4 de septiembre de 2024 (${URL_SIE7E}).`,
      ].join('\n\n'),
      inicio: hora('2024-10-26T08:00'),
      fin: hora('2024-10-26T15:00'),
      modalidad: 'HIBRIDO',
      sede: 'Hotel Marriott Tuxtla Gutiérrez',
      organizacionId: dermatologia.id,
      organizador: 'FEACOMECH y Colegio de Dermatología de Chiapas',
      capacidad: 400,
      inscripcionAbierta: false,
      estado: 'PUBLICADO',
      ponentes: {
        create: [
          { nombre: 'Angélica Palencia', semblanza: 'Investigadora en dermatitis atópica.', orden: 0 },
          { nombre: 'Alejandro Bonifaz', semblanza: 'Especialista chiapaneco en micología.', orden: 1 },
        ],
      },
    },
  })
  console.log('  Evento: Simposio de Dermatología (26 oct 2024).')
}

async function vinculacion() {
  const vinculos = [
    { tipo: 'CONVENIO' as const, nombre: 'Congreso del Estado de Chiapas', sitioWeb: 'https://www.congresochiapas.gob.mx', fechaFirma: dia('2021-01-14'), orden: 0, descripcion: 'Convenio para el desarrollo de acciones de capacitación y promoción en salud pública, firmado en enero de 2021.' },
    { tipo: 'INSTITUCION' as const, nombre: 'Secretaría de Salud del Estado de Chiapas', sitioWeb: 'https://saludchiapas.gob.mx', fechaFirma: null, orden: 0, descripcion: 'En enero de 2025 la Federación se sumó al proyecto «Nueva Era en Salud» y acordó colaborar en campañas, actualización académica y el censo estatal de profesionales de la salud.' },
  ]
  for (const v of vinculos) {
    if (!(await prisma.vinculo.findFirst({ where: { nombre: v.nombre } }))) await prisma.vinculo.create({ data: { ...v, publicado: true } })
  }
  console.log('  Vinculación: Congreso del Estado (convenio) y Secretaría de Salud.')
}

async function noticias(autorId: string | null, dermatologia: { id: string }) {
  const lista = [
    {
      slug: 'la-federacion-se-suma-al-proyecto-nueva-era-en-salud', tipo: 'NOTICIA' as const, publicadaEn: '2025-01-08T12:00:00-06:00', destacada: true, organizacionId: null,
      titulo: 'La Federación se suma al proyecto «Nueva Era en Salud»',
      resumen: 'El presidente de la FEACOMECH, Dr. Didier Gómez Trujillo, se reunió con el secretario de Salud del Estado para colaborar en las políticas de salud de Chiapas.',
      contenido: [
        'El presidente de la Federación de Asociaciones y Colegios Médicos del Estado de Chiapas, Dr. Didier Gómez Trujillo, se reunió con el secretario de Salud, Omar Gómez Cruz, y comprometió el apoyo de la Federación a las iniciativas de gobierno como aliada en la implementación de políticas públicas de salud. «La salud es la prioridad que nos une», señaló.',
        'La Federación presentó sus líneas de trabajo: campañas de hábitos saludables, fomento a la investigación, actualización de los profesionales mediante eventos académicos, un censo estatal de profesionales de la salud por especialidad y disciplina, participación en los planes de estudio de las instituciones educativas afines a la salud, y la regularización de quienes ejercen sin cédula profesional y de los establecimientos médicos.',
        'Por su parte, el secretario de Salud afirmó que «la voz de las asociaciones y colegios es fundamental» y que se incluirá en la Nueva Era en Salud, por ejemplo en un Consejo Consultivo.',
        `Fuente: Secretaría de Salud del Estado de Chiapas, 8 de enero de 2025 (${URL_SALUD}).`,
      ].join('\n\n'),
    },
    {
      slug: 'la-federacion-pide-alto-a-la-criminalizacion-del-acto-medico', tipo: 'COMUNICADO' as const, publicadaEn: '2025-06-13T12:00:00-06:00', destacada: false, organizacionId: null,
      titulo: 'La Federación pide un alto a la criminalización del acto médico',
      resumen: 'Ante la detención de un cirujano pediatra, la FEACOMECH se pronunció contra que los médicos sean detenidos y exhibidos como delincuentes.',
      contenido: [
        'El presidente de la Federación, Dr. Didier Gómez Trujillo, se pronunció contra la criminalización del acto médico en Chiapas, a raíz de la detención de un cirujano pediatra del ISSSTE. Señaló que la Federación no se opone a que siga el proceso legal, pero sí a que los médicos sean detenidos o exhibidos como delincuentes.',
        '«Los médicos nos preparamos todos los días para tomar decisiones críticas, en momentos difíciles, para salvar la vida de los pacientes», declaró, y añadió que la Federación trabaja con los colegios a nivel nacional para que no se criminalice el acto médico.',
        `Fuentes: La Silla Rota, 13 de junio de 2025 (${URL_SILLA}); Diario de Chiapas, «Alto a la criminalización».`,
      ].join('\n\n'),
    },
    {
      slug: 'simposio-de-dermatologia-en-tuxtla', tipo: 'ACTIVIDAD' as const, publicadaEn: '2024-09-04T12:00:00-06:00', destacada: false, organizacionId: dermatologia.id,
      titulo: 'Anuncian el Simposio de Dermatología en Tuxtla Gutiérrez',
      resumen: 'La Federación y el Colegio de Dermatología de Chiapas organizaron un simposio sobre las diez dermatosis más frecuentes del estado.',
      contenido: [
        'La Federación de Asociaciones y Colegios Médicos del Estado de Chiapas, presidida por el Dr. Didier Gómez Trujillo, y el Colegio de Dermatología de Chiapas, presidido por la Dra. Fanny Kramsky Soto, anunciaron el Simposio de Dermatología, el 26 de octubre en el Hotel Marriott de Tuxtla Gutiérrez, de 8:00 a 15:00 horas.',
        'El programa abordó las diez dermatosis más frecuentes de Chiapas, con ponentes como la investigadora en dermatitis atópica Angélica Palencia y el especialista chiapaneco en micología Alejandro Bonifaz. Contó con 400 lugares presenciales y transmisión en línea, y estuvo dirigido a médicos generales, especialistas, estudiantes y personal de enfermería.',
        `Fuente: Sie7e de Chiapas, 4 de septiembre de 2024 (${URL_SIE7E}).`,
      ].join('\n\n'),
    },
    {
      slug: 'convenio-con-el-congreso-del-estado-de-chiapas', tipo: 'NOTICIA' as const, publicadaEn: '2021-01-14T12:00:00-06:00', destacada: false, organizacionId: null,
      titulo: 'Convenio con el Congreso del Estado para capacitación en salud pública',
      resumen: 'El Congreso de Chiapas y la Federación firmaron un convenio para desarrollar acciones de capacitación y promoción en salud pública.',
      contenido: [
        'El Congreso del Estado de Chiapas firmó un convenio con la Federación de Asociaciones y Colegios Médicos para el desarrollo de acciones de capacitación y promoción en salud pública, en beneficio de la ciudadanía.',
        'En el acto participó el presidente de la Federación, Dr. José Ricardo Tovilla Victoria, y el coordinador de Enlace Legislativo, Humberto Idelfonso Hernández Rojas, quien informó que la Federación agrupaba entonces 28 colegios.',
        `Fuente: Notinúcleo, 14 de enero de 2021 (${URL_NOTINUCLEO}).`,
      ].join('\n\n'),
    },
    {
      slug: 'la-federacion-pide-reconsiderar-la-reapertura-durante-la-pandemia', tipo: 'COMUNICADO' as const, publicadaEn: '2020-06-30T12:00:00-06:00', destacada: false, organizacionId: null,
      titulo: 'La Federación pide reconsiderar la reapertura durante la pandemia',
      resumen: 'En una carta al gobernador, la FEACOMECH expresó su inconformidad con la «nueva normalidad» en Chiapas y pidió reforzar las medidas sanitarias.',
      contenido: [
        'La Federación de Asociaciones y Colegios Médicos del Estado de Chiapas, presidida por el Dr. José Ricardo Tovilla Victoria, dirigió una carta al gobernador Rutilio Escandón Cadenas en la que expresó su «total inconformidad» con la reapertura de actividades durante la pandemia de COVID-19.',
        'La Federación pidió reconsiderar la reapertura, que la población permaneciera en casa, el uso obligatorio de cubrebocas, respetar la sana distancia y la unidad entre los gobiernos estatal y federal frente a la emergencia sanitaria.',
        `Fuente: Proceso, 30 de junio de 2020 (${URL_PROCESO}).`,
      ].join('\n\n'),
    },
    {
      slug: 'programa-me-emociona-tu-salud-en-tuxtla', tipo: 'NOTICIA' as const, publicadaEn: '2024-11-05T12:00:00-06:00', destacada: false, organizacionId: null,
      titulo: '«Me emociona tu salud»: consultas con descuento en Tuxtla Gutiérrez',
      resumen: 'Un programa anunciado en la Cámara de Diputados con la participación de la Federación ofrecerá consultas de especialidad con 50 % de descuento a personas de bajos recursos.',
      contenido: [
        'El diputado federal Guillermo Rafael Santiago Rodríguez anunció el programa «Me emociona tu salud», con el que, junto con la Federación de Asociaciones y Colegios Médicos del Estado de Chiapas, se brindarán consultas con 50 % de descuento a personas de bajos recursos en Tuxtla Gutiérrez.',
        'El presidente de la Federación, Dr. Didier Gómez Trujillo, informó que se firmaría un convenio para que especialistas de las asociaciones y colegios integrantes participen en el programa.',
        `Fuente: Notilegis, Cámara de Diputados, 5 de noviembre de 2024 (${URL_NOTILEGIS}).`,
      ].join('\n\n'),
    },
    {
      slug: 'tuxtla-sede-del-congreso-internacional-de-emergencias-obstetricas-2026', tipo: 'NOTICIA' as const, publicadaEn: '2026-10-30T12:00:00-06:00', destacada: true, organizacionId: null,
      titulo: 'Tuxtla será sede del primer Congreso Internacional de Emergencias Obstétricas',
      resumen: 'El 11 y 12 de diciembre de 2026 se realizará en la capital chiapaneca un congreso sobre preeclampsia y hemorragia posparto, con ponentes de varios países.',
      contenido: [
        'Tuxtla Gutiérrez será sede, el 11 y 12 de diciembre de 2026, del primer Congreso Internacional de Emergencias Obstétricas que se realiza en Chiapas. El programa se centra en la prevención y atención de complicaciones del embarazo y el parto, en especial la preeclampsia y la hemorragia posparto, e incluye talleres prácticos.',
        'Contará con más de 23 ponencias de especialistas de Panamá, Colombia, Nicaragua, El Salvador, otras entidades del país y Chiapas. La convocatoria está abierta a estudiantes, personal de enfermería, médicos generales y especialistas.',
        'Se trata de un evento externo a la Federación; se difunde como información de interés para la comunidad médica. Consulte la sede, el registro y los costos con el comité organizador.',
        `Fuentes: El Heraldo de México, 30 de octubre de 2026 (${URL_HERALDO_2026}); Canal 13 Chiapas, 30 de octubre de 2026.`,
      ].join('\n\n'),
    },
  ]
  for (const n of lista) {
    if (await prisma.noticia.findUnique({ where: { slug: n.slug } })) continue
    await prisma.noticia.create({ data: { ...n, publicadaEn: new Date(n.publicadaEn), estado: 'PUBLICADA', autorId } })
  }
  console.log(`  ${lista.length} noticias con fuente.`)
}

/** VII Jornadas Académicas FEACOMECH 2026 (documentos oficiales del Comité organizador). */
async function jornadas2026(dermatologia: { id: string }) {
  // El programa y los ponentes se sincronizan con el temario oficial en cada carga.
  const programa = PROGRAMA_2026.flatMap(d => d.actividades.map(a => ({
    inicio: new Date(`${d.fecha}T${a.inicio}:00-06:00`),
    fin: a.fin ? new Date(`${d.fecha}T${a.fin}:00-06:00`) : null,
    titulo: a.tipo === 'taller' ? `Taller: ${a.titulo}` : a.titulo,
    descripcion: [a.bloque, a.coordina && `Coordina: ${a.coordina}`, a.costo && `Costo $${a.costo} MXN`].filter(Boolean).join(' · ') || null,
    ponentes: a.ponente ?? null,
    lugar: a.lugar ?? J.sede.nombre,
  })))
  const ponentes = [...new Map(PROGRAMA_2026.flatMap(d => d.actividades).filter(a => a.ponente && a.perfil).map(a => [a.ponente!, a.perfil!])).entries()]
    .map(([nombre, semblanza], orden) => ({ nombre, semblanza, orden }))

  const datos = {
    tipo: 'JORNADA' as const,
    titulo: `${J.edicion} ${J.titulo} y ${J.subtitulo} ${J.anio}`,
    descripcion: [
      `${J.bienio}. Tres días de actualización médica con ${ponentes.length} ponentes y los colegios de la Federación; el sábado 28, Simposio de Dermatología.`,
      `Incluye los talleres ${J.talleres.lista.map(t => `«${t.titulo}»`).join(' y ')} (costo adicional), el concurso de carteles científicos y la ${J.cena.titulo} con la toma de protesta de la nueva Mesa Directiva.`,
      'Información completa, cuotas y datos de pago: /jornadas-2026',
    ].join('\n\n'),
    inicio: new Date(J.inicio),
    fin: new Date(J.fin),
    modalidad: 'PRESENCIAL' as const,
    sede: J.sede.nombre,
    direccion: J.sede.direccion,
    organizacionId: dermatologia.id,
    organizador: 'FEACOMECH y Colegio de Chiapas de Dermatología',
    requisitos: J.cuotas.categorias.map(c => `${c.nombre}: $${c.regular} MXN`).join(' · '),
    valorCurricular: 'Constancia con valor curricular',
  }

  const existente = await prisma.evento.findUnique({ where: { slug: J.slug }, select: { id: true } })
  if (existente) {
    await prisma.$transaction([
      prisma.actividadPrograma.deleteMany({ where: { eventoId: existente.id } }),
      prisma.ponente.deleteMany({ where: { eventoId: existente.id } }),
      prisma.evento.update({ where: { id: existente.id }, data: { ...datos, programa: { create: programa }, ponentes: { create: ponentes } } }),
    ])
  }
  else {
    await prisma.evento.create({ data: { ...datos, slug: J.slug, inscripcionAbierta: true, estado: 'PUBLICADO', programa: { create: programa }, ponentes: { create: ponentes } } })
  }
  console.log(`  Evento: Jornadas 2026 (${programa.length} actividades, ${ponentes.length} ponentes).`)
}

async function main() {
  console.log('Cargando información pública de FEACOMECH…')
  const admin = await prisma.usuario.findFirst({ where: { roles: { some: { rol: { clave: 'SUPERADMIN' } } } }, orderBy: { creadoEn: 'asc' }, select: { id: true } })
  await institucion()
  await estructura()
  const dermatologia = await organizaciones()
  await evento(dermatologia)
  await jornadas2026(dermatologia)
  await vinculacion()
  await noticias(admin?.id ?? null, dermatologia)
  await portada()
  console.log('Listo. Revise y valide en la plataforma lo marcado como aproximado o por confirmar.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
