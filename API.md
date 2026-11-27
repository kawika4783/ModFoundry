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
