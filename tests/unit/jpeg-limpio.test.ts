import { describe, expect, it } from 'vitest'
import { limpiarJpeg } from '../../server/utils/jpeg-limpio'
import { textoNoPermitido } from '../../shared/muro-jornadas'

const seg = (marcador: number, cuerpo: Buffer) => {
  const largo = Buffer.alloc(2)
  largo.writeUInt16BE(cuerpo.length + 2)
  return Buffer.concat([Buffer.from([0xFF, marcador]), largo, cuerpo])
}
const sof = (ancho: number, alto: number) => {
  const b = Buffer.alloc(15)
  b[0] = 8
  b.writeUInt16BE(alto, 1)
  b.writeUInt16BE(ancho, 3)
  b[5] = 3
  return seg(0xC0, b)
}
const jfif = seg(0xE0, Buffer.from('JFIF\0\x01\x01\0\0\x01\0\x01\0\0', 'latin1'))
const exif = seg(0xE1, Buffer.from('Exif\0\0GPS-LATITUD-16.75', 'latin1'))
const comentario = seg(0xFE, Buffer.from('<script>alert(1)</script>', 'latin1'))
const sos = Buffer.concat([seg(0xDA, Buffer.from([1, 1, 0, 0, 63, 0])), Buffer.from([0x12, 0x34, 0xFF, 0x00, 0x56])])
const fin = Buffer.from([0xFF, 0xD9])
const inicio = Buffer.from([0xFF, 0xD8])

describe('limpiarJpeg', () => {
  it('quita EXIF/GPS, comentarios y lo que venga después del fin de imagen', () => {
    const sucio = Buffer.concat([inicio, jfif, exif, comentario, sof(1920, 1080), sos, fin, Buffer.from('PK\x03\x04archivo-oculto.zip', 'latin1')])
    const r = limpiarJpeg(sucio)!
    expect(r).not.toBeNull()
    expect(r.ancho).toBe(1920)
    expect(r.alto).toBe(1080)
    const texto = r.datos.toString('latin1')
    expect(texto).not.toContain('GPS')
    expect(texto).not.toContain('script')
    expect(texto).not.toContain('archivo-oculto')
    expect(texto).toContain('JFIF')
    expect(r.datos.subarray(-2)).toEqual(fin)
  })

  it('rechaza lo que no es un JPEG válido', () => {
    expect(limpiarJpeg(Buffer.from('<?php echo 1; ?>'))).toBeNull()
    expect(limpiarJpeg(Buffer.from([0x89, 0x50, 0x4E, 0x47]))).toBeNull()
    expect(limpiarJpeg(Buffer.concat([inicio, sof(800, 600)]))).toBeNull() // sin datos de imagen
    expect(limpiarJpeg(Buffer.concat([inicio, sos, fin]))).toBeNull() // sin dimensiones
  })
})

describe('textoNoPermitido', () => {
  it('bloquea enlaces, correos y groserías', () => {
    expect(textoNoPermitido('visita https://estafa.xyz')).toBeTruthy()
    expect(textoNoPermitido('entra a www.algo.com')).toBeTruthy()
    expect(textoNoPermitido('escríbeme a yo@correo.com')).toBeTruthy()
    expect(textoNoPermitido('qué pendejo')).toBeTruthy()
  })
  it('permite comentarios normales', () => {
    expect(textoNoPermitido('¡Excelente ponencia de la Dra. López sobre dermatoscopía!')).toBeNull()
    expect(textoNoPermitido('Saludos desde Tapachula, gran evento')).toBeNull()
  })
})
