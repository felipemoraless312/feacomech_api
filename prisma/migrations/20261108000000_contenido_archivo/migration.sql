-- CreateTable
CREATE TABLE "ContenidoArchivo" (
    "ruta" TEXT NOT NULL,
    "datos" BYTEA NOT NULL,

    CONSTRAINT "ContenidoArchivo_pkey" PRIMARY KEY ("ruta")
);
