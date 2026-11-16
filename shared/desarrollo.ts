// Créditos de la plataforma web (página /desarrollo y tarjeta en /contacto): perfil profesional
// del desarrollador y su contacto. Fuentes: currículum y catálogo de servicios de Numma
// (noviembre de 2026), revisados y redactados para el portal. Sin precios ni paquetes.

export const DESARROLLADOR = {
  nombre: 'Ing. Luis Felipe Morales Gutiérrez',
  cargo: 'CEO de Numma · Ingeniero Biomédico',
  foto: '/img/personas/luis-felipe-morales-gutierrez-rostro.jpg',
  retrato: '/img/personas/luis-felipe-morales-gutierrez.jpg',
  recorte: '/img/personas/recortes/luis-felipe-morales-gutierrez.webp',
  /** Resumen profesional (párrafos), en el mismo estilo que las reseñas de la mesa directiva. */
  resumen: [
    'Ingeniero biomédico y CEO de Numma, empresa de tecnología clínica y telecomunicaciones. Su trabajo se distingue por unir la ingeniería biomédica, el desarrollo de software y la infraestructura tecnológica en soluciones que acercan la tecnología a la atención de la salud.',
    'Es ingeniero biomédico por la Universidad Politécnica de Chiapas. Cuenta con experiencia en infraestructura y arquitectura de redes, cableado estructurado certificado y sistemas de videovigilancia IP para sedes corporativas, así como en el mantenimiento de equipo médico crítico en entornos hospitalarios. Tiene además experiencia docente a nivel licenciatura en ingeniería biomédica y tecnología.',
    'Al frente de Numma desarrolla plataformas de gestión clínica y administrativa para consultorios, clínicas, hospitales e instituciones, entre ellas expediente clínico electrónico, facturación electrónica y control de accesos, y ofrece un servicio integral que abarca la asesoría, la instalación, el mantenimiento y el soporte técnico.',
    'Es creador del maletín de telesalud BioKit Rural, desarrolló la plataforma de registro del Día del Médico y participa en campañas de mastografía en conjunto con CEPREC. Para la FEACOMECH diseñó y desarrolló el portal institucional y la plataforma de afiliados, incluida la infraestructura y la seguridad del servidor que la aloja.',
  ],
  /** Áreas en las que desarrolla tecnología (a partir del catálogo de Numma y su trayectoria). */
  especialidades: [
    {
      icono: 'i-lucide-file-heart',
      titulo: 'Software clínico y administrativo',
      texto: 'Expediente clínico electrónico, agenda y recetas; punto de venta con roles y cortes de caja; facturación electrónica CFDI 4.0; y control de accesos y reloj checador para hasta 1000 colaboradores.',
    },
    {
      icono: 'i-lucide-monitor-smartphone',
      titulo: 'Plataformas y sitios web',
      texto: 'Portales institucionales, plataformas con usuarios, roles y permisos, registro de eventos y sitios adaptables a celular, tableta y computadora.',
    },
    {
      icono: 'i-lucide-network',
      titulo: 'Infraestructura y telecomunicaciones',
      texto: 'Arquitectura de redes, cableado estructurado certificado a nivel corporativo, servidores y sistemas de videovigilancia IP con monitoreo centralizado.',
    },
    {
      icono: 'i-lucide-heart-pulse',
      titulo: 'Ingeniería biomédica',
      texto: 'Mantenimiento de equipo médico crítico, telesalud para zonas rurales y software para el procesamiento y análisis de imágenes biomédicas.',
    },
  ],
  /** Proyectos destacados, con enlace a una fuente cuando la hay. */
  proyectos: [
    { titulo: 'Plataforma digital de la FEACOMECH', texto: 'Portal institucional, plataforma de afiliados, credencial digital y constancias verificables.' },
    { titulo: 'BioKit Rural', texto: 'Maletín de telesalud que envía el expediente clínico a médicos especialistas para consulta a distancia.', enlace: 'https://alertachiapas.com/2026/04/23/jovenes-crean-dispositivo-para-facilitar-el-diagnostico-medico/', fuente: 'Alerta Chiapas' },
    { titulo: 'Registro del Día del Médico', texto: 'Plataforma de registro para la celebración del Día del Médico.' },
    { titulo: 'Campañas de mastografía', texto: 'Participación en campañas de detección oportuna de cáncer de mama, en conjunto con CEPREC.' },
  ],
  /** Trayectoria resumida, de lo más reciente a lo más antiguo. */
  trayectoria: [
    { cargo: 'CEO', lugar: 'Numma', periodo: 'Actual' },
    { cargo: 'Docencia', lugar: 'Nivel licenciatura · Ingeniería biomédica y tecnología', periodo: '2025 – actual' },
    { cargo: 'Supervisor técnico de infraestructura corporativa', lugar: 'SICOP', periodo: '2024 – 2026' },
    { cargo: 'Técnico biomédico', lugar: 'ISSTECH, Hospital de Especialidades «Vida Mejor» · Sanatorio Muñoa', periodo: '2023 – 2024' },
    { cargo: 'Ingeniería Biomédica', lugar: 'Universidad Politécnica de Chiapas', periodo: '2021 – 2025' },
  ],
  /**
   * Contacto profesional. Va en partes para que no aparezca completo en el HTML del servidor
   * (lo arma el navegador): así los robots que recolectan correos y teléfonos no lo encuentran.
   */
  contacto: {
    telefono: ['961', '610', '6469'],
    correo: ['numma.contact', 'gmail.com'],
  },
} as const
