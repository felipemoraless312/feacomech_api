// Créditos de la plataforma web (página /desarrollo y tarjeta en /contacto): un resumen breve
// del perfil del desarrollador y su contacto profesional.

export const DESARROLLADOR = {
  nombre: 'Ing. Luis Felipe Morales Gutiérrez',
  cargo: 'CEO de Numma · Ingeniero Biomédico',
  foto: '/img/personas/luis-felipe-morales-gutierrez-rostro.jpg',
  retrato: '/img/personas/luis-felipe-morales-gutierrez.jpg',
  recorte: '/img/personas/recortes/luis-felipe-morales-gutierrez.webp',
  /** Resumen (abstract) del perfil. */
  resumen: 'Ingeniero biomédico por la Universidad Politécnica de Chiapas y CEO de Numma, empresa de desarrollo web con enfoque corporativo y de infraestructura. Diseñó y desarrolló la plataforma digital de la FEACOMECH. Entre sus proyectos destacan el maletín de telesalud BioKit Rural, la plataforma de registro del Día del Médico y su participación en campañas de mastografía en conjunto con CEPREC.',
  /**
   * Contacto profesional, publicado a petición del desarrollador. Va en partes para que no
   * aparezca completo en el HTML del servidor (lo arma el navegador): así los robots que
   * recolectan correos y teléfonos no lo encuentran fácilmente.
   */
  contacto: {
    telefono: ['961', '610', '6469'],
    correo: ['felipemorales453', 'gmail.com'],
  },
  /** Fuente pública sobre BioKit Rural. */
  nota: {
    texto: 'BioKit Rural en Alerta Chiapas',
    enlace: 'https://alertachiapas.com/2026/04/23/jovenes-crean-dispositivo-para-facilitar-el-diagnostico-medico/',
  },
} as const
