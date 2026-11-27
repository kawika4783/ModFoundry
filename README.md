# ModFoundry

ModFoundry is a self-hosted no-code mod creation SaaS under active development. The repository currently contains the Phase 1 foundation and an interactive Foundry Bench interface. Compilation, payments, authentication flows and ModFoundry Connect are not operational yet.

## Current working surface

- Next.js Foundry Bench editor shell with working asset selection, tabs, block property controls and autosave feedback.
- NestJS health and compatibility catalog endpoints backed by PostgreSQL through Prisma.
- Initial multi-tenant, compatibility, entitlement, payment inbox and audit schema.
- Seeded candidate profile for Java 1.21.1 with Fabric. It is deliberately marked `CANDIDATE` until the exact toolchain and in-game fixture pass.
- Seeded configurable plan versions. Billing remains disabled.
- Docker Compose topology for web, API, PostgreSQL, Redis and migrations.

## Local development

1. Copy `.env.example` to `.env` and replace every secret value.
2. Run `pnpm install`.
3. Run `pnpm db:generate`.
4. Start PostgreSQL and Redis with `docker compose up -d postgres redis`.
5. Run the first development migration with `pnpm --filter @modfoundry/database prisma migrate dev --name foundation`.
6. Run `pnpm db:seed` and `pnpm dev`.

The web app uses port 3000 and the API uses port 4000. Do not enable checkout or publish the compatibility profile until their acceptance gates pass.
