FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY apps/integration-api/package.json apps/integration-api/package.json
RUN pnpm install --frozen-lockfile
COPY packages packages
COPY apps/integration-api apps/integration-api
RUN pnpm --filter @cargoflow/contracts build \
    && pnpm --filter @cargoflow/shared build \
    && pnpm --filter @cargoflow/database build \
    && pnpm --filter @cargoflow/integration-api build

FROM node:22-alpine AS runtime
RUN corepack enable
WORKDIR /workspace
COPY --from=build /workspace /workspace
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "apps/integration-api/dist/main.js"]
