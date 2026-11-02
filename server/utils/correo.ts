// Envío de correo (SMTP con nodemailer).
// Se configura con variables de entorno, no con runtimeConfig, para que los servicios
// funcionen igual dentro de Nitro y en las pruebas:
//   NUXT_SMTP_HOST, NUXT_SMTP_PORT, NUXT_SMTP_USER, NUXT_SMTP_PASS, NUXT_SMTP_SECURE,
//   NUXT_SMTP_FROM, NUXT_URL_PUBLICA
// Sin NUXT_SMTP_HOST los correos no salen: se guardan en `bandejaLocal` (pruebas) y se
// registran en la consola, y quien los dispara puede ofrecer el enlace manualmente.
import { createTransport, type Transporter } from 'nodemailer'

export interface Correo {
  para: string
  asunto: string
  html: string
  texto: string
}

/** Correos no enviados por falta de SMTP (los últimos 50); útil en pruebas. */
export const bandejaLocal: Correo[] = []

let transporte: Transporter | undefined

export function smtpConfigurado(): boolean {
  return !!process.env.NUXT_SMTP_HOST
}

function obtenerTransporte(): Transporter {
  transporte ??= createTransport({
    host: process.env.NUXT_SMTP_HOST,
    port: Number(process.env.NUXT_SMTP_PORT ?? 587),
    secure: process.env.NUXT_SMTP_SECURE === 'true',
    auth: process.env.NUXT_SMTP_USER ? { user: process.env.NUXT_SMTP_USER, pass: process.env.NUXT_SMTP_PASS } : undefined,
  })
  return transporte
}

/** URL pública de la plataforma para los enlaces de los correos (nunca el Host de la petición). */
export function urlPublica(ruta: string): string {
  const base = (process.env.NUXT_URL_PUBLICA || 'http://localhost:3001').replace(/\/$/, '')
  return `${base}${ruta}`
}

/** Envía el correo. Devuelve `false` si no hay SMTP configurado o si el envío falló. */
export async function enviarCorreo(c: Correo): Promise<boolean> {
  if (!smtpConfigurado()) {
    bandejaLocal.push(c)
    if (bandejaLocal.length > 50) bandejaLocal.shift()
    if (!process.env.VITEST) console.info(`[correo sin SMTP] Para: ${c.para} · ${c.asunto}\n${c.texto}`)
    return false
  }
  try {
    await obtenerTransporte().sendMail({
      from: process.env.NUXT_SMTP_FROM || 'FEACOMECH <no-responder@feacomech.local>',
      to: c.para,
      subject: c.asunto,
      html: c.html,
      text: c.texto,
    })
    return true
  }
  catch (e) {
    console.error('[correo] No se pudo enviar:', (e as Error).message)
    return false
  }
}

const escapar = (s: string) => s.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' })[ch]!)

/** Correo institucional sencillo: título, párrafos y un botón opcional. */
export function plantillaCorreo(o: { titulo: string, parrafos: string[], boton?: { texto: string, url: string }, pie?: string }): Pick<Correo, 'html' | 'texto'> {
  const parrafosHtml = o.parrafos.map(p => `<p style="margin:0 0 16px;line-height:1.55">${escapar(p)}</p>`).join('')
  const boton = o.boton
    ? `<p style="margin:24px 0"><a href="${escapar(o.boton.url)}" style="background:#3f2759;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600;display:inline-block">${escapar(o.boton.texto)}</a></p>
       <p style="margin:0 0 16px;font-size:13px;color:#6e6e73">Si el botón no funciona, copie este enlace en su navegador:<br><span style="word-break:break-all">${escapar(o.boton.url)}</span></p>`
    : ''
  const pie = o.pie ?? 'Este es un mensaje automático de la plataforma FEACOMECH; no responda a este correo.'
  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#f5f5f7;font-family:Inter,Segoe UI,Arial,sans-serif;color:#2c2c2e">
<div style="max-width:560px;margin:0 auto;padding:32px 16px">
  <p style="margin:0 0 20px;font-weight:700;letter-spacing:.04em;color:#3f2759">FEACOMECH</p>
  <div style="background:#fff;border-radius:16px;padding:28px">
    <h1 style="margin:0 0 16px;font-size:20px;color:#1d1d1f">${escapar(o.titulo)}</h1>
    ${parrafosHtml}${boton}
  </div>
  <p style="margin:20px 4px 0;font-size:12px;color:#86868b">${escapar(pie)}</p>
</div></body></html>`
  const texto = [o.titulo, '', ...o.parrafos, ...(o.boton ? ['', `${o.boton.texto}: ${o.boton.url}`] : []), '', pie].join('\n')
  return { html, texto }
}
