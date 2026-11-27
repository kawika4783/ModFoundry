# Deployment proposal

| Environment | Initial estimate | Assumptions |
|---|---|---|
| Development / smoke | 4 vCPU, 8 GB RAM, 80 GB SSD | One build at a time, light traffic and no concurrent game test |
| Small pilot | 8 vCPU, 16 GB RAM, 160 GB SSD | Small queue, warm Gradle cache, one or two measured compilation slots |
| Split production | App 4 vCPU / 8 GB; build node 8 vCPU / 16 GB and 120+ GB SSD | Separate execution boundary and independent scaling |

Estimates are unbenchmarked. Start with one worker slot, 2 vCPU, 4 GB job memory and bounded scratch/time, then measure peak memory, disk, cold/warm durations and queue latency before increasing concurrency. No dedicated GPU required. Track assets, artifacts, app images, cache, temporary space and backups separately. Published plan storage allowances require capacity planning and server-side enforcement.

Target Ubuntu 24.04, Docker Compose, local persistent storage or optional S3-compatible backend, TLS at Traefik or Nginx, one public origin. Compose services: web, API, Postgres, Redis, worker supervisor, storage gateway, background jobs, migration task, optional monitoring. Private service networks, readiness/liveness probes, resource ceilings, restart policies and deployment secrets. Run versioned migrations once under an advisory lock before admitting traffic. Provision SMTP, signing/encryption keys and Stripe test credentials during setup. Keep live mode and community off until acceptance.

Operations deliverables: docker-compose.yml, production Dockerfiles, .env.example, proxy examples, install/update/backup/restore scripts and operator/developer instructions. Update flow: verify backup, run backward-compatible schema changes, start healthy services, switch traffic and verify. Restore flow: restore DB and asset snapshot together into isolated environment, recover secrets by reference, reconcile pending jobs and billing, validate checksums and perform a test restore before reopening traffic. Store encrypted off-host copies when configured. Test retention and scheduled recovery. Monitor CPU, RAM, disk, DB, Redis, queue age, API errors/latency, build outcomes, tenant usage, companion versions, installs and compatibility regressions. Thresholds and alert routes are configurable.
