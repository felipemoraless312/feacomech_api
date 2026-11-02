/** Cargo con las personas en funciones, como lo dibuja el organigrama. */
export interface CargoOrganigrama {
  id: string
  nombre: string
  orden: number
  superiorId: string | null
  personas: {
    nombre: string
    fotoId: string | null
    procedencia?: string | null
    /** Sólo en el panel: el nombramiento aún no se publica en el portal. */
    sinPublicar?: boolean
  }[]
}
