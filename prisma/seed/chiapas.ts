// Catálogo geográfico de Chiapas para el censo: 15 regiones socioeconómicas y 124 municipios.
// Municipios: listado de 124 municipios (Wikipedia, «Anexo:Municipios de Chiapas»).
// La ASIGNACIÓN de municipios a regiones debe validarse contra la regionalización oficial
// del Gobierno de Chiapas (CEIEG); se puede corregir en la base sin cambiar el código.

export const REGIONES: { numero: number, nombre: string, municipios: string[] }[] = [
  { numero: 1, nombre: 'Metropolitana', municipios: ['Tuxtla Gutiérrez', 'Chiapa de Corzo', 'Berriozábal', 'Suchiapa'] },
  { numero: 2, nombre: 'Valles Zoque', municipios: ['Cintalapa', 'Jiquipilas', 'Ocozocoautla de Espinosa'] },
  { numero: 3, nombre: 'Mezcalapa', municipios: ['Chicoasén', 'Coapilla', 'Copainalá', 'Francisco León', 'Ocotepec', 'Osumacinta', 'San Fernando', 'Tecpatán', 'Mezcalapa'] },
  { numero: 4, nombre: 'De los Llanos', municipios: ['Acala', 'Chiapilla', 'Nicolás Ruiz', 'San Lucas', 'Socoltenango', 'Totolapa', 'Venustiano Carranza', 'Emiliano Zapata'] },
  { numero: 5, nombre: 'Altos Tsotsil-Tseltal', municipios: ['Aldama', 'Amatenango del Valle', 'Chalchihuitán', 'Chamula', 'Chanal', 'Chenalhó', 'Huixtán', 'Larráinzar', 'Mitontic', 'Oxchuc', 'Pantelhó', 'San Cristóbal de Las Casas', 'San Juan Cancuc', 'Santiago el Pinar', 'Tenejapa', 'Teopisca', 'Zinacantán'] },
  { numero: 6, nombre: 'Frailesca', municipios: ['Ángel Albino Corzo', 'La Concordia', 'Montecristo de Guerrero', 'Villa Corzo', 'Villaflores', 'El Parral'] },
  { numero: 7, nombre: 'De los Bosques', municipios: ['Bochil', 'El Bosque', 'Huitiupán', 'Ixtapa', 'Jitotol', 'Pantepec', 'Pueblo Nuevo Solistahuacán', 'Rayón', 'San Andrés Duraznal', 'Simojovel', 'Soyaló', 'Tapalapa', 'Tapilula', 'Rincón Chamula San Pedro'] },
  { numero: 8, nombre: 'Norte', municipios: ['Amatán', 'Chapultenango', 'Ixhuatán', 'Ixtacomitán', 'Ixtapangajoya', 'Juárez', 'Ostuacán', 'Pichucalco', 'Reforma', 'Solosuchiapa', 'Sunuapa'] },
  { numero: 9, nombre: 'Istmo-Costa', municipios: ['Arriaga', 'Mapastepec', 'Pijijiapan', 'Tonalá'] },
  { numero: 10, nombre: 'Soconusco', municipios: ['Acacoyagua', 'Acapetahua', 'Cacahoatán', 'Escuintla', 'Frontera Hidalgo', 'Huehuetán', 'Huixtla', 'Mazatán', 'Metapa', 'Suchiate', 'Tapachula', 'Tuxtla Chico', 'Tuzantán', 'Unión Juárez', 'Villa Comaltitlán'] },
  { numero: 11, nombre: 'Sierra Mariscal', municipios: ['Amatenango de la Frontera', 'Bejucal de Ocampo', 'Bella Vista', 'Chicomuselo', 'Frontera Comalapa', 'La Grandeza', 'Mazapa de Madero', 'Motozintla', 'El Porvenir', 'Siltepec', 'Honduras de la Sierra', 'Capitán Luis Ángel Vidal'] },
  { numero: 12, nombre: 'Selva Lacandona', municipios: ['Altamirano', 'Benemérito de las Américas', 'Maravilla Tenejapa', 'Marqués de Comillas', 'Ocosingo'] },
  { numero: 13, nombre: 'Maya', municipios: ['Catazajá', 'La Libertad', 'Palenque'] },
  { numero: 14, nombre: 'Tulijá Tseltal Chol', municipios: ['Chilón', 'Sabanilla', 'Salto de Agua', 'Sitalá', 'Tila', 'Tumbalá', 'Yajalón'] },
  { numero: 15, nombre: 'Meseta Comiteca Tojolabal', municipios: ['Comitán de Domínguez', 'La Independencia', 'Las Margaritas', 'Las Rosas', 'La Trinitaria', 'Tzimol'] },
]
