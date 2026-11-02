declare module '#auth-utils' {
  /**
   * Lo que viaja en la cookie sellada: sólo identidad, sin datos sensibles.
   * Roles y permisos NO van aquí: se leen de la base (con caché) en cada petición,
   * así un cambio de permisos aplica de inmediato y la cookie no crece.
   */
  interface User {
    id: string
    email: string
    nombre: string
    debeCambiarPassword: boolean
    versionSesion: number
  }

  interface UserSession {
    /** Id del renglón en la tabla Sesion (permite ver y cerrar sesiones por dispositivo). */
    sesionId?: string
  }
}

export {}
