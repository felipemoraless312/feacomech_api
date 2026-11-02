import { describe, expect, it } from 'vitest'
import {
  CATALOGO_PERMISOS, PERMISOS, PERMISOS_INICIALES, ROLES_INICIALES,
  alcanceMayor, combinarPermisos, entradasPermisos,
} from '../../shared/permisos'

describe('combinarPermisos', () => {
  it('gana el alcance más amplio', () => {
    expect(combinarPermisos([
      { permiso: 'evento.gestionar', alcance: 'PROPIO' },
      { permiso: 'evento.gestionar', alcance: 'TOTAL' },
      { permiso: 'evento.gestionar', alcance: 'ORGANIZACION' },
    ])).toEqual({ 'evento.gestionar': 'TOTAL' })
    expect(alcanceMayor('PROPIO', 'ORGANIZACION')).toBe('ORGANIZACION')
    expect(alcanceMayor(null, 'PROPIO')).toBe('PROPIO')
  })

  it('descarta permisos fuera del catálogo', () => {
    expect(combinarPermisos([{ permiso: 'no.existe', alcance: 'TOTAL' }])).toEqual({})
  })

  it('sin roles no hay permisos', () => {
    expect(combinarPermisos([])).toEqual({})
  })
})

describe('asignación inicial', () => {
  const de = (clave: keyof typeof PERMISOS_INICIALES) => Object.fromEntries(entradasPermisos(PERMISOS_INICIALES[clave]))

  it('hay asignación para cada rol inicial', () => {
    expect(Object.keys(PERMISOS_INICIALES).sort()).toEqual(ROLES_INICIALES.map(r => r.clave).sort())
  })

  it('el superadministrador tiene todo el catálogo', () => {
    expect(Object.keys(de('SUPERADMIN')).sort()).toEqual([...PERMISOS].sort())
  })

  it('sólo el superadministrador configura roles', () => {
    for (const r of ROLES_INICIALES) {
      expect(!!de(r.clave)['rol.administrar']).toBe(r.clave === 'SUPERADMIN')
    }
  })

  it('los representantes sólo actúan sobre su organización y no validan', () => {
    for (const rol of ['REPRESENTANTE_COLEGIO', 'REPRESENTANTE_ASOCIACION'] as const) {
      const p = de(rol)
      expect(p['organizacion.administrar']).toBeUndefined()
      expect(p['afiliacion.validar']).toBeUndefined()
      expect(p['usuario.administrar']).toBeUndefined()
      expect(p['organizacion.editar']).toBe('ORGANIZACION')
    }
  })

  it('el médico afiliado sólo participa en la comunidad', () => {
    expect(de('MEDICO_AFILIADO')).toEqual({ 'comunidad.participar': 'TOTAL' })
  })

  it('cada alcance asignado es válido para su permiso', () => {
    for (const r of ROLES_INICIALES) {
      for (const [permiso, alcance] of entradasPermisos(PERMISOS_INICIALES[r.clave])) {
        expect(CATALOGO_PERMISOS[permiso].alcances as readonly string[], `${r.clave}: ${permiso}`).toContain(alcance)
      }
    }
  })
})
