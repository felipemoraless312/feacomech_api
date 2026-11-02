import { describe, expect, it } from 'vitest'
import { IMAGENES, PDF, detectarTipo, rutaAbsoluta } from '../../server/utils/almacen'
import { plantillaCorreo } from '../../server/utils/correo'
import { permitirIntento } from '../../server/utils/frecuencia'
import { describirDispositivo } from '../../server/services/sesiones'
import { restablecerSchema } from '../../shared/schemas/auth'
import { usuarioAdminSchema } from '../../shared/schemas/usuario'

describe('detectarTipo (firma de archivo)', () => {
  it('reconoce JPG, PNG, WebP y PDF por sus primeros bytes', () => {
    expect(detectarTipo(Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), IMAGENES)?.mime).toBe('image/jpeg')
    expect(detectarTipo(Buffer.from('89504E470D0A1A0A00', 'hex'), IMAGENES)?.mime).toBe('image/png')
    expect(detectarTipo(Buffer.from('RIFF\0\0\0\0WEBPVP8 ', 'latin1'), IMAGENES)?.mime).toBe('image/webp')
    expect(detectarTipo(Buffer.from('%PDF-1.7'), [PDF])?.mime).toBe('application/pdf')
  })

  it('rechaza lo demás (SVG, HTML, ejecutables)', () => {
    expect(detectarTipo(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg">'), IMAGENES)).toBeNull()
    expect(detectarTipo(Buffer.from('<!doctype html>'), IMAGENES)).toBeNull()
    expect(detectarTipo(Buffer.from('MZ\x90\x00'), [...IMAGENES, PDF])).toBeNull()
  })

  it('no permite salir de la carpeta de almacenamiento', () => {
    expect(() => rutaAbsoluta('../../etc/passwd')).toThrow()
    expect(() => rutaAbsoluta('ab/archivo.png')).not.toThrow()
  })
})

describe('permitirIntento', () => {
  it('permite hasta el máximo dentro de la ventana y se reinicia después', () => {
    const clave = `prueba-${Math.random()}`
    const t = 1_000_000
    expect([1, 2, 3].map(() => permitirIntento(clave, 2, 1000, t))).toEqual([true, true, false])
    expect(permitirIntento(clave, 2, 1000, t + 1001)).toBe(true)
  })
})

describe('describirDispositivo', () => {
  it.each([
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/141.0 Safari/537.36', 'Chrome en Windows'],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1', 'Safari en iPhone'],
    ['Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/141.0 Mobile Safari/537.36', 'Chrome en Android'],
    ['Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/141.0 Safari/537.36 Edg/141.0', 'Edge en Windows'],
    [null, 'Dispositivo desconocido'],
  ])('%s → %s', (ua, esperado) => {
    expect(describirDispositivo(ua)).toBe(esperado)
  })
})

describe('plantillaCorreo', () => {
  it('escapa el contenido (sin inyección de HTML)', () => {
    const { html, texto } = plantillaCorreo({ titulo: 'Hola <b>x</b>', parrafos: ['a & b'], boton: { texto: 'Ir', url: 'https://x/?a=1&b="2"' } })
    expect(html).toContain('Hola &lt;b&gt;x&lt;/b&gt;')
    expect(html).toContain('a &amp; b')
    expect(html).not.toContain('"2"')
    expect(texto).toContain('Ir: https://x/?a=1&b="2"')
  })
})

describe('esquemas', () => {
  it('correo normalizado y roles como UUID', () => {
    const r = usuarioAdminSchema.parse({ email: '  Ana@Correo.MX ', nombre: 'Ana', apellidoPaterno: 'P', rolIds: [] })
    expect(r.email).toBe('ana@correo.mx')
    expect(usuarioAdminSchema.safeParse({ email: 'a@b.mx', nombre: 'A', apellidoPaterno: 'P', rolIds: ['x'] }).success).toBe(false)
  })

  it('el token de restablecimiento tiene el formato esperado', () => {
    const ok = { token: 'a'.repeat(43), nueva: 'Segura-2026x', confirmacion: 'Segura-2026x' }
    expect(restablecerSchema.safeParse(ok).success).toBe(true)
    expect(restablecerSchema.safeParse({ ...ok, token: 'corto' }).success).toBe(false)
    expect(restablecerSchema.safeParse({ ...ok, confirmacion: 'otra' }).success).toBe(false)
  })
})
