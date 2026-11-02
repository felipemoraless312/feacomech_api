import { z } from 'zod'

// Mensajes de validación de Zod en español (los propios de cada esquema tienen prioridad).
export default defineNitroPlugin(() => {
  z.config(z.locales.es())
})
