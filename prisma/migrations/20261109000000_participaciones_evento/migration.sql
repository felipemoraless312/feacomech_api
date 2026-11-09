-- CreateEnum
CREATE TYPE "TipoParticipacion" AS ENUM ('ASISTENTE', 'PONENTE', 'TALLER', 'CARTEL', 'COORDINADOR');

-- CreateTable
CREATE TABLE "ParticipacionEvento" (
    "id" UUID NOT NULL,
    "eventoSlug" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" "TipoParticipacion" NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT,
    "detalle" TEXT,
    "horas" INTEGER,
    "emitidaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revocadaEn" TIMESTAMP(3),
    "motivoRevocacion" TEXT,

    CONSTRAINT "ParticipacionEvento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParticipacionEvento_folio_key" ON "ParticipacionEvento"("folio");
CREATE UNIQUE INDEX "ParticipacionEvento_codigo_key" ON "ParticipacionEvento"("codigo");
CREATE INDEX "ParticipacionEvento_eventoSlug_correo_idx" ON "ParticipacionEvento"("eventoSlug", "correo");
