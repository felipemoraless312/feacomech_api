/**
 * Redibuja una imagen en un lienzo y la devuelve como JPEG nuevo: la reduce al lado mayor
 * indicado y, de paso, le quita los metadatos (ubicación GPS, modelo del teléfono).
 * Respeta la orientación de las fotos del celular. Las transparencias quedan en blanco.
 */
export async function reducirImagen(archivo: Blob, lado = 2400, calidad = 0.88): Promise<Blob> {
  const img = await decodificar(archivo)
  try {
    const w = 'naturalWidth' in img ? img.naturalWidth : img.width
    const h = 'naturalHeight' in img ? img.naturalHeight : img.height
    const escala = Math.min(1, lado / Math.max(w, h))
    const lienzo = document.createElement('canvas')
    lienzo.width = Math.round(w * escala)
    lienzo.height = Math.round(h * escala)
    const ctx = lienzo.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, lienzo.width, lienzo.height)
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, lienzo.width, lienzo.height)
    return await new Promise((ok, mal) => lienzo.toBlob(b => (b ? ok(b) : mal(new Error('No se pudo procesar la imagen'))), 'image/jpeg', calidad))
  }
  finally {
    if ('close' in img) img.close()
  }
}

async function decodificar(archivo: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try { return await createImageBitmap(archivo, { imageOrientation: 'from-image' }) }
    catch { /* se intenta con <img> */ }
  }
  return new Promise((ok, mal) => {
    const img = new Image()
    img.onload = () => ok(img)
    img.onerror = () => mal(new Error('Formato de imagen no compatible'))
    img.src = URL.createObjectURL(archivo)
  })
}
