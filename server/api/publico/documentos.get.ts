import { documentosQuery } from '~~/shared/schemas/documentos'
import { listarCategorias, listarDocumentos } from '~~/server/services/documentos'

/** Documentos públicos (estatutos, convocatorias…) para el portal. */
export default defineEventHandler(async (event) => {
  const q = leerQuery(event, documentosQuery)
  const [pagina, categorias] = await Promise.all([listarDocumentos(null, { ...q, incluirNoVigentes: false }), listarCategorias()])
  return { ...pagina, categorias: categorias.map(c => ({ id: c.id, nombre: c.nombre })) }
})
