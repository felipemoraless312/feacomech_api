import type { Permiso } from '#shared/permisos'

declare module '#app' {
  interface PageMeta {
    /** Permiso requerido para entrar a la página de la plataforma. */
    permiso?: Permiso
    /** Rol global requerido (p. ej. SUPERADMIN). */
    rol?: string
  }
}

export {}
