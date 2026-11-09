// Temario oficial de las VII Jornadas Académicas FEACOMECH y Simposio de Dermatología 2026
// (public/jornadas/temario.pdf). Horario del centro de México.

export type TipoActividad = 'ponencia' | 'registro' | 'receso' | 'acto' | 'taller' | 'social'

export interface Actividad {
  inicio: string // HH:MM
  fin?: string
  tipo: TipoActividad
  titulo: string
  ponente?: string
  perfil?: string
  /** Colegio o mesa que organiza el bloque. */
  bloque?: string
  coordina?: string
  lugar?: string
  costo?: number
}

export interface DiaPrograma {
  fecha: string // AAAA-MM-DD
  dia: string
  etiqueta: string
  tema?: string
  actividades: Actividad[]
}

const ANEST = { bloque: 'Colegio de Anestesiología', coordina: 'Dra. Irais Del Solar López' }
const OFTAL = { bloque: 'Colegio de Oftalmología', coordina: 'Dra. Hilda Rentería García' }
const PEDIA = { bloque: 'Colegio de Pediatría', coordina: 'Dra. Laura Cordero Zepeda' }
const GINE = { bloque: 'Colegio de Ginecología', coordina: 'Dr. Rodimiro Aguilar Valenzuela' }
const SCLC = { bloque: 'Colegio de San Cristóbal de las Casas', coordina: 'Dr. Pablo Manuel Alcázar Ramos' }
const ORL = { bloque: 'Colegio de Otorrinolaringología', coordina: 'Dr. Gerardo Sánchez Hernández' }
const URG = { bloque: 'Colegio de Urgencias', coordina: 'Dra. Claudia Rojas Guzmán' }
const COMITAN = { bloque: 'Colegio Médico de Comitán', coordina: 'Dr. Juan Carlos Martínez Cardiel' }
const QUIM = { bloque: 'Colegio de Químicos', coordina: 'QFB. Adriana Osiris Méndez Cigarroa' }
const REUMA = { bloque: 'Colegio de Reumatología', coordina: 'Dra. Liliana Hernández Cruz' }
const HEMO = { bloque: 'Mesa redonda de Hemodinámica', coordina: 'Dr. Eddie Alfaro Coutiño' }
const TS = { bloque: 'Colegio de Trabajo Social', coordina: 'Mtra. Ts. María Helena León Macías' }
const TRAUMA = { bloque: 'Colegio de Traumatología', coordina: 'Dr. Sarain Montero Orozco' }
const NEURO = { bloque: 'Colegio de Neurociencias', coordina: 'Dr. José de Jesús Almanza Muñoz' }
const PSICO = { bloque: 'Colegio de Psicología', coordina: 'Psic. María del Carmen Peche Domínguez' }
const FEA = { bloque: 'FEACOMECH', coordina: 'Dra. Fanny Kramsky Soto' }
const DENT = { bloque: 'Colegio de Cirujanos Dentistas', coordina: 'Dra. María Candelaria Gómez Velasco' }
const PATO = { bloque: 'Colegio de Anatomopatología', coordina: 'Dr. Jorge Rincón Acebo' }
const MG = { bloque: 'Colegio de Medicina General', coordina: 'Dr. Jorge Iván Gómez Vázquez' }
const MF = { bloque: 'Colegio de Medicina Familiar', coordina: 'Dra. América Fabiola Benítez Rendón' }
const DERMA = { bloque: 'Simposio de Dermatología', coordina: 'Dra. Fanny Kramsky Soto y Dr. Antonio Flores' }

export const PROGRAMA_2026: DiaPrograma[] = [
  {
    fecha: '2026-11-26',
    dia: 'Jueves 26',
    etiqueta: 'Día 1',
    tema: 'Jornadas Académicas',
    actividades: [
      { inicio: '07:00', fin: '08:00', tipo: 'registro', titulo: 'Registro de asistentes' },
      { inicio: '08:00', fin: '08:20', tipo: 'ponencia', titulo: 'Valoración preanestésica', ponente: 'Dra. Ivon Moreno Rovelo', perfil: 'Anestesióloga pediatra', ...ANEST },
      { inicio: '08:20', fin: '08:40', tipo: 'ponencia', titulo: 'Actualidades en micosis cutáneas', ponente: 'Dr. Alexandro Bonifaz', perfil: 'Doctor en Micología · Jefe del Departamento de Micología, Hospital Gea González', ...ANEST },
      { inicio: '08:40', fin: '09:10', tipo: 'ponencia', titulo: 'Manifestaciones oculares de las enfermedades sistémicas: lo que el médico general debe conocer', ponente: 'Dra. Elsy Saldaña Liévano', perfil: 'Oftalmóloga subespecialista en glaucoma', ...OFTAL },
      { inicio: '09:10', fin: '09:30', tipo: 'ponencia', titulo: 'Manejo empírico de la hernia umbilical en pediatría', ponente: 'Dr. Mario Cuesta Vázquez', perfil: 'Cirujano pediatra', ...PEDIA },
      { inicio: '09:30', fin: '09:50', tipo: 'ponencia', titulo: 'Más allá del estetoscopio: objetivando el asma desde el diagnóstico hasta el pronóstico', ponente: 'Dr. Didier Cruz Anleu', perfil: 'Neumólogo pediatra', ...PEDIA },
      { inicio: '09:50', fin: '10:20', tipo: 'acto', titulo: 'Inauguración y receso' },
      { inicio: '10:20', fin: '10:40', tipo: 'ponencia', titulo: 'Abordaje inicial de la pareja infértil', ponente: 'Dr. Enrique Gordillo Gómez', perfil: 'Ginecólogo especialista en reproducción humana', ...GINE },
      { inicio: '10:40', fin: '11:00', tipo: 'ponencia', titulo: 'Abordaje actual de la diabetes gestacional', ponente: 'Dr. Alberto Arriaga López', perfil: 'Ginecólogo especialista en medicina materno-fetal', ...GINE },
      { inicio: '11:00', fin: '11:20', tipo: 'ponencia', titulo: 'El acto quirúrgico abdominal más frecuente del mundo: impacto, manejo y futuro de la colecistectomía', ponente: 'Dr. Pablo Alcázar Ramos', perfil: 'Cirujano gastroenterólogo', ...SCLC },
      { inicio: '11:20', fin: '11:40', tipo: 'ponencia', titulo: 'Urgencias en otorrinolaringología', ponente: 'Dr. Gerardo Sánchez Hernández', perfil: 'Otorrinolaringólogo', ...ORL },
      { inicio: '11:40', fin: '12:10', tipo: 'receso', titulo: 'Receso' },
      { inicio: '12:10', fin: '12:30', tipo: 'ponencia', titulo: 'Panorama de la obesidad en México y el mundo', ponente: 'Dr. Daniel Guerra De Coss', perfil: 'Cirujano general y bariatra' },
      { inicio: '12:30', fin: '12:50', tipo: 'ponencia', titulo: 'Código ictus: del primer síntoma a la reperfusión', ponente: 'Dr. Héctor Miguel Saavedra Trujillo', perfil: 'Médico urgenciólogo', ...URG },
      { inicio: '12:50', fin: '13:10', tipo: 'ponencia', titulo: 'Demencia vascular', ponente: 'Dr. José Gilberto Alfaro Guillén', perfil: 'Medicina interna, geriatra', ...COMITAN },
      { inicio: '13:10', fin: '13:30', tipo: 'ponencia', titulo: 'De la muestra a la decisión médica: impacto de la fase preanalítica en la seguridad del paciente', ponente: 'QFB. Adriana Osiris Méndez Cigarroa', perfil: 'Química farmacobióloga', ...QUIM },
      { inicio: '13:30', fin: '14:00', tipo: 'ponencia', titulo: 'Abordaje diagnóstico de anticuerpos antinucleares', ponente: 'Dra. Alejandra Espinoza Orantes', perfil: 'Reumatóloga', ...REUMA },
      { inicio: '14:00', fin: '14:30', tipo: 'ponencia', titulo: 'Actualidades en cáncer de próstata', ponente: 'Dr. Hernán León Velasco', perfil: 'Urólogo' },
      { inicio: '14:30', fin: '15:00', tipo: 'ponencia', titulo: 'Manejo del síndrome coronario agudo: del consultorio a la hemodinámica', ponente: 'Dr. José Alfredo Estrada Suárez', perfil: 'Cardiólogo intervencionista', ...HEMO },
      { inicio: '16:00', fin: '18:00', tipo: 'taller', titulo: 'Electrocardiografía para médicos generales', ponente: 'Dr. Arturo Piña Flores', perfil: 'Cardiólogo intervencionista', lugar: 'Salón Misolha', costo: 400 },
    ],
  },
  {
    fecha: '2026-11-27',
    dia: 'Viernes 27',
    etiqueta: 'Día 2',
    tema: 'Jornadas Académicas',
    actividades: [
      { inicio: '08:00', fin: '08:20', tipo: 'ponencia', titulo: 'Protocolo de actuación ante caso de violencia y Código 100 desde el trabajo social', ponente: 'Mtra. Ts. María Helena León Macías', perfil: 'Maestra en Trabajo Social', ...TS },
      { inicio: '08:20', fin: '08:40', tipo: 'ponencia', titulo: 'Artroscopía de hombro', ponente: 'Dr. Adrián Flores Villalobos', perfil: 'Traumatólogo especialista en cirugía articular', ...TRAUMA },
      { inicio: '08:40', fin: '09:00', tipo: 'ponencia', titulo: 'Actualidades en politraumatismos', ponente: 'Dr. Didier Gómez Trujillo', perfil: 'Traumatólogo especialista en cirugía articular', ...TRAUMA },
      { inicio: '09:00', fin: '09:20', tipo: 'ponencia', titulo: 'Nueva agenda de investigación, prevención e impacto comunitario en neurociencias: del conocimiento científico a la transformación social', ponente: 'Dr. José de Jesús Almanza Muñoz', perfil: 'Psiquiatra', ...NEURO },
      { inicio: '09:20', fin: '09:40', tipo: 'ponencia', titulo: 'Duelo y trauma: comprensión psicoterapéutica de la experiencia de pérdida', ponente: 'Dra. Karime Andrade Mireles', perfil: 'Doctora en Psicología', ...PSICO },
      { inicio: '09:40', fin: '10:20', tipo: 'receso', titulo: 'Receso' },
      { inicio: '10:20', fin: '10:40', tipo: 'ponencia', titulo: 'Supresión ácida: una historia de innovación terapéutica', ponente: 'Dra. Vania Bárcenas Piña', perfil: 'Gerente médico de M8 Pharmaceuticals, Monterrey, N. L.', coordina: 'Dr. Daniel Guerra Melgar' },
      { inicio: '10:40', fin: '11:00', tipo: 'ponencia', titulo: 'Importancia de afiliarse a un colegio médico', ponente: 'Dr. Didier Gómez Trujillo', perfil: 'Presidente de la FEACOMECH', ...FEA },
      { inicio: '11:00', fin: '11:30', tipo: 'ponencia', titulo: 'VPH y cáncer bucal', ponente: 'Dra. Carla Leonor Robles Calzada', perfil: 'Odontóloga especialista en patología bucal', ...DENT },
      { inicio: '11:30', fin: '12:00', tipo: 'ponencia', titulo: 'Hábitos orales y su impacto en la salud general', ponente: 'Dra. Mariela Madrigal Ramírez', perfil: 'Odontóloga pediatra', ...DENT },
      { inicio: '12:00', fin: '12:30', tipo: 'ponencia', titulo: 'VPH en el cáncer cervicouterino', ponente: 'Dr. Carlos de León Rodríguez', perfil: 'Anatomopatólogo', ...PATO },
      { inicio: '12:30', fin: '13:00', tipo: 'ponencia', titulo: 'Embarazo en adolescentes', ponente: 'Dra. Raday García Estrada', perfil: 'Médica general', ...MG },
      { inicio: '13:00', fin: '13:30', tipo: 'receso', titulo: 'Receso' },
      { inicio: '13:30', fin: '14:00', tipo: 'ponencia', titulo: 'El paradigma de la salud planetaria: retos y realidades para la medicina contemporánea', ponente: 'Dr. Jorge Iván Gómez Vázquez', perfil: 'Médico general', ...MG },
      { inicio: '14:00', fin: '14:30', tipo: 'ponencia', titulo: 'El médico familiar como educador: transformar la consulta en una oportunidad de aprendizaje', ponente: 'Dr. Gildardo Anacleto Flores', perfil: 'Médico familiar', ...MF },
      { inicio: '14:30', fin: '15:00', tipo: 'ponencia', titulo: 'El arte y la ciencia de la atención gerontológica', ponente: 'Dr. Freddy Alejandro Díaz Solares', perfil: 'Médico familiar', ...MF },
      { inicio: '15:00', fin: '15:30', tipo: 'ponencia', titulo: 'Cuando todo importa: cómo tomar decisiones ante el paciente complejo en medicina familiar', ponente: 'Dra. América Fabiola Benítez Rendón', perfil: 'Médica familiar', ...MF },
      { inicio: '16:00', fin: '18:00', tipo: 'taller', titulo: 'Accesos vasculares', ponente: 'Dr. Víctor Manuel Blanco Martínez', perfil: 'Especialista en accesos vasculares ecoguiados', lugar: 'Salón Misolha', costo: 400 },
    ],
  },
  {
    fecha: '2026-11-28',
    dia: 'Sábado 28',
    etiqueta: 'Día 3',
    tema: 'Simposio de Dermatología',
    actividades: [
      { inicio: '08:00', fin: '08:30', tipo: 'ponencia', titulo: 'Actualidades en el tratamiento de la alopecia androgenética', ponente: 'Dr. Fernando López Vázquez', perfil: 'Dermatólogo', ...DERMA },
      { inicio: '08:30', fin: '09:00', tipo: 'ponencia', titulo: 'Piel y pelo: las señales visibles de los cambios invisibles', ponente: 'Dr. Diego Olín Pérez Rojas', perfil: 'Cirujano dermatólogo, Ciudad de México', ...DERMA },
      { inicio: '09:00', fin: '09:30', tipo: 'ponencia', titulo: 'Corticoesteroides tópicos: uso racional', ponente: 'Dr. Josué León', perfil: 'Director médico de LEO Pharma', ...DERMA },
      { inicio: '09:30', fin: '10:00', tipo: 'ponencia', titulo: 'Disruptores endocrinos', ponente: 'Dr. Julio Mayorga Camargo', perfil: 'Endocrinólogo, Haut Klinik, Ciudad de México', ...DERMA },
      { inicio: '10:00', fin: '10:30', tipo: 'ponencia', titulo: 'Nuevas alternativas en el tratamiento del acné: fagoterapia', ponente: 'Dr. Alberto Checa Rojas', perfil: 'Doctor en Ciencias Biomédicas · Director de CAS Biotechnology', ...DERMA },
      { inicio: '10:30', fin: '11:00', tipo: 'receso', titulo: 'Receso' },
      { inicio: '11:00', fin: '11:30', tipo: 'ponencia', titulo: 'La piel habla: manifestaciones cutáneas que cambian el rumbo del diagnóstico', ponente: 'Dra. Karen Citlali Pérez Cruz', perfil: 'Dermatóloga', ...DERMA },
      { inicio: '11:30', fin: '12:00', tipo: 'ponencia', titulo: 'Signos ungueales: no todo es onicomicosis', ponente: 'Dra. Esther Pastrana Ruiz', perfil: 'Dermatóloga', ...DERMA },
      { inicio: '12:00', fin: '12:30', tipo: 'ponencia', titulo: 'Fenómeno de sensibilización central', ponente: 'Dr. Nelson Jovany Urbina', perfil: 'Anestesiólogo algólogo', ...DERMA },
      { inicio: '12:30', fin: '13:00', tipo: 'receso', titulo: 'Receso' },
      { inicio: '13:00', fin: '13:30', tipo: 'ponencia', titulo: 'En dermatología, no todo es lo que parece (casos clínicos)', ponente: 'Dermatólogos del Colegio de Chiapas de Dermatología A.C.', ...DERMA },
      { inicio: '13:30', fin: '14:00', tipo: 'ponencia', titulo: 'Inteligencia artificial en dermatología', ponente: 'Dra. Erika Zúñiga Ramírez', perfil: 'Dermatóloga', ...DERMA },
      { inicio: '14:00', fin: '14:30', tipo: 'ponencia', titulo: '¿Qué hay de nuevo en el tratamiento de la psoriasis?', ponente: 'Dr. Fabio Anzueto Sánchez', perfil: 'Dermatólogo patólogo', ...DERMA },
      { inicio: '14:30', fin: '15:00', tipo: 'ponencia', titulo: 'Equipos y tecnologías médicas', ponente: 'Lic. Alejandro Moreno', perfil: 'Director de H&M BTI', ...DERMA },
      { inicio: '20:30', tipo: 'social', titulo: 'Toma de protesta de la nueva Mesa Directiva y Cena de Gala FEACOMECH', lugar: 'Salón Palenque', costo: 1000 },
    ],
  },
]

/** Mesa Directiva FEACOMECH, Bienio 2026 – 2028 (rinde protesta el 28 de noviembre). */
export const MESA_DIRECTIVA_2026 = {
  cargos: [
    { cargo: 'Presidenta', nombre: 'Dra. Fanny Kramsky Soto' },
    { cargo: 'Vicepresidenta', nombre: 'Dra. Isidra Candelario López' },
    { cargo: 'Secretaria Técnica', nombre: 'Dra. María del Carmen Albores Guillén' },
    { cargo: 'Secretario Administrativo', nombre: 'Ing. Biomédico Alexander Arroyo Núñez' },
    { cargo: 'Tesorera', nombre: 'QFB. Cecilia Cleotilde Velázquez Andrade' },
    { cargo: 'Protesorero', nombre: 'Dr. Humberto Hernández Rojas' },
  ],
  consejo: [
    { nombre: 'Dr. Didier Gómez Trujillo' },
    { nombre: 'Dr. Radamez Ramírez Cano' },
    { nombre: 'Dr. Ricardo Tovilla Victoria', finado: true },
  ],
  presidentes: [
    { nombre: 'Dr. Jorge Rincón Acebo', colegio: 'Anatomopatología' },
    { nombre: 'Dra. Irais Del Solar López', colegio: 'Anestesiología' },
    { nombre: 'Dr. Fernando Rodolfo García Alfonso', colegio: 'Angiología' },
    { nombre: 'Dr. Antonio Citalán Jiménez', colegio: 'Cardiología' },
    { nombre: 'Dr. Marco A. Barreda Gaxiola', colegio: 'Cirugía Plástica' },
    { nombre: 'Dr. Juan Carlos Martínez Cardiel', colegio: 'Asociación Médica de Comitán' },
    { nombre: 'Dra. María Candelaria Gómez Velasco', colegio: 'Cirujanos Dentistas' },
    { nombre: 'Dr. Antonio Flores', colegio: 'Dermatología' },
    { nombre: 'Dr. Rodimiro Aguilar Valenzuela', colegio: 'Ginecólogas/os y Obstetras' },
    { nombre: 'Dra. América F. Benítez Rendón', colegio: 'Medicina Familiar' },
    { nombre: 'Dr. Jorge Iván Gómez Vázquez', colegio: 'Medicina General' },
    { nombre: 'Dr. José de Jesús Almanza Muñoz', colegio: 'Neurociencias' },
    { nombre: 'Dra. Hilda Rentería García', colegio: 'Oftalmología' },
    { nombre: 'Dr. Gerardo Sánchez Hernández', colegio: 'Otorrinolaringología' },
    { nombre: 'Dra. Laura Cordero Zepeda', colegio: 'Pediatría' },
    { nombre: 'Psic. María del Carmen Peche Domínguez', colegio: 'Psicología' },
    { nombre: 'QFB. Adriana Osiris Méndez Cigarroa', colegio: 'Químicos' },
    { nombre: 'Dra. Liliana Hernández Cruz', colegio: 'Reumatología' },
    { nombre: 'Dr. Pablo Manuel Alcázar Ramos', colegio: 'San Cristóbal de las Casas' },
    { nombre: 'Mtra. Ts. María Helena León Macías', colegio: 'Trabajo Social' },
    { nombre: 'Dr. Sarain Montero Orozco', colegio: 'Traumatología' },
    { nombre: 'Dr. Eleasin López Flores', colegio: 'Médicos Ecografistas de Chiapas' },
    { nombre: 'Dra. Claudia Rojas Guzmán', colegio: 'Urgenciólogos' },
  ],
}

export const ponenciasDe = (d: DiaPrograma) => d.actividades.filter(a => a.tipo === 'ponencia')

/** Ponentes invitados de fuera de Chiapas o de la industria (según el temario). */
export const PONENTES_INVITADOS = [
  { nombre: 'Dr. Alexandro Bonifaz', perfil: 'Doctor en Micología · Jefe del Departamento de Micología, Hospital General Dr. Manuel Gea González', tema: 'Actualidades en micosis cutáneas', dia: 'Jueves 26 · 08:20' },
  { nombre: 'Dr. Diego Olín Pérez Rojas', perfil: 'Cirujano dermatólogo, Ciudad de México', tema: 'Piel y pelo: las señales visibles de los cambios invisibles', dia: 'Sábado 28 · 08:30' },
  { nombre: 'Dr. Julio Mayorga Camargo', perfil: 'Endocrinólogo, Haut Klinik, Ciudad de México', tema: 'Disruptores endocrinos', dia: 'Sábado 28 · 09:30' },
  { nombre: 'Dr. Alberto Checa Rojas', perfil: 'Doctor en Ciencias Biomédicas · Director de CAS Biotechnology', tema: 'Fagoterapia en el tratamiento del acné', dia: 'Sábado 28 · 10:00' },
  { nombre: 'Dra. Vania Bárcenas Piña', perfil: 'Gerente médico de M8 Pharmaceuticals, Monterrey', tema: 'Supresión ácida: una historia de innovación terapéutica', dia: 'Viernes 27 · 10:20' },
  { nombre: 'Dr. Josué León', perfil: 'Director médico de LEO Pharma', tema: 'Corticoesteroides tópicos: uso racional', dia: 'Sábado 28 · 09:00' },
]
