-- CreateEnum
CREATE TYPE "CategoriaAsistente" AS ENUM ('COLEGIADO', 'NO_COLEGIADO', 'ESTUDIANTE', 'OTRO');

-- CreateEnum
CREATE TYPE "OrigenRegistro" AS ENUM ('AUTOREGISTRO', 'MESA');

-- CreateTable
CREATE TABLE "RegistroAsistente" (
    "id" UUID NOT NULL,
    "eventoSlug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "telefono" TEXT,
    "categoria" "CategoriaAsistente" NOT NULL,
    "procedencia" TEXT,
    "codigo" TEXT NOT NULL,
    "origen" "OrigenRegistro" NOT NULL DEFAULT 'AUTOREGISTRO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroAsistente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngresoAsistente" (
    "id" UUID NOT NULL,
    "registroId" UUID NOT NULL,
    "fecha" DATE NOT NULL,
    "registradoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origen" "OrigenRegistro" NOT NULL DEFAULT 'AUTOREGISTRO',

    CONSTRAINT "IngresoAsistente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistroAsistente_codigo_key" ON "RegistroAsistente"("codigo");

-- CreateIndex
CREATE INDEX "RegistroAsistente_eventoSlug_creadoEn_idx" ON "RegistroAsistente"("eventoSlug", "creadoEn");

-- CreateIndex
CREATE UNIQUE INDEX "RegistroAsistente_eventoSlug_correo_key" ON "RegistroAsistente"("eventoSlug", "correo");

-- CreateIndex
CREATE INDEX "IngresoAsistente_fecha_idx" ON "IngresoAsistente"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "IngresoAsistente_registroId_fecha_key" ON "IngresoAsistente"("registroId", "fecha");

-- CreateIndex

-- AddForeignKey
ALTER TABLE "IngresoAsistente" ADD CONSTRAINT "IngresoAsistente_registroId_fkey" FOREIGN KEY ("registroId") REFERENCES "RegistroAsistente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

