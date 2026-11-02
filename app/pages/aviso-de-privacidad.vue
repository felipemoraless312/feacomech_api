<!-- Aviso de privacidad integral. ESTRUCTURA BASE: la debe revisar y aprobar el área jurídica
     de la Federación. Los datos entre corchetes los completa la Federación. -->
<template>
  <div>
    <SitioEncabezado antetitulo="Protección de datos" titulo="Aviso de privacidad" />

    <UContainer class="max-w-3xl space-y-10 py-14">
      <UAlert
        color="warning"
        variant="subtle"
        icon="i-lucide-file-pen-line"
        title="Borrador para revisión jurídica"
        description="Este aviso es una estructura base. Debe revisarlo y aprobarlo el área jurídica de la Federación antes de su publicación definitiva."
      />

      <section v-for="s in secciones" :key="s.titulo" class="space-y-3">
        <h2 class="font-display text-2xl font-semibold tracking-tight text-highlighted">
          {{ s.titulo }}
        </h2>
        <p v-for="(p, i) in s.parrafos" :key="i" class="text-[16px] leading-relaxed text-muted">
          {{ p }}
        </p>
        <ul v-if="s.lista" class="list-disc space-y-1.5 pl-6 text-[16px] text-muted">
          <li v-for="(l, i) in s.lista" :key="i">
            {{ l }}
          </li>
        </ul>
      </section>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Aviso de privacidad', robots: 'noindex' })

const { data: institucion } = await useInstitucion()
const nombre = computed(() => institucion.value?.nombre ?? 'la Federación')
const domicilio = computed(() => [institucion.value?.direccion, institucion.value?.ciudad].filter(Boolean).join(', ') || '[domicilio por confirmar]')
const correo = computed(() => institucion.value?.email || '[correo de privacidad por confirmar]')

const secciones = computed(() => [
  {
    titulo: 'Responsable',
    parrafos: [`${nombre.value} (en adelante, “la Federación”), con domicilio en ${domicilio.value}, es responsable del tratamiento de sus datos personales conforme a la legislación mexicana aplicable en materia de protección de datos personales en posesión de los particulares.`],
  },
  {
    titulo: 'Datos personales que tratamos',
    parrafos: ['Según el servicio que utilice, podemos tratar:'],
    lista: [
      'Identificación y contacto: nombre, correo electrónico y teléfono.',
      'Datos académicos y profesionales: cédula profesional y de especialidad, especialidad, subespecialidad, institución de trabajo y cargo institucional.',
      'Pertenencia a colegios y asociaciones, y su historial de afiliación.',
      'Fotografía, cuando usted decide agregarla a su perfil.',
      'Datos técnicos de uso de la plataforma: dirección IP, navegador y registro de accesos, con fines de seguridad.',
    ],
  },
  {
    titulo: 'Finalidades',
    parrafos: ['Finalidades necesarias para la relación con usted:'],
    lista: [
      'Administrar su cuenta, su afiliación y su pertenencia a colegios y asociaciones.',
      'Validar sus datos profesionales.',
      'Atender los mensajes que nos envía por el formulario de contacto.',
      'Comunicarle avisos institucionales y de seguridad de su cuenta.',
      'Mantener la seguridad de la plataforma y la bitácora de acciones.',
    ],
  },
  {
    titulo: 'Directorio público',
    parrafos: [
      'Su nombre, especialidad y fotografía sólo aparecen en el directorio público si usted lo autoriza expresamente desde su perfil. Puede retirar esa autorización en cualquier momento; el directorio público nunca muestra su correo, teléfono ni número de cédula.',
      'Los nombramientos de la mesa directiva y del consejo consultivo se publican una vez validados por la Federación.',
    ],
  },
  {
    titulo: 'Transferencias',
    parrafos: ['[Por definir por la Federación: si los datos se comparten con colegios o asociaciones afiliados, autoridades u otras instituciones, y con qué finalidad. Si no hay transferencias, indicarlo así.]'],
  },
  {
    titulo: 'Derechos ARCO y revocación del consentimiento',
    parrafos: [
      `Usted puede acceder a sus datos, rectificarlos, cancelarlos u oponerse a su tratamiento (derechos ARCO), así como revocar su consentimiento, enviando una solicitud a ${correo.value} con su nombre, el derecho que desea ejercer y un medio para responderle.`,
      'Muchos de sus datos puede consultarlos y corregirlos directamente en “Mi perfil” dentro de la plataforma.',
      '[Plazos y procedimiento de respuesta por definir por la Federación conforme a la ley.]',
    ],
  },
  {
    titulo: 'Cookies',
    parrafos: ['La plataforma usa únicamente una cookie técnica para mantener su sesión iniciada y una para recordar el tema claro u oscuro. No usamos cookies de publicidad ni de rastreo de terceros.'],
  },
  {
    titulo: 'Cambios a este aviso',
    parrafos: ['Cualquier cambio a este aviso se publicará en esta misma página.'],
  },
])
</script>
