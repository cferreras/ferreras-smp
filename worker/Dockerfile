FROM node:22-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY worker/package.json ./worker/package.json

RUN pnpm install --filter @ferreras/minecraft-live-worker --frozen-lockfile

COPY worker/tsconfig.json ./worker/tsconfig.json
COPY worker/src ./worker/src

RUN pnpm --filter @ferreras/minecraft-live-worker build
RUN pnpm --filter @ferreras/minecraft-live-worker deploy --prod --legacy /runtime

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build --chown=node:node /app/worker/dist ./dist
COPY --from=build --chown=node:node /runtime/node_modules ./node_modules

USER node

CMD ["node", "dist/index.js"]
