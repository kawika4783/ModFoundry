# Implementation status

## Implemented and verified

- Monorepo with Next.js web, NestJS API and Prisma/PostgreSQL database package.
- Foundry Bench desktop and responsive mobile shell. Asset selection, editor tabs, light level, hardness and save feedback work locally.
- Generated original copper lantern preview asset.
- API health and database-backed compatibility profile list.
- Initial tenant, membership, session, project, compatibility, plan, subscription, usage, payment inbox and audit schema with an initial SQL migration.
- Docker Compose topology for web, API, PostgreSQL, Redis and migration execution.
- Unit, type, production build and Playwright desktop/mobile checks.
- Registration/login/logout API with Argon2id hashes, scoped database sessions, CSRF tokens and origin checks; tenant membership is bound to each session.
- Server-side Free plan project count enforcement, tenant-scoped project reads and edits, candidate profile draft creation, archive/restore and optimistic document saves.
- Account, project list, configuration wizard and saved block/item draft editor UI. The original workbench is labeled as an illustrative demo.
- Local type checks, API unit tests and Next.js production build for this phase.

## Incomplete

Email verification, password reset, two-factor authentication, distributed rate limiting, production registration controls, broader role management and the administration portal are incomplete. Stripe, compilation workers, real Fabric generation, artifact downloads and ModFoundry Connect are not operational. The Build JAR control is disabled and explicitly labeled pending. Java 1.21.1 with Fabric remains a candidate until the exact toolchain and in-game fixture pass. The new account and project flow is not approved for public production traffic until HTTPS, abuse controls, email verification and deployment smoke tests are complete.

Foundry Bench (A) is the permanent theme. Resume with production account protections, project history and admin setup, then Stripe test billing and the exact Fabric toolchain spike.
