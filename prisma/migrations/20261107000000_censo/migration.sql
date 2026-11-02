-- AlterTable
ALTER TABLE "PerfilProfesional" ADD COLUMN     "municipioId" UUID;

-- CreateTable
CREATE TABLE "Region" (
    "id" UUID NOT NULL,
    "numero" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Municipio" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "regionId" UUID NOT NULL,

    CONSTRAINT "Municipio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Region_numero_key" ON "Region"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Region_nombre_key" ON "Region"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Municipio_nombre_key" ON "Municipio"("nombre");

-- CreateIndex
CREATE INDEX "Municipio_regionId_idx" ON "Municipio"("regionId");

-- AddForeignKey
ALTER TABLE "PerfilProfesional" ADD CONSTRAINT "PerfilProfesional_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Municipio" ADD CONSTRAINT "Municipio_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

