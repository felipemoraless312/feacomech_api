-- CreateEnum
CREATE TYPE "EstadoGanadorRifa" AS ENUM ('PENDIENTE', 'ENTREGADO', 'ANULADO');

-- CreateTable
CREATE TABLE "GanadorRifa" (
    "id" UUID NOT NULL,
    "eventoSlug" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "numero" INTEGER NOT NULL,
    "registroId" UUID NOT NULL,
    "premio" TEXT,
    "estado" "EstadoGanadorRifa" NOT NULL DEFAULT 'PENDIENTE',
    "sorteadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entregadoEn" TIMESTAMP(3),

    CONSTRAINT "GanadorRifa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GanadorRifa_eventoSlug_fecha_registroId_key" ON "GanadorRifa"("eventoSlug", "fecha", "registroId");

-- CreateIndex
CREATE UNIQUE INDEX "GanadorRifa_eventoSlug_fecha_numero_key" ON "GanadorRifa"("eventoSlug", "fecha", "numero");

-- AddForeignKey
ALTER TABLE "GanadorRifa" ADD CONSTRAINT "GanadorRifa_registroId_fkey" FOREIGN KEY ("registroId") REFERENCES "RegistroAsistente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
