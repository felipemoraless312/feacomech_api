import type { CommandPaletteGroup, CommandPaletteItem, NavigationMenuItem } from '@nuxt/ui'
import type { Permiso } from '#shared/permisos'

/** Un destino de la plataforma. Aparece sólo si el usuario tiene el permiso indicado. */
export interface Destino {
  label: string
  icon: string
  to: string
  /** Para el buscador y los accesos rápidos del resumen. */
  descripcion?: string
  permiso?: Permiso
  algunPermiso?: Permiso[]
  exact?: boolean
  exactQuery?: boolean
  target?: '_blank'
  notificaciones?: boolean
}

/** Sección de administración: se pliega en el menú y muestra sus destinos al abrirla. */
interface Seccion {
  label: string
  icon: string
  destinos: Destino[]
}

// Lo de todos los días, siempre visible.
const GENERAL: Destino[] = [
  { label: 'Inicio', icon: 'i-lucide-house', to: '/plataforma', exact: true, descripcion: 'Resumen y pendientes' },
  { label: 'Notificaciones', icon: 'i-lucide-bell', to: '/plataforma/notificaciones', notificaciones: true, descripcion: 'Avisos de la Federación y de la comunidad' },
]

const COMUNIDAD: Destino[] = [
  { label: 'Comunidad médica', icon: 'i-lucide-messages-square', to: '/plataforma/comunidad', descripcion: 'Grupos de discusión entre colegas' },
  { label: 'Eventos', icon: 'i-lucide-calendar-days', to: '/plataforma/eventos', exact: true, descripcion: 'Congresos, cursos e inscripciones' },
  { label: 'Documentos', icon: 'i-lucide-library', to: '/plataforma/documentos', descripcion: 'Estatutos, actas y formatos' },
  { label: 'Directorio', icon: 'i-lucide-building-2', to: '/directorio', target: '_blank', descripcion: 'Colegios y profesionales (portal público)' },
]

const CUENTA: Destino[] = [
  { label: 'Mi perfil', icon: 'i-lucide-id-card', to: '/plataforma/cuenta/perfil', descripcion: 'Datos personales y profesionales' },
  { label: 'Credencial digital', icon: 'i-lucide-badge-check', to: '/plataforma/cuenta/credencial', descripcion: 'Con código QR para comprobar su afiliación' },
  { label: 'Seguridad', icon: 'i-lucide-shield-check', to: '/plataforma/cuenta/seguridad', descripcion: 'Contraseña y sesiones abiertas' },
]

// Administración agrupada por tarea, en lugar de una lista larga.
const ADMINISTRACION: Seccion[] = [
  {
    label: 'Afiliados',
    icon: 'i-lucide-users',
    destinos: [
      { label: 'Profesionales', icon: 'i-lucide-stethoscope', permiso: 'profesional.ver', to: '/plataforma/profesionales', descripcion: 'Padrón y validación de cédulas' },
      { label: 'Solicitudes de afiliación', icon: 'i-lucide-file-check-2', algunPermiso: ['afiliacion.solicitar', 'afiliacion.validar', 'organizacion.administrar'], to: '/plataforma/afiliaciones', descripcion: 'Altas, bajas y cambios por aprobar' },
      { label: 'Usuarios y accesos', icon: 'i-lucide-user-cog', permiso: 'usuario.ver', to: '/plataforma/usuarios', descripcion: 'Cuentas, roles e invitaciones' },
    ],
  },
  {
    label: 'Colegios y asociaciones',
    icon: 'i-lucide-landmark',
    destinos: [
      { label: 'Colegios y asociaciones', icon: 'i-lucide-landmark', permiso: 'organizacion.ver', to: '/plataforma/organizaciones', descripcion: 'Organizaciones agremiadas y sus representantes' },
    ],
  },
  {
    label: 'Gobierno',
    icon: 'i-lucide-users-round',
    destinos: [
      { label: 'Mesa directiva', icon: 'i-lucide-users-round', permiso: 'estructura.administrar', to: '/plataforma/estructura', exact: true, exactQuery: true, descripcion: 'Cargos, periodos y nombramientos' },
      { label: 'Consejo consultivo', icon: 'i-lucide-scale', permiso: 'estructura.administrar', to: '/plataforma/estructura?organo=CONSEJO_CONSULTIVO', exactQuery: true, descripcion: 'Integrantes del consejo' },
    ],
  },
  {
    label: 'Eventos',
    icon: 'i-lucide-calendar-cog',
    destinos: [
      { label: 'Gestión de eventos', icon: 'i-lucide-calendar-cog', permiso: 'evento.gestionar', to: '/plataforma/eventos/gestion', descripcion: 'Crear eventos, inscritos y constancias' },
      { label: 'Registro Jornadas 2026', icon: 'i-lucide-scan-qr-code', permiso: 'evento.gestionar', to: '/plataforma/eventos/registro-jornadas', descripcion: 'Registro e ingresos en sede' },
    ],
  },
  {
    label: 'Comunicación',
    icon: 'i-lucide-megaphone',
    destinos: [
      { label: 'Noticias', icon: 'i-lucide-newspaper', algunPermiso: ['noticia.publicar', 'noticia.administrar'], to: '/plataforma/noticias', descripcion: 'Redactar y publicar en el portal' },
      { label: 'Moderación del foro', icon: 'i-lucide-shield-alert', algunPermiso: ['comunidad.moderar', 'grupo.administrar'], to: '/plataforma/moderacion', descripcion: 'Reportes y grupos de la comunidad' },
      { label: 'Mensajes de contacto', icon: 'i-lucide-mail', permiso: 'contacto.ver', to: '/plataforma/mensajes', descripcion: 'Formulario de contacto del portal' },
      { label: 'Vinculación', icon: 'i-lucide-handshake', permiso: 'contenido.administrar', to: '/plataforma/vinculacion', descripcion: 'Instituciones aliadas del portal' },
    ],
  },
  {
    label: 'Informes',
    icon: 'i-lucide-chart-column',
    destinos: [
      { label: 'Censo médico', icon: 'i-lucide-chart-pie', permiso: 'censo.ver', to: '/plataforma/censo', descripcion: 'Profesionales por municipio y especialidad' },
      { label: 'Reportes', icon: 'i-lucide-chart-column', permiso: 'reporte.ver', to: '/plataforma/reportes', descripcion: 'Consultas y exportación' },
    ],
  },
  {
    label: 'Configuración',
    icon: 'i-lucide-settings',
    destinos: [
      { label: 'Configuración', icon: 'i-lucide-settings', algunPermiso: ['config.administrar', 'rol.administrar', 'auditoria.ver', 'contenido.administrar'], to: '/plataforma/configuracion', descripcion: 'Institución, portada, roles y bitácora' },
    ],
  },
]

/** Menú, buscador y accesos de la plataforma, filtrados por los permisos del usuario. */
export function useMenuPlataforma() {
  const { puede } = usePermisos()
  const { noLeidas } = useNotificaciones()
  const route = useRoute()

  const visible = (d: Destino) => (!d.permiso || puede(d.permiso)) && (!d.algunPermiso || d.algunPermiso.some(p => puede(p)))

  const aItem = ({ descripcion: _d, permiso: _p, algunPermiso: _a, notificaciones, ...d }: Destino): NavigationMenuItem =>
    notificaciones && noLeidas.value
      ? { ...d, badge: { label: String(noLeidas.value), color: 'primary', variant: 'solid', size: 'sm' } }
      : d

  const secciones = computed(() =>
    ADMINISTRACION
      .map(s => ({ ...s, destinos: s.destinos.filter(visible) }))
      .filter(s => s.destinos.length),
  )

  const activa = (d: Destino) => {
    const [ruta] = d.to.split('?')
    return route.path === ruta || (!d.exact && route.path.startsWith(`${ruta}/`))
  }

  const menu = computed<NavigationMenuItem[][]>(() => {
    const admin: NavigationMenuItem[] = secciones.value.map(s =>
      // Una sección con un solo destino no se pliega: es un enlace directo.
      s.destinos.length === 1
        ? aItem(s.destinos[0]!)
        : {
            label: s.label,
            icon: s.icon,
            defaultOpen: s.destinos.some(activa),
            children: s.destinos.map(({ icon: _i, ...d }) => aItem(d as Destino)),
          },
    )
    return [
      GENERAL.map(aItem),
      [{ label: 'Comunidad', type: 'label' }, ...COMUNIDAD.map(aItem)],
      [{ label: 'Mi cuenta', type: 'label' }, ...CUENTA.map(aItem)],
      ...(admin.length ? [[{ label: 'Administración', type: 'label' } as NavigationMenuItem, ...admin]] : []),
    ]
  })

  /** Todos los destinos visibles, para el buscador (Ctrl + K). */
  const busqueda = computed<CommandPaletteGroup<CommandPaletteItem>[]>(() => {
    const items = (lista: Destino[]) => lista.filter(visible).map(d => ({
      label: d.label,
      suffix: d.descripcion,
      icon: d.icon,
      to: d.to,
      target: d.target,
    }))
    return [
      { id: 'general', label: 'Ir a', items: items([...GENERAL, ...COMUNIDAD, ...CUENTA]) },
      ...secciones.value.map(s => ({ id: s.label, label: s.label, items: items(s.destinos) })),
    ].filter(g => g.items.length)
  })

  /** Destinos de administración visibles (accesos rápidos del inicio). */
  const administracion = computed(() => secciones.value.flatMap(s => s.destinos))

  return { menu, busqueda, administracion, comunidad: COMUNIDAD, cuenta: CUENTA }
}
