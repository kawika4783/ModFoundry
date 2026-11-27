# Compatibility matrix and generation

| Edition / target | Loader or pack | Toolchain | Proposed capabilities | Status |
|---|---|---|---|---|
| Java 1.21.1 | Fabric | JDK 21; exact Loader, Loom, Gradle, mappings and dependencies pinned after toolchain smoke build | Client+server item, placeable block, 16×16 PNG, shaped recipe, JAR and source | Candidate, untested |
| Java 1.20.1 | Fabric / Forge candidates | Pin distinct toolchains per adapter | Additional version, migration fixture | Planned, unavailable |
| Java 1.21.1 | NeoForge candidate | Pin independent toolchain | Loader conversion fixture | Planned, unavailable |
| Bedrock stable release to be selected before Phase 4 | Resource and behavior packs, combined add-on | Pin manifest version, per-file format, engine minimum and optional Script API | MCPACK/MCADDON and authorized import | Planned, unavailable |
| Other releases, snapshots and previews | Per target | Per target | Explicitly allowlisted after testing | Unsupported by default |

Release metadata informs the searchable wizard. The registry controls selectability. Persist exact profile revision including edition, release channel, game version, loader version, JDK, Gradle, mappings, dependencies, type/side constraints, supported APIs and features, pack schema, worker image digest and limitations. Track creation, build, installation and gameplay evidence independently with timestamps, fixture hashes and client/server environments. Explain disabled features. Only publish verified status after required tests pass for that profile revision. Import release metadata as data with provenance. Verify exact upstream provider URLs before implementation.

Adapter flow: normalize and validate the document into typed item/block/recipe/behavior data; validate identifiers and asset references; emit version-specific source and resources using trusted templates and escaping; compile or package in disposable runner; inspect manifest and entrypoints and produce SHA-256, dependency lock, target, source ZIP and test report. Fabric adapter owns registry calls, namespace, recipe paths and mappings. Bedrock owns pack graph, UUIDs, file formats and script version rules. No customer Gradle scripts in MVP. Future Blockly constraints include bounded inputs, adapter-aware node availability and tests for effects and control flow. Advanced models and entities require edition-specific fixtures.

Conversion creates a new target and revision. Preview diagnostic differences before commit, apply explicit deterministic transforms, require user resolution of unsupported or lossy mappings and keep original revision. Build each target independently. Cross-edition migration maps individual supported features and reports gaps. Java resource packs route to resourcepacks, data packs to a selected world's datapacks and shaders only for supported profiles.

References:
- [Fabric JDK documentation](https://github.com/FabricMC/fabric-docs/blob/main/versions/1.21.1/develop/getting-started/setting-up-a-development-environment.md)
- [Microsoft Bedrock version terminology](https://learn.microsoft.com/minecraft/creator/reference/content/versiondisambiguation)
