// Organigrama: arma el árbol de cargos a partir de `superiorId`.
// Puro (sin base de datos) para usarlo igual en el servidor, el cliente y las pruebas.

export interface NodoCargo<T> {
  cargo: T
  hijos: NodoCargo<T>[]
}

interface CargoBase { id: string, superiorId: string | null, orden: number, nombre: string }

/**
 * Raíces = cargos sin superior o cuyo superior no está en la lista. Los hermanos se ordenan
 * por `orden` y nombre. Tolera ciclos (un cargo nunca aparece dos veces).
 */
export function armarOrganigrama<T extends CargoBase>(cargos: readonly T[]): NodoCargo<T>[] {
  const porId = new Map(cargos.map(c => [c.id, c]))
  const hijosDe = new Map<string | null, T[]>()
  for (const c of cargos) {
    const padre = c.superiorId && porId.has(c.superiorId) ? c.superiorId : null
    hijosDe.set(padre, [...(hijosDe.get(padre) ?? []), c])
  }
  const ordenar = (lista: T[]) => [...lista].sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, 'es'))
  const visitados = new Set<string>()
  const armar = (padre: string | null): NodoCargo<T>[] =>
    ordenar(hijosDe.get(padre) ?? [])
      .filter(c => !visitados.has(c.id) && visitados.add(c.id))
      .map(c => ({ cargo: c, hijos: armar(c.id) }))
  return armar(null)
}

/** ¿Asignar `superiorId` a `cargoId` crearía un ciclo? */
export function creaCiclo(cargos: readonly { id: string, superiorId: string | null }[], cargoId: string, superiorId: string | null): boolean {
  const porId = new Map(cargos.map(c => [c.id, c.superiorId]))
  for (let actual = superiorId, pasos = 0; actual && pasos <= cargos.length; actual = porId.get(actual) ?? null, pasos++) {
    if (actual === cargoId) return true
  }
  return false
}

/** Un nombramiento está vigente si su estado lo dice y su fecha de fin no ha pasado. */
export function estaVigente(n: { estado: string, inicio: string | Date, fin: string | Date | null }, hoy = new Date()) {
  const dia = hoy.toISOString().slice(0, 10)
  const iso = (v: string | Date) => new Date(v).toISOString().slice(0, 10)
  return n.estado === 'VIGENTE' && iso(n.inicio) <= dia && (!n.fin || iso(n.fin) >= dia)
}
