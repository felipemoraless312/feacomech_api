import type { NitroFetchOptions } from 'nitropack/types'

/**
 * Cliente de la API privada. La respuesta se tipa con el genérico (`api<Dto>(...)`); no se
 * infiere de la ruta como en `$fetch` porque con todas las rutas del proyecto esa inferencia
 * excede la profundidad de tipos de TypeScript (TS2321) desde Nuxt 4.6.
 */
export type Api = <T = unknown>(url: string, opts?: NitroFetchOptions<string>) => Promise<T>

/**
 * $fetch para la API privada. En SSR reenvía la cookie de la petición original.
 * Si la sesión venció (401) limpia el estado local y lleva al inicio de sesión
 * conservando la página a la que se quería ir.
 */
export function useApi(): Api {
  const requestFetch = useRequestFetch()
  const { clear } = useUserSession()
  const { limpiar } = usePermisos()
  const route = useRoute()

  const onResponseError = async ({ response }: { response: Response }) => {
    if (response.status === 401 && route.path !== '/plataforma/login') {
      limpiar()
      await clear()
      await navigateTo({ path: '/plataforma/login', query: { r: route.fullPath, motivo: 'sesion' } })
    }
  }

  return ((url: string, opts: object = {}) => requestFetch(url, { ...opts, onResponseError })) as Api
}

/** Mensaje legible de un error de la API (y errores por campo si los hay). */
export function errorDeApi(e: unknown): { mensaje: string, campos: Record<string, string> } {
  const err = e as { data?: { message?: string, data?: { campos?: Record<string, string> } }, message?: string }
  return {
    mensaje: err.data?.message ?? err.message ?? 'Ocurrió un error inesperado',
    campos: err.data?.data?.campos ?? {},
  }
}
