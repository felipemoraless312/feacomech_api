import { hash, verify } from '@node-rs/argon2'

// Argon2id (el algoritmo por defecto de @node-rs/argon2) con parámetros OWASP 2024+.
const OPCIONES = { memoryCost: 19_456, timeCost: 2, parallelism: 1 }

export function hashContrasena(contrasena: string): Promise<string> {
  return hash(contrasena, OPCIONES)
}

export async function verificarContrasena(hashGuardado: string, contrasena: string): Promise<boolean> {
  try {
    return await verify(hashGuardado, contrasena)
  }
  catch {
    return false
  }
}

// Hash de una contraseña aleatoria: se verifica contra él cuando el usuario no existe,
// para que la respuesta tarde lo mismo y no revele qué usuarios existen.
let hashSenuelo: Promise<string> | undefined
export function obtenerHashSenuelo(): Promise<string> {
  return (hashSenuelo ??= hashContrasena(crypto.randomUUID()))
}

// Sin caracteres ambiguos (0/O, 1/l/I) para dictarla en ventanilla.
const LETRAS = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
const DIGITOS = '23456789'

/** Contraseña temporal legible, p. ej. "kT7m-Qx4p-Hz9w"; cumple la política. */
export function generarContrasenaTemporal(): string {
  const azar = (alfabeto: string) => alfabeto.charAt(crypto.getRandomValues(new Uint32Array(1))[0]! % alfabeto.length)
  const grupo = () => azar(LETRAS) + azar(LETRAS) + azar(DIGITOS) + azar(LETRAS)
  return [grupo(), grupo(), grupo()].join('-')
}
