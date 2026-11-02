-- CreateEnum
CREATE TYPE "NivelAcceso" AS ENUM ('PUBLICO', 'AFILIADOS', 'ORGANIZACION', 'RESTRINGIDO');

-- CreateTable
CREATE TABLE "CategoriaDocumento" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CategoriaDocumento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoriaId" UUID NOT NULL,
    "archivoId" UUID NOT NULL,
    "nivelAcceso" "NivelAcceso" NOT NULL,
    "organizacionId" UUID,
    "eventoId" UUID,
    "fechaDocumento" DATE,
    "responsable" TEXT,
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    "descargas" INTEGER NOT NULL DEFAULT 0,
    "subidoPorId" UUID,
    "publicadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaDocumento_nombre_key" ON "CategoriaDocumento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaDocumento_slug_key" ON "CategoriaDocumento"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Documento_archivoId_key" ON "Documento"("archivoId");

-- CreateIndex
CREATE INDEX "Documento_categoriaId_vigente_idx" ON "Documento"("categoriaId", "vigente");

-- CreateIndex
CREATE INDEX "Documento_nivelAcceso_vigente_idx" ON "Documento"("nivelAcceso", "vigente");

-- CreateIndex
CREATE INDEX "Documento_organizacionId_idx" ON "Documento"("organizacionId");

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_archivoId_fkey" FOREIGN KEY ("archivoId") REFERENCES "Archivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Un documento de nivel ORGANIZACION pertenece a una organización.
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_nivel_organizacion" CHECK ("nivelAcceso" <> 'ORGANIZACION' OR "organizacionId" IS NOT NULL);

-- Búsqueda por título y descripción.
CREATE INDEX "Documento_texto_trgm_idx" ON "Documento" USING GIN (lower("titulo" || ' ' || coalesce("descripcion", '')) gin_trgm_ops);
