# Deployment proposal

## Foundation smoke deployment (not public production)

`deploy/hostinger.foundation.compose.yaml` builds web/API images from this repository and runs PostgreSQL, Redis, migrations and deterministic seed. It binds the web service to `127.0.0.1:32122`, so it is not publicly exposed. Use an isolated checkout and an untracked, owner-readable `.env` with a randomly generated `POSTGRES_PASSWORD` and `APP_URL=http://127.0.0.1:32122`. Registration is off by default; set `REGISTRATION_ENABLED=true` only for an isolated smoke test, then switch it off again. Run:

```sh
docker compose -f deploy/hostinger.foundation.compose.yaml --env-file .env build
docker compose -f deploy/hostinger.foundation.compose.yaml --env-file .env up -d
docker compose -f deploy/hostinger.foundation.compose.yaml --env-file .env ps
curl -f http://127.0.0.1:32122/api/v1/health
```

The foundation stack was smoke tested on Hostinger in `/docker/modfoundry-foundation`. The web container joins a private internal network for API access and a separate edge bridge to publish only `127.0.0.1:32122`. Runtime images bundle pnpm, so startup does not require npm registry access. A successful localhost test does not make this stack ready for public traffic.

The `seed` job creates only catalog entries and plan versions, not an administrator. The stack is intentionally separate from the existing public workbench preview. Do not expose registration or point public traffic at this stack until TLS, email verification, abuse controls, administrator setup, backup/restore and live authentication checks are complete. No Stripe or compilation services are deployed by this file.

| Environment | Initial estimate | Assumptions |
|---|---|---|
| Development / smoke | 4 vCPU, 8 GB RAM, 80 GB SSD | One build at a time, light traffic and no concurrent game test |
| Small pilot | 8 vCPU, 16 GB RAM, 160 GB SSD | Small queue, warm Gradle cache, one or two measured compilation slots |
| Split production | App 4 vCPU / 8 GB; build node 8 vCPU / 16 GB and 120+ GB SSD | Separate execution boundary and independent scaling |

Estimates are unbenchmarked. Start with one worker slot, 2 vCPU, 4 GB job memory and bounded scratch/time, then measure peak memory, disk, cold/warm durations and queue latency before increasing concurrency. No dedicated GPU required. Track assets, artifacts, app images, cache, temporary space and backups separately. Published plan storage allowances require capacity planning and server-side enforcement.

Target Ubuntu 24.04, Docker Compose, local persistent storage or optional S3-compatible backend, TLS at Traefik or Nginx, one public origin. Compose services: web, API, Postgres, Redis, worker supervisor, storage gateway, background jobs, migration task, optional monitoring. Private service networks, readiness/liveness probes, resource ceilings, restart policies and deployment secrets. Run versioned migrations once under an advisory lock before admitting traffic. Provision SMTP, signing/encryption keys and Stripe test credentials during setup. Keep live mode and community off until acceptance.

Operations deliverables: docker-compose.yml, production Dockerfiles, .env.example, proxy examples, install/update/backup/restore scripts and operator/developer instructions. Update flow: verify backup, run backward-compatible schema changes, start healthy services, switch traffic and verify. Restore flow: restore DB and asset snapshot together into isolated environment, recover secrets by reference, reconcile pending jobs and billing, validate checksums and perform a test restore before reopening traffic. Store encrypted off-host copies when configured. Test retention and scheduled recovery. Monitor CPU, RAM, disk, DB, Redis, queue age, API errors/latency, build outcomes, tenant usage, companion versions, installs and compatibility regressions. Thresholds and alert routes are configurable.
