FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY worker/package.json ./worker/package.json

RUN pnpm install --filter @ferreras/minecraft-live-worker --frozen-lockfile

COPY worker/tsconfig.json ./worker/tsconfig.json
COPY worker/src ./worker/src

RUN pnpm --filter @ferreras/minecraft-live-worker build

WORKDIR /app/worker

CMD ["pnpm", "start"]
