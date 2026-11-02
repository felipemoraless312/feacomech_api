-- Reglas que Prisma no puede expresar en schema.prisma.

-- ---------------------------------------------------------------------------
-- Auditoria: sólo INSERT (ni UPDATE, ni DELETE, ni TRUNCATE)
-- ---------------------------------------------------------------------------
CREATE FUNCTION fea_solo_insercion() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Los registros de "%" no se pueden modificar ni borrar', TG_TABLE_NAME
    USING ERRCODE = 'insufficient_privilege';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Auditoria_inmutable"
  BEFORE UPDATE OR DELETE ON "Auditoria"
  FOR EACH ROW EXECUTE FUNCTION fea_solo_insercion();

CREATE TRIGGER "Auditoria_sin_truncate"
  BEFORE TRUNCATE ON "Auditoria"
  FOR EACH STATEMENT EXECUTE FUNCTION fea_solo_insercion();

-- ---------------------------------------------------------------------------
-- El correo es el nombre de inicio de sesión: siempre en minúsculas y sin espacios,
-- para que "Ana@Correo.com" y "ana@correo.com" no sean dos cuentas.
-- ---------------------------------------------------------------------------
ALTER TABLE "Usuario"
  ADD CONSTRAINT "Usuario_email_normalizado" CHECK ("email" = lower(btrim("email")) AND "email" <> '');

-- ---------------------------------------------------------------------------
-- Los roles del sistema (creados por el seed) no se borran; se pueden desactivar,
-- salvo el superadministrador.
-- ---------------------------------------------------------------------------
CREATE FUNCTION fea_rol_sistema() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD."sistema" THEN
    RAISE EXCEPTION 'El rol "%" es del sistema y no se puede borrar', OLD."clave"
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF TG_OP = 'UPDATE' AND OLD."clave" = 'SUPERADMIN'
     AND (NOT NEW."activo" OR NEW."clave" IS DISTINCT FROM OLD."clave") THEN
    RAISE EXCEPTION 'El rol de superadministrador no se puede desactivar ni renombrar'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Rol_sistema"
  BEFORE UPDATE OR DELETE ON "Rol"
  FOR EACH ROW EXECUTE FUNCTION fea_rol_sistema();
