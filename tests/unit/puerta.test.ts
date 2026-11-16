import { describe, expect, it } from 'vitest'
import { esEnlaceDeCorreo, esPrivada, rutaNormalizada } from '../../server/utils/puerta'

describe('rutaNormalizada', () => {
  it('quita la query, decodifica, junta barras y pasa a minúsculas', () => {
    expect(rutaNormalizada('/plataforma/login?r=/x')).toBe('/plataforma/login')
    expect(rutaNormalizada('/%50lataforma/LOGIN')).toBe('/plataforma/login')
    expect(rutaNormalizada('//plataforma///usuarios')).toBe('/plataforma/usuarios')
    expect(rutaNormalizada('/%E0%A4%A')).toBe('/%e0%a4%a') // codificación inválida: no truena
  })
})

describe('esPrivada', () => {
  it('oculta la plataforma, las impresiones y la API privada', () => {
    for (const r of ['/plataforma', '/plataforma/login', '/plataforma/recuperar', '/imprimir/constancia/x', '/api/auth/login', '/api/auth/sesion', '/api/auth/puerta', '/api/usuarios', '/api/resumen', '/api'])
      expect(esPrivada(r), r).toBe(true)
  })

  it('deja pasar el portal, la API pública, los archivos, lo interno de Nuxt y los enlaces del correo', () => {
    for (const r of ['/', '/noticias', '/directorio/profesionales', '/constancias', '/verificar/abc', '/jornadas-2026/registro/x', '/api/publico/inicio', '/api/archivos/123', '/api/_auth/session', '/api/_nuxt_icon/lucide.json', '/api/auth/token/abc', '/api/auth/restablecer', '/_nuxt/app.js', '/robots.txt'])
      expect(esPrivada(r), r).toBe(false)
  })
})

describe('esEnlaceDeCorreo', () => {
  const token = 'a'.repeat(43)
  it('sólo la página de restablecer con un token de formato válido', () => {
    expect(esEnlaceDeCorreo('/plataforma/restablecer', token)).toBe(true)
    expect(esEnlaceDeCorreo('/plataforma/restablecer', 'corto')).toBe(false)
    expect(esEnlaceDeCorreo('/plataforma/restablecer', undefined)).toBe(false)
    expect(esEnlaceDeCorreo('/plataforma/login', token)).toBe(false)
  })
})
