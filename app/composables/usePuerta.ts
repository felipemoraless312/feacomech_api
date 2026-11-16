/**
 * ¿El servidor deja ver el inicio de sesión a este navegador? (cookie de la puerta o sesión)
 * Se pregunta una vez por visita; la respuesta sólo cambia al usar el enlace secreto, que
 * recarga la página.
 */
export async function puertaAbierta(): Promise<boolean> {
  const estado = useState<boolean | null>('puerta-abierta', () => null)
  if (estado.value === null) {
    try {
      await $fetch('/api/auth/puerta')
      estado.value = true
    }
    catch {
      estado.value = false
    }
  }
  return estado.value
}

/**
 * ¿Mostrar el enlace «Plataforma» en el portal público? Sólo a quien ya entró alguna vez
 * desde este navegador (cookie de aviso) o tiene la sesión abierta. Es sólo presentación:
 * el servidor decide con la cookie httpOnly.
 */
export function useEnlacePlataforma() {
  const { loggedIn } = useUserSession()
  const aviso = useCookie<string | null>('feacomech-afiliado', { readonly: true })
  return computed(() => loggedIn.value || aviso.value === '1')
}
