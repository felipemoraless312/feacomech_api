# Imagen de producción de FEACOMECH (Nuxt 4 + Prisma 7 + PostgreSQL).
#
#   build    → instala dependencias, genera el cliente Prisma y compila Nuxt (.output)
#   migrate  → mismo entorno que build; ejecuta migraciones y seeds (servicio de un solo uso)
#   runtime  → sólo .output (Nitro empaqueta lo necesario), sin herramientas de compilación
#
# Ver compose.prod.yaml y SERVER_SETUP.md.

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-bookworm-slim AS build
WORKDIR /app
ENV NUXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
# postinstall (nuxt prepare + prisma generate) necesita el código, así que se omite aquí
# y se ejecuta después de copiarlo.
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY . .
RUN npm rebuild && npx nuxt prepare && npx prisma generate && npx nuxt build

# Migraciones y datos iniciales (idempotentes). Se ejecuta como usuario sin privilegios.
FROM build AS migrate
ENV NODE_ENV=production
RUN chown -R node:node /app/node_modules/.cache 2>/dev/null || true
USER node
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npx tsx prisma/seed/feacomech-real.ts"]

FROM node:${NODE_VERSION}-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NUXT_TELEMETRY_DISABLED=1 \
    HOST=0.0.0.0 \
    PORT=3000 \
    NUXT_DIR_ALMACEN=/data/almacen \
    NUXT_ALMACEN=disco
COPY --from=build --chown=node:node /app/.output ./.output
# Carpeta de archivos subidos; el volumen montado aquí hereda este propietario.
RUN mkdir -p /data/almacen && chown -R node:node /data
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"
CMD ["node", ".output/server/index.mjs"]
