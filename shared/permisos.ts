// Control de acceso (RBAC).
//
// El CATÁLOGO de permisos se define aquí: cada endpoint exige uno con
// `requirePermiso(event, 'permiso')`, así que la lista la fija el código.
// La ASIGNACIÓN rol → permiso vive en la base (tablas Rol y RolPermiso) y la editan
// los administradores desde Configuración → Roles. `PERMISOS_INICIALES` es sólo lo que
// el seed carga la primera vez.
//
// Alcance con el que un rol tiene un permiso:
//   TOTAL        – en toda la Federación.
//   ORGANIZACION – sólo en las organizaciones donde el usuario tiene ese rol
//                  (p. ej. el representante de un colegio sobre su colegio).
//   PROPIO       – sólo sobre lo que el usuario creó o lo que es suyo.
// El servicio de dominio aplica ORGANIZACION/PROPIO; aquí sólo se declaran.

export const ALCANCES = ['TOTAL', 'ORGANIZACION', 'PROPIO'] as const
export type Alcance = (typeof ALCANCES)[number]

export const NOMBRE_ALCANCE: Record<Alcance, string> = {
  TOTAL: 'Toda la Federación',
  ORGANIZACION: 'Su organización',
  PROPIO: 'Sólo lo propio',
}

interface DefinicionPermiso {
  grupo: string
  descripcion: string
  /** Alcances que tienen sentido para este permiso (el panel sólo ofrece éstos). */
  alcances: readonly Alcance[]
}

const T = ['TOTAL'] as const
const TO = ['TOTAL', 'ORGANIZACION'] as const
const TOP = ['TOTAL', 'ORGANIZACION', 'PROPIO'] as const

export const CATALOGO_PERMISOS = {
  // Usuarios y accesos
  'usuario.ver': { grupo: 'Usuarios', descripcion: 'Consultar usuarios de la plataforma', alcances: TO },
  'usuario.administrar': { grupo: 'Usuarios', descripcion: 'Crear, editar, desactivar usuarios y asignar roles', alcances: T },
  'rol.administrar': { grupo: 'Usuarios', descripcion: 'Configurar roles y sus permisos', alcances: T },

  // Profesionales y afiliaciones
  'profesional.ver': { grupo: 'Profesionales', descripcion: 'Consultar perfiles profesionales completos', alcances: TO },
  'profesional.validar': { grupo: 'Profesionales', descripcion: 'Validar cédulas y datos profesionales', alcances: T },
  'afiliacion.solicitar': { grupo: 'Afiliaciones', descripcion: 'Solicitar altas y bajas de integrantes', alcances: TO },
  'afiliacion.validar': { grupo: 'Afiliaciones', descripcion: 'Aprobar o rechazar solicitudes de afiliación', alcances: T },

  // Colegios y asociaciones
  'organizacion.ver': { grupo: 'Colegios y asociaciones', descripcion: 'Consultar el detalle interno de organizaciones', alcances: TO },
  'organizacion.editar': { grupo: 'Colegios y asociaciones', descripcion: 'Proponer cambios a la información de la organización', alcances: TO },
  'organizacion.administrar': { grupo: 'Colegios y asociaciones', descripcion: 'Registrar organizaciones, validar cambios y su estado de afiliación', alcances: T },

  // Estructura organizacional
  'estructura.administrar': { grupo: 'Estructura', descripcion: 'Cargos, periodos, nombramientos, mesa directiva y consejo', alcances: TO },

  // Comunicación
  'noticia.publicar': { grupo: 'Noticias', descripcion: 'Redactar noticias y comunicados', alcances: TOP },
  'noticia.administrar': { grupo: 'Noticias', descripcion: 'Aprobar, publicar y retirar noticias del portal', alcances: T },
  'contenido.administrar': { grupo: 'Portal público', descripcion: 'Editar páginas institucionales, vinculación y datos de contacto', alcances: T },
  'contacto.ver': { grupo: 'Portal público', descripcion: 'Consultar mensajes del formulario de contacto', alcances: T },

  // Eventos
  'evento.gestionar': { grupo: 'Eventos', descripcion: 'Crear y editar eventos, inscripciones y asistencia', alcances: TO },
  'constancia.emitir': { grupo: 'Eventos', descripcion: 'Emitir constancias de participación', alcances: TO },

  // Comunidad
  'comunidad.participar': { grupo: 'Comunidad', descripcion: 'Publicar, comentar y reaccionar en la comunidad', alcances: T },
  'comunidad.moderar': { grupo: 'Comunidad', descripcion: 'Atender reportes y moderar publicaciones', alcances: TO },
  'grupo.administrar': { grupo: 'Comunidad', descripcion: 'Crear grupos de discusión y definir su privacidad', alcances: TO },

  // Documentos
  'documento.ver': { grupo: 'Documentos', descripcion: 'Consultar documentos de acceso restringido', alcances: TO },
  'documento.gestionar': { grupo: 'Documentos', descripcion: 'Subir, clasificar y retirar documentos', alcances: TO },

  // Información y control
  'censo.ver': { grupo: 'Censo e informes', descripcion: 'Consultar el censo médico detallado', alcances: TO },
  'reporte.ver': { grupo: 'Censo e informes', descripcion: 'Consultar y exportar reportes', alcances: TO },
  'config.administrar': { grupo: 'Configuración', descripcion: 'Datos institucionales, catálogos y parámetros', alcances: T },
  'auditoria.ver': { grupo: 'Configuración', descripcion: 'Consultar la bitácora de acciones', alcances: T },
} as const satisfies Record<string, DefinicionPermiso>

export type Permiso = keyof typeof CATALOGO_PERMISOS

export const PERMISOS = Object.keys(CATALOGO_PERMISOS) as Permiso[]

export function esPermiso(valor: string): valor is Permiso {
  return Object.hasOwn(CATALOGO_PERMISOS, valor)
}

/** Permisos efectivos de un usuario: permiso → alcance más amplio que le dan sus roles. */
export type PermisosEfectivos = Partial<Record<Permiso, Alcance>>

const PESO: Record<Alcance, number> = { PROPIO: 1, ORGANIZACION: 2, TOTAL: 3 }

/** El más amplio de dos alcances (TOTAL > ORGANIZACION > PROPIO). */
export function alcanceMayor(a: Alcance | null | undefined, b: Alcance | null | undefined): Alcance | null {
  if (!a) return b ?? null
  if (!b) return a
  return PESO[a] >= PESO[b] ? a : b
}

/**
 * Une los permisos de varios roles. Ignora permisos que ya no existen en el catálogo
 * (p. ej. uno retirado del código que sigue en la base).
 */
export function combinarPermisos(filas: readonly { permiso: string, alcance: Alcance }[]): PermisosEfectivos {
  const out: PermisosEfectivos = {}
  for (const { permiso, alcance } of filas) {
    if (!esPermiso(permiso)) continue
    out[permiso] = alcanceMayor(out[permiso], alcance)!
  }
  return out
}

// -----------------------------------------------------------------------------
//  Roles iniciales (el seed los crea; después se administran desde el panel)
// -----------------------------------------------------------------------------

export const ROLES_INICIALES = [
  { clave: 'SUPERADMIN', nombre: 'Superadministrador', descripcion: 'Acceso total a la plataforma, incluida la configuración de roles.' },
  { clave: 'PRESIDENTE', nombre: 'Presidente', descripcion: 'Presidencia de la Federación.' },
  { clave: 'ADMIN_INSTITUCIONAL', nombre: 'Administrador institucional', descripcion: 'Opera la plataforma a nombre de la Federación.' },
  { clave: 'MESA_DIRECTIVA', nombre: 'Integrante de mesa directiva', descripcion: 'Integrante de la mesa directiva vigente de la Federación.' },
  { clave: 'CONSEJERO', nombre: 'Consejero', descripcion: 'Integrante del consejo consultivo.' },
  { clave: 'REPRESENTANTE_COLEGIO', nombre: 'Representante de colegio', descripcion: 'Administra la información de su colegio.' },
  { clave: 'REPRESENTANTE_ASOCIACION', nombre: 'Representante de asociación', descripcion: 'Administra la información de su asociación.' },
  { clave: 'MEDICO_AFILIADO', nombre: 'Médico afiliado', descripcion: 'Profesional afiliado con acceso a la comunidad.' },
] as const

export type ClaveRolInicial = (typeof ROLES_INICIALES)[number]['clave']

/** Rol que siempre conserva todos los permisos y no se puede quitar al último usuario que lo tenga. */
export const ROL_SUPERADMIN = 'SUPERADMIN'

const todos = (alcance: Alcance = 'TOTAL'): PermisosEfectivos =>
  Object.fromEntries(PERMISOS.map(p => [p, alcance])) as PermisosEfectivos

const representante: PermisosEfectivos = {
  'usuario.ver': 'ORGANIZACION',
  'profesional.ver': 'ORGANIZACION',
  'afiliacion.solicitar': 'ORGANIZACION',
  'organizacion.ver': 'ORGANIZACION',
  'organizacion.editar': 'ORGANIZACION',
  'estructura.administrar': 'ORGANIZACION',
  'noticia.publicar': 'ORGANIZACION',
  'evento.gestionar': 'ORGANIZACION',
  'constancia.emitir': 'ORGANIZACION',
  'comunidad.participar': 'TOTAL',
  'comunidad.moderar': 'ORGANIZACION',
  'grupo.administrar': 'ORGANIZACION',
  'documento.ver': 'ORGANIZACION',
  'documento.gestionar': 'ORGANIZACION',
  'censo.ver': 'ORGANIZACION',
  'reporte.ver': 'ORGANIZACION',
}

const institucional: PermisosEfectivos = {
  'usuario.ver': 'TOTAL',
  'profesional.ver': 'TOTAL',
  'organizacion.ver': 'TOTAL',
  'noticia.publicar': 'PROPIO',
  'comunidad.participar': 'TOTAL',
  'documento.ver': 'TOTAL',
  'censo.ver': 'TOTAL',
  'reporte.ver': 'TOTAL',
}

/** Asignación inicial. Los administradores la ajustan después según las atribuciones reales. */
export const PERMISOS_INICIALES: Record<ClaveRolInicial, PermisosEfectivos> = {
  SUPERADMIN: todos(),
  PRESIDENTE: { ...todos(), 'usuario.administrar': undefined, 'rol.administrar': undefined, 'config.administrar': undefined },
  ADMIN_INSTITUCIONAL: { ...todos(), 'rol.administrar': undefined },
  MESA_DIRECTIVA: { ...institucional, 'evento.gestionar': 'TOTAL', 'constancia.emitir': 'TOTAL' },
  CONSEJERO: { ...institucional },
  REPRESENTANTE_COLEGIO: representante,
  REPRESENTANTE_ASOCIACION: representante,
  // Lo propio de cualquier usuario autenticado (su perfil, su credencial, inscribirse a
  // eventos, documentos para integrantes) no requiere permiso: lo decide cada servicio.
  MEDICO_AFILIADO: { 'comunidad.participar': 'TOTAL' },
}

/** Quita las entradas sin alcance (las que un rol inicial "resta" a otro). */
export function entradasPermisos(p: PermisosEfectivos): [Permiso, Alcance][] {
  return Object.entries(p).filter((e): e is [Permiso, Alcance] => !!e[1])
}
