FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/dashboard/package.json apps/dashboard/package.json
RUN pnpm install --frozen-lockfile
COPY apps/dashboard apps/dashboard
RUN pnpm --filter @cargoflow/dashboard build

FROM node:22-alpine AS runtime
WORKDIR /app
COPY --from=build /workspace/apps/dashboard/.output ./.output
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]

