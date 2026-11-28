# API design

Serve versioned JSON under /api/v1, publish OpenAPI and share generated clients. Browser uses secure same-origin cookies plus CSRF tokens for writes. Device tokens use a separate audience and scopes. Webhooks use provider-specific ingress with raw request bytes.

| Domain | Proposed endpoints |
|---|---|
| Account | /auth/register, /auth/verify, /auth/login, /auth/reset, /auth/mfa, /sessions, /account/export |
| Catalog | /catalog/releases, /compatibility/profiles, /compatibility/profiles/{id}/capabilities |
| Projects | /workspaces/{id}/projects, /projects/{id}/targets, /targets/{id}/revisions, /targets/{id}/validate, /targets/{id}/migration-preview |
| Builds | /targets/{id}/builds, /builds/{id}/cancel, /builds/{id}/events, /artifacts/{id}/download |
| Devices | /device-pairings, /device-pairings/{id}/authorize, /devices/{id}/profiles, /devices/{id}/jobs, /installs, /installs/{id}/receipt |
| Billing | /plans, /checkout, /billing/portal, /billing/invoices, /webhooks/{provider}/{account} |
| Admin | /admin/users, /admin/plans, /admin/providers, /admin/compatibility, /admin/branding, /admin/pages, /admin/audit |
| Deferred modules | /community, /teams, /servers, /marketplace |

Authorize each resource from membership, role, entitlement and explicit object ownership. Use cursor pagination and SSE for resumable build events. Error envelope contains stable code, field paths and request ID. Unsafe replays require an idempotency key scoped to principal, route and request hash. Revision writes require current version, returning conflict for stale updates. Signed or proxied artifact downloads are time-limited and bound to the authorized artifact. Device jobs contain opaque profile IDs and bounded signed intents. Check device revocation at claim and download.
# Foundation account and project endpoints

All paths below are under `/api/v1`. The browser uses a same-origin Next.js proxy at the same path. JSON errors use the NestJS `message` field. Sessions use an HttpOnly Secure cookie in production. The `modfoundry_csrf` cookie is readable by the browser and must also be supplied in `X-CSRF-Token` on authenticated mutations. Unsafe requests with an Origin header must match `APP_URL`.

| Method | Path | Description |
|---|---|---|
| POST | /auth/register | Create user, personal tenant, Free subscription and session |
| POST | /auth/login | Authenticate and issue a tenant-bound session |
| GET | /auth/me | Return current identity and workspace |
| POST | /auth/logout | Revoke session |
| GET | /compatibility/profiles | List available registry entries and candidate status |
| GET, POST | /projects | List tenant projects or create a structured draft |
| GET, PATCH, DELETE | /projects/:id | Read, rename or soft-delete a tenant project |
| POST | /projects/:id/archive | Archive without deletion |
| POST | /projects/:id/restore | Restore within plan limit |
| PATCH | /projects/:id/targets/:targetId | Save validated document with `documentVersion` optimistic lock |
| GET | /projects/:id/targets/:targetId/source | Inspect deterministic Java 1.21.1 Fabric candidate source files for a saved, tenant-owned target |

Creating a project accepts `{name,profileId,document}`, where `document` is a block `{kind,identifier,displayName,lightLevel,hardness}` or item `{kind,identifier,displayName,stackSize}`. The source inspection response includes `documentVersion`, `profileKey`, `revision`, `modId`, `status: UNTESTED_SOURCE`, `diagnostics` and a path-to-content `files` map. It only accepts the exact Java 1.21.1 Fabric candidate revision. The files have placeholder vanilla textures; this is not a ZIP, a Gradle project, a compiled JAR or gameplay verification. Candidate profiles cannot compile.

