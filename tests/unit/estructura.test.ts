import { describe, expect, it } from 'vitest'
import { armarOrganigrama, creaCiclo, estaVigente } from '../../shared/estructura'
import { contactoSchema, noticiaSchema } from '../../shared/schemas/portal'
import { nombramientoSchema } from '../../shared/schemas/estructura'

const c = (id: string, superiorId: string | null, orden = 0) => ({ id, superiorId, orden, nombre: id })

describe('armarOrganigrama', () => {
  it('arma el árbol por superior y ordena a los hermanos', () => {
    const arbol = armarOrganigrama([c('tesoreria', 'presidencia', 3), c('presidencia', null), c('secretaria', 'presidencia', 2), c('vocal', 'secretaria')])
    expect(arbol.map(n => n.cargo.id)).toEqual(['presidencia'])
    expect(arbol[0]!.hijos.map(n => n.cargo.id)).toEqual(['secretaria', 'tesoreria'])
    expect(arbol[0]!.hijos[0]!.hijos.map(n => n.cargo.id)).toEqual(['vocal'])
  })

  it('un cargo cuyo superior no está en la lista queda como raíz; los ciclos no se repiten', () => {
    expect(armarOrganigrama([c('a', 'inexistente')]).map(n => n.cargo.id)).toEqual(['a'])
    const conCiclo = armarOrganigrama([c('a', 'b'), c('b', 'a'), c('raiz', null)])
    expect(JSON.stringify(conCiclo).match(/"id":"a"/g)?.length ?? 0).toBeLessThanOrEqual(1)
  })
})

describe('creaCiclo', () => {
  const cargos = [c('p', null), c('s', 'p'), c('v', 's')]
  it('detecta que un cargo dependa de su propio subordinado', () => {
    expect(creaCiclo(cargos, 'p', 'v')).toBe(true)
    expect(creaCiclo(cargos, 's', 's')).toBe(true)
    expect(creaCiclo(cargos, 'v', 'p')).toBe(false)
    expect(creaCiclo(cargos, 'p', null)).toBe(false)
  })
})

describe('estaVigente', () => {
  const hoy = new Date('2026-11-01T12:00:00Z')
  it('vigente sólo si el estado lo dice y las fechas incluyen hoy', () => {
    expect(estaVigente({ estado: 'VIGENTE', inicio: '2025-01-01', fin: null }, hoy)).toBe(true)
    expect(estaVigente({ estado: 'VIGENTE', inicio: '2025-01-01', fin: '2026-10-31' }, hoy)).toBe(false)
    expect(estaVigente({ estado: 'VIGENTE', inicio: '2026-12-01', fin: null }, hoy)).toBe(false)
    expect(estaVigente({ estado: 'REVOCADO', inicio: '2025-01-01', fin: null }, hoy)).toBe(false)
  })
})

describe('esquemas del portal', () => {
  const contacto = { nombre: 'Ana', email: 'ana@correo.mx', asunto: 'Afiliación', mensaje: 'Quisiera información.', aceptaAviso: true }
  it('el contacto exige aceptar el aviso y rechaza el campo trampa', () => {
    expect(contactoSchema.safeParse(contacto).success).toBe(true)
    expect(contactoSchema.safeParse({ ...contacto, aceptaAviso: false }).success).toBe(false)
    expect(contactoSchema.safeParse({ ...contacto, sitio: 'http://spam' }).success).toBe(false)
  })

  it('noticia con contenido mínimo; nombramiento con persona y fechas coherentes', () => {
    expect(noticiaSchema.safeParse({ tipo: 'NOTICIA', titulo: 'T', contenido: 'corto' }).success).toBe(false)
    const base = { cargoId: '01a19794-6963-725e-852c-b2494852dfc9', inicio: '2026-01-01' }
    expect(nombramientoSchema.safeParse(base).success).toBe(false)
    expect(nombramientoSchema.safeParse({ ...base, nombrePersona: 'Dra. Ejemplo' }).success).toBe(true)
    expect(nombramientoSchema.safeParse({ ...base, nombrePersona: 'X', fin: '2025-01-01' }).success).toBe(false)
  })
})
