# Phased implementation and release checklist

- [x] Select permanent theme. Foundry Bench (A) approved.
- [ ] Preflight: review architecture, approve the initial game target, verify upstream rights and routes, identify Windows test environment and Stripe test account.
- [~] Phase 1: monorepo, initial migration, candidate compatibility registry, Foundry Bench shell and Compose topology implemented. Authentication, MFA, tenant enforcement, project CRUD, administrative bootstrap, Stripe, CMS and CI remain. Include accessible in-app navigation, responsive layouts and minimum legal/support/status content before commercial use.
- [ ] Phase 2: version and target wizard, exact Fabric version pin, basic blocks/items and recipes, basic pixel editor and asset handling, typed project revisions, validation, isolated queues, logs/cancellation/recovery, JAR and source downloads, official toolchain fixtures and in-game test harness.
- [ ] Phase 3: Windows companion build and pairing, official launcher detection and manual fallback, reviewed install, conflict/dependency handling, verified backup and rollback, installed mod management and signed delivery. Phase 1–3 jointly form the initial release.
- [ ] Phase 4: additional Java versions and loaders, multiple build targets and conversion, Bedrock pack engine and runtime fixtures, resource/data packs, additional launchers and simple profile creation, Linux/macOS companion, mobile import flows.
- [ ] Phase 5: Blockly, animation and advanced textures, Blockbench import and 3D editor, loot tables, entities, creatures, vehicles, biomes/dimensions, world generation and gameplay modules. Gate each against explicit adapter capabilities. Expand asset libraries, templates, previews, tutorials and accessibility.
- [ ] Phase 6: additional payment providers, manual billing, advanced subscription options, invoice administration, optional community publishing and moderation, collaboration, server deployment, analytics, optional permitted marketplace and optional AI plugin contract.
- [ ] Throughout: documentation, migrations, tests, admin controls, content workflows, backup/restore, usage and quality monitoring, logging and changelog updates. Complete current EULA and privacy review ahead of commercial enablement.

## Initial release gates

| Evidence | Passing result |
|---|---|
| Account and billing (1–4, 17) | Register and verify account; choose plan; complete Stripe test checkout; signed webhook updates the correct workspace. Exercise duplicates, stale events and checkout pause with renewals still active. Admin can adjust plans and provider state. |
| Create and build (5–10) | Select exact Java and Fabric target; unsupported capabilities show a reason; visually create an item/block; inspect generated source; real Gradle runner emits a valid JAR; authorized download has expected checksum. |
| Install and runtime (11–16) | Windows companion detects real profile; user approves install; verify correct directory and checksum; reject incompatible profile; replace eligible file and restore verified backup; launch appropriate authorized Minecraft client and confirm fixture item/block behavior. |
| Security and independence (18–20) | Prove two-tenant project/artifact/device isolation; prove runner lacks host secrets and app access; test constrained resource cleanup; execute entire creation-to-install flow with AI unconfigured. |

Record CI artifacts and manual device/game test evidence with commit, toolchain digest, Windows version, launcher, exact game and loader versions and observed results. Require an HTTPS setup smoke test and recovery drill before public production.
