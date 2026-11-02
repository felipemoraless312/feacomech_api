-- CreateEnum
CREATE TYPE "TipoOrgano" AS ENUM ('MESA_DIRECTIVA', 'CONSEJO_CONSULTIVO', 'COMISION', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoNombramiento" AS ENUM ('VIGENTE', 'CONCLUIDO', 'REVOCADO');

-- CreateEnum
CREATE TYPE "TipoNoticia" AS ENUM ('COMUNICADO', 'NOTICIA', 'ACTIVIDAD', 'PUBLICACION');

-- CreateEnum
CREATE TYPE "EstadoNoticia" AS ENUM ('BORRADOR', 'REVISION', 'PUBLICADA', 'RETIRADA');

-- CreateEnum
CREATE TYPE "TipoVinculo" AS ENUM ('INSTITUCION', 'CONVENIO', 'ORGANISMO');

-- CreateEnum
CREATE TYPE "EstadoMensaje" AS ENUM ('NUEVO', 'ATENDIDO', 'ARCHIVADO');

-- CreateTable
CREATE TABLE "Organo" (
    "id" UUID NOT NULL,
    "organizacionId" UUID,
    "tipo" "TipoOrgano" NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cargo" (
    "id" UUID NOT NULL,
    "organoId" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "superiorId" UUID,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Periodo" (
    "id" UUID NOT NULL,
    "organizacionId" UUID,
    "nombre" TEXT NOT NULL,
    "inicio" DATE NOT NULL,
    "fin" DATE,
    "descripcion" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Periodo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nombramiento" (
    "id" UUID NOT NULL,
    "cargoId" UUID NOT NULL,
    "periodoId" UUID,
    "usuarioId" UUID,
    "nombrePersona" TEXT,
    "organizacionProcedenciaId" UUID,
    "fotoId" UUID,
    "descripcion" TEXT,
    "inicio" DATE NOT NULL,
    "fin" DATE,
    "estado" "EstadoNombramiento" NOT NULL DEFAULT 'VIGENTE',
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nombramiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Noticia" (
    "id" UUID NOT NULL,
    "tipo" "TipoNoticia" NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "resumen" TEXT,
    "contenido" TEXT NOT NULL,
    "portadaId" UUID,
    "estado" "EstadoNoticia" NOT NULL DEFAULT 'BORRADOR',
    "destacada" BOOLEAN NOT NULL DEFAULT false,
    "publicadaEn" TIMESTAMP(3),
    "autorId" UUID,
    "organizacionId" UUID,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Noticia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vinculo" (
    "id" UUID NOT NULL,
    "tipo" "TipoVinculo" NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "sitioWeb" TEXT,
    "logoId" UUID,
    "fechaFirma" DATE,
    "vigenciaHasta" DATE,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vinculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MensajeContacto" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "asunto" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "estado" "EstadoMensaje" NOT NULL DEFAULT 'NUEVO',
    "ip" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atendidoPorId" UUID,
    "atendidoEn" TIMESTAMP(3),
    "nota" TEXT,

    CONSTRAINT "MensajeContacto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Organo_organizacionId_orden_idx" ON "Organo"("organizacionId", "orden");

-- CreateIndex
CREATE INDEX "Cargo_organoId_orden_idx" ON "Cargo"("organoId", "orden");

-- CreateIndex
CREATE INDEX "Periodo_organizacionId_inicio_idx" ON "Periodo"("organizacionId", "inicio");

-- CreateIndex
CREATE UNIQUE INDEX "Nombramiento_fotoId_key" ON "Nombramiento"("fotoId");

-- CreateIndex
CREATE INDEX "Nombramiento_cargoId_estado_idx" ON "Nombramiento"("cargoId", "estado");

-- CreateIndex
CREATE INDEX "Nombramiento_periodoId_idx" ON "Nombramiento"("periodoId");

-- CreateIndex
CREATE INDEX "Nombramiento_usuarioId_idx" ON "Nombramiento"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Noticia_slug_key" ON "Noticia"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Noticia_portadaId_key" ON "Noticia"("portadaId");

-- CreateIndex
CREATE INDEX "Noticia_estado_publicadaEn_idx" ON "Noticia"("estado", "publicadaEn");

-- CreateIndex
CREATE INDEX "Noticia_tipo_estado_idx" ON "Noticia"("tipo", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "Vinculo_logoId_key" ON "Vinculo"("logoId");

-- CreateIndex
CREATE INDEX "Vinculo_tipo_publicado_orden_idx" ON "Vinculo"("tipo", "publicado", "orden");

-- CreateIndex
CREATE INDEX "MensajeContacto_estado_creadoEn_idx" ON "MensajeContacto"("estado", "creadoEn");

-- AddForeignKey
ALTER TABLE "Organo" ADD CONSTRAINT "Organo_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cargo" ADD CONSTRAINT "Cargo_organoId_fkey" FOREIGN KEY ("organoId") REFERENCES "Organo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cargo" ADD CONSTRAINT "Cargo_superiorId_fkey" FOREIGN KEY ("superiorId") REFERENCES "Cargo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Periodo" ADD CONSTRAINT "Periodo_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nombramiento" ADD CONSTRAINT "Nombramiento_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "Cargo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nombramiento" ADD CONSTRAINT "Nombramiento_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "Periodo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nombramiento" ADD CONSTRAINT "Nombramiento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nombramiento" ADD CONSTRAINT "Nombramiento_organizacionProcedenciaId_fkey" FOREIGN KEY ("organizacionProcedenciaId") REFERENCES "Organizacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nombramiento" ADD CONSTRAINT "Nombramiento_fotoId_fkey" FOREIGN KEY ("fotoId") REFERENCES "Archivo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Noticia" ADD CONSTRAINT "Noticia_portadaId_fkey" FOREIGN KEY ("portadaId") REFERENCES "Archivo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Noticia" ADD CONSTRAINT "Noticia_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Noticia" ADD CONSTRAINT "Noticia_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vinculo" ADD CONSTRAINT "Vinculo_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "Archivo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MensajeContacto" ADD CONSTRAINT "MensajeContacto_atendidoPorId_fkey" FOREIGN KEY ("atendidoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ---------------------------------------------------------------------------
-- Reglas adicionales (escritas a mano)
-- ---------------------------------------------------------------------------

-- Un nombramiento identifica a la persona por su cuenta o por su nombre.
ALTER TABLE "Nombramiento" ADD CONSTRAINT "Nombramiento_persona"
  CHECK ("usuarioId" IS NOT NULL OR btrim(coalesce("nombrePersona", '')) <> '');
ALTER TABLE "Nombramiento" ADD CONSTRAINT "Nombramiento_fechas" CHECK ("fin" IS NULL OR "fin" >= "inicio");
ALTER TABLE "Periodo" ADD CONSTRAINT "Periodo_fechas" CHECK ("fin" IS NULL OR "fin" >= "inicio");
ALTER TABLE "Cargo" ADD CONSTRAINT "Cargo_superior_distinto" CHECK ("superiorId" IS NULL OR "superiorId" <> "id");

-- Una noticia publicada tiene fecha de publicación.
ALTER TABLE "Noticia" ADD CONSTRAINT "Noticia_publicada" CHECK ("estado" <> 'PUBLICADA' OR "publicadaEn" IS NOT NULL);

-- Búsqueda de noticias por título.
CREATE INDEX "Noticia_titulo_trgm_idx" ON "Noticia" USING GIN (lower("titulo") gin_trgm_ops);
