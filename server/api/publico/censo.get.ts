import { estadisticasCenso } from '~~/server/services/censo'

/** Estadística pública del censo: sólo cifras agregadas, sin grupos pequeños ni instituciones. */
export default defineEventHandler(async () => {
  const c = await estadisticasCenso({ segmento: 'registrados' }, 'publico')
  return {
    totales: {
      registrados: c.totales.registrados,
      afiliados: c.totales.afiliados,
      organizacionesAfiliadas: c.totales.organizacionesAfiliadas,
      municipios: c.totales.municipios,
      especialidades: c.totales.especialidades,
    },
    porEspecialidad: c.porEspecialidad,
    porRegion: c.porRegion,
  }
})
