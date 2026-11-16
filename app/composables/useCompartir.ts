// Metadatos para compartir en redes (Open Graph / X) con URLs absolutas, que es lo que piden
// Facebook y WhatsApp. La base sale de la configuración, nunca del encabezado Host de la
// petición (se podría falsificar).
//   useCompartir({ titulo, descripcion, imagen: '/api/archivos/…', tipo: 'article' })
import type { MaybeRefOrGetter } from 'vue'

export const IMAGEN_COMPARTIR = '/img/marca/compartir.jpg'

/** Base absoluta del sitio. Usa useRuntimeConfig: llamarla sólo durante el setup. */
function baseUrl(): string {
  const publica = useRuntimeConfig().public.urlPublica as string
  const base = publica
    || (import.meta.server ? process.env.NUXT_URL_PUBLICA ?? '' : window.location.origin)
  return base.replace(/\/$/, '')
}

const unir = (base: string, ruta: string) => (/^https?:\/\//.test(ruta) ? ruta : `${base}${ruta}`)

interface OpcionesCompartir {
  titulo?: MaybeRefOrGetter<string | null | undefined>
  descripcion?: MaybeRefOrGetter<string | null | undefined>
  imagen?: MaybeRefOrGetter<string | null | undefined>
  tipo?: 'website' | 'article'
}

export function useCompartir(o: OpcionesCompartir = {}) {
  const route = useRoute()
  // Se resuelve aquí, en el setup: los getters de abajo se evalúan después, fuera de él.
  const base = baseUrl()
  const imagen = () => unir(base, toValue(o.imagen) || IMAGEN_COMPARTIR)
  useSeoMeta({
    ogType: o.tipo ?? 'website',
    ogUrl: () => unir(base, route.path),
    ogTitle: o.titulo ? () => toValue(o.titulo) || undefined : undefined,
    ogDescription: o.descripcion ? () => toValue(o.descripcion) || undefined : undefined,
    ogImage: imagen,
    ogImageAlt: 'FEACOMECH',
    twitterImage: imagen,
  })
}
