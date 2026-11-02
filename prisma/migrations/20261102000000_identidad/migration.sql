
-- CreateEnum
CREATE TYPE "EstadoValidacion" AS ENUM ('PENDIENTE', 'VALIDADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "TipoTokenAcceso" AS ENUM ('RECUPERACION', 'INVITACION');

-- CreateEnum
CREATE TYPE "VisibilidadArchivo" AS ENUM ('PUBLICO', 'AUTENTICADO', 'RESTRINGIDO');

-- CreateTable
CREATE TABLE "Sesion" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimaActividad" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "userAgent" TEXT,
    "cerradaEn" TIMESTAMP(3),
    "motivoCierre" TEXT,

    CONSTRAINT "Sesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenAcceso" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "tipo" "TipoTokenAcceso" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "usadoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,

    CONSTRAINT "TokenAcceso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "cuerpo" TEXT,
    "enlace" TEXT,
    "leidaEn" TIMESTAMP(3),
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Especialidad" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "padreId" UUID,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Especialidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilProfesional" (
    "usuarioId" UUID NOT NULL,
    "cedulaProfesional" TEXT,
    "especialidadId" UUID,
    "subespecialidadId" UUID,
    "cedulaEspecialidad" TEXT,
    "institucionTrabajo" TEXT,
    "mostrarInstitucion" BOOLEAN NOT NULL DEFAULT false,
    "cargoInstitucional" TEXT,
    "fotoId" UUID,
    "publicarDirectorio" BOOLEAN NOT NULL DEFAULT false,
    "consentimientoEn" TIMESTAMP(3),
    "estadoValidacion" "EstadoValidacion" NOT NULL DEFAULT 'PENDIENTE',
    "validadoPorId" UUID,
    "validadoEn" TIMESTAMP(3),
    "motivoRechazo" TEXT,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerfilProfesional_pkey" PRIMARY KEY ("usuarioId")
);

-- CreateTable
CREATE TABLE "Archivo" (
    "id" UUID NOT NULL,
    "nombreOriginal" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "ruta" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "visibilidad" "VisibilidadArchivo" NOT NULL DEFAULT 'AUTENTICADO',
    "subidoPorId" UUID,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Archivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sesion_usuarioId_cerradaEn_idx" ON "Sesion"("usuarioId", "cerradaEn");

-- CreateIndex
CREATE UNIQUE INDEX "TokenAcceso_tokenHash_key" ON "TokenAcceso"("tokenHash");

-- CreateIndex
CREATE INDEX "TokenAcceso_usuarioId_creadoEn_idx" ON "TokenAcceso"("usuarioId", "creadoEn");

-- CreateIndex
CREATE INDEX "Notificacion_usuarioId_leidaEn_creadaEn_idx" ON "Notificacion"("usuarioId", "leidaEn", "creadaEn");

-- CreateIndex
CREATE UNIQUE INDEX "Especialidad_padreId_nombre_key" ON "Especialidad"("padreId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilProfesional_fotoId_key" ON "PerfilProfesional"("fotoId");

-- CreateIndex
CREATE INDEX "PerfilProfesional_especialidadId_idx" ON "PerfilProfesional"("especialidadId");

-- CreateIndex
CREATE INDEX "PerfilProfesional_estadoValidacion_idx" ON "PerfilProfesional"("estadoValidacion");

-- CreateIndex
CREATE UNIQUE INDEX "Archivo_ruta_key" ON "Archivo"("ruta");

-- AddForeignKey
ALTER TABLE "Sesion" ADD CONSTRAINT "Sesion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenAcceso" ADD CONSTRAINT "TokenAcceso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Especialidad" ADD CONSTRAINT "Especialidad_padreId_fkey" FOREIGN KEY ("padreId") REFERENCES "Especialidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilProfesional" ADD CONSTRAINT "PerfilProfesional_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilProfesional" ADD CONSTRAINT "PerfilProfesional_especialidadId_fkey" FOREIGN KEY ("especialidadId") REFERENCES "Especialidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilProfesional" ADD CONSTRAINT "PerfilProfesional_subespecialidadId_fkey" FOREIGN KEY ("subespecialidadId") REFERENCES "Especialidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilProfesional" ADD CONSTRAINT "PerfilProfesional_fotoId_fkey" FOREIGN KEY ("fotoId") REFERENCES "Archivo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilProfesional" ADD CONSTRAINT "PerfilProfesional_validadoPorId_fkey" FOREIGN KEY ("validadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Archivo" ADD CONSTRAINT "Archivo_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ---------------------------------------------------------------------------
-- Reglas adicionales (escritas a mano)
-- ---------------------------------------------------------------------------

-- Dos especialidades principales (padreId NULL) no pueden llamarse igual.
DROP INDEX "Especialidad_padreId_nombre_key";
CREATE UNIQUE INDEX "Especialidad_padreId_nombre_key" ON "Especialidad"("padreId", lower("nombre")) NULLS NOT DISTINCT;

-- Una especialidad no puede ser su propia subespecialidad.
ALTER TABLE "Especialidad" ADD CONSTRAINT "Especialidad_padre_distinto" CHECK ("padreId" IS NULL OR "padreId" <> "id");

-- Consentimiento del directorio: si se publica, queda la fecha en que se otorgó.
ALTER TABLE "PerfilProfesional" ADD CONSTRAINT "PerfilProfesional_consentimiento"
  CHECK (NOT "publicarDirectorio" OR "consentimientoEn" IS NOT NULL);

-- Sesiones vigentes por usuario (consulta frecuente al validar cada petición).
CREATE INDEX "Sesion_abiertas_idx" ON "Sesion"("usuarioId") WHERE "cerradaEn" IS NULL;
