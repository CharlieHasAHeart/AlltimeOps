# API Design: Lightweight AIOps Platform for Personal Servers

## 1. Purpose

This document defines the API contract for transforming the existing Keep-derived API into a lightweight AIOps platform for personal servers.

The current codebase already exposes a FastAPI backend under `keep/api`. The existing API is platform-oriented and includes routes such as `/alerts`, `/incidents`, `/workflows`, `/providers`, `/actions`, `/ai`, `/settings`, `/whoami`, `/healthcheck`, plus advanced platform routes such as `/mapping`, `/extraction`, `/topology`, `/maintenance`, `/dashboard`, `/deduplications`, `/facets`, and `/cel`.

The target product API should preserve useful existing Keep routes where possible, introduce a small number of new personal-server routes, and expose a stable product contract for the MVP.

The product loop supported by this API is:

**Server → Signal → Incident → AI Diagnosis → Notification / Ticket / Safe Action → Timeline**

---

## 2. Source of Truth

This `api-design.md` is the source of truth for API contracts.

Primary source documents:

- `prd.md`
- `domain-model.md`
- `architecture.md`
- `db-schemas.md`
- `tech-stack.md`

Repository context used:

- `keep/api/api.py` is the FastAPI application entrypoint.
- `keep/api/routes/alerts.py` exists and should be mapped to the product concept **Signals**.
- `keep/api/routes/incidents.py` exists and should remain the product concept **Incidents**.
- `keep/api/routes/workflows.py` exists and should be mapped to the product concept **Playbooks**.
- `keep/api/routes/providers.py` exists and should be mapped to the product concept **Integrations**.
- `keep/api/routes/actions.py` exists and should remain the product concept **Actions**.
- `keep/api/routes/ai.py` exists and should be mapped to **AI Diagnosis / AI Settings**.
- `keep/api/routes/settings.py`, `whoami.py`, `healthcheck.py`, `status.py`, `pusher.py`, and `metrics.py` exist as supporting system routes.
- Advanced platform routes such as `mapping.py`, `extraction.py`, `topology.py`, `maintenance.py`, `dashboard.py`, `deduplications.py`, `facets.py`, `cel.py`, `rules.py`, `preset.py`, `tags.py`, and `provider_images.py` exist but should not be primary MVP product APIs.

If this document conflicts with the PRD, the PRD takes precedence for product scope.

If this document conflicts with the domain model, the domain model takes precedence for entity meaning.

If this document conflicts with the architecture document, architecture rules take precedence for module boundaries and dependency direction.

If this document conflicts with existing Keep endpoints, this document defines the target product-facing API while allowing internal compatibility adapters.

---

## 3. Canonical Project Decisions

### Product Mode Decision

Canonical backend variable:

```bash
PRODUCT_MODE=personal_server_mvp
```

Canonical frontend variable:

```bash
NEXT_PUBLIC_PRODUCT_MODE=personal_server_mvp
```

The product-facing API should treat `personal_server_mvp` as the only canonical MVP mode.

Deprecated compatibility variables may exist for legacy mapping only:

```bash
NEXT_PUBLIC_SLIM_MODE
NEXT_PUBLIC_PRODUCT_MODE=lite
```

New API behavior and settings examples must not use `lite` as product mode.

### Server Health State Policy

#### Product-facing health states

The product-facing server health states are:

- `healthy`
- `warning`
- `critical`
- `unknown`

#### Internal lifecycle or system states

The backend/database may also store:

- `disconnected`
- `archived`

#### Mapping rules

- `healthy` means the server has no known active problem.
- `warning` means the server has a non-critical problem or degraded condition.
- `critical` means the server has an urgent active problem.
- `unknown` means the system does not have enough recent data to determine health.
- `disconnected` is an internal/system state and must not be treated as `healthy`.
- `archived` is an internal lifecycle state and must not appear in the default active server list.
- `degraded` is not a canonical MVP health state.
- Any legacy `degraded` value must be mapped to `warning`.

### API Rollout Decision

The MVP uses a phased API rollout.

#### Sprint 1 rule

Sprint 1 must not require a full `/api/v1` rewrite.

Existing Keep routes remain available internally:

- `/alerts`
- `/incidents`
- `/workflows`
- `/providers`
- `/actions`
- `/ai`
- `/settings`
- `/whoami`
- `/healthcheck`
- `/status`

#### Product wrapper rule

New product-facing wrappers should be introduced only where needed for MVP clarity:

- `/api/v1/me`
- `/api/v1/settings`
- `/api/v1/overview`
- `/api/v1/servers`

#### Compatibility mapping

Existing routes may continue to power product concepts:

| Existing Keep Route | Product Concept |
|---|---|
| `/alerts` | Signals |
| `/workflows` | Playbooks |
| `/providers` | Integrations |
| `/actions` | Actions |
| `/incidents` | Incidents |
| `/ai` | AI Diagnosis |

#### Later migration

Full `/api/v1` coverage is a future migration task and must not block Sprint 1.

---

## 4. Codex Usage

Codex should use this document to understand the target client-server API contract for the personal-server MVP.

Codex should preserve existing Keep route implementations where they are useful, but should expose them through product language and a lightweight API surface.

Codex should treat API IDs such as `API-001` as stable references.

Codex should not add broad enterprise, marketplace, topology, mapping, extraction, dashboard-builder, maintenance-window, or complex RBAC APIs to the MVP product surface unless this document is updated.

---

## 5. Non-Goals

This document does not define ORM code.

This document does not define UI component design.

This document does not define local commands.

This document does not define implementation task order.

This document does not define database migrations.

This document does not expose secrets, API keys, private keys, passwords, tokens, webhook secrets, or provider credentials.

This document does not define enterprise APIs for billing, licensing, complex RBAC, enterprise SSO, CMDB, large-scale topology, provider marketplace management, or compliance reporting.

---

## 6. API Style

### STYLE-001: Existing route compatibility

The current backend registers routers directly under unversioned prefixes such as:

```text
/alerts
/incidents
/workflows
/providers
/actions
/ai
/settings
/whoami
/healthcheck
```

The MVP should preserve these existing routes internally where doing so reduces migration risk.

### STYLE-002: Product-facing API style

The target product-facing API should use REST-style JSON endpoints.

The preferred future product base path is:

```text
/api/v1
```

However, during migration, product-facing UI may call existing Keep route prefixes through a compatibility layer.

### STYLE-003: Product language mapping

Existing Keep route names should map to MVP product terms:

| Existing Keep Route | Product Concept | Product-Facing Name |
|---|---|---|
| `/alerts` | Signals | Signals |
| `/incidents` | Incidents | Incidents |
| `/workflows` | Playbooks | Playbooks |
| `/providers` | Integrations | Integrations |
| `/actions` | Actions | Actions |
| `/ai` | AI Diagnosis / AI Settings | AI Diagnosis |
| `/settings` | Settings | Settings |
| `/whoami` | Current user context | Me |
| `/healthcheck` | Health check | Healthcheck |

## Legacy Terminology Policy

| Product Concept | User-visible MVP Term | Internal Legacy Term | Allowed Contexts | Forbidden Contexts |
|---|---|---|---|---|
| Signal | Signal | Alert | backend model names, existing route names, compatibility adapters | primary navigation, page titles, onboarding copy |
| Playbook | Playbook | Workflow | backend workflow engine, existing route names, compatibility adapters | primary navigation, user-facing MVP labels |
| Integration | Integration | Provider | provider adapter code, existing route names, internal config | primary navigation, MVP settings labels |
| Overview | Overview | Dashboard | internal aggregation only if reused | dashboard-builder UI in MVP mode |
| Server | Server | none / topology entity if mapped later | all MVP user-facing contexts | replacing Server with topology in user-facing MVP UI |

Rules:

- User-facing MVP UI must use `Signal`, `Playbook`, `Integration`, `Overview`, and `Server`.
- Backend internals may keep legacy names when preserving existing Keep compatibility.
- Existing routes such as `/alerts`, `/workflows`, and `/providers` may remain during migration.
- Product-facing wrappers and UI labels must translate legacy terms into MVP terms.
- Do not perform broad internal renames only for terminology cleanup unless the execution plan explicitly requires it.

Compatibility mapping used in migration:

```text
/alerts     → Signals
/workflows  → Playbooks
/providers  → Integrations
/actions    → Actions
/incidents  → Incidents
/ai         → AI Diagnosis
```

### STYLE-004: New required route

The existing codebase does not show a dedicated `servers.py` route. The personal-server MVP should add:

```text
/servers
```

or product-versioned equivalent:

```text
/api/v1/servers
```

### STYLE-005: JSON

Request and response bodies are JSON unless otherwise stated.

### STYLE-006: Field naming

New product-facing JSON fields use snake_case.

### STYLE-007: Date and time

Timestamps are ISO 8601 UTC strings.

### STYLE-008: ID format

IDs are opaque strings. Clients must not infer meaning from ID format.

---

## 6. Authentication

### AUTH-001: Existing authentication context

The existing API is wired through Keep identity management and has a `/whoami` route. The MVP should use the existing authentication context where possible.

### AUTH-002: Production authentication

Production or commercial MVP usage must not rely on no-auth mode.

### AUTH-003: User APIs

User-facing product APIs require an authenticated session.

### AUTH-004: External intake APIs

External signal intake APIs require integration-level authentication.

### AUTH-005: Authentication failure

Authentication failure returns HTTP `401`.

Response shape:

```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Authentication is required.",
    "details": {}
  }
}
```

---

## 7. Authorization Rules

### AUTHZ-001: Tenant/workspace boundary

The existing Keep backend uses tenant-style context. The personal-server MVP should map this to the product concept of a workspace.

Every user-facing API request must be scoped to the active tenant/workspace.

### AUTHZ-002: Backend enforcement

Authorization must be enforced on the backend.

The frontend may hide actions or pages, but backend authorization remains mandatory.

### AUTHZ-003: Server ownership

Server-specific endpoints must verify that the server belongs to the active tenant/workspace.

### AUTHZ-004: Incident ownership

Incident-specific endpoints must verify that the incident belongs to the active tenant/workspace.

### AUTHZ-005: Action execution

Action execution must verify:

- The user belongs to the active tenant/workspace.
- The action belongs to the active tenant/workspace or is a safe seeded system action.
- The target server belongs to the active tenant/workspace.
- The action is enabled.
- The action risk level is defined.
- Approval exists when required.
- Unsafe actions are not executed automatically.

### AUTHZ-006: Integration usage

Integration usage must verify:

- The integration belongs to the active tenant/workspace.
- The integration is enabled.
- The integration is connected or configured for the requested capability.

### AUTHZ-007: Authorization failure

Authorization failure returns HTTP `403`.

Response shape:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have access to this resource.",
    "details": {}
  }
}
```

---

## 8. Common Request Rules

### REQ-001: JSON body

Requests with bodies must be valid JSON.

### REQ-002: Unknown fields

New MVP endpoints should reject unknown fields for create and update operations unless explicitly marked as extensible.

Existing Keep compatibility endpoints may be more permissive during migration.

### REQ-003: Required fields

Missing required fields return `VALIDATION_ERROR`.

### REQ-004: Query parameters

Query parameters must use documented formats.

### REQ-005: Pagination

List endpoints should support cursor pagination for new MVP endpoints.

Existing Keep endpoints may preserve their existing pagination behavior until wrapped or migrated.

### REQ-006: Idempotency

Mutation endpoints that create external side effects should support an `Idempotency-Key` header.

Applies especially to:

- Diagnosis requests.
- Notification sending.
- Ticket creation.
- Playbook execution.
- Action execution.

---

## 9. Common Response Rules

### RES-001: Single-resource success envelope

New MVP endpoints should return:

```json
{
  "data": {}
}
```

### RES-002: List success envelope

New MVP list endpoints should return:

```json
{
  "data": [],
  "pagination": {
    "next_cursor": null,
    "limit": 50
  }
}
```

### RES-003: Compatibility endpoints

Existing Keep endpoints may return their current response shapes. Product-facing wrappers should normalize responses to this document when practical.

### RES-004: Sensitive data

Responses must never include raw secrets, tokens, passwords, SSH private keys, webhook secrets, SMTP credentials, or AI provider keys.

### RES-005: Empty lists

Empty lists return `[]`, not `null`.

---

## 10. Error Format

New MVP endpoints should use this error envelope:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message.",
    "details": {}
  }
}
```

Existing Keep endpoints may currently return different error shapes. Product-facing APIs should normalize errors over time.

### Common error codes

| Code | HTTP Status | Meaning |
|---|---:|---|
| `AUTHENTICATION_REQUIRED` | 401 | User is not authenticated |
| `FORBIDDEN` | 403 | User lacks access |
| `NOT_FOUND` | 404 | Resource does not exist or is not accessible |
| `VALIDATION_ERROR` | 400 | Request is invalid |
| `CONFLICT` | 409 | Request conflicts with current resource state |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTEGRATION_NOT_CONNECTED` | 409 | Required integration is unavailable |
| `ACTION_APPROVAL_REQUIRED` | 409 | Action cannot run before approval |
| `ACTION_REJECTED` | 409 | Action was rejected |
| `UNSAFE_ACTION_BLOCKED` | 409 | Unsafe action cannot be executed automatically |
| `INSUFFICIENT_EVIDENCE` | 422 | Diagnosis cannot produce a supported conclusion |
| `EXTERNAL_SERVICE_ERROR` | 502 | External provider failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Validation error details

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": {
      "fields": [
        {
          "field": "name",
          "message": "This field is required."
        }
      ]
    }
  }
}
```

---

## 11. Endpoint List

The `API-001` through `API-050` endpoint catalog defines the target product contract and migration direction.

Sprint 1 implementation scope is constrained by `execution-plan.md` `Sprint 1 API Scope`.

It must not be interpreted as mandatory Sprint 1 implementation for every endpoint.

Sprint 1 requires only the phased wrapper set and compatibility behavior defined in the API rollout decision.

### Existing Keep route mapping

| API ID | Existing Route | Product Route | Product Concept | MVP Treatment |
|---|---|---|---|---|
| API-001 | `/whoami` | `/api/v1/me` | Me | Keep and wrap |
| API-002 | none or dashboard-derived | `/api/v1/overview` | Overview | Add lightweight endpoint |
| API-003 | new | `/api/v1/servers` | Servers | Add |
| API-004 | new | `/api/v1/servers/{server_id}` | Server detail | Add |
| API-005 | new | `/api/v1/servers/{server_id}/services` | Server services | Add or defer |
| API-006 | `/alerts` | `/api/v1/signals` | Signals | Wrap existing alerts |
| API-007 | `/alerts` | `/api/v1/signals/{signal_id}` | Signal detail | Wrap existing alerts |
| API-008 | `/alerts` or new | `/api/v1/signals/test` | Test signal | Add or wrap |
| API-009 | `/alerts` or provider webhook paths | `/api/v1/intake/webhook/{integration_id}` | Webhook intake | Wrap existing alert intake |
| API-010 | `/alerts` or provider webhook paths | `/api/v1/intake/prometheus/{integration_id}` | Prometheus intake | Wrap existing alert intake |
| API-011 | `/incidents` | `/api/v1/incidents` | Incidents | Keep and wrap |
| API-012 | `/incidents` | `/api/v1/incidents/{incident_id}` | Incident detail | Keep and wrap |
| API-013 | `/incidents` | `/api/v1/incidents/{incident_id}/resolve` | Resolve incident | Keep and wrap if existing |
| API-014 | `/incidents` | `/api/v1/incidents/{incident_id}/reopen` | Reopen incident | Keep and wrap if existing |
| API-015 | `/incidents` | `/api/v1/incidents/{incident_id}/timeline` | Timeline | Keep, add, or wrap |
| API-016 | `/ai` | `/api/v1/incidents/{incident_id}/diagnoses` | AI Diagnosis | Wrap existing AI route or add |
| API-017 | `/workflows` | `/api/v1/playbooks` | Playbooks | Wrap existing workflows |
| API-018 | `/workflows` | `/api/v1/playbooks/{playbook_id}` | Playbook detail | Wrap existing workflows |
| API-019 | `/workflows` | `/api/v1/playbooks/{playbook_id}/run` | Run playbook | Wrap existing workflows |
| API-020 | `/actions` | `/api/v1/actions` | Actions | Keep and wrap |
| API-021 | `/actions` | `/api/v1/action-runs` | Action runs | Keep and wrap or add |
| API-022 | `/actions` | `/api/v1/action-runs/{action_run_id}/approve` | Approve action | Add safety layer if missing |
| API-023 | `/providers` | `/api/v1/integrations` | Integrations | Wrap existing providers |
| API-024 | `/providers` | `/api/v1/integrations/{integration_id}` | Integration detail | Wrap existing providers |
| API-025 | `/providers` | `/api/v1/integrations/{integration_id}/validate` | Validate integration | Wrap or add |
| API-026 | existing provider/action path or add | `/api/v1/incidents/{incident_id}/notifications` | Notifications | Add product wrapper |
| API-027 | existing provider/action path or add | `/api/v1/incidents/{incident_id}/tickets` | Tickets | Add product wrapper |
| API-028 | `/healthcheck` | `/api/v1/healthcheck` | Healthcheck | Keep and optionally wrap |
| API-029 | `/status` | `/api/v1/status` | Status | Keep and optionally wrap |
| API-030 | `/settings` | `/api/v1/settings` | Settings | Keep and wrap |

### Non-MVP existing routes

These routes exist in the current API but should not be part of the primary lightweight MVP product API:

| Existing Route | MVP Treatment |
|---|---|
| `/mapping` | Hidden or admin-only |
| `/extraction` | Hidden or admin-only |
| `/topology` | Hidden or future |
| `/maintenance` | Hidden or future |
| `/dashboard` | Hidden or replaced by Overview |
| `/deduplications` | Hidden; internal capability only |
| `/{entity_name}/facets` | Hidden; internal filtering support only |
| `/cel` | Hidden; internal expression support only |
| `/rules` | Hidden or future |
| `/preset` | Hidden or future |
| `/tags` | Hidden or future |
| `/provider-images` | Hidden or internal support only |
| `/metrics` | System/ops only |
| `/pusher` | Realtime support only |
| `/auth/groups` | Not primary MVP |
| `/auth/roles` | Not primary MVP |
| `/auth/permissions` | Not primary MVP |
| `/auth/users` | Admin/support only if retained |

---

## 12. Endpoint Details

## API-001: GET /api/v1/me

### Purpose

Return the current authenticated user and active workspace context.

### Existing Keep Mapping

Wraps or aligns with existing `/whoami`.

### Related Requirements

- REQ-039
- REQ-050

### Related Domain Entities

- ENT-USER
- ENT-WORKSPACE

### Auth

Authenticated user session required.

### Request Params

None.

### Request Body

None.

### Response Body

```json
{
  "data": {
    "user": {
      "id": "usr_123",
      "email": "user@example.com",
      "display_name": "Alex",
      "status": "active"
    },
    "workspace": {
      "id": "wks_123",
      "name": "Personal Servers",
      "product_mode": "personal_server_mvp",
      "role": "owner"
    }
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`

### Notes

Must not return secrets or provider credentials.

---

## API-002: GET /api/v1/overview

### Purpose

Return the lightweight personal-server Overview summary.

### Existing Keep Mapping

May aggregate from existing `/incidents`, `/alerts`, `/actions`, and future `/servers`.

Should replace the need for exposing `/dashboard` in MVP.

### Related Requirements

- REQ-005
- REQ-039
- REQ-050

### Related Domain Entities

- ENT-SERVER
- ENT-SIGNAL
- ENT-INCIDENT
- ENT-DIAGNOSIS
- ENT-ACTION-RUN

### Auth

Authenticated user session required.

### Request Params

None.

### Request Body

None.

### Response Body

```json
{
  "data": {
    "summary": {
      "monitored_servers": 2,
      "active_incidents": 1,
      "critical_signals": 3,
      "ai_diagnoses": 5,
      "actions_executed": 4
    },
    "server_health": {
      "healthy": 1,
      "warning": 1,
      "critical": 0,
      "unknown": 0,
      "disconnected": 0
    },
    "recent_incidents": [
      {
        "id": "inc_123",
        "title": "Disk usage high on personal-vps",
        "severity": "warning",
        "status": "diagnosed",
        "server": {
          "id": "srv_123",
          "name": "personal-vps"
        },
        "updated_at": "2026-05-08T12:34:56Z"
      }
    ],
    "recent_signals": [
      {
        "id": "sig_123",
        "title": "Disk usage above 85%",
        "severity": "warning",
        "source_type": "prometheus",
        "received_at": "2026-05-08T12:30:00Z"
      }
    ]
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`

### Notes

This endpoint is a product-level summary and should not expose full dashboard-builder behavior.

---

## API-003: GET /api/v1/servers

### Purpose

List monitored personal servers.

### Existing Keep Mapping

No dedicated `keep/api/routes/servers.py` was found in the explored API. This is a new MVP endpoint.

### Related Requirements

- REQ-002
- REQ-006
- REQ-044

### Related Domain Entities

- ENT-SERVER

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required | Notes |
|---|---|---:|---|
| health_state | string | no | healthy, warning, critical, unknown, disconnected, archived |
| environment | string | no | production, staging, development, homelab, other |
| limit | integer | no | Default 50 |
| cursor | string | no | Pagination cursor |
| sort | string | no | name, updated_at, last_signal_at |
| order | string | no | asc, desc |

### Request Body

None.

### Response Body

```json
{
  "data": [
    {
      "id": "srv_123",
      "name": "personal-vps",
      "host": "203.0.113.10",
      "environment": "production",
      "description": "Main personal VPS",
      "health_state": "warning",
      "connection_status": "connected",
      "monitoring_status": "active",
      "diagnosis_access_status": "connected",
      "last_signal_at": "2026-05-08T12:30:00Z",
      "last_incident_at": "2026-05-08T12:31:00Z",
      "last_diagnosis_at": "2026-05-08T12:32:00Z",
      "created_at": "2026-05-01T10:00:00Z",
      "updated_at": "2026-05-08T12:32:00Z"
    }
  ],
  "pagination": {
    "next_cursor": null,
    "limit": 50
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`

### Notes

Archived servers are excluded by default.

---

## API-004: POST /api/v1/servers

### Purpose

Create a monitored personal server record.

### Existing Keep Mapping

New MVP endpoint.

### Related Requirements

- REQ-008
- REQ-009
- REQ-010
- REQ-011

### Related Domain Entities

- ENT-SERVER

### Auth

Authenticated user session required.

### Request Params

None.

### Request Body

```json
{
  "name": "personal-vps",
  "host": "203.0.113.10",
  "environment": "production",
  "description": "Main personal VPS"
}
```

### Response Body

```json
{
  "data": {
    "id": "srv_123",
    "name": "personal-vps",
    "host": "203.0.113.10",
    "environment": "production",
    "description": "Main personal VPS",
    "health_state": "unknown",
    "connection_status": "pending",
    "monitoring_status": "inactive",
    "diagnosis_access_status": "not_configured",
    "last_signal_at": null,
    "last_incident_at": null,
    "last_diagnosis_at": null,
    "created_at": "2026-05-08T12:00:00Z",
    "updated_at": "2026-05-08T12:00:00Z"
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 409 `CONFLICT`

### Notes

Server creation does not imply monitoring or SSH diagnosis access is already active.

---

## API-005: GET /api/v1/servers/{server_id}

### Purpose

Get details for one monitored server.

### Existing Keep Mapping

New MVP endpoint.

### Related Requirements

- REQ-002
- REQ-006
- REQ-044

### Related Domain Entities

- ENT-SERVER

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| server_id | string | yes |

### Request Body

None.

### Response Body

```json
{
  "data": {
    "id": "srv_123",
    "name": "personal-vps",
    "host": "203.0.113.10",
    "environment": "production",
    "description": "Main personal VPS",
    "health_state": "warning",
    "connection_status": "connected",
    "monitoring_status": "active",
    "diagnosis_access_status": "connected",
    "last_signal_at": "2026-05-08T12:30:00Z",
    "last_incident_at": "2026-05-08T12:31:00Z",
    "last_diagnosis_at": "2026-05-08T12:32:00Z",
    "services_count": 3,
    "active_incidents_count": 1,
    "created_at": "2026-05-01T10:00:00Z",
    "updated_at": "2026-05-08T12:32:00Z"
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`

### Notes

The server must belong to the active tenant/workspace.

---

## API-006: PATCH /api/v1/servers/{server_id}

### Purpose

Update server metadata.

### Existing Keep Mapping

New MVP endpoint.

### Related Requirements

- REQ-010
- REQ-011
- REQ-044

### Related Domain Entities

- ENT-SERVER

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| server_id | string | yes |

### Request Body

```json
{
  "name": "personal-vps-renamed",
  "environment": "production",
  "description": "Updated description"
}
```

### Response Body

```json
{
  "data": {
    "id": "srv_123",
    "name": "personal-vps-renamed",
    "host": "203.0.113.10",
    "environment": "production",
    "description": "Updated description",
    "health_state": "warning",
    "connection_status": "connected",
    "monitoring_status": "active",
    "diagnosis_access_status": "connected",
    "updated_at": "2026-05-08T12:40:00Z"
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`

### Notes

This endpoint updates metadata only. Monitoring setup and SSH setup should be handled through integrations or future onboarding endpoints.

---

## API-007: POST /api/v1/servers/{server_id}/archive

### Purpose

Archive a server.

### Existing Keep Mapping

New MVP endpoint.

### Related Requirements

- REQ-044
- REQ-048

### Related Domain Entities

- ENT-SERVER

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| server_id | string | yes |

### Request Body

```json
{
  "reason": "Server decommissioned"
}
```

### Response Body

```json
{
  "data": {
    "id": "srv_123",
    "health_state": "archived",
    "archived_at": "2026-05-08T13:00:00Z"
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`
- 409 `CONFLICT`

### Notes

Archiving a server must not delete historical incidents, signals, diagnoses, tickets, notifications, or action runs.

---

## API-008: GET /api/v1/servers/{server_id}/services

### Purpose

List services associated with a server.

### Existing Keep Mapping

New or deferred MVP endpoint.

### Related Requirements

- REQ-002
- REQ-016

### Related Domain Entities

- ENT-SERVER
- ENT-SERVER-SERVICE

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| server_id | string | yes |

### Request Body

None.

### Response Body

```json
{
  "data": [
    {
      "id": "svc_123",
      "server_id": "srv_123",
      "name": "nginx",
      "service_type": "process",
      "expected_status": "running",
      "last_known_status": "healthy",
      "criticality": "high",
      "created_at": "2026-05-08T12:00:00Z",
      "updated_at": "2026-05-08T12:00:00Z"
    }
  ],
  "pagination": {
    "next_cursor": null,
    "limit": 50
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`

### Notes

Server services may be deferred if the first MVP only tracks server-level incidents.

---

## API-009: POST /api/v1/servers/{server_id}/services

### Purpose

Create a service record under a server.

### Existing Keep Mapping

New or deferred MVP endpoint.

### Related Requirements

- REQ-002
- REQ-016

### Related Domain Entities

- ENT-SERVER-SERVICE

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| server_id | string | yes |

### Request Body

```json
{
  "name": "nginx",
  "service_type": "process",
  "expected_status": "running",
  "criticality": "high"
}
```

### Response Body

```json
{
  "data": {
    "id": "svc_123",
    "server_id": "srv_123",
    "name": "nginx",
    "service_type": "process",
    "expected_status": "running",
    "last_known_status": "unknown",
    "criticality": "high",
    "created_at": "2026-05-08T12:00:00Z",
    "updated_at": "2026-05-08T12:00:00Z"
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`
- 409 `CONFLICT`

### Notes

Service names should be unique per server when service registration is enabled.

---

## API-010: GET /api/v1/signals

### Purpose

List signals in the active workspace.

### Existing Keep Mapping

Wraps existing `/alerts`.

### Related Requirements

- REQ-012
- REQ-013
- REQ-014

### Related Domain Entities

- ENT-SIGNAL
- ENT-SERVER
- ENT-INCIDENT

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required | Notes |
|---|---|---:|---|
| source_type | string | no | prometheus, webhook, manual_test |
| severity | string | no | info, warning, critical, unknown |
| status | string | no | received, normalized, linked, ignored, resolved, archived |
| server_id | string | no | Filter by server |
| incident_id | string | no | Filter by incident |
| is_test | boolean | no | Filter test signals |
| limit | integer | no | Default 50 |
| cursor | string | no | Pagination cursor |
| sort | string | no | received_at, severity |
| order | string | no | asc, desc |

### Request Body

None.

### Response Body

```json
{
  "data": [
    {
      "id": "sig_123",
      "source_type": "prometheus",
      "title": "Disk usage above 85%",
      "description": "Root filesystem usage is high.",
      "severity": "warning",
      "status": "linked",
      "server": {
        "id": "srv_123",
        "name": "personal-vps"
      },
      "server_service": null,
      "incident": {
        "id": "inc_123",
        "title": "Disk usage high on personal-vps"
      },
      "is_test": false,
      "received_at": "2026-05-08T12:30:00Z",
      "created_at": "2026-05-08T12:30:00Z",
      "updated_at": "2026-05-08T12:31:00Z"
    }
  ],
  "pagination": {
    "next_cursor": null,
    "limit": 50
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`

### Notes

Signals are the product-facing name for alert/feed events. Existing alert data should be normalized into this response shape over time.

---

## API-011: GET /api/v1/signals/{signal_id}

### Purpose

Get one signal.

### Existing Keep Mapping

Wraps existing `/alerts` detail behavior.

### Related Requirements

- REQ-014
- REQ-040

### Related Domain Entities

- ENT-SIGNAL

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| signal_id | string | yes |

### Request Body

None.

### Response Body

```json
{
  "data": {
    "id": "sig_123",
    "source_type": "prometheus",
    "source_integration_id": "int_123",
    "title": "Disk usage above 85%",
    "description": "Root filesystem usage is high.",
    "severity": "warning",
    "status": "linked",
    "server_id": "srv_123",
    "server_service_id": null,
    "incident_id": "inc_123",
    "is_test": false,
    "raw_payload_summary": {
      "alertname": "DiskUsageHigh",
      "instance": "personal-vps"
    },
    "normalized_summary": {
      "metric": "disk_usage_percent",
      "threshold": 85
    },
    "fingerprint": "disk_usage_high:srv_123:/",
    "received_at": "2026-05-08T12:30:00Z",
    "resolved_at": null,
    "created_at": "2026-05-08T12:30:00Z",
    "updated_at": "2026-05-08T12:31:00Z"
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`

### Notes

`raw_payload_summary` must not include secrets.

---

## API-012: POST /api/v1/signals/test

### Purpose

Create a manual test signal for onboarding.

### Existing Keep Mapping

May be implemented through existing `/alerts` creation behavior or as a new wrapper endpoint.

### Related Requirements

- REQ-043
- REQ-049

### Related Domain Entities

- ENT-TEST-SIGNAL
- ENT-SIGNAL

### Auth

Authenticated user session required.

### Request Params

None.

### Request Body

```json
{
  "server_id": "srv_123",
  "severity": "warning",
  "title": "Test disk usage signal",
  "description": "This is a test signal for onboarding."
}
```

### Response Body

```json
{
  "data": {
    "test_signal": {
      "id": "tst_123",
      "status": "generated",
      "result_summary": "Test signal generated."
    },
    "signal": {
      "id": "sig_456",
      "source_type": "manual_test",
      "title": "Test disk usage signal",
      "severity": "warning",
      "status": "received",
      "server_id": "srv_123",
      "is_test": true,
      "received_at": "2026-05-08T12:45:00Z"
    }
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`

### Notes

Test signals must be clearly distinguishable from operational signals.

---

## API-013: POST /api/v1/intake/webhook/{integration_id}

### Purpose

Receive a generic webhook signal from an external source.

### Existing Keep Mapping

Should wrap or align with existing alert/provider webhook intake behavior.

### Related Requirements

- REQ-013
- REQ-040

### Related Domain Entities

- ENT-SIGNAL
- ENT-INTEGRATION

### Auth

Integration-specific authentication required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| integration_id | string | yes |

### Request Body

```json
{
  "title": "Website unavailable",
  "description": "Health check failed for https://example.com",
  "severity": "critical",
  "server_hint": "personal-vps",
  "service_hint": "website",
  "status": "firing",
  "observed_at": "2026-05-08T12:50:00Z",
  "labels": {
    "source": "uptime-check",
    "environment": "production"
  }
}
```

### Response Body

```json
{
  "data": {
    "signal_id": "sig_789",
    "status": "received",
    "incident_id": "inc_456",
    "received_at": "2026-05-08T12:50:05Z"
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`
- 409 `INTEGRATION_NOT_CONNECTED`
- 429 `RATE_LIMITED`

### Notes

This endpoint must not expose integration secrets in responses.

---

## API-014: POST /api/v1/intake/prometheus/{integration_id}

### Purpose

Receive Prometheus-compatible alert signals.

### Existing Keep Mapping

Should wrap or align with existing alert/provider intake behavior.

### Related Requirements

- REQ-013
- REQ-040
- REQ-049

### Related Domain Entities

- ENT-SIGNAL
- ENT-INTEGRATION
- ENT-INCIDENT

### Auth

Integration-specific authentication required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| integration_id | string | yes |

### Request Body

```json
{
  "receiver": "aiops",
  "status": "firing",
  "alerts": [
    {
      "status": "firing",
      "labels": {
        "alertname": "DiskUsageHigh",
        "instance": "personal-vps",
        "severity": "warning"
      },
      "annotations": {
        "summary": "Disk usage above 85%",
        "description": "Root filesystem usage is high."
      },
      "startsAt": "2026-05-08T12:30:00Z",
      "endsAt": null,
      "fingerprint": "abc123"
    }
  ]
}
```

### Response Body

```json
{
  "data": {
    "received": 1,
    "signals": [
      {
        "id": "sig_123",
        "status": "received",
        "incident_id": "inc_123"
      }
    ]
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`
- 409 `INTEGRATION_NOT_CONNECTED`
- 429 `RATE_LIMITED`

### Notes

This endpoint should accept Prometheus Alertmanager-style payloads.

---

## API-015: GET /api/v1/incidents

### Purpose

List incidents.

### Existing Keep Mapping

Wraps existing `/incidents`.

### Related Requirements

- REQ-015
- REQ-016
- REQ-040

### Related Domain Entities

- ENT-INCIDENT
- ENT-SIGNAL
- ENT-SERVER
- ENT-DIAGNOSIS

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required | Notes |
|---|---|---:|---|
| status | string | no | open, investigating, diagnosed, action_recommended, action_taken, resolved, reopened, archived |
| severity | string | no | info, warning, critical, unknown |
| server_id | string | no | Filter by server |
| limit | integer | no | Default 50 |
| cursor | string | no | Pagination cursor |
| sort | string | no | created_at, updated_at, severity |
| order | string | no | asc, desc |

### Request Body

None.

### Response Body

```json
{
  "data": [
    {
      "id": "inc_123",
      "title": "Disk usage high on personal-vps",
      "description": "Disk usage exceeded threshold.",
      "severity": "warning",
      "status": "diagnosed",
      "server": {
        "id": "srv_123",
        "name": "personal-vps"
      },
      "server_service": null,
      "current_diagnosis": {
        "id": "dia_123",
        "status": "generated"
      },
      "recommended_next_action": "Check disk usage and identify large log files.",
      "created_at": "2026-05-08T12:31:00Z",
      "updated_at": "2026-05-08T12:32:00Z"
    }
  ],
  "pagination": {
    "next_cursor": null,
    "limit": 50
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`

### Notes

Archived incidents are excluded by default.

---

## API-016: POST /api/v1/incidents

### Purpose

Create an incident manually or from provided signal IDs.

### Existing Keep Mapping

Wraps existing `/incidents` creation behavior if present.

### Related Requirements

- REQ-015
- REQ-016
- REQ-040

### Related Domain Entities

- ENT-INCIDENT
- ENT-SIGNAL

### Auth

Authenticated user session required.

### Request Params

None.

### Request Body

```json
{
  "title": "Manual incident",
  "description": "Manual investigation for server instability.",
  "severity": "warning",
  "server_id": "srv_123",
  "server_service_id": null,
  "signal_ids": ["sig_123"]
}
```

### Response Body

```json
{
  "data": {
    "id": "inc_456",
    "title": "Manual incident",
    "description": "Manual investigation for server instability.",
    "severity": "warning",
    "status": "open",
    "server_id": "srv_123",
    "server_service_id": null,
    "current_diagnosis_id": null,
    "recommended_next_action": null,
    "created_at": "2026-05-08T13:00:00Z",
    "updated_at": "2026-05-08T13:00:00Z"
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`

### Notes

An incident must have an origin: manual creation, signal IDs, or playbook-triggered condition.

---

## API-017: GET /api/v1/incidents/{incident_id}

### Purpose

Get incident details.

### Existing Keep Mapping

Wraps existing `/incidents` detail behavior.

### Related Requirements

- REQ-016
- REQ-018
- REQ-041

### Related Domain Entities

- ENT-INCIDENT
- ENT-SIGNAL
- ENT-DIAGNOSIS
- ENT-ACTION-RUN
- ENT-TICKET
- ENT-NOTIFICATION

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| incident_id | string | yes |

### Request Body

None.

### Response Body

```json
{
  "data": {
    "id": "inc_123",
    "title": "Disk usage high on personal-vps",
    "description": "Disk usage exceeded threshold.",
    "severity": "warning",
    "status": "diagnosed",
    "server": {
      "id": "srv_123",
      "name": "personal-vps",
      "environment": "production"
    },
    "server_service": null,
    "related_signals_count": 2,
    "current_diagnosis": {
      "id": "dia_123",
      "status": "generated",
      "probable_cause": "Log files appear to be consuming disk space.",
      "uncertainty_statement": "Diagnosis is based on alert metadata and should be verified with disk diagnostics."
    },
    "recommended_next_action": "Run disk usage diagnostic.",
    "resolved_at": null,
    "created_at": "2026-05-08T12:31:00Z",
    "updated_at": "2026-05-08T12:32:00Z"
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`

### Notes

Incident details should not include full raw action outputs by default.

---

## API-018: PATCH /api/v1/incidents/{incident_id}

### Purpose

Update incident metadata.

### Existing Keep Mapping

Wraps existing `/incidents` update behavior if present.

### Related Requirements

- REQ-016
- REQ-041

### Related Domain Entities

- ENT-INCIDENT

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| incident_id | string | yes |

### Request Body

```json
{
  "title": "Disk usage high on personal-vps",
  "description": "Updated investigation notes.",
  "severity": "warning",
  "recommended_next_action": "Run disk usage diagnostic."
}
```

### Response Body

```json
{
  "data": {
    "id": "inc_123",
    "title": "Disk usage high on personal-vps",
    "description": "Updated investigation notes.",
    "severity": "warning",
    "status": "diagnosed",
    "recommended_next_action": "Run disk usage diagnostic.",
    "updated_at": "2026-05-08T13:10:00Z"
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`
- 409 `CONFLICT`

### Notes

Use dedicated endpoints for resolving or reopening incidents.

---

## API-019: POST /api/v1/incidents/{incident_id}/resolve

### Purpose

Resolve an incident.

### Existing Keep Mapping

Wraps existing incident status update behavior.

### Related Requirements

- REQ-041
- REQ-048

### Related Domain Entities

- ENT-INCIDENT
- ENT-TIMELINE-EVENT

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| incident_id | string | yes |

### Request Body

```json
{
  "resolution_summary": "Old logs were cleaned and disk usage returned to normal."
}
```

### Response Body

```json
{
  "data": {
    "id": "inc_123",
    "status": "resolved",
    "resolved_at": "2026-05-08T14:00:00Z",
    "updated_at": "2026-05-08T14:00:00Z"
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`
- 409 `CONFLICT`

### Notes

Resolving an incident should create a timeline event.

---

## API-020: POST /api/v1/incidents/{incident_id}/reopen

### Purpose

Reopen a resolved incident.

### Existing Keep Mapping

Wraps existing incident status update behavior.

### Related Requirements

- REQ-041
- REQ-048

### Related Domain Entities

- ENT-INCIDENT
- ENT-TIMELINE-EVENT

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| incident_id | string | yes |

### Request Body

```json
{
  "reason": "A related signal was received again."
}
```

### Response Body

```json
{
  "data": {
    "id": "inc_123",
    "status": "reopened",
    "updated_at": "2026-05-08T15:00:00Z"
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`
- 409 `CONFLICT`

### Notes

Reopening should create a timeline event.

---

## API-021: GET /api/v1/incidents/{incident_id}/timeline

### Purpose

List incident timeline events.

### Existing Keep Mapping

May wrap existing incident event/audit behavior or require a new product-level timeline endpoint.

### Related Requirements

- REQ-041
- REQ-042

### Related Domain Entities

- ENT-TIMELINE-EVENT
- ENT-INCIDENT

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required | Notes |
|---|---|---:|---|
| incident_id | string | yes | Path parameter |
| limit | integer | no | Default 100 |
| cursor | string | no | Pagination cursor |

### Request Body

None.

### Response Body

```json
{
  "data": [
    {
      "id": "tle_123",
      "event_type": "diagnosis_generated",
      "actor_type": "ai",
      "actor_id": null,
      "summary": "AI diagnosis generated with probable disk pressure cause.",
      "related_entity_type": "diagnosis",
      "related_entity_id": "dia_123",
      "occurred_at": "2026-05-08T12:32:00Z",
      "created_at": "2026-05-08T12:32:00Z"
    }
  ],
  "pagination": {
    "next_cursor": null,
    "limit": 100
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`

### Notes

Timeline is required for closed-loop traceability.

---

## API-022: POST /api/v1/incidents/{incident_id}/signals

### Purpose

Link a signal to an incident.

### Existing Keep Mapping

May wrap existing incident-alert association behavior or require a new product wrapper.

### Related Requirements

- REQ-015
- REQ-040
- REQ-041

### Related Domain Entities

- ENT-INCIDENT
- ENT-SIGNAL

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| incident_id | string | yes |

### Request Body

```json
{
  "signal_id": "sig_123",
  "linked_reason": "manual"
}
```

### Response Body

```json
{
  "data": {
    "incident_id": "inc_123",
    "signal_id": "sig_123",
    "linked_reason": "manual",
    "linked_at": "2026-05-08T13:20:00Z"
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`
- 409 `CONFLICT`

### Notes

The same signal should not be linked to the same incident more than once.

---

## API-023: GET /api/v1/incidents/{incident_id}/diagnoses

### Purpose

List diagnoses for an incident.

### Existing Keep Mapping

Wraps or coordinates with existing `/ai` route and any existing AI suggestion models.

### Related Requirements

- REQ-017
- REQ-018
- REQ-019
- REQ-020

### Related Domain Entities

- ENT-DIAGNOSIS
- ENT-EVIDENCE

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| incident_id | string | yes |

### Request Body

None.

### Response Body

```json
{
  "data": [
    {
      "id": "dia_123",
      "incident_id": "inc_123",
      "status": "generated",
      "probable_cause": "Log files appear to be consuming disk space.",
      "impact": "The server may become unstable if disk usage continues growing.",
      "risk_notes": "Do not delete files without verifying paths.",
      "uncertainty_statement": "Diagnosis should be verified with disk usage diagnostics.",
      "is_current": true,
      "generated_at": "2026-05-08T12:32:00Z",
      "created_at": "2026-05-08T12:32:00Z"
    }
  ],
  "pagination": {
    "next_cursor": null,
    "limit": 50
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`

### Notes

Older diagnoses may be superseded but should remain visible as history.

---

## API-024: POST /api/v1/incidents/{incident_id}/diagnoses

### Purpose

Request AI diagnosis for an incident.

### Existing Keep Mapping

Uses or wraps existing `/ai` route capabilities.

### Related Requirements

- REQ-017
- REQ-018
- REQ-019
- REQ-020
- REQ-021
- REQ-022

### Related Domain Entities

- ENT-DIAGNOSIS
- ENT-EVIDENCE
- ENT-INCIDENT

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| incident_id | string | yes |

### Request Body

```json
{
  "integration_id": "int_ai_123",
  "include_action_results": true,
  "include_timeline": true,
  "mode": "standard"
}
```

### Response Body

```json
{
  "data": {
    "id": "dia_456",
    "incident_id": "inc_123",
    "status": "requested",
    "is_current": false,
    "created_at": "2026-05-08T13:30:00Z"
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`
- 409 `INTEGRATION_NOT_CONNECTED`
- 422 `INSUFFICIENT_EVIDENCE`
- 502 `EXTERNAL_SERVICE_ERROR`

### Notes

Diagnosis generation may complete asynchronously.

---

## API-025: GET /api/v1/diagnoses/{diagnosis_id}

### Purpose

Get diagnosis details, including evidence.

### Existing Keep Mapping

Uses or wraps existing `/ai` capabilities and AI-related storage.

### Related Requirements

- REQ-018
- REQ-019
- REQ-020

### Related Domain Entities

- ENT-DIAGNOSIS
- ENT-EVIDENCE

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| diagnosis_id | string | yes |

### Request Body

None.

### Response Body

```json
{
  "data": {
    "id": "dia_123",
    "incident_id": "inc_123",
    "status": "generated",
    "probable_cause": "Log files appear to be consuming disk space.",
    "evidence_summary": "Signal reported disk usage above 85%. No cleanup action has been recorded yet.",
    "impact": "The server may become unstable if disk usage continues growing.",
    "recommended_actions": [
      {
        "title": "Run disk usage diagnostic",
        "risk_level": "read_only"
      }
    ],
    "verification_steps": [
      "Check disk usage by mount point.",
      "Identify largest directories under log paths."
    ],
    "risk_notes": "Avoid deleting files before verifying paths.",
    "uncertainty_statement": "Diagnosis should be verified with read-only diagnostics.",
    "model_label": "qwen-compatible",
    "is_current": true,
    "evidence": [
      {
        "id": "evd_123",
        "evidence_type": "signal",
        "summary": "Disk usage signal received from Prometheus.",
        "observed_at": "2026-05-08T12:30:00Z"
      }
    ],
    "generated_at": "2026-05-08T12:32:00Z",
    "created_at": "2026-05-08T12:32:00Z",
    "updated_at": "2026-05-08T12:32:00Z"
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`

### Notes

Evidence and inference must remain clearly separated.

---

## API-026: GET /api/v1/playbooks

### Purpose

List playbooks.

### Existing Keep Mapping

Wraps existing `/workflows`.

### Related Requirements

- REQ-030
- REQ-031
- REQ-032
- REQ-046

### Related Domain Entities

- ENT-PLAYBOOK

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| status | string | no |
| problem_type | string | no |
| limit | integer | no |
| cursor | string | no |

### Request Body

None.

### Response Body

```json
{
  "data": [
    {
      "id": "pbk_123",
      "name": "Disk Usage High",
      "problem_type": "disk_usage_high",
      "status": "enabled",
      "notification_enabled": true,
      "ticket_enabled": false,
      "action_policy": "read_only_only",
      "created_at": "2026-05-08T10:00:00Z",
      "updated_at": "2026-05-08T10:00:00Z"
    }
  ],
  "pagination": {
    "next_cursor": null,
    "limit": 50
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`

### Notes

Only personal-server-oriented playbooks should be exposed in the MVP.

---

## API-027: POST /api/v1/playbooks

### Purpose

Create a playbook.

### Existing Keep Mapping

Wraps existing `/workflows` creation behavior.

### Related Requirements

- REQ-030
- REQ-031
- REQ-032

### Related Domain Entities

- ENT-PLAYBOOK

### Auth

Authenticated user session required.

### Request Params

None.

### Request Body

```json
{
  "name": "Disk Usage High",
  "problem_type": "disk_usage_high",
  "status": "enabled",
  "trigger_summary": {
    "severity": "warning",
    "signal_title_contains": "disk"
  },
  "diagnostic_steps_summary": [
    "Generate AI diagnosis",
    "Suggest disk usage diagnostic"
  ],
  "notification_enabled": true,
  "ticket_enabled": false,
  "action_policy": "read_only_only"
}
```

### Response Body

```json
{
  "data": {
    "id": "pbk_123",
    "name": "Disk Usage High",
    "problem_type": "disk_usage_high",
    "status": "enabled",
    "trigger_summary": {
      "severity": "warning",
      "signal_title_contains": "disk"
    },
    "diagnostic_steps_summary": [
      "Generate AI diagnosis",
      "Suggest disk usage diagnostic"
    ],
    "notification_enabled": true,
    "ticket_enabled": false,
    "action_policy": "read_only_only",
    "created_at": "2026-05-08T10:00:00Z",
    "updated_at": "2026-05-08T10:00:00Z"
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 409 `CONFLICT`

### Notes

Playbooks exposed in the MVP must map to personal-server operational problems.

---

## API-028: GET /api/v1/playbooks/{playbook_id}

### Purpose

Get playbook details.

### Existing Keep Mapping

Wraps existing `/workflows` detail behavior.

### Related Requirements

- REQ-030
- REQ-032

### Related Domain Entities

- ENT-PLAYBOOK

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| playbook_id | string | yes |

### Request Body

None.

### Response Body

```json
{
  "data": {
    "id": "pbk_123",
    "name": "Disk Usage High",
    "problem_type": "disk_usage_high",
    "status": "enabled",
    "trigger_summary": {
      "severity": "warning",
      "signal_title_contains": "disk"
    },
    "diagnostic_steps_summary": [
      "Generate AI diagnosis",
      "Suggest disk usage diagnostic"
    ],
    "notification_enabled": true,
    "ticket_enabled": false,
    "action_policy": "read_only_only",
    "created_at": "2026-05-08T10:00:00Z",
    "updated_at": "2026-05-08T10:00:00Z"
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`

### Notes

Do not expose non-MVP workflow marketplace templates.

---

## API-029: PATCH /api/v1/playbooks/{playbook_id}

### Purpose

Update a playbook.

### Existing Keep Mapping

Wraps existing `/workflows` update behavior.

### Related Requirements

- REQ-030
- REQ-032

### Related Domain Entities

- ENT-PLAYBOOK

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| playbook_id | string | yes |

### Request Body

```json
{
  "name": "Disk Usage High",
  "status": "enabled",
  "notification_enabled": true,
  "ticket_enabled": true,
  "action_policy": "approval_required_allowed"
}
```

### Response Body

```json
{
  "data": {
    "id": "pbk_123",
    "name": "Disk Usage High",
    "status": "enabled",
    "notification_enabled": true,
    "ticket_enabled": true,
    "action_policy": "approval_required_allowed",
    "updated_at": "2026-05-08T11:00:00Z"
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`
- 409 `CONFLICT`

### Notes

Playbook updates must not enable unsafe automatic actions.

---

## API-030: POST /api/v1/playbooks/{playbook_id}/run

### Purpose

Run a playbook manually for a signal or incident.

### Existing Keep Mapping

Wraps existing `/workflows` execution behavior.

### Related Requirements

- REQ-032
- REQ-040

### Related Domain Entities

- ENT-PLAYBOOK
- ENT-PLAYBOOK-RUN
- ENT-INCIDENT
- ENT-SIGNAL

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| playbook_id | string | yes |

### Request Body

```json
{
  "incident_id": "inc_123",
  "signal_id": null
}
```

### Response Body

```json
{
  "data": {
    "id": "pbr_123",
    "playbook_id": "pbk_123",
    "incident_id": "inc_123",
    "signal_id": null,
    "status": "triggered",
    "result_summary": null,
    "created_at": "2026-05-08T13:40:00Z",
    "updated_at": "2026-05-08T13:40:00Z"
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`
- 409 `CONFLICT`

### Notes

At least one of `incident_id` or `signal_id` must be provided.

---

## API-031: GET /api/v1/playbook-runs/{playbook_run_id}

### Purpose

Get playbook run details.

### Existing Keep Mapping

Wraps existing workflow execution details.

### Related Requirements

- REQ-032
- REQ-041

### Related Domain Entities

- ENT-PLAYBOOK-RUN

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| playbook_run_id | string | yes |

### Request Body

None.

### Response Body

```json
{
  "data": {
    "id": "pbr_123",
    "playbook_id": "pbk_123",
    "incident_id": "inc_123",
    "signal_id": null,
    "status": "completed",
    "result_summary": "Diagnosis generated and notification sent.",
    "started_at": "2026-05-08T13:40:01Z",
    "completed_at": "2026-05-08T13:40:30Z",
    "steps": [
      {
        "id": "pbs_123",
        "step_type": "diagnosis",
        "status": "completed",
        "summary": "AI diagnosis generated.",
        "related_entity_type": "diagnosis",
        "related_entity_id": "dia_123"
      }
    ],
    "created_at": "2026-05-08T13:40:00Z",
    "updated_at": "2026-05-08T13:40:30Z"
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`

### Notes

A playbook run may be partially completed.

---

## API-032: GET /api/v1/actions

### Purpose

List available actions.

### Existing Keep Mapping

Wraps existing `/actions`.

### Related Requirements

- REQ-025
- REQ-026
- REQ-027
- REQ-047

### Related Domain Entities

- ENT-ACTION

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| category | string | no |
| target_type | string | no |
| risk_level | string | no |
| enabled | boolean | no |
| limit | integer | no |
| cursor | string | no |

### Request Body

None.

### Response Body

```json
{
  "data": [
    {
      "id": "act_123",
      "name": "Check disk usage",
      "description": "Collect disk usage information from the target server.",
      "category": "diagnostics",
      "target_type": "server",
      "risk_level": "read_only",
      "approval_required": false,
      "enabled": true
    }
  ],
  "pagination": {
    "next_cursor": null,
    "limit": 50
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`

### Notes

Every exposed action must have a risk level.

---

## API-033: GET /api/v1/actions/{action_id}

### Purpose

Get action details.

### Existing Keep Mapping

Wraps existing `/actions` detail behavior.

### Related Requirements

- REQ-025
- REQ-026
- REQ-027
- REQ-047

### Related Domain Entities

- ENT-ACTION

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| action_id | string | yes |

### Request Body

None.

### Response Body

```json
{
  "data": {
    "id": "act_123",
    "name": "Check disk usage",
    "description": "Collect disk usage information from the target server.",
    "category": "diagnostics",
    "target_type": "server",
    "risk_level": "read_only",
    "approval_required": false,
    "enabled": true,
    "created_at": "2026-05-08T10:00:00Z",
    "updated_at": "2026-05-08T10:00:00Z"
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`

### Notes

Action details must clearly communicate safety.

---

## API-034: POST /api/v1/action-runs

### Purpose

Request an action run.

### Existing Keep Mapping

Wraps existing `/actions` execution behavior, but must add personal-server action safety semantics if missing.

### Related Requirements

- REQ-025
- REQ-026
- REQ-027
- REQ-028
- REQ-029
- REQ-042
- REQ-047
- REQ-048

### Related Domain Entities

- ENT-ACTION
- ENT-ACTION-RUN
- ENT-APPROVAL
- ENT-SERVER
- ENT-INCIDENT

### Auth

Authenticated user session required.

### Request Params

None.

### Request Body

```json
{
  "action_id": "act_123",
  "incident_id": "inc_123",
  "server_id": "srv_123",
  "server_service_id": null,
  "reason": "Collect disk usage evidence for diagnosis."
}
```

### Response Body

```json
{
  "data": {
    "id": "arun_123",
    "action_id": "act_123",
    "incident_id": "inc_123",
    "server_id": "srv_123",
    "server_service_id": null,
    "status": "running",
    "risk_level_at_run": "read_only",
    "approval_required": false,
    "result_summary": null,
    "requested_at": "2026-05-08T13:50:00Z",
    "started_at": "2026-05-08T13:50:01Z",
    "completed_at": null,
    "created_at": "2026-05-08T13:50:00Z",
    "updated_at": "2026-05-08T13:50:01Z"
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`
- 409 `ACTION_APPROVAL_REQUIRED`
- 409 `UNSAFE_ACTION_BLOCKED`
- 409 `INTEGRATION_NOT_CONNECTED`

### Notes

Approval-required actions should create an action run in `waiting_for_approval` state instead of executing immediately.

---

## API-035: GET /api/v1/action-runs/{action_run_id}

### Purpose

Get action run details.

### Existing Keep Mapping

Wraps existing action execution result behavior or adds a product wrapper.

### Related Requirements

- REQ-042
- REQ-047
- REQ-048

### Related Domain Entities

- ENT-ACTION-RUN
- ENT-ACTION

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| action_run_id | string | yes |

### Request Body

None.

### Response Body

```json
{
  "data": {
    "id": "arun_123",
    "action": {
      "id": "act_123",
      "name": "Check disk usage",
      "risk_level": "read_only"
    },
    "incident_id": "inc_123",
    "server_id": "srv_123",
    "status": "completed",
    "risk_level_at_run": "read_only",
    "result_summary": "Disk usage collected successfully.",
    "output_excerpt": "Filesystem Size Used Avail Use% Mounted on ...",
    "error_summary": null,
    "requested_at": "2026-05-08T13:50:00Z",
    "started_at": "2026-05-08T13:50:01Z",
    "completed_at": "2026-05-08T13:50:03Z",
    "created_at": "2026-05-08T13:50:00Z",
    "updated_at": "2026-05-08T13:50:03Z"
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`

### Notes

`output_excerpt` must be limited and treated as sensitive operational data.

---

## API-036: POST /api/v1/action-runs/{action_run_id}/approve

### Purpose

Approve an approval-required action run.

### Existing Keep Mapping

Likely new MVP safety endpoint unless existing action approval semantics already exist.

### Related Requirements

- REQ-028
- REQ-047
- REQ-048

### Related Domain Entities

- ENT-ACTION-RUN
- ENT-APPROVAL

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| action_run_id | string | yes |

### Request Body

```json
{
  "decision_note": "Approved after reviewing diagnosis and target server."
}
```

### Response Body

```json
{
  "data": {
    "action_run_id": "arun_123",
    "approval": {
      "id": "app_123",
      "status": "approved",
      "decision_note": "Approved after reviewing diagnosis and target server.",
      "decided_at": "2026-05-08T14:10:00Z"
    },
    "action_run_status": "approved"
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`
- 409 `CONFLICT`

### Notes

Approval does not guarantee immediate completion. Execution may continue asynchronously.

---

## API-037: POST /api/v1/action-runs/{action_run_id}/reject

### Purpose

Reject an approval-required action run.

### Existing Keep Mapping

Likely new MVP safety endpoint unless existing action approval semantics already exist.

### Related Requirements

- REQ-028
- REQ-029
- REQ-048

### Related Domain Entities

- ENT-ACTION-RUN
- ENT-APPROVAL

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| action_run_id | string | yes |

### Request Body

```json
{
  "decision_note": "Not safe to execute during active service traffic."
}
```

### Response Body

```json
{
  "data": {
    "action_run_id": "arun_123",
    "approval": {
      "id": "app_123",
      "status": "rejected",
      "decision_note": "Not safe to execute during active service traffic.",
      "decided_at": "2026-05-08T14:12:00Z"
    },
    "action_run_status": "rejected"
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`
- 409 `CONFLICT`

### Notes

Rejected action runs must not execute.

---

## API-038: GET /api/v1/integrations

### Purpose

List MVP integrations.

### Existing Keep Mapping

Wraps existing `/providers`.

### Related Requirements

- REQ-033
- REQ-034
- REQ-035
- REQ-036
- REQ-045

### Related Domain Entities

- ENT-INTEGRATION

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| category | string | no |
| enabled | boolean | no |

### Request Body

None.

### Response Body

```json
{
  "data": [
    {
      "id": "int_123",
      "name": "Prometheus",
      "provider_key": "prometheus",
      "category": "monitoring",
      "enabled": true,
      "connection_status": "connected",
      "config_summary": {
        "display_name": "Prometheus alerts"
      },
      "last_validated_at": "2026-05-08T10:00:00Z",
      "created_at": "2026-05-08T09:00:00Z",
      "updated_at": "2026-05-08T10:00:00Z"
    }
  ]
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`

### Notes

Only MVP integrations should be exposed in the primary product experience.

---

## API-039: POST /api/v1/integrations

### Purpose

Create or configure an integration.

### Existing Keep Mapping

Wraps existing `/providers` configuration behavior.

### Related Requirements

- REQ-034
- REQ-035
- REQ-036

### Related Domain Entities

- ENT-INTEGRATION

### Auth

Authenticated user session required.

### Request Params

None.

### Request Body

```json
{
  "name": "Prometheus",
  "provider_key": "prometheus",
  "category": "monitoring",
  "enabled": true,
  "config": {
    "display_name": "Prometheus alerts"
  }
}
```

### Response Body

```json
{
  "data": {
    "id": "int_123",
    "name": "Prometheus",
    "provider_key": "prometheus",
    "category": "monitoring",
    "enabled": true,
    "connection_status": "configured",
    "config_summary": {
      "display_name": "Prometheus alerts"
    },
    "last_validated_at": null,
    "created_at": "2026-05-08T09:00:00Z",
    "updated_at": "2026-05-08T09:00:00Z"
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 409 `CONFLICT`

### Notes

The request may include sensitive config fields, but the response must return only non-sensitive `config_summary`.

---

## API-040: GET /api/v1/integrations/{integration_id}

### Purpose

Get integration details.

### Existing Keep Mapping

Wraps existing `/providers` detail behavior.

### Related Requirements

- REQ-034
- REQ-035
- REQ-036

### Related Domain Entities

- ENT-INTEGRATION

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| integration_id | string | yes |

### Request Body

None.

### Response Body

```json
{
  "data": {
    "id": "int_123",
    "name": "Prometheus",
    "provider_key": "prometheus",
    "category": "monitoring",
    "enabled": true,
    "connection_status": "connected",
    "config_summary": {
      "display_name": "Prometheus alerts"
    },
    "last_validated_at": "2026-05-08T10:00:00Z",
    "created_at": "2026-05-08T09:00:00Z",
    "updated_at": "2026-05-08T10:00:00Z"
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`

### Notes

Do not return secrets.

---

## API-041: PATCH /api/v1/integrations/{integration_id}

### Purpose

Update integration settings.

### Existing Keep Mapping

Wraps existing `/providers` update behavior.

### Related Requirements

- REQ-034
- REQ-035
- REQ-036

### Related Domain Entities

- ENT-INTEGRATION

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| integration_id | string | yes |

### Request Body

```json
{
  "name": "Prometheus alerts",
  "enabled": true,
  "config": {
    "display_name": "Prometheus alerts"
  }
}
```

### Response Body

```json
{
  "data": {
    "id": "int_123",
    "name": "Prometheus alerts",
    "provider_key": "prometheus",
    "category": "monitoring",
    "enabled": true,
    "connection_status": "configured",
    "config_summary": {
      "display_name": "Prometheus alerts"
    },
    "updated_at": "2026-05-08T10:30:00Z"
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`

### Notes

Sensitive config values must never be echoed in the response.

---

## API-042: POST /api/v1/integrations/{integration_id}/validate

### Purpose

Validate an integration connection.

### Existing Keep Mapping

Wraps or adds to existing `/providers` validation behavior.

### Related Requirements

- REQ-034
- REQ-035
- REQ-036

### Related Domain Entities

- ENT-INTEGRATION

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| integration_id | string | yes |

### Request Body

```json
{
  "validation_type": "connection"
}
```

### Response Body

```json
{
  "data": {
    "integration_id": "int_123",
    "connection_status": "connected",
    "last_validated_at": "2026-05-08T10:35:00Z",
    "result_summary": "Integration validated successfully."
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`
- 502 `EXTERNAL_SERVICE_ERROR`

### Notes

Validation errors should be actionable and redacted.

---

## API-043: POST /api/v1/integrations/{integration_id}/disable

### Purpose

Disable an integration.

### Existing Keep Mapping

Wraps existing `/providers` disable/delete behavior if available.

### Related Requirements

- REQ-034
- REQ-035
- REQ-036

### Related Domain Entities

- ENT-INTEGRATION

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| integration_id | string | yes |

### Request Body

```json
{
  "reason": "No longer used"
}
```

### Response Body

```json
{
  "data": {
    "id": "int_123",
    "enabled": false,
    "connection_status": "disabled",
    "updated_at": "2026-05-08T10:40:00Z"
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`
- 409 `CONFLICT`

### Notes

Disabled integrations must not be used for new active operations.

---

## API-044: GET /api/v1/incidents/{incident_id}/notifications

### Purpose

List notifications for an incident.

### Existing Keep Mapping

May be implemented through existing provider/action execution records or as a new product wrapper.

### Related Requirements

- REQ-023
- REQ-040
- REQ-041

### Related Domain Entities

- ENT-NOTIFICATION
- ENT-INCIDENT

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| incident_id | string | yes |

### Request Body

None.

### Response Body

```json
{
  "data": [
    {
      "id": "ntf_123",
      "incident_id": "inc_123",
      "channel": "email",
      "destination_summary": "user@example.com",
      "status": "sent",
      "subject": "Incident: Disk usage high on personal-vps",
      "message_summary": "AI diagnosis and recommended action sent.",
      "failure_reason": null,
      "sent_at": "2026-05-08T13:00:00Z",
      "created_at": "2026-05-08T13:00:00Z"
    }
  ],
  "pagination": {
    "next_cursor": null,
    "limit": 50
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`

### Notes

Destination summaries must not expose credentials.

---

## API-045: POST /api/v1/incidents/{incident_id}/notifications

### Purpose

Send a notification for an incident.

### Existing Keep Mapping

May be implemented through existing provider/action capabilities or as a new product wrapper.

### Related Requirements

- REQ-023
- REQ-040
- REQ-041

### Related Domain Entities

- ENT-NOTIFICATION
- ENT-INCIDENT

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| incident_id | string | yes |

### Request Body

```json
{
  "integration_id": "int_smtp_123",
  "channel": "email",
  "subject": "Incident: Disk usage high on personal-vps",
  "message": "Please review the incident and AI diagnosis."
}
```

### Response Body

```json
{
  "data": {
    "id": "ntf_456",
    "incident_id": "inc_123",
    "channel": "email",
    "destination_summary": "configured email recipient",
    "status": "pending",
    "subject": "Incident: Disk usage high on personal-vps",
    "message_summary": "Please review the incident and AI diagnosis.",
    "created_at": "2026-05-08T13:05:00Z"
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`
- 409 `INTEGRATION_NOT_CONNECTED`
- 502 `EXTERNAL_SERVICE_ERROR`

### Notes

Notification sending may complete asynchronously.

---

## API-046: GET /api/v1/incidents/{incident_id}/tickets

### Purpose

List tickets linked to an incident.

### Existing Keep Mapping

May be implemented through provider/action execution records or as a new product wrapper.

### Related Requirements

- REQ-024
- REQ-040
- REQ-041

### Related Domain Entities

- ENT-TICKET
- ENT-INCIDENT

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| incident_id | string | yes |

### Request Body

None.

### Response Body

```json
{
  "data": [
    {
      "id": "tkt_123",
      "incident_id": "inc_123",
      "provider": "github",
      "external_reference": "42",
      "external_url": "https://example.invalid/issues/42",
      "status": "created",
      "title": "Disk usage high on personal-vps",
      "summary": "Issue created from incident.",
      "failure_reason": null,
      "created_external_at": "2026-05-08T13:10:00Z",
      "created_at": "2026-05-08T13:10:00Z",
      "updated_at": "2026-05-08T13:10:00Z"
    }
  ],
  "pagination": {
    "next_cursor": null,
    "limit": 50
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`

### Notes

External URLs are workspace-scoped operational data.

---

## API-047: POST /api/v1/incidents/{incident_id}/tickets

### Purpose

Create a GitHub issue or Jira ticket for an incident.

### Existing Keep Mapping

May be implemented through existing provider/action capabilities or as a new product wrapper.

### Related Requirements

- REQ-024
- REQ-040
- REQ-041

### Related Domain Entities

- ENT-TICKET
- ENT-INCIDENT

### Auth

Authenticated user session required.

### Request Params

| Param | Type | Required |
|---|---|---:|
| incident_id | string | yes |

### Request Body

```json
{
  "integration_id": "int_github_123",
  "provider": "github",
  "title": "Disk usage high on personal-vps",
  "summary": "Track remediation for disk usage incident."
}
```

### Response Body

```json
{
  "data": {
    "id": "tkt_456",
    "incident_id": "inc_123",
    "provider": "github",
    "external_reference": null,
    "external_url": null,
    "status": "creation_requested",
    "title": "Disk usage high on personal-vps",
    "summary": "Track remediation for disk usage incident.",
    "created_at": "2026-05-08T13:15:00Z",
    "updated_at": "2026-05-08T13:15:00Z"
  }
}
```

### Errors

- 400 `VALIDATION_ERROR`
- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 404 `NOT_FOUND`
- 409 `INTEGRATION_NOT_CONNECTED`
- 502 `EXTERNAL_SERVICE_ERROR`

### Notes

Ticket creation may complete asynchronously. The response must not expose provider tokens.

---

## API-048: GET /api/v1/healthcheck

### Purpose

Return service health.

### Existing Keep Mapping

Wraps or aliases existing `/healthcheck`.

### Related Requirements

- Supports operational readiness.

### Related Domain Entities

None directly.

### Auth

May be public or authenticated depending on deployment policy.

### Request Params

None.

### Request Body

None.

### Response Body

```json
{
  "data": {
    "status": "ok",
    "version": "unknown"
  }
}
```

### Errors

- 500 `INTERNAL_ERROR`

### Notes

This endpoint should remain lightweight and should not expose sensitive configuration.

---

## API-049: GET /api/v1/status

### Purpose

Return system status information.

### Existing Keep Mapping

Wraps or aliases existing `/status`.

### Related Requirements

- Supports operational visibility.

### Related Domain Entities

None directly.

### Auth

Authenticated user session recommended for non-basic status.

### Request Params

None.

### Request Body

None.

### Response Body

```json
{
  "data": {
    "status": "running",
    "components": {
      "api": "ok",
      "database": "ok",
      "scheduler": "unknown",
      "consumer": "unknown"
    }
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`
- 500 `INTERNAL_ERROR`

### Notes

Do not expose internal secrets or infrastructure details.

---

## API-050: GET /api/v1/settings

### Purpose

Return product settings relevant to the lightweight MVP.

### Existing Keep Mapping

Wraps existing `/settings`.

### Related Requirements

- REQ-003
- REQ-004
- REQ-034
- REQ-038
- REQ-045
- REQ-046

Secondary relevance note:

- REQ-021 (AI provider configuration context)
- REQ-033 (integration terminology context)
- REQ-039 (minimal onboarding context)

### Related Domain Entities

- ENT-INTEGRATION
- ENT-WORKSPACE

### Auth

Authenticated user session required.

### Request Params

None.

### Request Body

None.

### Response Body

```json
{
  "data": {
    "product_mode": "personal_server_mvp",
    "enabled_pages": [
      "overview",
      "servers",
      "incidents",
      "signals",
      "playbooks",
      "actions",
      "integrations",
      "settings"
    ],
    "enabled_integrations": [
      "prometheus",
      "webhook",
      "qwen",
      "ollama",
      "smtp",
      "github",
      "jira",
      "ssh"
    ],
    "enabled_advanced_features": []
  }
}
```

### Errors

- 401 `AUTHENTICATION_REQUIRED`
- 403 `FORBIDDEN`

### Notes

Settings must not return raw secrets.

---

## 13. Pagination

### PAGE-001: Cursor pagination for new MVP endpoints

New MVP list endpoints use cursor pagination:

```text
limit
cursor
```

Response shape:

```json
{
  "pagination": {
    "next_cursor": "opaque_cursor_or_null",
    "limit": 50
  }
}
```

### PAGE-002: Default limit

Default limit is 50.

### PAGE-003: Maximum limit

Maximum limit is 100.

### PAGE-004: Existing Keep pagination

Existing Keep endpoints may use their current pagination behavior. Product-facing wrappers should normalize pagination over time.

### PAGE-005: Cursor opacity

Cursors are opaque strings. Clients must not parse them.

---

## 14. Filtering

### FILTER-001: Explicit filters only

Filtering must use documented query parameters.

### FILTER-002: Server filters

Server lists support:

- `health_state`
- `environment`

### FILTER-003: Signal filters

Signal lists support:

- `source_type`
- `severity`
- `status`
- `server_id`
- `incident_id`
- `is_test`

### FILTER-004: Incident filters

Incident lists support:

- `status`
- `severity`
- `server_id`

### FILTER-005: Integration filters

Integration lists support:

- `category`
- `enabled`

### FILTER-006: Action filters

Action lists support:

- `category`
- `target_type`
- `risk_level`
- `enabled`

### FILTER-007: Unknown filters

Unknown filters should return `VALIDATION_ERROR` in new MVP endpoints.

---

## 15. Sorting

### SORT-001: Common shape

Sorting uses:

```text
sort=<field>&order=<asc|desc>
```

### SORT-002: Default order

Default order is descending by the most relevant time field.

Examples:

- Signals default to `received_at desc`.
- Incidents default to `updated_at desc`.
- Servers default to `updated_at desc`.

### SORT-003: Unknown sort fields

Unknown sort fields return `VALIDATION_ERROR`.

### SORT-004: Stable sort

List endpoints should use a stable secondary sort by `id` when needed.

---

## 16. Idempotency

### IDEMP-001: Header

Side-effecting mutation endpoints may accept:

```text
Idempotency-Key
```

### IDEMP-002: Recommended endpoints

Idempotency is recommended for:

- `POST /api/v1/incidents/{incident_id}/notifications`
- `POST /api/v1/incidents/{incident_id}/tickets`
- `POST /api/v1/action-runs`
- `POST /api/v1/playbooks/{playbook_id}/run`
- `POST /api/v1/incidents/{incident_id}/diagnoses`
- External signal intake endpoints when upstream retries are expected.

### IDEMP-003: Duplicate behavior

Repeated requests with the same idempotency key and same effective body should return the original result.

### IDEMP-004: Conflict behavior

Repeated requests with the same idempotency key and a different effective body return HTTP `409`.

Response:

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Idempotency key was already used with a different request.",
    "details": {}
  }
}
```

---

## 17. Rate Limiting, if applicable

### RATE-001: Existing limiter

The existing backend has limiter support. MVP APIs may use it where appropriate.

### RATE-002: User-facing APIs

Authenticated APIs may have moderate rate limits suitable for personal-server deployments.

### RATE-003: Intake APIs

Signal intake APIs should have stricter rate limits than authenticated UI APIs.

### RATE-004: AI diagnosis

AI diagnosis requests should be rate limited to avoid unexpected cost or resource usage.

### RATE-005: Action execution

Action run requests should be rate limited to avoid accidental repeated execution.

### RATE-006: Rate limit response

HTTP status:

```text
429 Too Many Requests
```

Response:

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retry_after_seconds": 60
    }
  }
}
```

### RATE-007: Exact limits

Exact numeric limits are not decided in this document.

---

## 18. API Versioning, if applicable

### VERSION-001: Existing unversioned routes

Existing Keep routes are currently unversioned.

### VERSION-002: New product route preference

New product-facing APIs should use:

```text
/api/v1
```

### VERSION-003: Migration strategy

During migration, `/api/v1/*` may wrap existing unversioned routes.

### VERSION-004: Breaking changes

Breaking API changes require a new version path.

### VERSION-005: Non-breaking changes

Adding optional response fields is non-breaking.

### VERSION-006: Field removal

Removing or renaming response fields is breaking.

---

## 19. Sensitive Field Policy

### SENS-001: No secret response fields

API responses must not include:

- API keys
- Provider tokens
- SMTP passwords
- SSH private keys
- Webhook secrets
- AI provider credentials
- Raw authorization headers

### SENS-002: Config summaries only

Integration responses may include `config_summary`, but only non-sensitive display data.

### SENS-003: Action output sensitivity

Action output must be returned only as limited `output_excerpt` or summarized result.

### SENS-004: Raw payload minimization

Signal responses may include `raw_payload_summary`, not full raw payloads by default.

### SENS-005: Error redaction

Errors must not expose secrets.

### SENS-006: Ticket URLs

External ticket URLs may be returned but are workspace-scoped operational data.

### SENS-007: Diagnosis data

Diagnosis content may contain operational details and must require authentication and authorization.

### SENS-008: Request secrets

Some integration configuration requests may contain secrets, but responses must not echo them.

---

## 20. Mapping to Requirements and Domain Entities

| API ID | Main Requirements | Main Domain Entities | Existing Keep Route |
|---|---|---|---|
| API-001 | REQ-039, REQ-050 | ENT-USER, ENT-WORKSPACE | `/whoami` |
| API-002 | REQ-005, REQ-039, REQ-050 | ENT-SERVER, ENT-SIGNAL, ENT-INCIDENT | new / dashboard-derived |
| API-003 | REQ-002, REQ-006, REQ-044 | ENT-SERVER | new |
| API-004 | REQ-008, REQ-009, REQ-010 | ENT-SERVER | new |
| API-005 | REQ-002, REQ-006, REQ-044 | ENT-SERVER | new |
| API-006 | REQ-010, REQ-011 | ENT-SERVER | new |
| API-007 | REQ-044, REQ-048 | ENT-SERVER | new |
| API-008 | REQ-002, REQ-016 | ENT-SERVER-SERVICE | new |
| API-009 | REQ-002, REQ-016 | ENT-SERVER-SERVICE | new |
| API-010 | REQ-012, REQ-013, REQ-014 | ENT-SIGNAL | `/alerts` |
| API-011 | REQ-014, REQ-040 | ENT-SIGNAL | `/alerts` |
| API-012 | REQ-043, REQ-049 | ENT-TEST-SIGNAL, ENT-SIGNAL | `/alerts` or new |
| API-013 | REQ-013, REQ-040 | ENT-SIGNAL, ENT-INTEGRATION | `/alerts` / provider intake |
| API-014 | REQ-013, REQ-040, REQ-049 | ENT-SIGNAL, ENT-INTEGRATION | `/alerts` / provider intake |
| API-015 | REQ-015, REQ-016, REQ-040 | ENT-INCIDENT | `/incidents` |
| API-016 | REQ-015, REQ-016, REQ-040 | ENT-INCIDENT, ENT-SIGNAL | `/incidents` |
| API-017 | REQ-016, REQ-018, REQ-041 | ENT-INCIDENT | `/incidents` |
| API-018 | REQ-016, REQ-041 | ENT-INCIDENT | `/incidents` |
| API-019 | REQ-041, REQ-048 | ENT-INCIDENT, ENT-TIMELINE-EVENT | `/incidents` |
| API-020 | REQ-041, REQ-048 | ENT-INCIDENT, ENT-TIMELINE-EVENT | `/incidents` |
| API-021 | REQ-041, REQ-042 | ENT-TIMELINE-EVENT | `/incidents` or new |
| API-022 | REQ-015, REQ-040, REQ-041 | ENT-INCIDENT, ENT-SIGNAL | `/incidents` / `/alerts` or new |
| API-023 | REQ-017, REQ-018, REQ-019, REQ-020 | ENT-DIAGNOSIS | `/ai` |
| API-024 | REQ-017, REQ-018, REQ-019, REQ-020 | ENT-DIAGNOSIS, ENT-EVIDENCE | `/ai` |
| API-025 | REQ-018, REQ-019, REQ-020 | ENT-DIAGNOSIS, ENT-EVIDENCE | `/ai` |
| API-026 | REQ-030, REQ-031, REQ-032 | ENT-PLAYBOOK | `/workflows` |
| API-027 | REQ-030, REQ-031, REQ-032 | ENT-PLAYBOOK | `/workflows` |
| API-028 | REQ-030, REQ-032 | ENT-PLAYBOOK | `/workflows` |
| API-029 | REQ-030, REQ-032 | ENT-PLAYBOOK | `/workflows` |
| API-030 | REQ-032, REQ-040 | ENT-PLAYBOOK-RUN | `/workflows` |
| API-031 | REQ-032, REQ-041 | ENT-PLAYBOOK-RUN | `/workflows` |
| API-032 | REQ-025, REQ-026, REQ-027, REQ-047 | ENT-ACTION | `/actions` |
| API-033 | REQ-025, REQ-026, REQ-027, REQ-047 | ENT-ACTION | `/actions` |
| API-034 | REQ-025, REQ-026, REQ-027, REQ-028, REQ-029 | ENT-ACTION-RUN | `/actions` |
| API-035 | REQ-042, REQ-047, REQ-048 | ENT-ACTION-RUN | `/actions` |
| API-036 | REQ-028, REQ-047, REQ-048 | ENT-APPROVAL | new |
| API-037 | REQ-028, REQ-029, REQ-048 | ENT-APPROVAL | new |
| API-038 | REQ-033, REQ-034, REQ-035, REQ-036 | ENT-INTEGRATION | `/providers` |
| API-039 | REQ-034, REQ-035, REQ-036 | ENT-INTEGRATION | `/providers` |
| API-040 | REQ-034, REQ-035, REQ-036 | ENT-INTEGRATION | `/providers` |
| API-041 | REQ-034, REQ-035, REQ-036 | ENT-INTEGRATION | `/providers` |
| API-042 | REQ-034, REQ-035, REQ-036 | ENT-INTEGRATION | `/providers` |
| API-043 | REQ-034, REQ-035, REQ-036 | ENT-INTEGRATION | `/providers` |
| API-044 | REQ-023, REQ-040, REQ-041 | ENT-NOTIFICATION | provider/action wrapper or new |
| API-045 | REQ-023, REQ-040, REQ-041 | ENT-NOTIFICATION | provider/action wrapper or new |
| API-046 | REQ-024, REQ-040, REQ-041 | ENT-TICKET | provider/action wrapper or new |
| API-047 | REQ-024, REQ-040, REQ-041 | ENT-TICKET | provider/action wrapper or new |
| API-048 | operational support | none | `/healthcheck` |
| API-049 | operational support | none | `/status` |
| API-050 | REQ-003, REQ-004, REQ-034, REQ-038, REQ-045, REQ-046 | ENT-WORKSPACE, ENT-INTEGRATION | `/settings` |

---

## 21. Assumptions

### ASM-001

The current backend is a FastAPI monolith under `keep/api`.

### ASM-002

The existing application registers routers for providers, actions, ai, healthcheck, alerts, incidents, settings, workflows, whoami, pusher, status, rules, preset, mapping, auth groups, auth permissions, auth roles, auth users, metrics, extraction, dashboard, tags, maintenance, topology, deduplications, facets, cel, and provider-images.

### ASM-003

The current codebase has no clearly identified dedicated `servers.py` route under `keep/api/routes` from the repository inspection, so Servers should be introduced as a new product module.

### ASM-004

Signals should map to existing Alerts first, rather than requiring an immediate full rewrite.

### ASM-005

Playbooks should map to existing Workflows first, rather than requiring an immediate full workflow engine rewrite.

### ASM-006

Integrations should map to existing Providers first, rather than requiring an immediate provider system rewrite.

### ASM-007

Actions should reuse existing Actions capability but add risk, approval, and server-target safety semantics where needed.

### ASM-008

AI Diagnosis should reuse existing AI route capabilities where possible.

### ASM-009

Advanced existing routes should be hidden from the MVP product surface rather than deleted during the first slimming phase.

### ASM-010

`/api/v1` may be implemented as wrappers over existing unversioned Keep routes.

### ASM-011

Existing Keep route response shapes may differ from this target contract. This document defines the desired product-facing shape.

### ASM-012

The exact current endpoint methods inside each route file were not fully enumerated in this document; route-level presence was used to align the target API with the current codebase structure.

---

## 22. Open Questions

### OQ-001

Should `/api/v1/*` be implemented as new routers, or should the existing unversioned routes be renamed gradually?

### OQ-002

Should the UI call compatibility wrappers using product language, or continue calling existing Keep route paths during Sprint 1?

### OQ-003

Should `servers` be implemented as a completely new table and route, or should it initially map to an existing topology/entity concept?

### OQ-004

Should Signals keep using the existing Alert model permanently, or should a new Signal abstraction wrap Alert records?

### OQ-005

Should Playbooks remain a pure UI/product rename of Workflows, or should they become a simplified wrapper around Workflows?

### OQ-006

Should Integrations be a UI/product rename of Providers, or should a new integration whitelist abstraction be added?

### OQ-007

Should action approval be implemented as a new first-class route and table, or as metadata on existing action execution records?

### OQ-008

Should ticket creation and notifications be modeled as first-class APIs, or only as actions/playbook steps in the MVP?

### OQ-009

Should `/dashboard` be fully hidden in MVP, or used internally to power `/api/v1/overview`?

### OQ-010

Should `/deduplications` remain accessible to admins, or be fully hidden from product mode?

### OQ-011

Should `/mapping`, `/extraction`, `/topology`, and `/maintenance` be unregistered from the FastAPI app in lightweight mode, or only hidden in the frontend?

### OQ-012

Should `/facets` and `/cel` remain available as internal query support for existing list pages?

### OQ-013

Should `/auth/users`, `/auth/roles`, `/auth/groups`, and `/auth/permissions` be retained for all deployments, or hidden in personal-server product mode?

### OQ-014

Should external signal intake preserve existing Keep provider-specific webhook URLs for compatibility?

### OQ-015

Should the product expose OpenAPI docs for both legacy routes and `/api/v1` product routes, or only product routes in MVP mode?
