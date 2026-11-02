/** Lo mínimo que muestra la lista de documentos (portal y plataforma). */
export interface DocumentoLista {
  id: string
  titulo: string
  descripcion: string | null
  nivelAcceso: string
  vigente: boolean
  fechaDocumento: string | Date | null
  categoria: { nombre: string }
  organizacion: { nombre: string, siglas: string | null } | null
  archivo: { mime: string, tamano: number, nombreOriginal: string }
}
