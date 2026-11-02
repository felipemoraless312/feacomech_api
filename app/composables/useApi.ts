/**
 * $fetch para la API privada. En SSR reenvía la cookie de la petición original.
 * Si la sesión venció (401) limpia el estado local y lleva al inicio de sesión
 * conservando la página a la que se quería ir.
 */
export function useApi(): typeof $fetch {
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

  return ((url: string, opts: object = {}) => requestFetch(url, { ...opts, onResponseError })) as typeof $fetch
}

/** Mensaje legible de un error de la API (y errores por campo si los hay). */
export function errorDeApi(e: unknown): { mensaje: string, campos: Record<string, string> } {
  const err = e as { data?: { message?: string, data?: { campos?: Record<string, string> } }, message?: string }
  return {
    mensaje: err.data?.message ?? err.message ?? 'Ocurrió un error inesperado',
    campos: err.data?.data?.campos ?? {},
  }
}
