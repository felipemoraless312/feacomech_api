// Sólo responde si la puerta está abierta (o desactivada): el middleware 03.puerta da 404
// antes de llegar aquí. Las pantallas de inicio de sesión lo consultan al navegar desde el
// propio sitio, donde el servidor no interviene.
export default defineEventHandler(() => ({ ok: true }))
