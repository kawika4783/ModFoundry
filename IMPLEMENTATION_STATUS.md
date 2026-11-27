# Implementation status

## Implemented and verified

- Monorepo with Next.js web, NestJS API and Prisma/PostgreSQL database package.
- Foundry Bench desktop and responsive mobile shell. Asset selection, editor tabs, light level, hardness and save feedback work locally.
- Generated original copper lantern preview asset.
- API health and database-backed compatibility profile list.
- Initial tenant, membership, session, project, compatibility, plan, subscription, usage, payment inbox and audit schema with an initial SQL migration.
- Docker Compose topology for web, API, PostgreSQL, Redis and migration execution.
- Unit, type, production build and Playwright desktop/mobile checks.

## Incomplete

Authentication endpoints, project persistence from the editor, entitlement enforcement, Stripe, compilation workers, real Fabric generation, artifact downloads and ModFoundry Connect are not operational. The Build JAR control is disabled and explicitly labeled pending. Java 1.21.1 with Fabric remains a candidate until the exact toolchain and in-game fixture pass.

Foundry Bench (A) is the permanent theme. Resume with secure authentication and persisted project revisions, then Stripe test billing and the exact Fabric toolchain spike.
