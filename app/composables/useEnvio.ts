interface ConErrores {
  setErrors: (errores: { name: string, message: string }[]) => void
}

/**
 * Estado de envío de un formulario: `enviando`, mensaje de `error` y, si se pasa
 * la referencia del UForm, errores por campo devueltos por la API (data.campos).
 */
export function useEnvio(form?: Ref<ConErrores | null | undefined>) {
  const enviando = ref(false)
  const error = ref('')

  async function enviar<R>(fn: () => Promise<R>): Promise<{ ok: true, valor: R } | { ok: false, error: unknown }> {
    enviando.value = true
    error.value = ''
    try {
      return { ok: true, valor: await fn() }
    }
    catch (e) {
      const { mensaje, campos } = errorDeApi(e)
      error.value = mensaje
      form?.value?.setErrors(Object.entries(campos).map(([name, message]) => ({ name, message })))
      return { ok: false, error: e }
    }
    finally {
      enviando.value = false
    }
  }

  return { enviando, error, enviar }
}
