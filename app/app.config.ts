// Ajustes globales de los componentes de Nuxt UI para el estilo minimalista
// (ver app/assets/css/main.css para colores, tipografía y sombras).
export default defineAppConfig({
  ui: {
    colors: {
      // Morado institucional del escudo de FEACOMECH (ver app/assets/css/main.css).
      primary: 'marca',
      neutral: 'gris',
    },

    button: {
      slots: { base: 'rounded-md font-semibold tracking-[0.01em] transition-[background-color,color]' },
    },
    badge: {
      slots: { base: 'rounded-sm font-semibold uppercase tracking-wide text-[11px]' },
    },
    input: {
      slots: { base: 'rounded-lg' },
      defaultVariants: { variant: 'soft', size: 'lg' },
    },
    textarea: {
      slots: { base: 'rounded-lg' },
      defaultVariants: { variant: 'soft', size: 'lg' },
    },
    select: {
      slots: { base: 'rounded-lg' },
      defaultVariants: { variant: 'soft', size: 'lg' },
    },
    selectMenu: {
      slots: { base: 'rounded-lg', content: 'rounded-xl shadow-flotante ring-0' },
      defaultVariants: { variant: 'soft', size: 'lg' },
    },
    formField: {
      slots: { label: 'text-[13px] font-medium text-muted', help: 'text-xs' },
    },
    card: {
      slots: { root: 'rounded-lg shadow-tarjeta' },
      variants: { variant: { outline: { root: 'bg-default ring-0 divide-y divide-default' } } },
    },
    pageCard: {
      slots: {
        root: 'rounded-lg transition-[box-shadow] duration-200',
        leadingIcon: 'size-7 stroke-[1.5] text-primary',
        title: 'text-[17px] font-semibold tracking-tight text-highlighted',
        description: 'text-[15px] leading-relaxed text-muted',
      },
      variants: {
        variant: {
          outline: { root: 'bg-default ring-0 shadow-tarjeta' },
          subtle: { root: 'bg-muted ring-0' },
        },
        to: { true: { root: 'hover:shadow-flotante' } },
      },
    },
    pageHero: {
      slots: {
        container: 'py-24 sm:py-32 lg:py-36 gap-12',
        title: 'text-5xl sm:text-7xl font-semibold tracking-[-0.03em] text-highlighted text-balance',
        description: 'text-xl sm:text-2xl/9 text-muted text-balance max-w-3xl mx-auto',
      },
    },
    pageSection: {
      slots: {
        title: 'text-4xl sm:text-5xl font-semibold tracking-[-0.025em] text-highlighted text-balance',
        description: 'text-lg sm:text-xl text-muted text-balance',
      },
    },
    pageHeader: {
      slots: {
        root: 'border-b-0 py-12 sm:py-16',
        title: 'text-4xl sm:text-5xl font-semibold tracking-[-0.025em]',
        description: 'text-lg sm:text-xl text-muted mt-3',
      },
    },
    header: {
      slots: { root: 'bg-default border-b border-default' },
    },
    footer: {
      slots: { root: 'border-t border-default bg-muted' },
    },
    modal: {
      slots: {
        overlay: 'bg-marca-950/40',
        content: 'rounded-lg shadow-flotante ring-0 divide-y-0',
        header: 'px-6 pt-6 pb-2 min-h-0',
        title: 'text-lg font-semibold tracking-tight',
        body: 'px-6 py-4',
        footer: 'px-6 pb-6 pt-2 justify-end',
      },
    },
    dropdownMenu: {
      slots: { content: 'rounded-xl shadow-flotante ring-0 bg-default/85 backdrop-blur-xl', item: 'rounded-md' },
    },
    tooltip: {
      slots: { content: 'rounded-md' },
    },
    table: {
      slots: {
        thead: 'border-b border-default',
        th: 'text-xs font-medium uppercase tracking-wide text-dimmed',
        tbody: 'divide-y divide-default [&>tr]:transition-colors [&>tr:hover]:bg-muted/60',
        td: 'text-sm py-3.5',
      },
    },
    dashboardSidebar: {
      slots: { root: 'bg-muted border-e border-default', body: 'gap-6' },
    },
    dashboardNavbar: {
      slots: { root: 'bg-default/72 backdrop-blur-xl backdrop-saturate-150 border-b border-default', title: 'text-[17px] tracking-tight' },
    },
    dashboardToolbar: {
      slots: { root: 'border-b border-default' },
    },
    navigationMenu: {
      slots: { link: 'before:rounded-lg', linkLeadingIcon: 'size-[18px] stroke-[1.75]' },
    },
    alert: {
      slots: { root: 'rounded-xl' },
    },
  },
})
