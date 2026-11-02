// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', 'nuxt-auth-utils'],

  css: ['~/assets/css/main.css'],

  // Siempre en claro, aunque el dispositivo esté en modo oscuro; el usuario puede cambiarlo.
  colorMode: {
    preference: 'light',
    fallback: 'light',
    storageKey: 'feacomech-tema',
  },

  // Se descargan al compilar y se sirven desde el propio servidor.
  fonts: {
    families: [
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700], global: true },
      // Títulos: serif sobria de corte institucional.
      { name: 'Source Serif 4', provider: 'google', weights: [500, 600, 700], global: true },
    ],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'es-MX' },
      titleTemplate: '%s · FEACOMECH',
      meta: [
        { name: 'description', content: 'Federación de Asociaciones y Colegios Médicos del Estado de Chiapas' },
        { name: 'theme-color', content: '#3f2759' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },

  // El portal público se renderiza en el servidor (SEO) y sólo recibe datos públicos.
  // La plataforma privada y las impresiones son SPA: no se genera HTML con datos personales
  // en el servidor y se evitan diferencias de hidratación (IDs de etiquetas de formulario).
  routeRules: {
    '/plataforma/**': { ssr: false },
    '/imprimir/**': { ssr: false },
  },

  // Sesión: cookie sellada httpOnly (nuxt-auth-utils). maxAge = vida máxima absoluta;
  // la inactividad se controla en server/middleware/02.sesion.ts.
  runtimeConfig: {
    session: {
      name: 'feacomech-sesion',
      password: '', // NUXT_SESSION_PASSWORD
      maxAge: 60 * 60 * 12,
      // En producción sólo por HTTPS. En desarrollo se permite HTTP para probar desde un
      // teléfono en la red local; "localhost" ya es seguro.
      cookie: { sameSite: 'lax', secure: process.env.NODE_ENV === 'production' },
    },
  },

  // Dependencias que Vite empaqueta al arrancar (si las descubre a mitad del uso, recarga
  // y la página en curso falla con "useHead() was called without provide context").
  vite: {
    optimizeDeps: {
      include: ['zod', 'date-fns', '@date-fns/tz', '@vueuse/core'],
    },
  },

  nitro: {
    rollupConfig: {
      plugins: [
        {
          // El cliente generado por Prisma 7 hace `fileURLToPath(import.meta.url)` para
          // definir __dirname; al empaquetar, Nitro sustituye import.meta.url por
          // "file:///_entry.js", que en Windows no es una ruta válida y tumba el servidor.
          // Con el adaptador pg el motor va incrustado (wasm base64) y no usa __dirname.
          name: 'feacomech:prisma-dirname',
          transform(code: string, id: string) {
            if (!id.replaceAll('\\', '/').includes('/server/generated/prisma/')) return null
            const sinDirname = code.replace(/^globalThis\['__dirname'\] = .*$/m, '')
            return sinDirname === code ? null : { code: sinDirname, map: null }
          },
        },
      ],
    },
  },

  typescript: {
    strict: true,
  },
})
