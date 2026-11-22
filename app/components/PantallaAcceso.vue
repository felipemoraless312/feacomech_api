<!-- Marco institucional para inicio de sesión, recuperación y cambio de contraseña: fondo claro,
     escudo oficial al centro sobre el nombre de la Federación y la tarjeta del formulario debajo.
     Igual en celular y escritorio; sólo cambian los tamaños. -->
<template>
  <div class="relative isolate flex min-h-svh flex-col bg-marca-50/60 dark:bg-marca-950">
    <!-- Fondo: halo suave detrás del escudo y franja institucional arriba -->
    <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-1 bg-gradient-to-r from-marca-700 via-marca-500 to-acento-400" />
    <div aria-hidden="true" class="pointer-events-none absolute left-1/2 top-0 -z-10 h-[34rem] w-[54rem] max-w-[200vw] -translate-x-1/2 -translate-y-1/3 rounded-full bg-radial from-marca-200/70 via-marca-100/30 to-transparent blur-2xl dark:from-marca-800/50 dark:via-marca-900/20" />
    <MarcaRed aria-hidden="true" class="pointer-events-none absolute -bottom-40 -right-40 -z-10 size-[30rem] text-marca-300/20 dark:text-marca-700/20" />

    <main class="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-14">
      <div class="entrada w-full max-w-[420px]">
        <!-- Escudo y nombre -->
        <NuxtLink to="/" class="group mx-auto mb-8 flex w-fit flex-col items-center text-center" aria-label="Ir al portal público">
          <img src="/img/marca/escudo-512.png" alt="Escudo de la FEACOMECH" width="512" height="512" class="size-24 object-contain drop-shadow-[0_10px_18px_rgb(64_40_88/0.28)] transition-transform duration-500 group-hover:scale-[1.04] sm:size-28">
          <span class="mt-5 font-display text-2xl font-semibold tracking-[0.06em] text-marca-800 dark:text-marca-100">
            FEACOMECH
          </span>
          <span class="mt-1 max-w-xs text-sm leading-snug text-muted">
            Federación de Asociaciones y Colegios Médicos del Estado de Chiapas
          </span>
        </NuxtLink>

        <div class="rounded-2xl bg-default p-7 shadow-flotante ring-1 ring-default sm:p-9">
          <slot />
        </div>
      </div>
    </main>

    <footer class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 pb-6 text-xs text-dimmed">
      <NuxtLink to="/" class="inline-flex items-center gap-1 font-medium text-toned hover:text-primary">
        <UIcon name="i-lucide-arrow-left" class="size-3.5" />
        Volver al portal
      </NuxtLink>
      <span aria-hidden="true">·</span>
      <span>Por la dignificación y unión profesional</span>
    </footer>
  </div>
</template>
