/** Construye un CSV (UTF-8 con BOM, CRLF) seguro para hojas de cálculo. */
export function aCsv(encabezados: string[], filas: (string | number | null | undefined)[][]) {
  const celda = (v: string | number | null | undefined) => {
    const t = String(v ?? '').replace(/"/g, '""')
    // Evita que el contenido se interprete como fórmula.
    return `"${/^[=+\-@]/.test(t) ? `'${t}` : t}"`
  }
  return `﻿${[encabezados, ...filas].map(f => f.map(celda).join(',')).join('\r\n')}\r\n`
}
