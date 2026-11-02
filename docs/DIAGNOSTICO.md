# FEACOMECH: diagnóstico inicial (Fase 1, auditoría)

**Fecha:** 1 nov 2026
**Plantilla analizada:** `Desktop/Hoscem` (sistema HOSCEM, commit `e503077`)
**Destino:** `Desktop/feacomech`. Por ahora solo contiene este documento. No se ha escrito ni copiado código.

---

## 1. Arquitectura actual de la plantilla

Es un monolito Nuxt full-stack con tres capas y una sola fuente de verdad para cada tema:

```
app/      cliente Nuxt 4: sitio público (SSR) + portal privado (SPA en /personal/**)
shared/   código común cliente/servidor: permisos (RBAC), esquemas Zod y lógica pura
server/   API Nitro → handlers delgados → services (dominio + transacciones) → Prisma
prisma/   schema, migraciones SQL (con triggers) y seed
tests/    unit/ (sin BD) e integration/ (BD de pruebas en Docker)
```

Reglas de diseño que se conservan en FEACOMECH:
- **Handler**: `requirePermiso(event, 'permiso')`, luego `leerCuerpo(event, schemaZod)`, luego el servicio, y devuelve un DTO. No contiene lógica de negocio.
- **Servicio**: reglas de dominio. Toda escritura relevante va en una `prisma.$transaction` que también escribe en `Auditoria`.
- **Autorización en dos niveles**: el permiso por rol (`shared/permisos.ts`) y el alcance (TOTAL / SERVICIO / PROPIO), que aplica el servicio.
- El sitio público usa SSR y solo recibe datos públicos. El portal privado es una SPA (`routeRules ssr:false`), así que el servidor no genera HTML con datos sensibles.

## 2. Tecnologías detectadas

| Pieza | Versión | Uso |
|---|---|---|
| Node.js | ≥ 22.12 | |
| Nuxt / Nitro | 4.5 | app + API |
| Nuxt UI | 4.11 (Tailwind 4) | componentes, `UDashboard*`, tablas y formularios |
| Pinia | 4 | estado (casi no se usa) |
| Prisma | 7.10 + `@prisma/adapter-pg` | ORM y migraciones |
| PostgreSQL | 17 (Docker Compose) | dev en 5432, pruebas en 5433 (tmpfs) |
| Zod | 4 | validación compartida, mensajes en español |
| nuxt-auth-utils | 0.5 | cookie sellada httpOnly |
| @node-rs/argon2 | 2 | hash argon2id |
| date-fns + @date-fns/tz | 4 | zona `America/Mexico_City` |
| Playwright | 1.63 | PDF en el servidor desde vistas `/imprimir/**` |
| Vitest + @nuxt/test-utils | 5 / 4 | pruebas unitarias e integración |
| Iconos | Lucide (`@iconify-json/lucide`) | |
| Fuentes | Inter + Fraunces (descargadas al compilar) | |

## 3. Estructura de carpetas relevante

- `app/layouts`: `default` (sitio), `personal` (dashboard con barra lateral filtrada por permisos) e `impresion`.
- `app/components`: genéricos (`GrupoDatos`, `FilaDato`, `EncabezadoPagina`, `AlertaError`, `PantallaAcceso`, `SelectorPersona`, `FormularioUsuario`), `sitio/*` (portada, secciones, contacto, cifras…) y de dominio hospitalario (cargos, episodio, laboratorio).
- `app/composables`: `useApi` (401 → login), `useEnvio` (estado de envío y errores por campo), `usePermisos`, `useHospital` (datos institucionales).
- `app/middleware/auth.global.ts`: protege `/personal/**` y `/imprimir/**` con `meta.permiso`.
- `server/utils`: `sesion.ts` (`requirePermiso`, `requireAlguno`, `idDeRuta`), `auditoria.ts`, `validacion.ts`, `contrasenas.ts`, `prisma.ts`, `parametros.ts`, `folios.ts`, `pdf.ts`.
- `server/middleware`: `01.seguridad` (cabeceras y `no-store`) y `02.sesion` (inactividad e invalidación por `versionSesion`).
- `server/services`: 13 servicios, unas 3,500 líneas, casi todas del dominio clínico y de cobro.

## 4. Funcionalidades existentes (en HOSCEM)

**Genéricas y reutilizables:**
- Inicio de sesión con bloqueo (5 intentos, 15 min) y hash señuelo contra enumeración.
- Cambio de contraseña obligatorio.
- Sesión con inactividad configurable; un cambio de contraseña o de roles invalida las sesiones abiertas.
- Administración de usuarios: alta, edición, desactivación y restablecimiento.
- Bitácora inmutable (trigger SQL) con su pantalla de consulta.
- Parámetros configurables en la base y folios consecutivos sin huecos.
- Datos institucionales editables (el sitio no publica los campos vacíos).
- Generación de PDF, sitio público SSR, aviso de privacidad (borrador), dashboard y reportes.

**Del hospital (no aplican a FEACOMECH):** pacientes, episodios, camas, cargos, caja, recibos, cortes, notas clínicas, enfermería, cirugías, laboratorio y honorarios.

## 5. Componentes reutilizables

| Se reutiliza tal cual o casi | Se adapta | Se descarta |
|---|---|---|
| `server/utils/{sesion,auditoria,validacion,contrasenas,prisma,parametros,folios,pdf}.ts` | `shared/permisos.ts` (ver §9.1) | Todo `server/services` clínico y de caja |
| `server/middleware/*` | `services/auth.ts` y `usuarios.ts` (perfil profesional y recuperación de contraseña) | `components/cargos`, `episodio`, `laboratorio` |
| `useApi`, `useEnvio`, `usePermisos`, `errorDeApi` | `layouts/personal.vue`, que pasa a `/plataforma` con el menú de 14 módulos | `shared/{turnos,cuenta}.ts` y sus pruebas |
| `GrupoDatos`, `FilaDato`, `EncabezadoPagina`, `AlertaError`, `PantallaAcceso`, `SelectorPersona` | `layouts/default.vue` y `components/sitio/*` (Portada, Sección, Contacto, Cifras) | `imagenes/` y `public/` de HOSCEM |
| `app.config.ts` (estilo de Nuxt UI), `plugins/{revelar,zod-es}.ts` | `main.css`: el verde de HOSCEM cambia a **azul institucional**, con otra tipografía de títulos | Plugin Rollup de Prisma (se conserva, es un arreglo para Windows) |
| `docker-compose.yml`, `prisma.config.ts`, `vitest.config.ts`, helpers de pruebas | Puertos **5434/5435** para no chocar con HOSCEM | |

## 6. Estado de la base de datos (plantilla)

- El schema tiene 1,610 líneas y unos 60 modelos, casi todos clínicos. Hay 7 migraciones con reglas SQL: la bitácora es solo-inserción y hay índices parciales únicos.
- `Rol` es un **enum de Prisma**. Agregar un rol exige una migración y no se puede configurar desde el panel.
- `Adjunto` existe como modelo, pero **no hay almacenamiento de archivos**: no se pueden subir archivos a disco con control de acceso.
- **Para FEACOMECH:** base nueva (`feacomech`, `feacomech_test`) con migraciones nuevas desde cero. No se arrastra el historial de HOSCEM.

## 7. Estado de autenticación (plantilla)

- Funciona bien: usuario + contraseña, argon2id, bloqueo por intentos, cookie `httpOnly` `sameSite=lax` (`secure` en producción), inactividad, invalidación por versión y bitácora de login/logout.
- Le falta lo que exige FEACOMECH:
  - **Recuperación de contraseña por correo.** No hay envío de correo; hace falta SMTP y un token de un solo uso con caducidad.
  - **Iniciar sesión con correo**, no con nombre de usuario.
  - **Lista de sesiones activas** con opción de cerrar las demás.
  - **Notificaciones.**
  - **Registro o solicitud de afiliación** por parte del médico, que hoy no existe porque en HOSCEM solo el administrador crea usuarios.

## 8. Módulos que deben desarrollarse

| # | Módulo | Entidades principales |
|---|---|---|
| A | Identidad, usuarios y perfil profesional | `Usuario`, `PerfilProfesional`, `Especialidad`, `Sesion`, `TokenRecuperacion`, `ConsentimientoDatos` |
| B | RBAC configurable con alcance por organización | `Rol`, `Permiso`, `RolPermiso`, `UsuarioRol(organizacionId?)` |
| C | Colegios y asociaciones | `Organizacion` (tipo COLEGIO/ASOCIACION), `AfiliacionFederacion` (historial), `Membresia` (historial), `SolicitudCambio` (validación por la Federación) |
| D | Estructura y mesa directiva | `Cargo` (configurable), `Organo` (mesa, consejo, comisión), `Periodo`, `Nombramiento`; organigrama |
| E | Portal público y contenido (CMS) | `Pagina`/`Seccion`, `Noticia` (tipo), `Vinculo`/`Convenio`, `MensajeContacto`, `DatosInstitucionales` |
| F | Eventos y EMC | `Evento`, `Ponente`, `ProgramaActividad`, `Inscripcion`, `Asistencia`, `Constancia` (folio + verificación por QR) |
| G | Comunidad y foro | `Grupo` (general, especialidad, organización o debate, con privacidad), `MiembroGrupo`, `Publicacion`, `Comentario` (anidado), `Reaccion`, `Reporte`, `Moderacion` |
| H | Gestión documental | `Documento`, `CategoriaDocumento`, `Archivo` (almacenamiento privado), nivel de acceso |
| I | Censo médico estatal | `Municipio`/`Region` (catálogo INEGI de Chiapas), agregados y gráficas; distingue afiliado, registrado y pendiente |
| J | Panel, reportes y configuración | indicadores desde la BD, reportes y exportación, `Parametro`, `Auditoria` |
| K | Credencial digital | vista y PDF con QR de verificación pública (sin datos sensibles) |
| L | Protección de datos (LFPDPPP 2025) | aviso de privacidad, consentimientos, derechos ARCO, opción de publicar o no en el directorio |

## 9. Posibles problemas técnicos

1. **Roles fijos en código.** El prompt pide que los administradores configuren permisos. Propuesta: el **catálogo de permisos** se queda en `shared/permisos.ts` (lo define el código, porque cada endpoint lo usa), pero la asignación **rol → permisos** pasa a la base y se edita desde el panel. Se agrega el alcance `ORGANIZACION`: un representante solo actúa sobre las organizaciones donde tiene ese rol. Los permisos efectivos van en la sesión y se recargan cuando cambia la configuración, con el mecanismo `versionSesion` que ya existe.
2. **Archivos.** Hay que construir el almacenamiento: disco privado fuera de `public/`, nombre aleatorio, validación por *magic bytes* y no solo por extensión, límites de tamaño y descarga a través de un endpoint que revisa permisos. Las imágenes se convierten a WebP. Hay que decidir si se usa `sharp`.
3. **Correo.** Se necesita SMTP (nodemailer) para recuperar contraseñas y enviar notificaciones. En desarrollo se usaría Mailpit en Docker.
4. **Gráficas.** No hay librería. Propuesta: SVG propio o una librería ligera. Se decide en la Fase 3.
5. **Playwright en producción** (constancias y credenciales en PDF) requiere Chromium en el servidor. Es pesado pero ya está resuelto en HOSCEM.
6. **Problemas heredados ya documentados:** `nuxt typecheck/prepare/build` rompen `npm run dev` si se ejecutan al mismo tiempo. Prisma 7 bloquea `migrate reset` cuando lo ejecuta un agente, así que se usa `migrate deploy`. La hidratación con `useId` en SSR obligó a servir el portal como SPA. El plugin Rollup para `__dirname` es necesario en Windows.
7. **Puertos y nombres** (5432/5433, nombres de cookie y de compose): hay que cambiarlos para que ambos proyectos funcionen a la vez.
8. **Foro y datos de pacientes.** Se necesita un aviso visible al publicar, reportes y moderación. El reglamento lo define la Federación.
9. **Información institucional.** La búsqueda pública solo encontró notas de prensa con nombres de presidentes de distintos periodos. **No se cargará ninguno.** Toda la estructura queda vacía o marcada «Pendiente de validación por FEACOMECH».

## 10. Plan de implementación propuesto

| Fase | Entregable | Verificación |
|---|---|---|
| **0. Base** | `git init` en `feacomech`. Copia de la infraestructura genérica de la §5 (sin dominio clínico). Renombrado, puertos 5434/5435, `.env.example`, compose con Mailpit. | `npm install`, `db:up`, typecheck, pruebas de auth y permisos |
| **1. Identidad visual** | Paleta azul institucional, tipografía, logotipo provisional, layout público y layout `/plataforma` con el menú de 14 módulos (lo que aún no existe aparece deshabilitado como «próximamente», sin enlaces muertos) | typecheck; lo visual lo revisa el usuario |
| **2. Identidad y RBAC** | Usuarios, perfil profesional, especialidades, login por correo, recuperación de contraseña, sesiones activas, roles y permisos en BD con alcance por organización, bitácora | integración: permisos por rol y por organización |
| **3. Organizaciones y afiliaciones** | Directorio, espacio y panel por organización, membresías con historial, solicitudes de alta y cambios con validación de la Federación, documentos de la organización | integración |
| **4. Estructura organizacional** | Cargos, órganos, periodos, nombramientos, historial y organigrama dinámico | integración |
| **5. Portal público y CMS** | Inicio, Nosotros, Directorio, Noticias, Eventos (lectura), Vinculación, Contacto (con antispam y límite de envíos), todo administrable | SSR solo con datos públicos |
| **6. Eventos y EMC** | Eventos, inscripción, asistencia, constancias PDF con QR verificable, calendario | integración |
| **7. Comunidad y foro** | Grupos con privacidad, publicaciones, comentarios anidados, reacciones, adjuntos, reportes y moderación, notificaciones | integración y permisos |
| **8. Documentos** | Biblioteca con categorías, búsqueda, permisos, vista previa y descarga autorizada | integración |
| **9. Censo y reportes** | Estadísticas agregadas (públicas y privadas), gráficas, reportes exportables, dashboard con datos reales | integración |
| **10. Credencial y datos personales** | Credencial digital, aviso de privacidad (borrador para revisión jurídica), consentimientos, ARCO y exportación de datos propios | integración |
| **11. Cierre** | README, documentación técnica, manual de administración, guía de respaldos | revisión |

Al cerrar cada fase se reporta qué archivos se modificaron, qué quedó funcionando, qué falta y el resultado de las pruebas.

### Decisiones que necesito antes de empezar
1. **Logotipo y colores oficiales** de FEACOMECH (si existen) o uso de un logotipo provisional.
2. **Correo SMTP** para producción (se puede posponer; en desarrollo se usa Mailpit).
3. ¿El médico puede **solicitar su registro** desde el sitio, o solo lo da de alta su colegio o la Federación?
4. ¿Los **eventos tienen costo**? El prompt no menciona pagos; propongo dejarlos fuera.

---

### Fuentes consultadas (solo contexto, nada se cargó como dato)
- [Facebook de Feacomech](https://www.facebook.com/feacomech/)
- [Diario de Chiapas: «Lealtad y trabajo», nueva directiva de la FEACOMECH](https://diariodechiapas.com/a-and-s/lealtad-y-trabajo-nueva-directiva-de-la-feacomech/)
- [Diario de Chiapas: Criminalización médica](https://diariodechiapas.com/metropoli/criminalizacion-medica/)
- [UNICH: Difusión (convenio con FEACOMECH)](https://www.unich.edu.mx/author/zuemi-cruz-diaz/page/203/)
- [Sie7e de Chiapas: Simposio de Dermatología en Tuxtla](https://www.sie7edechiapas.com/post/anuncian-el-simposio-de-dermatolog%C3%ADa-en-tuxtla)
