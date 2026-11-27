// Reconstruye un JPEG dejando sólo lo necesario para mostrar la imagen.
//
// Recorre los segmentos del archivo y descarta los de aplicación (APP1–APP15: EXIF con GPS,
// modelo de cámara, XMP, miniaturas incrustadas…) y los comentarios; también todo lo que venga
// después del marcador de fin de imagen (donde suelen esconderse archivos pegados). Si el
// archivo no tiene la estructura de un JPEG válido, se rechaza: no se intenta "arreglarlo".

export interface JpegLimpio {
  datos: Buffer
  ancho: number
  alto: number
}

// Marcadores de inicio de cuadro (SOF) que traen las dimensiones.
const SOF = new Set([0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF])

export function limpiarJpeg(b: Buffer): JpegLimpio | null {
  if (b.length < 4 || b[0] !== 0xFF || b[1] !== 0xD8) return null
  const partes: Buffer[] = [Buffer.from([0xFF, 0xD8])]
  let ancho = 0
  let alto = 0
  let pos = 2

  while (pos < b.length) {
    if (b[pos] !== 0xFF) return null
    // Bytes de relleno 0xFF entre segmentos
    while (b[pos] === 0xFF && pos < b.length) pos++
    const marcador = b[pos]
    pos++
    if (marcador === undefined) return null

    // Marcadores sin longitud
    if (marcador === 0xD8 || marcador === 0x01 || (marcador >= 0xD0 && marcador <= 0xD7)) continue
    if (marcador === 0xD9) break // fin de imagen sin datos: inválido (se revisa abajo)

    if (pos + 2 > b.length) return null
    const largo = b.readUInt16BE(pos)
    if (largo < 2 || pos + largo > b.length) return null
    const segmento = b.subarray(pos - 2, pos + largo)

    if (marcador === 0xDA) {
      // Inicio de los datos de imagen: se copian hasta el último fin de imagen (FFD9).
      const fin = b.lastIndexOf(Buffer.from([0xFF, 0xD9]))
      if (fin <= pos) return null
      partes.push(b.subarray(pos - 2, fin + 2))
      if (!ancho || !alto) return null
      return { datos: Buffer.concat(partes), ancho, alto }
    }

    if (SOF.has(marcador)) {
      if (largo < 7) return null
      alto = b.readUInt16BE(pos + 3)
      ancho = b.readUInt16BE(pos + 5)
    }

    const esApp0Jfif = marcador === 0xE0 && b.subarray(pos + 2, pos + 7).toString('latin1') === 'JFIF\0'
    const descartar = (marcador >= 0xE0 && marcador <= 0xEF && !esApp0Jfif) || marcador === 0xFE
    if (!descartar) partes.push(segmento)
    pos += largo
  }
  return null
}
