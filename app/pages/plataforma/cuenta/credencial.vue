<!-- Credencial digital: tarjeta que se voltea (frente / QR), con inclinación y brillo
     holográfico que siguen al cursor. Se puede imprimir (ambas caras) o compartir el enlace
     de verificación. Si no está vigente, explica qué falta. -->
<template>
  <PanelPagina id="credencial" titulo="Credencial digital" tamano="md">
    <div v-if="!c" class="flex justify-center py-20">
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
    </div>

    <div v-else class="space-y-8">
      <!-- Tarjeta -->
      <div class="no-imprimir flex flex-col items-center gap-5">
        <div
          ref="escena"
          class="escena w-full max-w-[30rem] [perspective:1600px]"
          @pointermove="mover"
          @pointerleave="soltar"
        >
          <button
            type="button"
            class="tarjeta relative block aspect-[85.6/54] w-full cursor-pointer rounded-2xl text-left focus-visible:outline-3 focus-visible:outline-primary/40"
            :class="{ volteada }"
            :aria-label="volteada ? 'Ver el frente de la credencial' : 'Ver el código QR de la credencial'"
            @click="volteada = !volteada"
          >
            <div class="cara-3d absolute inset-0 shadow-flotante rounded-2xl">
              <CredencialCara :c="c" cara="frente" />
              <div class="holograma pointer-events-none absolute inset-0 rounded-2xl" aria-hidden="true" />
            </div>
            <div class="cara-3d reverso absolute inset-0 shadow-flotante rounded-2xl">
              <CredencialCara :c="c" cara="reverso" />
              <div class="holograma pointer-events-none absolute inset-0 rounded-2xl" aria-hidden="true" />
            </div>
          </button>
        </div>
        <p class="flex items-center gap-1.5 text-xs text-dimmed">
          <UIcon name="i-lucide-rotate-3d" class="size-4" /> Toque la credencial para voltearla
        </p>

        <div class="flex flex-wrap justify-center gap-2">
          <UButton :icon="volteada ? 'i-lucide-id-card' : 'i-lucide-qr-code'" :label="volteada ? 'Ver frente' : 'Ver código QR'" color="neutral" variant="outline" @click="volteada = !volteada" />
          <UButton icon="i-lucide-printer" label="Imprimir" color="neutral" variant="outline" @click="imprimir" />
          <UButton icon="i-lucide-link" label="Copiar enlace de verificación" @click="copiar" />
        </div>
      </div>

      <!-- Estado -->
      <UAlert
        v-if="c.vigente"
        class="no-imprimir"
        color="success"
        variant="subtle"
        icon="i-lucide-badge-check"
        title="Credencial vigente"
        description="Cualquier persona puede comprobarla escaneando el código QR del reverso."
      />
      <UAlert
        v-else
        class="no-imprimir"
        color="warning"
        variant="subtle"
        icon="i-lucide-info"
        title="Su credencial todavía no está vigente"
      >
        <template #description>
          <ul class="mt-1 list-disc space-y-1 ps-4">
            <li v-if="!c.validado">
              La Federación debe validar su perfil profesional
              <template v-if="c.estadoValidacion === 'RECHAZADO'">(tiene observaciones; revíselas en su perfil)</template>.
            </li>
            <li v-if="!c.membresias.length">
              Necesita una membresía activa en un colegio o asociación afiliada.
            </li>
          </ul>
          <div class="mt-3 flex flex-wrap gap-2">
            <UButton to="/plataforma/cuenta/perfil" label="Ir a mi perfil" size="sm" color="warning" variant="solid" />
          </div>
        </template>
      </UAlert>

      <!-- Membresías -->
      <GrupoDatos v-if="c.membresias.length" titulo="Afiliaciones vigentes" class="no-imprimir">
        <div v-for="m in c.membresias" :key="m.organizacion" class="flex items-center gap-3 px-5 py-3.5">
          <LogoOrganizacion :logo-id="m.logoId" :nombre="m.organizacion" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-highlighted">{{ m.organizacion }}</p>
            <p class="text-xs text-muted">
              <template v-if="m.numeroSocio">Socio {{ m.numeroSocio }} · </template>
              <template v-if="m.desde">desde {{ formatoFecha(m.desde) }}</template>
            </p>
          </div>
        </div>
      </GrupoDatos>

      <!-- Impresión: ambas caras a tamaño real (85.6 × 54 mm), lista para recortar -->
      <div class="solo-imprimir">
        <div class="impresa"><CredencialCara :c="c" cara="frente" /></div>
        <div class="impresa"><CredencialCara :c="c" cara="reverso" /></div>
      </div>
    </div>
  </PanelPagina>
</template>

<script setup lang="ts">
import { formatoFecha } from '#shared/texto'
import type { MiCredencialDto } from '~~/server/services/credencial'

definePageMeta({ layout: 'plataforma' })
useSeoMeta({ title: 'Credencial digital' })

const api = useApi()
const toast = useToast()

type Credencial = MiCredencialDto & { qr: string, urlVerificacion: string }
const { data: c } = await useAsyncData('mi-credencial', () => api<Credencial>('/api/cuenta/credencial'))

const volteada = ref(false)

// Inclinación y brillo: variables CSS por cuadro, sólo con ratón.
const escena = ref<HTMLElement>()
let cuadro = 0
function mover(e: PointerEvent) {
  if (e.pointerType !== 'mouse' || !escena.value) return
  const el = escena.value
  const r = el.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width
  const y = (e.clientY - r.top) / r.height
  cancelAnimationFrame(cuadro)
  cuadro = requestAnimationFrame(() => {
    el.style.setProperty('--rx', `${((0.5 - y) * 14).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${((x - 0.5) * 18).toFixed(2)}deg`)
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
    el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
    el.style.setProperty('--brillo', '1')
  })
}
function soltar() {
  const el = escena.value
  if (!el) return
  cancelAnimationFrame(cuadro)
  el.style.setProperty('--rx', '0deg')
  el.style.setProperty('--ry', '0deg')
  el.style.setProperty('--brillo', '0')
}
onBeforeUnmount(() => cancelAnimationFrame(cuadro))

function imprimir() {
  window.print()
}

async function copiar() {
  if (!c.value) return
  try {
    await navigator.clipboard.writeText(c.value.urlVerificacion)
    toast.add({ title: 'Enlace copiado', description: 'Compártalo para que comprueben su credencial.', color: 'success', icon: 'i-lucide-check' })
  }
  catch {
    toast.add({ title: 'No se pudo copiar', description: c.value.urlVerificacion, color: 'warning' })
  }
}
</script>

<style scoped>
.escena {
  --rx: 0deg;
  --ry: 0deg;
  --mx: 50%;
  --my: 50%;
  --brillo: 0;
  /* El texto de la tarjeta escala con su ancho */
  container-type: inline-size;
}
.tarjeta {
  font-size: 4.4cqw;
  transform-style: preserve-3d;
  transform: rotateX(var(--rx)) rotateY(var(--ry));
  transition: transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1);
  /* backwards: al terminar no retiene el transform, así la inclinación y el volteo siguen funcionando */
  animation: tarjeta-entrada 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}
.tarjeta.volteada {
  transform: rotateX(var(--rx)) rotateY(calc(180deg + var(--ry)));
}
.cara-3d {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.cara-3d.reverso {
  transform: rotateY(180deg);
}

/* Brillo holográfico: un arcoíris suave y un punto de luz que siguen al cursor */
.holograma {
  opacity: calc(0.25 + var(--brillo) * 0.55);
  transition: opacity 0.4s;
  mix-blend-mode: soft-light;
  background:
    radial-gradient(circle at var(--mx) var(--my), rgb(255 255 255 / 0.9), transparent 45%),
    linear-gradient(115deg, transparent 20%, rgb(192 169 218 / 0.7) 35%, rgb(250 230 212 / 0.8) 48%, rgb(157 124 194 / 0.6) 60%, transparent 75%);
  background-size: 100% 100%, 220% 220%;
  background-position: 0 0, var(--mx) var(--my);
}

@keyframes tarjeta-entrada {
  from { opacity: 0; transform: translateY(24px) rotateX(18deg) scale(0.94); }
}

.solo-imprimir { display: none; }

@media (prefers-reduced-motion: reduce) {
  .tarjeta { animation: none; transition: none; }
}

@media print {
  .no-imprimir { display: none !important; }
  .solo-imprimir {
    display: flex;
    flex-direction: column;
    gap: 8mm;
    align-items: center;
  }
  .impresa {
    width: 85.6mm;
    height: 54mm;
    font-size: 3.77mm;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>

<style>
/* Al imprimir la credencial sólo sale la tarjeta: se oculta todo lo que no la contiene y sus
   contenedores dejan de recortar (el panel de la plataforma tiene altura fija con scroll). */
@media print {
  body:has(.solo-imprimir) :not(:has(.solo-imprimir)):not(.solo-imprimir):not(.solo-imprimir *) {
    display: none !important;
  }
  body:has(.solo-imprimir) :has(.solo-imprimir) {
    position: static !important;
    overflow: visible !important;
    height: auto !important;
    min-height: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    background: none !important;
  }
}
</style>
