-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('CONGRESO', 'CURSO', 'CONFERENCIA', 'TALLER', 'JORNADA', 'OTRO');

-- CreateEnum
CREATE TYPE "ModalidadEvento" AS ENUM ('PRESENCIAL', 'VIRTUAL', 'HIBRIDO');

-- CreateEnum
CREATE TYPE "EstadoEvento" AS ENUM ('BORRADOR', 'PUBLICADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoInscripcion" AS ENUM ('CONFIRMADA', 'LISTA_ESPERA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoGrupo" AS ENUM ('GENERAL', 'ESPECIALIDAD', 'ORGANIZACION', 'DEBATE');

-- CreateEnum
CREATE TYPE "PrivacidadGrupo" AS ENUM ('ABIERTO', 'MIEMBROS', 'PRIVADO');

-- CreateEnum
CREATE TYPE "RolGrupo" AS ENUM ('MIEMBRO', 'MODERADOR');

-- CreateEnum
CREATE TYPE "EstadoMiembroGrupo" AS ENUM ('ACTIVO', 'PENDIENTE');

-- CreateEnum
CREATE TYPE "TipoReaccion" AS ENUM ('ME_GUSTA', 'UTIL', 'INTERESANTE');

-- CreateEnum
CREATE TYPE "MotivoReporte" AS ENUM ('DATOS_PACIENTE', 'INAPROPIADO', 'SPAM', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoReporte" AS ENUM ('PENDIENTE', 'ELIMINADO', 'DESESTIMADO');

-- CreateTable
CREATE TABLE "Evento" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "tipo" "TipoEvento" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "portadaId" UUID,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "modalidad" "ModalidadEvento" NOT NULL,
    "sede" TEXT,
    "direccion" TEXT,
    "enlaceVirtual" TEXT,
    "organizacionId" UUID,
    "organizador" TEXT,
    "capacidad" INTEGER,
    "requisitos" TEXT,
    "valorCurricular" TEXT,
    "inscripcionAbierta" BOOLEAN NOT NULL DEFAULT true,
    "estado" "EstadoEvento" NOT NULL DEFAULT 'BORRADOR',
    "creadoPorId" UUID,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActividadPrograma" (
    "id" UUID NOT NULL,
    "eventoId" UUID NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3),
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "ponentes" TEXT,
    "lugar" TEXT,

    CONSTRAINT "ActividadPrograma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ponente" (
    "id" UUID NOT NULL,
    "eventoId" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "semblanza" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Ponente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inscripcion" (
    "id" UUID NOT NULL,
    "eventoId" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "estado" "EstadoInscripcion" NOT NULL,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceladaEn" TIMESTAMP(3),

    CONSTRAINT "Inscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asistencia" (
    "id" UUID NOT NULL,
    "inscripcionId" UUID NOT NULL,
    "fecha" DATE NOT NULL,
    "registradaPorId" UUID,
    "registradaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asistencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Constancia" (
    "id" UUID NOT NULL,
    "folio" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "inscripcionId" UUID NOT NULL,
    "emitidaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emitidaPorId" UUID,
    "revocadaEn" TIMESTAMP(3),
    "motivoRevocacion" TEXT,

    CONSTRAINT "Constancia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grupo" (
    "id" UUID NOT NULL,
    "tipo" "TipoGrupo" NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "privacidad" "PrivacidadGrupo" NOT NULL,
    "especialidadId" UUID,
    "organizacionId" UUID,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoPorId" UUID,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MiembroGrupo" (
    "grupoId" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "rol" "RolGrupo" NOT NULL DEFAULT 'MIEMBRO',
    "estado" "EstadoMiembroGrupo" NOT NULL DEFAULT 'ACTIVO',
    "unidoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MiembroGrupo_pkey" PRIMARY KEY ("grupoId","usuarioId")
);

-- CreateTable
CREATE TABLE "Publicacion" (
    "id" UUID NOT NULL,
    "grupoId" UUID NOT NULL,
    "autorId" UUID NOT NULL,
    "titulo" TEXT,
    "contenido" TEXT NOT NULL,
    "fijada" BOOLEAN NOT NULL DEFAULT false,
    "editadaEn" TIMESTAMP(3),
    "eliminadaEn" TIMESTAMP(3),
    "eliminadaPorId" UUID,
    "motivoEliminacion" TEXT,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Publicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comentario" (
    "id" UUID NOT NULL,
    "publicacionId" UUID NOT NULL,
    "autorId" UUID NOT NULL,
    "padreId" UUID,
    "contenido" TEXT NOT NULL,
    "editadoEn" TIMESTAMP(3),
    "eliminadoEn" TIMESTAMP(3),
    "eliminadoPorId" UUID,
    "motivoEliminacion" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comentario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaccion" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "publicacionId" UUID,
    "comentarioId" UUID,
    "tipo" "TipoReaccion" NOT NULL,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdjuntoPublicacion" (
    "id" UUID NOT NULL,
    "publicacionId" UUID NOT NULL,
    "archivoId" UUID NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AdjuntoPublicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reporte" (
    "id" UUID NOT NULL,
    "publicacionId" UUID,
    "comentarioId" UUID,
    "reportadoPorId" UUID NOT NULL,
    "motivo" "MotivoReporte" NOT NULL,
    "detalle" TEXT,
    "estado" "EstadoReporte" NOT NULL DEFAULT 'PENDIENTE',
    "resueltoPorId" UUID,
    "resueltoEn" TIMESTAMP(3),
    "nota" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Evento_slug_key" ON "Evento"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Evento_portadaId_key" ON "Evento"("portadaId");

-- CreateIndex
CREATE INDEX "Evento_estado_inicio_idx" ON "Evento"("estado", "inicio");

-- CreateIndex
CREATE INDEX "Evento_organizacionId_idx" ON "Evento"("organizacionId");

-- CreateIndex
CREATE INDEX "ActividadPrograma_eventoId_inicio_idx" ON "ActividadPrograma"("eventoId", "inicio");

-- CreateIndex
CREATE INDEX "Ponente_eventoId_orden_idx" ON "Ponente"("eventoId", "orden");

-- CreateIndex
CREATE INDEX "Inscripcion_eventoId_estado_creadaEn_idx" ON "Inscripcion"("eventoId", "estado", "creadaEn");

-- CreateIndex
CREATE UNIQUE INDEX "Inscripcion_eventoId_usuarioId_key" ON "Inscripcion"("eventoId", "usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Asistencia_inscripcionId_fecha_key" ON "Asistencia"("inscripcionId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "Constancia_folio_key" ON "Constancia"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "Constancia_codigo_key" ON "Constancia"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Constancia_inscripcionId_key" ON "Constancia"("inscripcionId");

-- CreateIndex
CREATE UNIQUE INDEX "Grupo_slug_key" ON "Grupo"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Grupo_organizacionId_key" ON "Grupo"("organizacionId");

-- CreateIndex
CREATE INDEX "Grupo_tipo_activo_idx" ON "Grupo"("tipo", "activo");

-- CreateIndex
CREATE INDEX "MiembroGrupo_usuarioId_idx" ON "MiembroGrupo"("usuarioId");

-- CreateIndex
CREATE INDEX "Publicacion_grupoId_eliminadaEn_creadaEn_idx" ON "Publicacion"("grupoId", "eliminadaEn", "creadaEn");

-- CreateIndex
CREATE INDEX "Publicacion_autorId_idx" ON "Publicacion"("autorId");

-- CreateIndex
CREATE INDEX "Comentario_publicacionId_creadoEn_idx" ON "Comentario"("publicacionId", "creadoEn");

-- CreateIndex
CREATE INDEX "Reaccion_publicacionId_idx" ON "Reaccion"("publicacionId");

-- CreateIndex
CREATE INDEX "Reaccion_comentarioId_idx" ON "Reaccion"("comentarioId");

-- CreateIndex
CREATE UNIQUE INDEX "AdjuntoPublicacion_archivoId_key" ON "AdjuntoPublicacion"("archivoId");

-- CreateIndex
CREATE INDEX "AdjuntoPublicacion_publicacionId_orden_idx" ON "AdjuntoPublicacion"("publicacionId", "orden");

-- CreateIndex
CREATE INDEX "Reporte_estado_creadoEn_idx" ON "Reporte"("estado", "creadoEn");

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_portadaId_fkey" FOREIGN KEY ("portadaId") REFERENCES "Archivo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActividadPrograma" ADD CONSTRAINT "ActividadPrograma_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ponente" ADD CONSTRAINT "Ponente_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_inscripcionId_fkey" FOREIGN KEY ("inscripcionId") REFERENCES "Inscripcion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_registradaPorId_fkey" FOREIGN KEY ("registradaPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Constancia" ADD CONSTRAINT "Constancia_inscripcionId_fkey" FOREIGN KEY ("inscripcionId") REFERENCES "Inscripcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Constancia" ADD CONSTRAINT "Constancia_emitidaPorId_fkey" FOREIGN KEY ("emitidaPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grupo" ADD CONSTRAINT "Grupo_especialidadId_fkey" FOREIGN KEY ("especialidadId") REFERENCES "Especialidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grupo" ADD CONSTRAINT "Grupo_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grupo" ADD CONSTRAINT "Grupo_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MiembroGrupo" ADD CONSTRAINT "MiembroGrupo_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MiembroGrupo" ADD CONSTRAINT "MiembroGrupo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacion" ADD CONSTRAINT "Publicacion_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacion" ADD CONSTRAINT "Publicacion_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacion" ADD CONSTRAINT "Publicacion_eliminadaPorId_fkey" FOREIGN KEY ("eliminadaPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "Publicacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_eliminadoPorId_fkey" FOREIGN KEY ("eliminadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_padreId_fkey" FOREIGN KEY ("padreId") REFERENCES "Comentario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaccion" ADD CONSTRAINT "Reaccion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaccion" ADD CONSTRAINT "Reaccion_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "Publicacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaccion" ADD CONSTRAINT "Reaccion_comentarioId_fkey" FOREIGN KEY ("comentarioId") REFERENCES "Comentario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdjuntoPublicacion" ADD CONSTRAINT "AdjuntoPublicacion_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "Publicacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdjuntoPublicacion" ADD CONSTRAINT "AdjuntoPublicacion_archivoId_fkey" FOREIGN KEY ("archivoId") REFERENCES "Archivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "Publicacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_comentarioId_fkey" FOREIGN KEY ("comentarioId") REFERENCES "Comentario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_reportadoPorId_fkey" FOREIGN KEY ("reportadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_resueltoPorId_fkey" FOREIGN KEY ("resueltoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ---------------------------------------------------------------------------
-- Reglas adicionales (escritas a mano)
-- ---------------------------------------------------------------------------

ALTER TABLE "Evento" ADD CONSTRAINT "Evento_fechas" CHECK ("fin" >= "inicio");
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_capacidad" CHECK ("capacidad" IS NULL OR "capacidad" > 0);

-- Un grupo de organización o de especialidad está ligado a ella.
ALTER TABLE "Grupo" ADD CONSTRAINT "Grupo_vinculo" CHECK (
  ("tipo" <> 'ORGANIZACION' OR "organizacionId" IS NOT NULL)
  AND ("tipo" <> 'ESPECIALIDAD' OR "especialidadId" IS NOT NULL)
);

-- Reacciones y reportes apuntan a exactamente un elemento; una reacción por persona y elemento.
ALTER TABLE "Reaccion" ADD CONSTRAINT "Reaccion_un_destino" CHECK (("publicacionId" IS NULL) <> ("comentarioId" IS NULL));
CREATE UNIQUE INDEX "Reaccion_usuario_publicacion_key" ON "Reaccion"("usuarioId", "publicacionId") WHERE "publicacionId" IS NOT NULL;
CREATE UNIQUE INDEX "Reaccion_usuario_comentario_key" ON "Reaccion"("usuarioId", "comentarioId") WHERE "comentarioId" IS NOT NULL;
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_un_destino" CHECK (("publicacionId" IS NULL) <> ("comentarioId" IS NULL));
CREATE UNIQUE INDEX "Reporte_usuario_publicacion_key" ON "Reporte"("reportadoPorId", "publicacionId") WHERE "publicacionId" IS NOT NULL;
CREATE UNIQUE INDEX "Reporte_usuario_comentario_key" ON "Reporte"("reportadoPorId", "comentarioId") WHERE "comentarioId" IS NOT NULL;

-- Búsqueda en la comunidad.
CREATE INDEX "Publicacion_texto_trgm_idx" ON "Publicacion" USING GIN (lower(coalesce("titulo", '') || ' ' || "contenido") gin_trgm_ops);
