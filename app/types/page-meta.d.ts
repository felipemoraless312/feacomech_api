import type { Permiso } from '#shared/permisos'

declare module '#app' {
  interface PageMeta {
    /** Permiso requerido para entrar a la página de la plataforma. */
    permiso?: Permiso
  }
}

export {}
