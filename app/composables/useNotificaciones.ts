/**
 * Número de notificaciones sin leer (para el menú). Se consulta al entrar y cada 60 s
 * mientras la pestaña está visible.
 */
export function useNotificaciones() {
  const noLeidas = useState('notificaciones-no-leidas', () => 0)

  async function actualizar() {
    try {
      noLeidas.value = (await $fetch('/api/cuenta/notificaciones/conteo')).noLeidas
    }
    catch {
      // Sin sesión o sin red: se reintenta en el siguiente ciclo.
    }
  }

  return { noLeidas, actualizar }
}

/** Inicia el sondeo (llamar una vez desde el layout de la plataforma). */
export function useSondeoNotificaciones() {
  const { actualizar } = useNotificaciones()
  let temporizador: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    actualizar()
    temporizador = setInterval(() => {
      if (document.visibilityState === 'visible') actualizar()
    }, 60_000)
  })
  onBeforeUnmount(() => clearInterval(temporizador))
}
