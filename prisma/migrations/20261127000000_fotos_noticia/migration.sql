-- CreateTable
CREATE TABLE "FotoNoticia" (
    "id" UUID NOT NULL,
    "noticiaId" UUID NOT NULL,
    "archivoId" UUID NOT NULL,
    "pie" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FotoNoticia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FotoNoticia_archivoId_key" ON "FotoNoticia"("archivoId");

-- CreateIndex
CREATE INDEX "FotoNoticia_noticiaId_orden_idx" ON "FotoNoticia"("noticiaId", "orden");

-- AddForeignKey
ALTER TABLE "FotoNoticia" ADD CONSTRAINT "FotoNoticia_noticiaId_fkey" FOREIGN KEY ("noticiaId") REFERENCES "Noticia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoNoticia" ADD CONSTRAINT "FotoNoticia_archivoId_fkey" FOREIGN KEY ("archivoId") REFERENCES "Archivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
