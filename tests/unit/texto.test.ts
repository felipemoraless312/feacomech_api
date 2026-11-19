import { describe, expect, it } from 'vitest'
import { fragmentarEnlaces } from '../../shared/texto'

describe('fragmentarEnlaces', () => {
  it('deja el texto sin URL como un solo fragmento', () => {
    expect(fragmentarEnlaces('Hola país')).toEqual([{ tipo: 'texto', valor: 'Hola país' }])
  })

  it('separa la URL y excluye la puntuación de cierre', () => {
    const f = fragmentarEnlaces('Fuente: El Heraldo (https://heraldodemexico.com.mx/nota-1.html); Canal 13.')
    expect(f).toEqual([
      { tipo: 'texto', valor: 'Fuente: El Heraldo (' },
      { tipo: 'enlace', valor: 'https://heraldodemexico.com.mx/nota-1.html', url: 'https://heraldodemexico.com.mx/nota-1.html' },
      { tipo: 'texto', valor: '); Canal 13.' },
    ])
  })

  it('conserva paréntesis balanceados dentro de la URL', () => {
    const f = fragmentarEnlaces('Ver https://es.wikipedia.org/wiki/Chiapas_(estado).')
    expect(f[1]).toMatchObject({ tipo: 'enlace', url: 'https://es.wikipedia.org/wiki/Chiapas_(estado)' })
    expect(f[2]).toEqual({ tipo: 'texto', valor: '.' })
  })

  it('no convierte esquemas distintos de http(s)', () => {
    expect(fragmentarEnlaces('javascript:alert(1) ftp://x')).toHaveLength(1)
  })
})

describe('logoVinculo', () => {
  it('reconoce a las instituciones por su nombre, con o sin acentos', async () => {
    const { logoVinculo } = await import('../../shared/organizacion')
    expect(logoVinculo('Congreso del Estado de Chiapas')).toBe('/img/vinculacion/congreso-chiapas.webp')
    expect(logoVinculo('H. CONGRESO DEL ESTADO DE CHIAPAS')).toBe('/img/vinculacion/congreso-chiapas.webp')
    expect(logoVinculo('Secretaría de Salud del Estado de Chiapas')).toBe('/img/vinculacion/salud-chiapas.webp')
    expect(logoVinculo('Secretaria de Salud')).toBe('/img/vinculacion/salud-chiapas.webp')
    expect(logoVinculo('Universidad Autónoma de Chiapas')).toBeUndefined()
    // Versión ancha cuando existe; si no, la cuadrada.
    expect(logoVinculo('Congreso del Estado de Chiapas', 'horizontal')).toBe('/img/vinculacion/congreso-chiapas-horizontal.webp')
    expect(logoVinculo('Secretaría de Salud', 'horizontal')).toBe('/img/vinculacion/salud-chiapas.webp')
  })
})

describe('MESA_DIRECTIVA', () => {
  it('incluye la reseña del Dr. Alexander Arroyo Núñez en párrafos', async () => {
    const { MESA_DIRECTIVA } = await import('../../shared/organizacion')
    const arroyo = MESA_DIRECTIVA.integrantes.find(i => i.cargo === 'Secretario Administrativo')
    expect(arroyo?.nombre).toBe('Dr. Alexander Arroyo Núñez')
    expect(arroyo?.resena?.split(/\n\s*\n/)).toHaveLength(4)
  })
})

describe('personas con página propia', () => {
  it('genera direcciones limpias y únicas, y encuentra a cada integrante', async () => {
    const { PERSONAS, buscarPersona, slugPersona } = await import('../../shared/organizacion')
    expect(slugPersona('Dr. Alexander Arroyo Núñez')).toBe('alexander-arroyo-nunez')
    expect(slugPersona('QFB. Cecilia Clotilde Velázquez Andrade')).toBe('cecilia-clotilde-velazquez-andrade')
    expect(new Set(PERSONAS.map(p => p.slug)).size).toBe(PERSONAS.length)
    const arroyo = buscarPersona('alexander-arroyo-nunez')
    expect(arroyo?.organo).toBe('Mesa directiva')
    expect(arroyo?.retrato).toBe('/img/personas/alexander-arroyo-nunez.jpg')
    expect(arroyo?.foto).toBe('/img/personas/alexander-arroyo-nunez-rostro.jpg')
    expect(buscarPersona('no-existe')).toBeUndefined()
    const renteria = buscarPersona('maria-hilda-renteria-garcia')
    expect(renteria?.organo).toBe('Presidentes de colegios')
    expect(renteria?.periodo).toBe('2026–2027')
    expect(renteria?.resena).not.toMatch(/@|961|Cédula/)
    expect(renteria?.colegio?.slug).toBe('colegio-de-oftalmologos-del-estado-de-chiapas')
    expect(buscarPersona('issel-prisciliano-gutierrez-mandujano')?.organo).toBe('Consejo consultivo')
    expect(buscarPersona('issel-prisciliano-gutierrez-mandujano')?.resena).toBeTruthy()
  })
})

describe('colegios afiliados', () => {
  it('cada presidente de colegio tiene su colegio, con dirección única', async () => {
    const { MESA_DIRECTIVA_2026 } = await import('../../shared/jornadas2026-programa')
    const { COLEGIOS_AFILIADOS, colegioPorClave } = await import('../../shared/colegios')
    for (const p of MESA_DIRECTIVA_2026.presidentes) expect(colegioPorClave(p.colegio), p.colegio).toBeDefined()
    expect(new Set(COLEGIOS_AFILIADOS.map(c => c.slug)).size).toBe(COLEGIOS_AFILIADOS.length)
    for (const c of COLEGIOS_AFILIADOS) expect(c.slug).toMatch(/^[a-z0-9-]{1,90}$/)
  })
})
