FROM node:22-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY worker/package.json ./worker/package.json

RUN pnpm install --filter ferreras-smp --frozen-lockfile

COPY astro.config.mjs tsconfig.json ./
COPY public ./public
COPY src ./src

ENV ASTRO_ADAPTER=node
ENV MINECRAFT_API_ONLY=true
RUN pnpm build:dokploy
RUN pnpm --filter ferreras-smp deploy --prod --legacy /runtime

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /runtime/node_modules ./node_modules

USER node

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
