import { z } from 'zod'
import { ALCANCES, CATALOGO_PERMISOS, esPermiso } from '../permisos'
import { opcional, requerido } from './comunes'

export const rolSchema = z.object({
  nombre: requerido(80),
  descripcion: opcional(300),
  activo: z.boolean().default(true),
  permisos: z
    .array(z.object({ permiso: z.string(), alcance: z.enum(ALCANCES) }))
    .max(200)
    .superRefine((lista, ctx) => {
      const vistos = new Set<string>()
      lista.forEach((p, i) => {
        if (!esPermiso(p.permiso)) {
          ctx.addIssue({ code: 'custom', path: [i, 'permiso'], message: `Permiso desconocido: ${p.permiso}` })
          return
        }
        if (vistos.has(p.permiso)) ctx.addIssue({ code: 'custom', path: [i, 'permiso'], message: 'Permiso repetido' })
        vistos.add(p.permiso)
        if (!(CATALOGO_PERMISOS[p.permiso].alcances as readonly string[]).includes(p.alcance)) {
          ctx.addIssue({ code: 'custom', path: [i, 'alcance'], message: `Alcance no válido para ${p.permiso}` })
        }
      })
    }),
})
export type RolInput = z.input<typeof rolSchema>
export type RolDatos = z.output<typeof rolSchema>

export const rolCrearSchema = rolSchema.extend({
  clave: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{2,39}$/, 'De 3 a 40 caracteres: letras, números y guion bajo'),
})
export type RolCrearInput = z.input<typeof rolCrearSchema>
