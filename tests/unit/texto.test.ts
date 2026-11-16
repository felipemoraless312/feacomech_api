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
