-- CreateEnum
CREATE TYPE "TipoOrganizacion" AS ENUM ('COLEGIO', 'ASOCIACION');

-- CreateEnum
CREATE TYPE "EstadoAfiliacion" AS ENUM ('EN_TRAMITE', 'AFILIADA', 'SUSPENDIDA', 'BAJA');

-- CreateEnum
CREATE TYPE "EstadoMembresia" AS ENUM ('SOLICITADA', 'ACTIVA', 'RECHAZADA', 'BAJA');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- DropIndex
DROP INDEX "UsuarioRol_usuarioId_rolId_key";

-- AlterTable
ALTER TABLE "UsuarioRol" ADD COLUMN     "organizacionId" UUID;

-- CreateTable
CREATE TABLE "Organizacion" (
    "id" UUID NOT NULL,
    "tipo" "TipoOrganizacion" NOT NULL,
    "nombre" TEXT NOT NULL,
    "siglas" TEXT,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaConstitucion" DATE,
    "municipio" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "sitioWeb" TEXT,
    "logoId" UUID,
    "estadoAfiliacion" "EstadoAfiliacion" NOT NULL DEFAULT 'EN_TRAMITE',
    "publica" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AfiliacionOrganizacion" (
    "id" UUID NOT NULL,
    "organizacionId" UUID NOT NULL,
    "estado" "EstadoAfiliacion" NOT NULL,
    "desde" DATE NOT NULL,
    "hasta" DATE,
    "motivo" TEXT,
    "registradoPorId" UUID,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AfiliacionOrganizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membresia" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "organizacionId" UUID NOT NULL,
    "estado" "EstadoMembresia" NOT NULL DEFAULT 'SOLICITADA',
    "numeroSocio" TEXT,
    "desde" DATE,
    "hasta" DATE,
    "solicitadaPorId" UUID,
    "solicitadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comentario" TEXT,
    "resueltaPorId" UUID,
    "resueltaEn" TIMESTAMP(3),
    "motivo" TEXT,
    "bajaSolicitadaEn" TIMESTAMP(3),

    CONSTRAINT "Membresia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudCambio" (
    "id" UUID NOT NULL,
    "organizacionId" UUID NOT NULL,
    "datos" JSONB NOT NULL,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'PENDIENTE',
    "solicitadaPorId" UUID,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resueltaPorId" UUID,
    "resueltaEn" TIMESTAMP(3),
    "motivo" TEXT,

    CONSTRAINT "SolicitudCambio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organizacion_slug_key" ON "Organizacion"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Organizacion_logoId_key" ON "Organizacion"("logoId");

-- CreateIndex
CREATE INDEX "Organizacion_tipo_estadoAfiliacion_idx" ON "Organizacion"("tipo", "estadoAfiliacion");

-- CreateIndex
CREATE INDEX "AfiliacionOrganizacion_organizacionId_desde_idx" ON "AfiliacionOrganizacion"("organizacionId", "desde");

-- CreateIndex
CREATE INDEX "Membresia_organizacionId_estado_idx" ON "Membresia"("organizacionId", "estado");

-- CreateIndex
CREATE INDEX "Membresia_usuarioId_idx" ON "Membresia"("usuarioId");

-- CreateIndex
CREATE INDEX "SolicitudCambio_organizacionId_estado_idx" ON "SolicitudCambio"("organizacionId", "estado");

-- CreateIndex
CREATE INDEX "UsuarioRol_organizacionId_idx" ON "UsuarioRol"("organizacionId");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioRol_usuarioId_rolId_organizacionId_key" ON "UsuarioRol"("usuarioId", "rolId", "organizacionId") NULLS NOT DISTINCT;

-- AddForeignKey
ALTER TABLE "UsuarioRol" ADD CONSTRAINT "UsuarioRol_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organizacion" ADD CONSTRAINT "Organizacion_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "Archivo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AfiliacionOrganizacion" ADD CONSTRAINT "AfiliacionOrganizacion_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AfiliacionOrganizacion" ADD CONSTRAINT "AfiliacionOrganizacion_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membresia" ADD CONSTRAINT "Membresia_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membresia" ADD CONSTRAINT "Membresia_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membresia" ADD CONSTRAINT "Membresia_solicitadaPorId_fkey" FOREIGN KEY ("solicitadaPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membresia" ADD CONSTRAINT "Membresia_resueltaPorId_fkey" FOREIGN KEY ("resueltaPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudCambio" ADD CONSTRAINT "SolicitudCambio_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudCambio" ADD CONSTRAINT "SolicitudCambio_solicitadaPorId_fkey" FOREIGN KEY ("solicitadaPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudCambio" ADD CONSTRAINT "SolicitudCambio_resueltaPorId_fkey" FOREIGN KEY ("resueltaPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ---------------------------------------------------------------------------
-- Reglas adicionales (escritas a mano)
-- ---------------------------------------------------------------------------

-- Un profesional tiene a lo más una membresía abierta (solicitada o activa) por organización.
CREATE UNIQUE INDEX "Membresia_abierta_key" ON "Membresia"("usuarioId", "organizacionId")
  WHERE "estado" IN ('SOLICITADA', 'ACTIVA');

-- Una membresía activa tiene fecha de alta; una baja, fecha de baja.
ALTER TABLE "Membresia" ADD CONSTRAINT "Membresia_fechas" CHECK (
  ("estado" <> 'ACTIVA' OR "desde" IS NOT NULL)
  AND ("estado" <> 'BAJA' OR "hasta" IS NOT NULL)
  AND ("hasta" IS NULL OR "desde" IS NULL OR "hasta" >= "desde")
);

-- Un solo periodo de afiliación vigente por organización.
CREATE UNIQUE INDEX "AfiliacionOrganizacion_vigente_key" ON "AfiliacionOrganizacion"("organizacionId") WHERE "hasta" IS NULL;

-- Una sola propuesta de cambio pendiente por organización.
CREATE UNIQUE INDEX "SolicitudCambio_pendiente_key" ON "SolicitudCambio"("organizacionId") WHERE "estado" = 'PENDIENTE';

-- No hay dos organizaciones del mismo tipo con el mismo nombre (sin distinguir mayúsculas).
CREATE UNIQUE INDEX "Organizacion_tipo_nombre_key" ON "Organizacion"("tipo", lower("nombre"));

-- Búsqueda por nombre tolerante a errores de captura.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX "Organizacion_nombre_trgm_idx" ON "Organizacion" USING GIN (lower("nombre") gin_trgm_ops);
