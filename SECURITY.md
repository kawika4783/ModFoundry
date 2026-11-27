# Security design and launch gates

| Risk | Proposed treatment and verification |
|---|---|
| Cross-tenant access | Composite tenant foreign keys, transaction-scoped PostgreSQL RLS where appropriate, object checks for every download and job, tests across different tenants and roles. |
| Untrusted builds | Dedicated secret-free execution host or isolation boundary for public production. No Docker socket in application services or job sandboxes. Disposable non-root runner with resource limits, read-only root, restricted capabilities, no app network, no inherited credentials. Approved dependency imports are hash-pinned and isolated from jobs. Verify teardown, output bounds and network/secret denial. |
| Credential theft | Argon2id, verified email, user TOTP with recovery codes, enforced admin MFA, parameterized queries, HttpOnly secure sessions, rotation and revocation, CSRF and CSP, rate limits, encrypted provider/server secrets and key rotation. |
| Malicious uploads | Validate by type and decoded limits, scan quarantined assets, bound archive expansion, serve attachments from constrained endpoints, remove executable permissions, moderate published releases. |
| Unauthorized local writes | Scoped device jobs, checksum and signed manifest, revocation, explicit approval, handle-based path validation, backup and restore tests. |
| Payment fraud | Signature validation, durable idempotency, provider reconciliation and audited administrator actions. |
| Privacy | Minimize inventory and log data, configurable retention, export/deletion, no telemetry by default. Keep child registration unavailable until appropriate age/consent lifecycle and privacy controls are reviewed and tested. |

Bootstrap username is kawika4783aiden. Supply initial password via deployment secret or interactive setup, force rotation on first login, and retire the bootstrap credential. Audit security events, role changes, support access, payments, deployment and backup restores. Document incident response and revocation procedures.

Review current [Minecraft EULA](https://www.minecraft.net/en-us/eula) and [Usage Guidelines](https://www.minecraft.net/en-us/usage-guidelines) before commercial launch and each distribution change. Keep marketplace monetization disabled. Focus prices on tool/service access and keep subscription checks out of generated gameplay. Do not distribute proprietary game content or suggest official affiliation.
