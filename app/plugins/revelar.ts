// Directiva v-revelar: el elemento aparece suavemente al entrar en pantalla.
//   <div v-revelar>…</div>        <div v-revelar="120">…</div>  (retraso en ms)
// En el servidor no hace nada: el contenido se entrega visible (buscadores, sin JavaScript).
// En el cliente sólo oculta lo que todavía está fuera de pantalla, así no parpadea lo que
// ya se ve. Con "reducir movimiento" no se aplica.
import type { Directive } from 'vue'

let observador: IntersectionObserver | undefined
let pendiente = false

function mostrar(el: Element) {
  el.classList.remove('revelar-oculto')
  el.classList.add('revelar-visible')
  observador?.unobserve(el)
}

// Red de seguridad: si el visitante baja muy rápido (o salta con un enlace del menú), el
// observador puede no ver el cruce; al desplazarse se muestra todo lo que ya pasó por pantalla.
function revisarAlDesplazar() {
  if (pendiente) return
  pendiente = true
  requestAnimationFrame(() => {
    pendiente = false
    for (const el of document.querySelectorAll('.revelar-oculto')) {
      if (el.getBoundingClientRect().top < window.innerHeight) mostrar(el)
    }
  })
}

function obtenerObservador() {
  window.addEventListener('scroll', revisarAlDesplazar, { passive: true })
  observador ??= new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (e.isIntersecting) mostrar(e.target)
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
  return observador
}

const revelar: Directive<HTMLElement, number | undefined> = {
  getSSRProps: () => ({}),
  mounted(el, { value }) {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return // ya visible
    if (value) el.style.setProperty('--retraso', `${value}ms`)
    el.classList.add('revelar-oculto')
    obtenerObservador().observe(el)
  },
  unmounted(el) {
    observador?.unobserve(el)
  },
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('revelar', revelar)
})
