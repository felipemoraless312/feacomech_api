# FEACOMECH

Plataforma institucional de la **Federación de Asociaciones y Colegios Médicos del Estado de Chiapas**:
portal público + plataforma privada para colegios, asociaciones y profesionales afiliados.

Arquitectura heredada de HOSCEM. Diagnóstico y plan por fases: [`docs/DIAGNOSTICO.md`](docs/DIAGNOSTICO.md).

Stack: Nuxt 4 · Nuxt UI 4 · Prisma 7 · PostgreSQL 17 · Zod 4 · nuxt-auth-utils (argon2id).

## Requisitos

- Node.js 22.12 o superior
- Docker Desktop (PostgreSQL y Mailpit)

## Primer arranque

```bash
cp .env.example .env        # y generar NUXT_SESSION_PASSWORD (ver comentario en el archivo)
npm install
npm run db:up               # PostgreSQL dev (5434), pruebas (5435) y Mailpit (8025)
npm run db:deploy           # aplica las migraciones
npm run db:seed             # roles iniciales, parámetros y superadministrador
npm run dev                 # http://localhost:3001
```

- Portal público: `http://localhost:3001`
- Plataforma privada: `http://localhost:3001/plataforma`, con el correo y la contraseña de
  `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (pide cambiarla al entrar).
- Correos de desarrollo: `http://localhost:8025` (Mailpit).
- Datos de demostración (opcional, sólo desarrollo): `npm run db:demo` crea organizaciones "[DEMO]" y usuarios @demo.feacomech.local con la contraseña `Demo-Feacomech-2026` (p. ej. `representante@demo.feacomech.local`).
- Información pública real de FEACOMECH (con fuentes): `npm run db:datos-reales` (ver `prisma/seed/feacomech-real.ts`). Para retirar los datos de demostración: `npm run db:quitar-demo`.
- Desde el teléfono en la misma red: `npm run dev:red` y abrir `http://<IP-de-la-PC>:3001`.

Los puertos (3001, 5434, 5435) son distintos a los de HOSCEM para que ambos proyectos corran a la vez.

## Pruebas

```bash
npm run test:unit           # sin base de datos
npm run test:integration    # requiere npm run db:up (base de pruebas, puerto 5435)
npm run typecheck
```

> No ejecute `typecheck`, `nuxt prepare` ni `build` mientras `npm run dev` está corriendo: regeneran `.nuxt` y el servidor de desarrollo empieza a fallar. Si pasa, reinicie `npm run dev`.

## Estructura

```
app/        cliente Nuxt: portal público (SSR) y plataforma privada (/plataforma, SPA)
shared/     código común: catálogo de permisos, parámetros, esquemas Zod
server/     API (handlers delgados) → services (dominio + transacciones) → Prisma
prisma/     schema, migraciones (con reglas SQL) y seed
tests/      unit/ e integration/
```

Reglas clave:
- **Permisos (RBAC).** El catálogo de permisos está en `shared/permisos.ts`. Qué permisos tiene cada rol se guarda en la base (`Rol`, `RolPermiso`) y se configura desde el panel. El servidor valida cada endpoint con `requirePermiso(event, '…')`, que devuelve el alcance: `TOTAL`, `ORGANIZACION` o `PROPIO`. El cliente solo oculta o muestra opciones.
- **Bitácora.** Todo cambio relevante se guarda en una transacción que también escribe en `Auditoria`. La bitácora no se puede modificar ni borrar porque lo impide un trigger en la base.
- **Información institucional.** No se inventa. El portal solo publica lo capturado y validado; lo marcado como `[… por confirmar]` no se publica.
- **Sesión.** Va en una cookie sellada que guarda la identidad del usuario y el id de su renglón en la tabla `Sesion`. Cada petición valida ese renglón: si la sesión se cerró, venció por inactividad o el usuario fue desactivado, deja de servir. Los roles y permisos se leen de la base, con caché, así que un cambio de permisos aplica en segundos.
- **Contraseñas.** El administrador nunca ve ni dicta contraseñas. Las cuentas nuevas reciben por correo un enlace de activación (72 h) y la recuperación envía un enlace de un solo uso (30 min). En la base solo se guarda el hash del enlace. Sin SMTP configurado, la plataforma muestra el enlace al administrador para que lo entregue en persona.
- **Archivos.** Se guardan en `almacen/`, fuera de `public/`, con nombre aleatorio. El tipo se valida por la firma real del archivo y no por su extensión. Se entregan por `/api/archivos/:id` según su visibilidad: `PUBLICO`, `AUTENTICADO` o `RESTRINGIDO`.
- **Límites de frecuencia** por IP en inicio de sesión, recuperación y subida de fotos (`server/utils/frecuencia.ts`).

## Avance

| Fase | Contenido | Estado |
|---|---|---|
| 0 | Base: infraestructura de HOSCEM sin la parte clínica, puertos propios, Mailpit, roles y permisos guardados en la base, inicio de sesión con correo, bitácora, portal y plataforma base | ✅ |
| 1 | Identidad visual: paleta azul, Source Serif 4, marca y motivo «red» provisionales; componentes `PanelPagina`, `EstadoPunto`, `EstadoVacio`, `FotoPerfil` | ✅ (falta el logotipo oficial) |
| 2 | Usuarios (alta con invitación, roles, activación), panel de roles y permisos, mi perfil profesional con foto y consentimiento, recuperación de contraseña, sesiones por dispositivo, notificaciones, especialidades, datos institucionales, bitácora, resumen con indicadores | ✅ |
| 3 | Colegios y asociaciones: registro, historial de afiliación a la Federación, integrantes (solicitud de alta y baja, validación, historial), representantes con alcance de su organización, cambios de datos sujetos a aprobación, logotipo, estadísticas, validación de cédulas (Profesionales), «Mis organizaciones», directorio público | ✅ |
| 4 | Estructura organizacional: órganos y cargos configurables con jerarquía, periodos, nombramientos con historial (cuenta o sólo nombre, procedencia, foto, estado), publicación sólo tras validación de la Federación, organigrama dinámico; igual para cada organización | ✅ |
| 5 | Portal público: inicio con datos reales, Nosotros, Directorio (organizaciones, mesa directiva con historial, consejo, profesionales autorizados), Noticias con flujo editorial (borrador → revisión → publicada), Vinculación, Contacto (con campo trampa y límite por IP), aviso de privacidad (borrador) | ✅ |
| 6 | Eventos y EMC: gestión (Federación u organizaciones), programa, ponentes, portada, inscripción con cupo y lista de espera (bloqueo de fila: sin sobrecupo), asistencia por día, constancias con folio y QR verificable en /verificar/<código>, revocación, CSV de inscritos, calendario público | ✅ |
| 7 | Comunidad: grupos general, por especialidad, por organización (automático) y debates; privacidad ABIERTO/MIEMBROS/PRIVADO; publicaciones con adjuntos restringidos, comentarios con respuestas, reacciones, reportes y moderación; bloqueo de CURP, NSS y números de expediente | ✅ |
| 8 | Gestión documental: categorías configurables, niveles de acceso (público, afiliados, organización, restringido), PDF/Office/imágenes validados por firma, vista previa, descargas con bitácora, versiones del archivo, vigencia, biblioteca por organización y página pública /documentos | ✅ |
| 9 | Censo médico y reportes: catálogo de 15 regiones y 124 municipios de Chiapas, municipio de ejercicio en el perfil, censo por especialidad, subespecialidad, región, municipio, organización e institución (registrados, afiliados, validados, pendientes) con evolución mensual; cifras públicas agregadas (grupos de menos de 3 en «Otros»); reportes CSV con alcance y bitácora. Portada administrable (cifras con fuente, trayectoria, cita, líneas de trabajo, agenda con cuenta regresiva) | ✅ |
| 10–11 | Ver `docs/DIAGNOSTICO.md` §10 | Pendiente |

### Pendiente de la Federación

- Identidad: se usa el escudo oficial (`public/logo/logo.jpg`, recortado en `public/img/escudo-*.png`) y su morado (#3F2759) como color de marca. Si existe una versión vectorial (SVG/PDF) del escudo, conviene reemplazar los PNG.
- Aviso de privacidad: borrador para revisión jurídica (`app/pages/aviso-de-privacidad.vue`).
- Nombramientos: la estructura base (Presidencia, Vicepresidencia, Secretaría general, Tesorería, Vocalía, Consejo consultivo) es una plantilla sin personas; la Federación captura y publica a quienes valide.
- Datos institucionales: dirección, teléfono, correo, historia, misión, visión y objetivos.
- Regiones: la asignación de municipios a las 15 regiones socioeconómicas (`prisma/seed/chiapas.ts`) debe cotejarse con la regionalización oficial del CEIEG.
- Portada: cifras, trayectoria y agenda vienen de notas de prensa citadas; se editan en Configuración → Página de inicio.
- La ciudad (Tuxtla Gutiérrez) se tomó de su página pública de Facebook y está marcada para confirmar.
