FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY worker/package.json ./worker/package.json

RUN pnpm install --filter ferreras-smp --frozen-lockfile

COPY astro.config.mjs tsconfig.json ./
COPY public ./public
COPY src ./src

ENV ASTRO_ADAPTER=node
RUN pnpm build:dokploy

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
