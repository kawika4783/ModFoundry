FROM node:22-alpine AS deps
RUN apk add --no-cache openssl && corepack enable
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/database/package.json packages/database/package.json
RUN pnpm install --frozen-lockfile
FROM deps AS build
COPY tsconfig.base.json ./
COPY apps/api apps/api
COPY packages/database packages/database
RUN pnpm db:generate && pnpm --filter @modfoundry/api build
FROM node:22-alpine
RUN apk add --no-cache openssl && npm install -g pnpm@11.25.0 && addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=build --chown=app:app /app /app
USER app
EXPOSE 4000
CMD ["pnpm", "--filter", "@modfoundry/api", "start:prod"]
