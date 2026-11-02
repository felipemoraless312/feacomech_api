import type { Alcance, Permiso, PermisosEfectivos } from '#shared/permisos'

export interface AccesoSesion {
  roles: { clave: string, nombre: string, organizacion: { id: string, nombre: string } | null }[]
  permisos: PermisosEfectivos
  /** Para permisos con alcance ORGANIZACION: en qué organizaciones aplican. */
  organizaciones: Partial<Record<Permiso, string[]>>
}

/**
 * Roles y permisos del usuario en el cliente, para mostrar u ocultar menús y botones.
 * El servidor valida siempre: ocultar un botón no protege la operación.
 * Se cargan de /api/auth/sesion al entrar a la plataforma (middleware auth.global).
 */
export function usePermisos() {
  const acceso = useState<AccesoSesion | null>('acceso', () => null)

  async function cargar(forzar = false): Promise<AccesoSesion> {
    if (acceso.value && !forzar) return acceso.value
    const r = await $fetch('/api/auth/sesion')
    acceso.value = { roles: r.roles, permisos: r.permisos, organizaciones: r.organizaciones }
    return acceso.value
  }

  /** ¿Tiene el permiso sobre esa organización? (alcance total, o es una de las suyas) */
  function puedeEn(permiso: Permiso, organizacionId: string) {
    const a = acceso.value?.permisos[permiso]
    return a === 'TOTAL' || (a === 'ORGANIZACION' && !!acceso.value?.organizaciones[permiso]?.includes(organizacionId))
  }

  return {
    acceso,
    cargar,
    limpiar: () => { acceso.value = null },
    puede: (permiso: Permiso) => !!acceso.value?.permisos[permiso],
    puedeEn,
    alcance: (permiso: Permiso): Alcance | null => acceso.value?.permisos[permiso] ?? null,
  }
}
