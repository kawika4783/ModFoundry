# Changelog

## Unreleased

- Deployed and smoke tested the isolated foundation stack on Hostinger: web, API, PostgreSQL, Redis, migration and catalog seed. Kept registration off and the web bound to localhost.
- Fixed Compose build contexts, packaged pnpm in runtime images so private services do not download at startup, and attached the web service to an edge bridge for localhost port publishing.

- Added scoped account sessions, CSRF checks, tenant project draft persistence and Free plan limits.
- Added account, configuration wizard, project list and automatically saved block/item draft editor.
- Added a separate loopback-only foundation Compose stack for VPS smoke testing; public release remains gated.
- Corrected demo labels so illustrative controls are not presented as persisted or compiled.
- Defined the proposed architecture, core ERD, version-aware engine, billing abstraction, companion workflow, three visual concepts and staged release gates.

- Added the Phase 1 monorepo foundation, database schema and initial migration.
- Added the responsive Foundry Bench editor shell with working local interactions.
- Added the NestJS compatibility catalog and health endpoints.
- Added unit, build and desktop/mobile browser verification.
- Kept compilation and payment controls explicitly unavailable.

