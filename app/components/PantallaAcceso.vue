<!-- Marco para inicio de sesión y cambio de contraseña: en pantallas grandes, panel morado
     institucional con la foto de la Federación a la izquierda; en el celular, fondo morado con la
     tarjeta al centro. -->
<template>
  <div class="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
    <aside class="relative isolate hidden overflow-hidden bg-gradient-to-br from-marca-800 to-marca-950 lg:block">
      <img src="/img/jornadas-2025-1280.webp" alt="" aria-hidden="true" class="absolute inset-0 -z-20 size-full object-cover opacity-35">
      <div class="absolute inset-0 -z-10 bg-gradient-to-t from-marca-950 via-marca-900/80 to-marca-800/50" />
      <MarcaRed class="girar-lento pointer-events-none absolute -bottom-48 -left-40 -z-10 size-[40rem] text-white/10" />
      <div class="flex h-full flex-col justify-between p-12 text-white">
        <NuxtLink to="/" aria-label="Ir al portal público" class="w-fit">
          <MarcaLogo grande claro class="!text-white" />
        </NuxtLink>
        <div class="entrada max-w-md">
          <p class="text-sm font-semibold uppercase tracking-[0.16em] text-marca-200">
            Plataforma institucional
          </p>
          <p class="mt-3 font-display text-4xl font-semibold leading-tight tracking-[-0.015em]">
            Federación de Asociaciones y Colegios Médicos del Estado de Chiapas
          </p>
          <p class="mt-4 text-white/75">
            Por la dignificación y unión profesional.
          </p>
        </div>
      </div>
    </aside>

    <div class="relative isolate flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-marca-700 to-marca-950 px-4 py-12 lg:bg-none lg:bg-muted">
      <MarcaRed class="pointer-events-none absolute -right-32 -top-32 -z-10 size-96 text-white/10 lg:hidden" />
      <div class="entrada w-full max-w-[400px]">
        <NuxtLink to="/" class="mb-8 flex justify-center lg:hidden" aria-label="Ir al portal público">
          <MarcaLogo claro class="!text-white" />
        </NuxtLink>
        <div class="rounded-xl bg-default p-8 shadow-flotante sm:p-10">
          <slot />
        </div>
        <p class="mt-8 text-center text-xs text-white/70 lg:text-dimmed">
          FEACOMECH · Chiapas
        </p>
      </div>
    </div>
  </div>
</template>
