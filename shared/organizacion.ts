// Contenido institucional del portal (documento «Página web de la FEACOMECH»).
// Textos editoriales que aún no se capturan en la plataforma. Lo que dependa de datos
// (misión, visión, colegios, noticias) sigue viniendo de la base.

import { colegioPorClave } from './colegios'
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

export interface Integrante {
  cargo: string
  nombre: string
  resena?: string
  foto?: string
  /** Ficha del colegio que preside en el directorio (/directorio/<slug>). */
  colegio?: { nombre: string, slug: string }
}

/**
 * Fotografías disponibles por nombre (las demás muestran iniciales). Son recortes al rostro
 * en /public/img/personas; el archivo original se conserva junto a cada uno sin el sufijo «_rostro».
 */
const FOTOS: Record<string, string> = {
  'Dra. Fanny Kramsky Soto': FOTO_PRESIDENTA,
  'Dr. José Ricardo Tovilla Victoria': '/img/personas/jose-ricardo-tovilla-victoria-rostro.jpg',
  'Dr. Hernán León Velasco': '/img/personas/hernan-leon-velasco-rostro.jpg?v=2',
  'Dr. Didier Gómez Trujillo': '/img/personas/didier-gomez-trujillo-rostro.jpg',
  'Dr. Alexander Arroyo Núñez': '/img/personas/alexander-arroyo-nunez-rostro.jpg?v=2',
  'QFB. Cecilia Clotilde Velázquez Andrade': '/img/personas/cecilia-clotilde-velazquez-andrade-rostro.jpg',
  'Mtra. María Elena León Macías': '/img/personas/maria-elena-leon-macias-rostro.jpg',
  'Dra. Isidra Candelario López': '/img/personas/isidra-candelario-lopez-rostro.jpg',
  'Dr. Humberto Hernández Rojas': '/img/personas/humberto-hernandez-rojas-rostro.jpg',
  'QFB. Adriana Osiris Méndez Cigarroa': '/img/personas/adriana-osiris-mendez-cigarroa-rostro.jpg',
  'Dr. Issel Prisciliano Gutiérrez Mandujano': '/img/personas/issel-prisciliano-gutierrez-mandujano-rostro.jpg',
  'Dr. Eddie Enrique Alfaro Coutiño': '/img/personas/eddie-enrique-alfaro-coutino-rostro.jpg',
  'Dra. María del Carmen Albores Guillén': '/img/personas/maria-del-carmen-albores-guillen-rostro.jpg',
}

/**
 * Fotos sin fondo en /public/img/personas/recortes (busto, 560×700, WebP transparente), para
 * mostrar a la persona sobre el escudo de la Federación en su página. Se generan con rembg
 * (modelo u2net_human_seg); si no hay, se usa el retrato con marco de arco.
 */
const RECORTES: Record<string, string> = {
  'Dra. Fanny Kramsky Soto': '/img/personas/recortes/fanny-kramsky.webp',
  'Dr. Alexander Arroyo Núñez': '/img/personas/recortes/alexander-arroyo-nunez.webp?v=2',
  'Dr. Hernán León Velasco': '/img/personas/recortes/hernan-leon-velasco.webp?v=2',
  'Dr. José Ricardo Tovilla Victoria': '/img/personas/recortes/jose-ricardo-tovilla-victoria.webp',
  'QFB. Cecilia Clotilde Velázquez Andrade': '/img/personas/recortes/cecilia-clotilde-velazquez-andrade.webp',
  'Dra. Isidra Candelario López': '/img/personas/recortes/isidra-candelario-lopez.webp',
  'Dr. Humberto Hernández Rojas': '/img/personas/recortes/humberto-hernandez-rojas.webp',
  'Dr. Eddie Enrique Alfaro Coutiño': '/img/personas/recortes/eddie-enrique-alfaro-coutino.webp',
  'Dra. María del Carmen Albores Guillén': '/img/personas/recortes/maria-del-carmen-albores-guillen.webp',
}

/** Retratos verticales para la página de cada persona (si no hay, se usa el recorte al rostro). */
const RETRATOS: Record<string, string> = {
  'Dra. Fanny Kramsky Soto': '/img/personas/fanny-kramsky.jpg',
  'Dr. Hernán León Velasco': '/img/personas/hernan-leon-velasco.jpg?v=2',
  'Dr. José Ricardo Tovilla Victoria': '/img/personas/jose-ricardo-tovilla-victoria.jpg',
  'Dr. Alexander Arroyo Núñez': '/img/personas/alexander-arroyo-nunez.jpg?v=2',
  'QFB. Cecilia Clotilde Velázquez Andrade': '/img/personas/cecilia-clotilde-velazquez-andrade.jpg',
  'Mtra. María Elena León Macías': '/img/personas/maria-elena-leon-macias.jpg',
  'Dra. Isidra Candelario López': '/img/personas/isidra-candelario-lopez.jpg',
  'Dr. Humberto Hernández Rojas': '/img/personas/humberto-hernandez-rojas.jpg',
  'Dr. Issel Prisciliano Gutiérrez Mandujano': '/img/personas/issel-prisciliano-gutierrez-mandujano.jpg',
  'Dr. Eddie Enrique Alfaro Coutiño': '/img/personas/eddie-enrique-alfaro-coutino.jpg',
  'Dra. María del Carmen Albores Guillén': '/img/personas/maria-del-carmen-albores-guillen.jpg',
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
  // CV condensado de la QFB. Velázquez Andrade, noviembre de 2026 (sin datos de contacto).
  'QFB. Cecilia Clotilde Velázquez Andrade': [
    'Química farmacéutica bióloga, con orientación en bioquímica y microbiología, con amplia experiencia en salud pública, control de calidad, análisis clínicos y farmacia. Su trayectoria se distingue por la gestión y el aseguramiento de la calidad, la bioseguridad y el diagnóstico epidemiológico.',
    'Es egresada de la Facultad de Química de la Universidad Nacional Autónoma de México (UNAM) como química farmacéutica bióloga (bioquímica microbióloga). Ha complementado su formación con diplomados en hematología, VIH, microbiología clínica, bioética, parasitología y enfermedades tropicales, entre otros.',
    'En el Laboratorio Estatal de Salud Pública se ha desempeñado en las áreas de parasitología, diagnóstico epidemiológico, entomología médica, citopatología, redes de laboratorio, bioseguridad y biocustodia, y gestión y aseguramiento de la calidad. Cuenta además con experiencia en el análisis fisicoquímico y microbiológico del agua, en laboratorio de análisis clínicos y como responsable de farmacia, a cargo del control de inventarios, la dispensación de medicamentos y la atención farmacéutica.',
    'Forma parte de la Mesa Directiva de la FEACOMECH como Tesorera durante el bienio 2026–2028.',
  ].join('\n\n'),
  // Minicurrículum de la Dra. Albores Guillén, noviembre de 2026.
  'Dra. María del Carmen Albores Guillén': [
    'Médica especialista en Anestesiología y maestra en Administración de Servicios de Salud. Su trayectoria combina la práctica médica especializada, la docencia y la participación activa en la organización y representación gremial, con un compromiso permanente con el desarrollo de la Anestesiología y el fortalecimiento de la comunidad médica en Chiapas.',
    'Es médica cirujana por la Universidad Autónoma de Chiapas (UNACH), donde concluyó su formación en 2000. Cursó la especialidad en Anestesiología, que inició en el Hospital Universitario de Puebla y concluyó con los dos últimos años de residencia en el Hospital Regional «Dr. Rafael Pascacio Gamboa», con aval de la Benemérita Universidad Autónoma de Puebla (BUAP) y de la UNACH; obtuvo el título de especialista en 2009. En 2025 concluyó la maestría en Administración de Servicios de Salud.',
    'Se desempeñó tres años como médica general en el programa IMSS-Oportunidades, en la región de Las Margaritas, y dos años en una clínica de dermatología en Monterrey, Nuevo León. Como anestesióloga laboró durante 13 años en el Hospital Regional «Dr. Rafael Pascacio Gamboa» y en el Hospital Chiapas Nos Une «Dr. Jesús Gilberto Gómez Maza», donde fue profesora adjunta de los médicos residentes de Anestesiología.',
    'En el Colegio de Anestesiología del Estado de Chiapas (COANECH) ha sido tesorera, vicepresidenta y presidenta (2022–2025); actualmente es su secretaria. Forma parte de la Mesa Directiva de la FEACOMECH como Secretaria Técnica durante el bienio 2026–2028.',
  ].join('\n\n'),

  // --- Presidencias de colegios afiliados (CV recibidos en noviembre de 2026, sin datos de contacto) ---
  'Dra. María Hilda Rentería García': [
    'Médica oftalmóloga con alta especialidad en retina y vítreo y más de 30 años de experiencia clínica y quirúrgica. Ejerce la práctica privada en Tuxtla Gutiérrez y cuenta con una amplia trayectoria docente en pregrado y posgrado. Recibió el Premio Nacional de Oftalmología en 1996.',
    'Es médica cirujana por la Facultad de Medicina de la Universidad Nacional Autónoma de México (UNAM). Realizó la residencia y el diploma de especialidad en Oftalmología en el Hospital Oftalmológico de Nuestra Señora de la Luz, con aval de la UNAM, y la subespecialidad en Retina y Vítreo en la misma institución. Cuenta además con un diplomado en Medicina Antienvejecimiento por la Benemérita Universidad Autónoma de Puebla.',
    'Fue médica adscrita al Servicio de Retina y Vítreo de la Fundación Hospital de Nuestra Señora de la Luz (1997–2005), donde coordinó la enseñanza de posgrado en Retina y Vítreo. Ejerció en la Clínica Chiapas (1994–2004) y, desde 2005, en la Clínica de Especialidades «Santa Elena», en Tuxtla Gutiérrez.',
    'Ha sido profesora de posgrado en Retina y Vítreo en la UNAM, docente de la licenciatura en Optometría del IPN y, desde 2018, docente de pregrado en la Universidad Salazar (IESCH). Ha impartido más de 25 ponencias en congresos y cursos de la Asociación Mexicana de Retina, la Sociedad Mexicana de Oftalmología y el Congreso Mexicano de Oftalmología, y es autora de trabajos libres y videos quirúrgicos sobre vitrectomía y patología vitreorretiniana.',
    'Preside el Colegio de Oftalmólogos del Estado de Chiapas durante el periodo 2026–2027.',
  ].join('\n\n'),
  // Reseña enviada por la Dra. del Solar (noviembre de 2026), tal cual.
  'Dra. Iraís del Solar López': [
    'La Dra. Iraís del Solar López es Médica Cirujana por la Benemérita Universidad Autónoma de Chiapas, especialista en Anestesiología por la Universidad Nacional Autónoma de México y subespecialista en Neuroanestesiología, con formación en el Instituto Nacional de Neurología y Neurocirugía y aval de la UNAM. Es Maestra en Gestión de Sistemas de Salud por la UNACH. Durante su formación se integró al Programa Impulso para la Investigación en Salud Carlos Slim.',
    'Su trayectoria combina la práctica clínica en los sectores público y privado con la docencia en residencias médicas en Anestesiología en el Hospital de Especialidades Pediátricas, donde contribuye a la formación de médicos especialistas. Cuenta, además, con estudios y un diplomado en Peritaje Médico. Su actividad profesional incluye la elaboración de dictámenes médico-legales en apoyo al Poder Judicial.',
    'En el ámbito académico, es primera autora del capítulo «Salud intercultural y atención hospitalaria: propuesta para mejorar la calidad de los servicios», incluido en la obra colectiva «Bienestar integral y transiciones en salud comunitaria: Nutrición, salud mental y estrategias bioculturales en Chiapas».',
    'Actualmente participa en la Comisión de Capacitación y Certificación de la FEACOMECH y preside el Colegio de Anestesiología del Estado de Chiapas durante el periodo 2025–2027. Su labor gremial complementa una trayectoria dedicada a la práctica clínica, la formación médica y la actividad pericial.',
  ].join('\n\n'),
  // CV de la Mtra. León Macías (noviembre de 2026), sin datos de contacto ni personales.
  'Mtra. María Elena León Macías': [
    'Maestra en Trabajo Social con más de una década de experiencia en el ámbito hospitalario, dedicada a la atención y orientación de pacientes y familiares, la vinculación interinstitucional y la formación de nuevas generaciones de trabajadores sociales.',
    'Es licenciada (2011–2014) y maestra en Trabajo Social (2015–2016) por el Instituto de Estudios Superiores «Sor Juana Inés de la Cruz», y técnica en Trabajo Social por el Instituto Tecnológico de Estudios Chiapas. Ha cursado los diplomados Básico y Avanzado de Peritos de los Procesos Médicos y de los Profesionales de la Salud, en el Centro de Investigaciones Jurídicas, Médicas y Sociales, y el diplomado en Docencia Clínica en el CECyTE.',
    'Desde 2012 se desempeña en el Hospital IMSS-Bienestar «Dr. Jesús Gilberto Gómez Maza», en Tuxtla Gutiérrez, donde realiza entrevistas a pacientes, reportes al Ministerio Público, gestiones, acompañamiento y orientación a pacientes y familiares, y referencias y enlace con otras instituciones. Como responsable de los pasantes de Trabajo Social coordina sus proyectos, la exposición de temas, la rotación por los servicios y la enseñanza continua. De junio a octubre de 2026 estuvo a cargo de la Subjefatura de Trabajo Social del hospital.',
    'Preside el Colegio de Trabajadores Sociales del Estado de Chiapas (COTRASECH).',
  ].join('\n\n'),
  // «CV_SEMBLANZA CURRICULAR QUIM.AOMC.docx», noviembre de 2026 (sin datos de contacto).
  'QFB. Adriana Osiris Méndez Cigarroa': [
    'Química farmacéutica bióloga con más de 20 años de experiencia profesional en el laboratorio clínico, en los sectores público y privado, y una trayectoria que destaca por el liderazgo en la gestión de la calidad.',
    'Es egresada de la Universidad Veracruzana, donde cursó la licenciatura en Químico Farmacéutico Biólogo, la especialización en Control de Calidad y la maestría en Gestión de la Calidad. Es doctora en Alta Dirección y Negocios por la Universidad del País INNOVA y cuenta con certificación profesional en Química Clínica otorgada por la Federación Nacional de Químicos Clínicos, CONAQUIC, A.C.',
    'Desde hace 19 años forma parte del Hospital de Alta Especialidad Pediátrica de Chiapas, donde se desempeña como jefa de Sección de Análisis Clínicos en las áreas de Hemato-Oncología y pruebas de genética especializada. Es responsable de la dirección del Sistema de Gestión de la Calidad bajo la norma ISO 9001:2015, integra el equipo líder en los procesos de acreditación hospitalaria y colabora en auditorías internas, mejora continua y seguridad institucional. Presidió el Comité Hospitalario de Bioética de 2021 a 2024 y participa en brigadas de Soporte Básico de Vida. En el sector privado es jefa de Laboratorio Clínico y responsable sanitaria.',
    'Ha cursado 53 cursos y 10 talleres en las distintas áreas del laboratorio clínico, la calidad y la bioética —entre ellos control estadístico de la calidad, hematología celular y molecular, inmunología, endocrinología y seguridad del paciente— y ha asistido a 30 congresos de la CONAQUIC. Cuenta con la certificación IATA en transporte de sustancias biológicas de categoría B y participó en la elaboración de reactivos del Examen Único de Certificación de los Químicos Clínicos (EUC-QUICLIC), conforme a los lineamientos del CENEVAL (2017).',
    'Preside el Consejo Directivo 2025–2027 del Colegio de Químicos de Chiapas, A.C., y es comisionada de Apoyo y Defensa del Laboratorio Clínico de la CONAQUIC (2026–2027). Ha ocupado diversos cargos directivos en ambas organizaciones.',
  ].join('\n\n'),
  'Dr. Sarain Montero Orozco': [
    'Médico especialista en traumatología y ortopedia, con práctica en microcirugía articular, y más de 40 años de ejercicio profesional en Tuxtla Gutiérrez.',
    'Es egresado del posgrado del Centro Médico Nacional, con aval de la Universidad Nacional Autónoma de México (UNAM). Durante cuarenta años ha sido profesor de Traumatología y Ortopedia en la licenciatura de la Universidad Autónoma de Chiapas (UNACH).',
    'Preside el Colegio de Ortopedia y Traumatología de Chiapas (COTECH).',
  ].join('\n\n'),
  'Psic. María del Carmen Peche Domínguez': [
    'Psicóloga clínica, encargada del Servicio de Salud Mental del Hospital Dr. Jesús Gilberto Gómez Maza, con formación en terapia familiar, psicología forense y atención del comportamiento suicida.',
    'Es licenciada en Psicología Clínica por la Universidad Autónoma de Guadalajara. Cursó la especialidad en Terapia Familiar en el Instituto de Terapia Familiar Cencalli (Ciudad de México), la de Psicología Clínica Institucional en el Instituto Nacional de Psiquiatría Ramón de la Fuente, con aval de la UNAM, y la de Psicología Forense en Niños y Adolescentes por la Suprema Corte de Justicia de la Nación. Se especializó además en la identificación, valoración e intervención del comportamiento suicida con la Organización Panamericana de la Salud.',
    'Ha sido catedrática de Psicología en el Centro de Estudios Superiores de Tapachula (1990–1992), en el Departamento de Psiquiatría y Salud Mental de la UNAM (1992–1993), en la Universidad de Ciencias y Artes de Chiapas (1996–1999) y en la Universidad del Valle de México (2001–2009), entre otras instituciones.',
    'Ha sido ponente en congresos nacionales e internacionales: el VI Congreso Mexicano y II Iberoamericano de Psicología, con un trabajo sobre el suicidio en jóvenes mexicanos; las Jornadas de Psicología Clínica del Instituto Mexicano de Psiquiatría; el I y el II Congreso Nacional de Sociedades Pro Salud Mental, y el II Congreso Regional Zona Sur de la Asociación Psiquiátrica Mexicana, con temas de terapia familiar estructural y sistémica.',
    'Preside el Colegio de Profesionales en Psicología del Estado de Chiapas (COPPSECH).',
  ].join('\n\n'),
}

/** Cargo y periodo de las presidencias de colegio que constan en su currículum. */
const PRESIDENCIAS_COLEGIO: Record<string, { cargo: string, periodo?: string }> = {
  'Dra. María Hilda Rentería García': { cargo: 'Presidenta del Colegio de Oftalmólogos del Estado de Chiapas', periodo: '2026–2027' },
  'Dra. Iraís del Solar López': { cargo: 'Presidenta del Colegio de Anestesiología del Estado de Chiapas (COANECH)', periodo: '2025–2027' },
  'Dr. Sarain Montero Orozco': { cargo: 'Presidente del Colegio de Ortopedia y Traumatología de Chiapas (COTECH)' },
  'QFB. Adriana Osiris Méndez Cigarroa': { cargo: 'Presidenta del Colegio de Químicos de Chiapas, A.C.', periodo: '2025–2027' },
  'Mtra. María Elena León Macías': { cargo: 'Presidenta del Colegio de Trabajadores Sociales del Estado de Chiapas (COTRASECH)' },
  'Psic. María del Carmen Peche Domínguez': { cargo: 'Presidenta del Colegio de Profesionales en Psicología del Estado de Chiapas (COPPSECH)' },
}

/** Mesa directiva vigente. Las reseñas curriculares se agregan conforme se reciban. */
export const MESA_DIRECTIVA: { periodo: string, integrantes: Integrante[] } = {
  periodo: 'Bienio 2026–2028',
  integrantes: MESA_DIRECTIVA_2026.cargos.map(c => ({ ...c, foto: FOTOS[c.nombre], resena: RESENAS[c.nombre] })),
}

/** Consejo consultivo: integrado por los expresidentes de la Federación. */
export const CONSEJO_CONSULTIVO: Integrante[] = [
  ...MESA_DIRECTIVA_2026.consejo,
  // Su currículum (noviembre de 2026) indica que integra actualmente el consejo consultivo.
  { nombre: 'Dr. Issel Prisciliano Gutiérrez Mandujano', finado: false },
  // Expresidente (2011–2013) que participa en el consejo consultivo (dato de la Federación, noviembre de 2026).
  { nombre: 'Dr. Eddie Enrique Alfaro Coutiño', finado: false },
  // Expresidente activo en las actividades de la Federación (dato de la Federación, noviembre de 2026).
  { nombre: 'Dr. Hernán León Velasco', finado: false },
].map((c) => {
  const nombre = c.nombre.replace('Radamez', 'Radamés').replace('Dr. Ricardo Tovilla', 'Dr. José Ricardo Tovilla')
  return { cargo: c.finado ? 'Consejero (†)' : 'Consejero', nombre, foto: FOTOS[nombre] }
})

/** Presidencias de los colegios afiliados; las que tienen reseña llevan a su página propia. */
export const PRESIDENTES_COLEGIOS: Integrante[] = MESA_DIRECTIVA_2026.presidentes.map(p => ({
  cargo: PRESIDENCIAS_COLEGIO[p.nombre]?.cargo ?? `Presidencia · ${colegioPorClave(p.colegio)?.nombre ?? p.colegio}`,
  nombre: p.nombre,
  foto: FOTOS[p.nombre],
  resena: RESENAS[p.nombre],
  colegio: colegioPorClave(p.colegio),
}))

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
    resena: 'Médico urólogo, escritor, poeta y compositor originario de Villaflores. Médico cirujano por la Universidad Autónoma de Guadalajara, con titulación por la UNAM, y especialista en Urología por el Centro Médico Nacional La Raza; ejerce la urología oncológica y la cirugía urológica en Tuxtla Gutiérrez y es miembro de las asociaciones Americana y Europea de Urología. Presidió el Colegio Médico del Estado de Chiapas, antecesor de la FEACOMECH, y la gestión 2022–2024 de la Federación llevó su nombre en homenaje; integra su consejo consultivo. A los 14 años fue socio fundador de la delegación de la Cruz Roja Mexicana en Villaflores. Su obra literaria y musical ha recibido, entre otros, el Premio de Poesía Enoch Cancino Casahonda (2010), la Medalla José Emilio Grajales (2013) y el reconocimiento «Personajes de mi Ciudad» de Tuxtla Gutiérrez.',
  },
  // Currículum breve recibido en noviembre de 2026.
  {
    nombre: 'Dr. Jaime José Gutiérrez Gómez',
    periodo: 'Periodo por documentar',
    desde: null,
    resena: 'Expresidente de la Federación. Segundo vicepresidente de la Confederación Iberolatinoamericana de Entidades Médicas (CONFEMEL); expresidente del Colegio Médico de México (FENACOME), de la Federación Mexicana de Colegios de Ortopedia y Traumatología y del Consejo Mexicano de Ortopedia y Traumatología.',
  },
  // Currículum recibido en noviembre de 2026; periodo según la Federación.
  {
    nombre: 'Dr. Eddie Enrique Alfaro Coutiño',
    periodo: '2011 – 2013',
    desde: 2011,
    resena: 'Médico especialista en Medicina Interna, originario de Tuxtla Gutiérrez. Egresado de la Universidad Autónoma de Guadalajara, realizó su posgrado en el Centro Médico Nacional «La Raza» del IMSS y es fellow en Diabetes Mellitus por la Clínica Joslin de Boston, Massachusetts. Ha sido catedrático de la Universidad Autónoma de Chiapas, el Instituto de Estudios Superiores de Chiapas, la Universidad de Ciencias y Artes de Chiapas y la Universidad Intercultural de Chiapas. Es coautor de libros de medicina interna, colaborador de revistas médicas indexadas y autor de tres ediciones del libro «Cuida tu azúcar y viví feliz». Miembro de la Sociedad de Medicina Interna de México. Presidió la Federación durante el bienio 2011–2013, forma parte de su consejo consultivo y la gestión 2024–2026 llevó su nombre.',
  },
  // Currículum recibido en noviembre de 2026.
  {
    nombre: 'Dr. Issel Prisciliano Gutiérrez Mandujano',
    periodo: 'Periodo por documentar',
    desde: null,
    resena: 'Médico pediatra originario de Tuxtla Gutiérrez. Médico cirujano por la Universidad Veracruzana, con posgrado en Pediatría Médica en el Centro Médico Nacional «Adolfo Ruiz Cortines» del IMSS, en Veracruz. Fue pediatra adscrito durante 35 años en la Secretaría de Salud y 28 en el ISSSTE, y es jubilado del IMSS. Expresidente del Colegio de Pediatría de Tuxtla Gutiérrez, del Colegio de Pediatría del Estado de Chiapas y de la Federación de Pediatría del Sureste, y vocal consejero del Consejo Mexicano de Certificación en Pediatría por dos periodos. Fue vicepresidente y presidente de la FEACOMECH, de cuyo consejo consultivo forma parte. Siempre comprometido con la enseñanza, la capacitación y la colegiación de los médicos de Chiapas, pugna por las mejoras gremiales del personal médico y de salud del estado.',
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
    resena: 'Médico neurocirujano en Tuxtla Gutiérrez. Médico cirujano por la Universidad La Salle, especialista en Neurocirugía por la UNAM y maestro en Ciencias de la Salud por la UNACH. Es neurocirujano del Hospital General «Dr. Belisario Domínguez» del ISSSTE, donde participó en la primera unidad de columna del instituto en Chiapas, y ejerce también en el ámbito privado; es referente en cirugía de columna, neurocirugía mínimamente invasiva, tumores cerebrales y procedimientos endovasculares. Fue vicepresidente de la Federación antes de presidirla y encabezó la gestión 2022–2024 «Dr. Hernán León Velasco».',
  },
  {
    nombre: 'Dr. Didier Gómez Trujillo',
    periodo: '2024 – 2026',
    desde: 2024,
    resena: 'Médico especialista en ortopedia y traumatología, originario de Ocozocoautla. Expresidente del Colegio de Traumatología y Ortopedia de Chiapas (COTECH) y exvocal de la Federación Mexicana de Colegios de Ortopedia y Traumatología (FEMECOT), que lo reconoció en 2022 y 2023. Autor de «Letras tiernas» (2002), «Caminando entre versos» (2004) e «Historia del Hospital Regional» (2006). Encabezó la gestión «Dr. Eddie Alfaro Coutiño».',
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
  organo: 'Mesa directiva' | 'Consejo consultivo' | 'Presidentes de colegios'
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
  ...PRESIDENTES_COLEGIOS.map(i => comoPersona(i, 'Presidentes de colegios', PRESIDENCIAS_COLEGIO[i.nombre]?.periodo ?? 'Periodo vigente')),
]

/**
 * A dónde regresa la página de una persona: la mesa directiva vive en /organizacion, el consejo
 * consultivo junto a los expresidentes y cada presidencia en la ficha de su colegio.
 */
export function regresoPersona(p: Persona): { to: string, label: string } {
  if (p.organo === 'Mesa directiva') return { to: '/organizacion', label: 'Volver a la mesa directiva' }
  if (p.organo === 'Consejo consultivo') return { to: '/expresidentes#consejo-consultivo', label: 'Volver al consejo consultivo' }
  return p.colegio
    ? { to: `/directorio/${p.colegio.slug}`, label: `Volver a ${p.colegio.nombre}` }
    : { to: '/directorio', label: 'Volver al directorio' }
}

/** Presidencia del colegio con esa ficha en el directorio (/directorio/<slug>), si consta. */
export function presidenciaDeColegio(slug: string): Persona | undefined {
  return PERSONAS.find(p => p.organo === 'Presidentes de colegios' && p.colegio?.slug === slug)
}

export function buscarPersona(slug: string): Persona | undefined {
  return PERSONAS.find(p => p.slug === slug)
}
