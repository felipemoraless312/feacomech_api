import { z } from 'zod'

// Mensajes de validación de Zod en español (los propios de cada esquema tienen prioridad).
export default defineNuxtPlugin(() => {
  z.config(z.locales.es())
})
