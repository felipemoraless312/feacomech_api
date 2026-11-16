<!-- Entrada del portal: cortina lavanda con el escudo, un anillo morado → cobre que se dibuja y
     las siglas que se componen; luego la cortina sube y descubre la portada.

     Cómo se sincroniza (para que nunca se vea la cortina vacía):
     1. Un script en <head> marca <html class="sin-intro"> si ya se vio en esta sesión (no se
        pinta) y, si no, la registra como vista.
     2. La cortina se pinta desde el HTML del servidor con todas sus animaciones EN PAUSA.
     3. Un script al final de <body> (corre en cuanto se lee el HTML, antes que Vue) espera a que
        el escudo y las tipografías estén listos —máximo 1.5 s— y añade <html class="intro-lista">:
        ahí arranca la secuencia completa.
     4. Vue la retira del DOM cuando termina la animación de salida (con un tope de seguridad).
     Sin JavaScript no se muestra (<noscript>), y con "reducir movimiento" tampoco. Un clic la salta. -->
<template>
  <div ref="raiz" class="intro" aria-hidden="true" @click="cerrar(true)" @animationend="alTerminar">
    <div class="intro-contenido">
      <div class="relative">
        <svg class="intro-anillo" viewBox="0 0 200 200" fill="none">
          <defs>
            <linearGradient id="intro-degradado" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="var(--color-marca-500)" />
              <stop offset="1" stop-color="var(--color-acento-400)" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="94" stroke="var(--color-marca-100)" stroke-width="2" />
          <circle class="intro-trazo" cx="100" cy="100" r="94" stroke="url(#intro-degradado)" stroke-width="3" stroke-linecap="round" />
        </svg>
        <img src="/img/marca/escudo-intro.webp" alt="" class="intro-escudo" width="240" height="269" fetchpriority="high" decoding="sync">
      </div>
      <p class="intro-siglas">
        FEACOMECH
      </p>
      <p class="intro-lema">
        Por la dignificación y unión profesional
      </p>
      <span class="intro-barra" />
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ fin: [] }>()

const MAX_ESPERA_MS = 1500

useHead({
  link: [{ key: 'fea-intro-escudo', rel: 'preload', as: 'image', href: '/img/marca/escudo-intro.webp', fetchpriority: 'high' }],
  noscript: [{ key: 'fea-intro-noscript', innerHTML: '<style>.intro{display:none!important}</style>' }],
  script: [
    {
      key: 'fea-intro',
      tagPosition: 'head',
      innerHTML: `try{if(sessionStorage.getItem('fea-intro'))document.documentElement.classList.add('sin-intro');else sessionStorage.setItem('fea-intro','1')}catch(e){}`,
    },
    {
      // Arranca la secuencia cuando el escudo y las tipografías están listos (o al tope de espera).
      key: 'fea-intro-lista',
      tagPosition: 'bodyClose',
      innerHTML: `(function(){var h=document.documentElement;if(h.classList.contains('sin-intro'))return;var listo=false;function ir(){if(!listo){listo=true;h.classList.add('intro-lista')}}setTimeout(ir,${MAX_ESPERA_MS});var esperas=[];var img=document.querySelector('.intro-escudo');if(img&&!img.complete)esperas.push(new Promise(function(r){img.addEventListener('load',r);img.addEventListener('error',r)}));if(document.fonts&&document.fonts.ready)esperas.push(document.fonts.ready);Promise.all(esperas).then(function(){requestAnimationFrame(ir)})})()`,
    },
  ],
})

const raiz = ref<HTMLElement>()
let tope: ReturnType<typeof setTimeout> | undefined

function cerrar(saltada = false) {
  clearTimeout(tope)
  const html = document.documentElement
  html.classList.add('intro-lista')
  // Al saltarla, la portada no espera a la cortina.
  if (saltada) html.classList.add('intro-saltada')
  emit('fin')
}

// La animación de salida es la de la propia cortina (las de sus hijos también burbujean).
function alTerminar(e: AnimationEvent) {
  if (e.target === raiz.value && e.animationName.includes('intro-salida')) cerrar()
}

onMounted(() => {
  const html = document.documentElement
  if (html.classList.contains('sin-intro') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return cerrar(true)
  // Tope de seguridad por si el navegador no emite animationend (pestaña en segundo plano, etc.).
  tope = setTimeout(() => cerrar(true), MAX_ESPERA_MS + 4000)
})
onBeforeUnmount(() => clearTimeout(tope))
</script>

<style scoped>
.intro {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  overflow: hidden;
  cursor: pointer;
  clip-path: inset(0 0 0 0);
  /* Fondo sin desenfoques (ligero en teléfonos): halos radiales lavanda y durazno */
  background:
    radial-gradient(ellipse 70% 55% at 15% 10%, rgb(220 207 235 / 0.9), transparent 70%),
    radial-gradient(ellipse 65% 50% at 90% 95%, rgb(250 230 212 / 0.9), transparent 70%),
    linear-gradient(160deg, var(--color-marca-50), #fff 55%, var(--color-acento-50));
}

.intro {
  animation: intro-salida 0.75s cubic-bezier(0.76, 0, 0.24, 1) 1.75s forwards;
}

.intro-contenido {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: intro-contenido-salida 0.6s cubic-bezier(0.76, 0, 0.24, 1) 1.7s forwards;
}

.intro-anillo {
  position: absolute;
  inset: -2.25rem;
  width: calc(100% + 4.5rem);
  height: calc(100% + 4.5rem);
  transform: rotate(-90deg);
}
.intro-trazo {
  stroke-dasharray: 591;
  stroke-dashoffset: 591;
  animation: intro-trazo 1.1s cubic-bezier(0.65, 0, 0.35, 1) 0.2s forwards;
}

.intro-escudo {
  position: relative;
  height: 7.5rem;
  width: auto;
  animation: intro-escudo 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.intro-siglas {
  margin-top: 3.25rem;
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: 800;
  letter-spacing: 0.14em;
  color: var(--color-marca-800);
  animation: intro-siglas 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) 0.55s both;
}

.intro-lema {
  margin-top: 0.5rem;
  padding-inline: 1rem;
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--color-acento-600);
  animation: intro-aparecer 0.6s ease-out 0.9s both;
}

.intro-barra {
  position: relative;
  margin-top: 1.5rem;
  height: 3px;
  width: 9rem;
  overflow: hidden;
  border-radius: 9999px;
  background: var(--color-marca-100);
  animation: intro-aparecer 0.4s ease-out 0.9s both;
}
.intro-barra::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--color-marca-500), var(--color-acento-400));
  transform: scaleX(0);
  transform-origin: left;
  animation: intro-barra 0.8s cubic-bezier(0.65, 0, 0.35, 1) 0.95s forwards;
}

/* Sólo opacidad y transform (sin filtros): fluido también en teléfonos */
@keyframes intro-escudo {
  from { opacity: 0; transform: scale(0.6); }
  to { opacity: 1; transform: none; }
}
@keyframes intro-trazo {
  to { stroke-dashoffset: 0; }
}
@keyframes intro-siglas {
  from { opacity: 0; transform: translateY(10px) scaleX(1.25); }
  to { opacity: 1; transform: none; }
}
@keyframes intro-aparecer {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}
@keyframes intro-barra {
  to { transform: scaleX(1); }
}
@keyframes intro-contenido-salida {
  to { opacity: 0; transform: translateY(-40px) scale(0.96); }
}
/* La cortina sube y deja ver la portada */
@keyframes intro-salida {
  to { clip-path: inset(0 0 100% 0); visibility: hidden; pointer-events: none; }
}

@media (prefers-reduced-motion: reduce) {
  .intro { display: none; }
}
</style>

<style>
/* Reglas que dependen de clases en <html>. Van sin "scoped" a propósito: en un bloque scoped,
   Vue compila `:global(html.x) .intro` como sólo `html.x` y la regla acaba aplicándose a toda
   la página (p. ej. `html.sin-intro { display: none }` la dejaba en blanco). */
html.sin-intro .intro { display: none; }

/* Todo en pausa hasta que <html> tenga .intro-lista (ver el script del final de <body>) */
.intro,
.intro * {
  animation-play-state: paused !important;
}
html.intro-lista .intro,
html.intro-lista .intro * {
  animation-play-state: running !important;
}

.dark .intro {
  background: linear-gradient(160deg, var(--color-marca-950), #0f0c14 55%, var(--color-marca-900));
}
.dark .intro-siglas { color: #fff; }
</style>
