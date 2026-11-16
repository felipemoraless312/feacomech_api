// Créditos de la plataforma web (página /desarrollo, enlazada desde el pie de página).
// Tomado del currículum del desarrollador (noviembre de 2026), revisado y corregido.
// No se publican teléfono ni correo personal: el contacto va por /contacto.

export const DESARROLLADOR = {
  nombre: 'Ing. Luis Felipe Morales Gutiérrez',
  rol: 'Diseño y desarrollo de la plataforma web',
  titulo: 'Ingeniero Biomédico',
  foto: '/img/personas/luis-felipe-morales-gutierrez-rostro.jpg',
  retrato: '/img/personas/luis-felipe-morales-gutierrez.jpg',
  recorte: '/img/personas/recortes/luis-felipe-morales-gutierrez.webp',
  presentacion: [
    'Ingeniero biomédico por la Universidad Politécnica de Chiapas, con experiencia en telecomunicaciones, infraestructura de redes, equipo médico y programación.',
    'Diseñó y desarrolló la plataforma web de la FEACOMECH: el portal institucional, la plataforma privada para afiliados y la infraestructura y seguridad del servidor que la aloja. Como integrante de la comunidad de la Federación, participa en su programa de capacitación continua.',
  ],
  /** Lo que se construyó para la Federación. */
  aportes: [
    { icono: 'i-lucide-globe', titulo: 'Portal institucional', texto: 'Noticias, eventos, directorio de colegios agremiados, organización y vinculación institucional.' },
    { icono: 'i-lucide-users', titulo: 'Plataforma de afiliados', texto: 'Perfiles profesionales, comunidad médica, documentos y administración con roles y permisos.' },
    { icono: 'i-lucide-badge-check', titulo: 'Credencial y constancias', texto: 'Credencial digital con código QR y constancias que cualquiera puede verificar en línea.' },
    { icono: 'i-lucide-scan-qr-code', titulo: 'Registro en sede', texto: 'Registro e ingresos de asistentes de las VII Jornadas Académicas 2026.' },
    { icono: 'i-lucide-shield-check', titulo: 'Seguridad e infraestructura', texto: 'Servidor propio con HTTPS, respaldos diarios, bitácora de acciones y acceso protegido.' },
  ],
  experiencia: [
    { cargo: 'Profesor de asignatura', lugar: 'Universidad Politécnica de Chiapas', periodo: 'Agosto de 2025 – actual', texto: 'Docencia en ingeniería biomédica y tecnología, diseño de material didáctico y asesoría de proyectos de investigación.' },
    { cargo: 'Supervisor técnico de infraestructura corporativa', lugar: 'SICOP', periodo: 'Marzo de 2024 – mayo de 2026', texto: 'Cableado estructurado certificado en más de 10 sedes, sistemas de videovigilancia IP, soporte a usuarios y herramientas en Python para el análisis de registros de red.' },
    { cargo: 'Estadía industrial', lugar: 'Universidad Politécnica de Chiapas', periodo: 'Abril – junio de 2025', texto: 'Desarrollo de software en Python para el procesamiento y análisis de imágenes biomédicas, y logística de eventos académicos.' },
    { cargo: 'Técnico biomédico (estancia industrial II)', lugar: 'ISSTECH, Hospital de Especialidades «Vida Mejor»', periodo: 'Diciembre de 2024', texto: 'Mantenimiento preventivo y correctivo de ventiladores, monitores y sistemas de soporte vital en cuidados intensivos.' },
    { cargo: 'Técnico en equipos biomédicos (estancia industrial I)', lugar: 'Sanatorio Muñoa', periodo: 'Marzo – abril de 2023', texto: 'Evaluación funcional de monitores de signos vitales e inventario de equipo biomédico.' },
  ],
  habilidades: [
    'Desarrollo web', 'Python', 'JavaScript', 'SQL', 'C', 'MATLAB', 'Machine learning',
    'Procesamiento de imágenes biomédicas', 'Redes y cableado estructurado', 'Videovigilancia IP',
    'Equipo biomédico', 'SolidWorks', 'Fusion 360',
  ],
  formacion: [
    { titulo: 'Ingeniería Biomédica', lugar: 'Universidad Politécnica de Chiapas', periodo: '2021 – 2025' },
    { titulo: 'Gestión de proyectos de Google', lugar: 'Google / Coursera', periodo: 'Abril de 2024' },
    { titulo: 'Gestión de proyectos y fundamentos de metodología Agile', lugar: 'Santander Open Academy', periodo: 'Septiembre de 2024' },
    { titulo: 'Análisis de circuitos eléctricos', lugar: 'Curso académico', periodo: 'Enero de 2025' },
  ],
  idiomas: 'Español (nativo) · Inglés (intermedio)',
} as const
