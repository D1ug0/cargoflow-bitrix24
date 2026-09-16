FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY apps/integration-worker/package.json apps/integration-worker/package.json
RUN pnpm install --frozen-lockfile
COPY packages packages
COPY apps/integration-worker apps/integration-worker
RUN pnpm --filter @cargoflow/contracts build \
    && pnpm --filter @cargoflow/shared build \
    && pnpm --filter @cargoflow/database build \
    && pnpm --filter @cargoflow/integration-worker build

FROM node:22-alpine AS runtime
RUN corepack enable
WORKDIR /workspace
COPY --from=build /workspace /workspace
ENV NODE_ENV=production
CMD ["node", "apps/integration-worker/dist/main.js"]
