-- CreateEnum
CREATE TYPE "EstadoPublicacionMuro" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateTable
CREATE TABLE "PublicacionMuro" (
    "id" UUID NOT NULL,
    "eventoSlug" TEXT NOT NULL,
    "autor" TEXT,
    "mensaje" TEXT,
    "estado" "EstadoPublicacionMuro" NOT NULL DEFAULT 'PENDIENTE',
    "destacada" BOOLEAN NOT NULL DEFAULT false,
    "enRedes" BOOLEAN NOT NULL DEFAULT false,
    "meGusta" INTEGER NOT NULL DEFAULT 0,
    "huella" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revisadoEn" TIMESTAMP(3),
    "revisadoPorId" UUID,

    CONSTRAINT "PublicacionMuro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FotoMuro" (
    "id" UUID NOT NULL,
    "publicacionId" UUID NOT NULL,
    "ruta" TEXT NOT NULL,
    "rutaMiniatura" TEXT NOT NULL,
    "ancho" INTEGER NOT NULL,
    "alto" INTEGER NOT NULL,
    "tamano" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FotoMuro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComentarioMuro" (
    "id" UUID NOT NULL,
    "publicacionId" UUID NOT NULL,
    "autor" TEXT,
    "texto" TEXT NOT NULL,
    "oculto" BOOLEAN NOT NULL DEFAULT false,
    "reportes" INTEGER NOT NULL DEFAULT 0,
    "huella" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComentarioMuro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PublicacionMuro_eventoSlug_estado_id_idx" ON "PublicacionMuro"("eventoSlug", "estado", "id");

-- CreateIndex
CREATE UNIQUE INDEX "FotoMuro_ruta_key" ON "FotoMuro"("ruta");

-- CreateIndex
CREATE UNIQUE INDEX "FotoMuro_rutaMiniatura_key" ON "FotoMuro"("rutaMiniatura");

-- CreateIndex
CREATE INDEX "FotoMuro_publicacionId_idx" ON "FotoMuro"("publicacionId");

-- CreateIndex
CREATE INDEX "ComentarioMuro_publicacionId_id_idx" ON "ComentarioMuro"("publicacionId", "id");

-- AddForeignKey
ALTER TABLE "FotoMuro" ADD CONSTRAINT "FotoMuro_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "PublicacionMuro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioMuro" ADD CONSTRAINT "ComentarioMuro_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "PublicacionMuro"("id") ON DELETE CASCADE ON UPDATE CASCADE;
