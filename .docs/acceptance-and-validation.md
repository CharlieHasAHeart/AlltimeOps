# Acceptance and Validation: Lightweight AIOps Platform for Personal Servers

## 1. Purpose

This document defines what “completed” means for the lightweight AIOps platform for personal servers and how correctness must be proven.

It converts the product scope, domain model, API design, and container-first development environment into acceptance criteria, validation commands, test expectations, manual checks, and regression coverage.

The core product loop to validate is:

**Server → Signal → Incident → AI Diagnosis → Notification / Ticket / Safe Action → Timeline**

---

## 2. Source of Truth

This `acceptance-and-validation.md` is the source of truth for acceptance and validation.

Source documents:

- `prd.md`
- `domain-model.md`
- `api-design.md`
- `dev-environment.md`
- `architecture.md`
- `db-schemas.md`
- `tech-stack.md`

If this document conflicts with `prd.md`, the PRD takes precedence for product scope.

If this document conflicts with `domain-model.md`, the domain model takes precedence for business meaning.

If this document conflicts with `api-design.md`, the API design takes precedence for API contracts.

If this document conflicts with `dev-environment.md`, the dev environment document takes precedence for exact commands.
If this document conflicts with `dev-environment.md` Validation Command Policy, the policy governs whether documented equivalents are allowed.

---

## 3. Canonical Project Decisions

### Product Mode

Canonical backend variable:

```bash
PRODUCT_MODE=personal_server_mvp
```

Canonical frontend variable:

```bash
NEXT_PUBLIC_PRODUCT_MODE=personal_server_mvp
```

Deprecated compatibility variables:

```bash
NEXT_PUBLIC_SLIM_MODE
NEXT_PUBLIC_PRODUCT_MODE=lite
```

Rules:

- `PRODUCT_MODE=personal_server_mvp` is the backend source of truth.
- `NEXT_PUBLIC_PRODUCT_MODE=personal_server_mvp` is the frontend source of truth.
- `NEXT_PUBLIC_SLIM_MODE` must not be used for new code.
- `NEXT_PUBLIC_PRODUCT_MODE=lite` must not be used for new code.
- If legacy code already reads `NEXT_PUBLIC_SLIM_MODE`, it may be temporarily mapped to `personal_server_mvp`.
- If legacy code already reads `NEXT_PUBLIC_PRODUCT_MODE=lite`, it may be temporarily mapped to `personal_server_mvp`.
- All new implementation must use `PRODUCT_MODE` and `NEXT_PUBLIC_PRODUCT_MODE`.
- If product mode variables conflict, `PRODUCT_MODE=personal_server_mvp` and `NEXT_PUBLIC_PRODUCT_MODE=personal_server_mvp` are canonical.

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

`degraded` may still appear in internal non-server enums; see `domain-model.md` and `db-schemas.md` `degraded Terminology Clarification`.

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

Sprint 1 required/deferred API IDs are defined in `execution-plan.md` `Sprint 1 API Scope`.

## Objective Acceptance Thresholds

### Hidden feature

A feature is considered hidden in MVP mode when:

- It is not present in primary navigation.
- It is not linked from Overview.
- It is not shown in onboarding.
- It is not included in MVP settings as an enabled page.
- Direct legacy routes may exist only if route compatibility is intentionally preserved.

### Reduced surface

The product surface is considered reduced when:

- Primary navigation has no more than 8 entries.
- Primary navigation includes only:
  - Overview
  - Servers
  - Incidents
  - Signals
  - Playbooks
  - Actions
  - Integrations
  - Settings
- Integrations page shows only the MVP provider whitelist.
- Playbooks page shows only MVP playbook templates.
- Dashboard builder, topology, mapping, extraction, maintenance, and deduplication pages are not visible in MVP navigation.

### Clear empty state

An empty state is valid when it includes:

- what is missing,
- why it matters,
- one primary action,
- no more than one secondary action.

### Fast first value

Fast first value is achieved when a new user can:

1. open the app,
2. add a server,
3. create a test signal,
4. see a signal or incident result,

without configuring enterprise providers.

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

## MVP Database Implementation Scope

`db-schemas.md` defines the target-state data model.

Sprint 1 must not implement every table in `db-schemas.md`.

Sprint 1 database work is limited to:

- `servers`
- optional `server_services`
- product mode / settings persistence only if required
- minimal timeline support only if required by the implemented incident flow

Existing Keep tables should be reused where practical for:

- alerts / signals
- incidents
- workflows / playbooks
- providers / integrations
- actions
- users
- tenants / workspaces
- secrets

The following target-state tables may be deferred unless required by the current execution task:

- `diagnoses`
- `diagnosis_evidence`
- `playbooks`
- `playbook_runs`
- `playbook_steps`
- `action_runs`
- `action_approvals`
- `notifications`
- `tickets`
- `test_signals`
- `incident_timeline_events`

Rules:

- Do not create target-state tables early unless the current task requires them.
- Prefer wrappers over duplicate tables when existing Keep tables can support the MVP behavior.
- Do not delete existing Keep tables during Sprint 1.
- Do not create destructive migrations during Sprint 1.
- Any new database object must map to a task in `execution-plan.md`.

---

## 4. Codex Usage

Codex should use this document to decide whether a change is complete.

Codex should not consider work complete unless the relevant acceptance criteria are met and the required validation commands pass.

Codex should use the exact validation commands listed here by default.

Codex should not invent alternative commands, package managers, test runners, or host-based workflows.

Codex may use a documented equivalent validation command only under the Validation Command Policy.

---

## 5. Non-Goals

This document does not define technology rationale.

This document does not define full database schema.

This document does not define complete API request and response details.

This document does not define setup commands beyond validation commands.

This document does not define implementation task order.

This document does not define production SLOs, enterprise compliance tests, billing validation, enterprise SSO validation, or complex RBAC validation.

---

## 6. Global Definition of Done

A feature is done only when all applicable conditions are true:

1. Product behavior matches `prd.md`.
2. Domain behavior matches `domain-model.md`.
3. API behavior matches `api-design.md`.
4. Code organization respects `architecture.md`.
5. Data persistence behavior matches `db-schemas.md`.
6. Development and validation use the container-first workflow in `dev-environment.md`.
7. The feature has unit tests where business logic exists.
8. The feature has integration tests where APIs, persistence, or external boundaries are involved.
9. Manual validation confirms the user-visible workflow.
10. Security-sensitive responses do not expose secrets.
11. Authorization is enforced on the backend.
12. Error cases return documented error codes and HTTP status codes.
13. Meaningful incident events are recorded in the timeline.
14. Action safety rules are enforced.
15. MVP product mode does not expose non-MVP platform routes or features as primary product surfaces.
16. `codex-metrics.json` exists after reporting tasks, remains valid JSON, includes required schema keys, and reflects the latest task validation status.

---

## 7. Required Validation Commands

The project uses a container-first workflow. These commands must be run from the repository root with the development stack available.

Exact commands are the default.

If an exact command cannot run, a documented equivalent is allowed only under the Validation Command Policy and must be recorded in `codex-execution-report.md` with the substitution reason.

## `codex-metrics.json` Schema Policy

`codex-metrics.json` must remain valid JSON.

Codex must preserve the minimal schema keys defined in this project.

Codex may add task-specific metrics, but must not remove required keys.

Codex must not change canonical decision values unless the corresponding project documents are updated first.

Required canonical values:

- `product_mode`: `personal_server_mvp`
- `frontend_product_mode`: `personal_server_mvp`
- `default_cloud_llm_provider`: `qwen`
- `local_llm_provider`: `ollama`
- `api_strategy`: `phased_wrappers`
- `full_api_v1_required_in_sprint_1`: `false`
- `validation_command_policy`: `exact_or_documented_equivalent`
- `container_first_required`: `true`
- `host_level_validation_allowed_by_default`: `false`

Required arrays:

- `mvp_provider_whitelist`
- `server_health_states`
- `internal_server_states`
- `known_blockers`
- `last_validation_commands`

Codex must update:

- `last_task_id`
- `last_validation_commands`
- `last_validation_status`

after every task.

Codex must update:

- `tasks_completed`
- `tasks_deferred`
- `milestones_completed`
- `full_validation_status`
- `known_blockers`

when applicable.

### Reporting Consistency Validation Criteria

- `codex-metrics.json` exists after the first reporting task.
- `codex-metrics.json` is valid JSON.
- Required minimal schema keys are present.
- Canonical decision values match project decisions.
- Latest task metadata is reflected through `last_task_id`, `last_validation_commands`, and `last_validation_status`.

### VALCMD-001: Build development containers

```bash
docker compose -f docker-compose.dev.yml build
```

### VALCMD-002: Start development stack

```bash
mkdir -p state
docker compose -f docker-compose.dev.yml up -d
```

### VALCMD-003: Backend lint

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run ruff check keep tests
```

### VALCMD-004: Backend format check

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run black --check keep tests
```

### VALCMD-005: Backend import order check

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run isort --check-only keep tests
```

### VALCMD-006: Frontend lint

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npm run lint
```

### VALCMD-007: Frontend typecheck

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npm run typecheck
```

### VALCMD-008: Backend tests

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
```

### VALCMD-009: Frontend tests

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
```

### VALCMD-010: Workflow example validation

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npm run test:workflow-examples
```

### VALCMD-011: Frontend build

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npm run build
```

### VALCMD-012: Manual migration validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run python -c "from keep.api.core.db_on_start import migrate_db; migrate_db()"
```

### VALCMD-013: Seed/provision validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run python -c "import keep.api.config as c; c.on_starting()"
```

### VALCMD-014: Full required validation set

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run ruff check keep tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run black --check keep tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run isort --check-only keep tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm run lint
docker compose -f docker-compose.dev.yml exec keep-frontend npm run typecheck
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
docker compose -f docker-compose.dev.yml exec keep-frontend npm run test:workflow-examples
docker compose -f docker-compose.dev.yml exec keep-frontend npm run build
```

---

## 8. Feature Acceptance Criteria

## VAL-001: Container-first development workflow

### Related Requirements

- REQ-050

### Related APIs

- API-048
- API-049

### Acceptance Criteria

- The project can be built using Docker Compose.
- The development stack starts through `docker compose -f docker-compose.dev.yml up -d`.
- Backend commands run inside `keep-backend`.
- Frontend commands run inside `keep-frontend`.
- Host-level Poetry, Python, Node, and npm commands are not required for normal validation.
- The backend is reachable at `http://localhost:8080`.
- The frontend is reachable at `http://localhost:3000`.

### Required Tests

- Container startup validation.
- Healthcheck validation.
- Frontend page load manual check.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml build
mkdir -p state
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm run build
```

### Manual Checks

- Open `http://localhost:3000`.
- Confirm the UI loads.
- Open or call `http://localhost:8080` health/status endpoints if exposed.
- Confirm no container repeatedly restarts.

---

## VAL-002: Lightweight product mode

### Related Requirements

- REQ-003
- REQ-004
- REQ-038
- REQ-045
- REQ-046

### Related APIs

- API-002
- API-050

### Acceptance Criteria

- Product mode is `personal_server_mvp`.
- Backend product mode is `personal_server_mvp`.
- Frontend product mode is `personal_server_mvp`.
- `NEXT_PUBLIC_SLIM_MODE` is not required for MVP behavior.
- `NEXT_PUBLIC_PRODUCT_MODE=lite` is not required for MVP behavior.
- Primary navigation includes exactly 8 entries: Overview, Servers, Incidents, Signals, Playbooks, Actions, Integrations, and Settings.
- Primary MVP page titles use product terms: Overview, Servers, Signals, Playbooks, Integrations.
- Onboarding copy uses product terms instead of Alert/Workflow/Provider labels.
- Legacy terms may remain in backend route names or internal compatibility layers.
- Legacy terms must not appear as primary MVP labels.
- Non-MVP platform features are not exposed as primary product pages.
- Mapping, extraction, topology, maintenance, advanced dashboards, deduplications, facets, CEL, rules, presets, and provider marketplace features are hidden from the MVP user experience based on the Hidden feature threshold.
- Existing Keep route capabilities may remain internally but must not dominate the MVP UI.

### Required Tests

- Unit test for product mode configuration.
- Frontend test for navigation visibility.
- Integration test for `/api/v1/settings` or equivalent settings response.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
docker compose -f docker-compose.dev.yml exec keep-frontend npm run typecheck
```

### Manual Checks

- Open the app.
- Confirm only MVP navigation entries are visible.
- Confirm advanced Keep platform entries are hidden.
- Confirm settings or visible config reports `product_mode = personal_server_mvp`.

---

## VAL-003: Current user and workspace context

### Related Requirements

- REQ-039
- REQ-050

### Related APIs

- API-001

### Acceptance Criteria

- Authenticated user context can be retrieved.
- Response includes user identity.
- Response includes active workspace or tenant context.
- Response does not expose secrets.
- Workspace boundary is available to backend authorization checks.

### Required Tests

- API integration test for current user context.
- Authorization test for unauthenticated request.
- Unit test for tenant/workspace context resolution.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run ruff check keep tests
```

### Manual Checks

- Confirm logged-in or local development user context is displayed correctly.
- Confirm workspace/product mode appears in settings or debug context when available.

---

## VAL-004: Overview summary

### Related Requirements

- REQ-005
- REQ-039
- REQ-040
- REQ-050

### Related APIs

- API-002

### Acceptance Criteria

- Overview summarizes monitored servers.
- Overview summarizes active incidents.
- Overview summarizes recent signals.
- Overview summarizes recent AI diagnoses or diagnosis status.
- Overview summarizes recent actions.
- Overview empty state includes: what is missing, why it matters, one primary action (`Add Server`), and no more than one secondary action.
- Overview does not expose advanced dashboard-builder behavior.
- Overview links only to MVP surfaces and does not link hidden legacy pages.

### Required Tests

- API integration test for empty overview.
- API integration test for overview with server, signal, incident, diagnosis, and action data.
- Frontend component/page test for overview empty state.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
docker compose -f docker-compose.dev.yml exec keep-frontend npm run build
```

### Manual Checks

- Open Overview with no server.
- Confirm Add Server call to action is visible.
- Create or seed data.
- Confirm overview counts and recent records update.

---

## VAL-005: Server creation and listing

### Related Requirements

- REQ-002
- REQ-006
- REQ-007
- REQ-008
- REQ-009
- REQ-010
- REQ-011
- REQ-044

### Related APIs

- API-003
- API-004
- API-005
- API-006
- API-007

### Acceptance Criteria

- User can create a server with name, host, environment, and optional description.
- Server defaults to `health_state = unknown`.
- Server defaults to `connection_status = pending`.
- Server defaults to `monitoring_status = inactive`.
- Server defaults to `diagnosis_access_status = not_configured`.
- `degraded` is not shown as a canonical MVP health state.
- Any legacy `degraded` server health value maps to `warning`.
- `unknown` is used when data is insufficient.
- `disconnected` is not treated as `healthy`.
- Server list returns only servers in the active workspace.
- Server detail shows health, connection, monitoring, and diagnosis access status.
- Archived servers are not shown by default.
- Archiving a server does not delete historical incidents, signals, diagnoses, tickets, notifications, or action runs.
- Sprint 1 does not fail when deferred target-state tables are not yet implemented.
- Existing Keep tables are reused where practical for MVP behavior.
- No destructive migration occurs in Sprint 1 database work.

### Required Tests

- Unit test for server default state.
- API integration test for create server.
- API integration test for list server.
- API integration test for archive server.
- Authorization test for cross-workspace server access.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run black --check keep tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run isort --check-only keep tests
```

### Manual Checks

- Add a server from the UI.
- Confirm it appears in Servers.
- Open server detail.
- Archive the server.
- Confirm it disappears from default server list but historical records remain available.

---

## VAL-006: Server services

### Related Requirements

- REQ-002
- REQ-016

### Related APIs

- API-008
- API-009

### Acceptance Criteria

- If enabled in MVP, user can create service records under a server.
- Service records are scoped to a server.
- Service type uses allowed values.
- Service criticality uses allowed values.
- Signals and incidents may reference service records when known.
- If service records are deferred, UI must not present broken service workflows.

### Required Tests

- API integration test for service creation if enabled.
- Unit test for allowed service types.
- Frontend test confirming service UI is either functional or hidden.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
```

### Manual Checks

- Add a service under a server if the feature is visible.
- Confirm it appears under that server only.
- Confirm no service UI appears if the feature is deferred.

---

## VAL-007: Signal list and signal detail

### Related Requirements

- REQ-012
- REQ-013
- REQ-014
- REQ-040

### Related APIs

- API-010
- API-011

### Acceptance Criteria

- Existing Keep alerts are exposed as product Signals.
- Signal list supports source type, severity, status, server, incident, and test filters where implemented.
- Signal detail includes source, title, description, severity, status, server mapping when available, incident mapping when available, and received time.
- Signals without server mapping remain visible.
- Signal raw payload summaries do not expose secrets.
- Product UI uses the term Signals, not Alerts, for the MVP surface.

### Required Tests

- Unit test for alert-to-signal normalization.
- API integration test for list signals.
- API integration test for unmapped signal visibility.
- Frontend test for signal terminology.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
docker compose -f docker-compose.dev.yml exec keep-frontend npm run typecheck
```

### Manual Checks

- Open Signals page.
- Confirm signals are listed.
- Confirm unmapped signals are not dropped.
- Confirm the UI does not call them Alerts in primary navigation.

---

## VAL-008: Manual test signal

### Related Requirements

- REQ-043
- REQ-049

### Related APIs

- API-012

### Acceptance Criteria

- User can generate a manual test signal.
- Test signal is marked as test.
- Test signal is distinguishable from real operational signals.
- Test signal can be used to validate signal intake and incident creation behavior.
- Test signal must not be confused with production incident data.
- Fast first value path is observable: app open -> add server -> create test signal -> signal or incident visible.

### Required Tests

- API integration test for test signal creation.
- Unit test for `is_test` behavior.
- Frontend test for test signal label/badge.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
```

### Manual Checks

- Create a test signal from onboarding or Signals page.
- Confirm it appears as a test signal.
- Confirm it is not visually indistinguishable from real signals.

---

## VAL-009: Webhook signal intake

### Related Requirements

- REQ-013
- REQ-040

### Related APIs

- API-013

### Acceptance Criteria

- Webhook intake receives valid signal payloads.
- Webhook intake authenticates the configured integration.
- Webhook payload is normalized into a Signal.
- Signal may be associated with a server when hints match.
- Invalid webhook payload returns `VALIDATION_ERROR`.
- Disabled integration returns `INTEGRATION_NOT_CONNECTED` or equivalent conflict behavior.
- Webhook response does not expose secrets.

### Required Tests

- API integration test for valid webhook signal.
- API integration test for invalid payload.
- API integration test for disabled integration.
- Unit test for webhook normalization.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run ruff check keep tests
```

### Manual Checks

- Configure webhook integration.
- Send a sample webhook signal.
- Confirm signal appears in Signals.
- Confirm no secret appears in response or logs.

---

## VAL-010: Prometheus signal intake

### Related Requirements

- REQ-013
- REQ-040
- REQ-049

### Related APIs

- API-014

### Acceptance Criteria

- Prometheus Alertmanager-style payload is accepted.
- Each alert becomes a Signal or is deduplicated according to signal rules.
- Signal severity is normalized.
- Alert labels and annotations are summarized safely.
- Signal can create or link to an Incident when appropriate.
- Invalid Prometheus payload returns `VALIDATION_ERROR`.

### Required Tests

- API integration test for Alertmanager payload.
- Unit test for severity normalization.
- Unit test for fingerprint/deduplication behavior.
- API integration test for invalid payload.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run black --check keep tests
```

### Manual Checks

- Send a sample disk usage alert payload.
- Confirm a Signal is created.
- Confirm related Incident behavior works according to configuration.

---

## VAL-011: Incident creation and listing

### Related Requirements

- REQ-015
- REQ-016
- REQ-040
- REQ-041

### Related APIs

- API-015
- API-016
- API-017
- API-018
- API-022

### Acceptance Criteria

- Incident can be created manually.
- Incident can be created from one or more signals.
- Incident must have an origin.
- Incident list shows title, severity, status, affected server when known, current diagnosis status when available, and updated time.
- Incident detail shows related server, related service when known, signal count, diagnosis summary, and recommended next action.
- Signal-to-incident links are traceable.
- Duplicate signal links are rejected or ignored deterministically.

### Required Tests

- Unit test for incident origin rule.
- API integration test for manual incident creation.
- API integration test for incident creation from signal.
- API integration test for signal linking.
- API integration test for duplicate link conflict.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
```

### Manual Checks

- Create an incident from a signal.
- Create a manual incident.
- Link a signal to an incident.
- Confirm the incident detail shows the linked signal.

---

## VAL-012: Incident lifecycle

### Related Requirements

- REQ-016
- REQ-041
- REQ-048

### Related APIs

- API-017
- API-018
- API-019
- API-020
- API-021

### Acceptance Criteria

- Incident can transition through valid states.
- Incident can be resolved.
- Resolved incident records `resolved_at`.
- Incident can be reopened.
- Reopening records a timeline event.
- Invalid state transitions return `CONFLICT`.
- Incident history remains visible after resolution.

### Required Tests

- Unit test for incident state machine.
- API integration test for resolve.
- API integration test for reopen.
- API integration test for invalid transition.
- Timeline integration test.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run ruff check keep tests
```

### Manual Checks

- Resolve an incident.
- Reopen the incident.
- Confirm timeline records both events.
- Confirm resolved incident remains visible in history filters.

---

## VAL-013: Incident timeline

### Related Requirements

- REQ-041
- REQ-042

### Related APIs

- API-021
- API-019
- API-020
- API-024
- API-034
- API-036
- API-037
- API-045
- API-047

### Acceptance Criteria

- Timeline records incident creation.
- Timeline records signal linking.
- Timeline records diagnosis generation.
- Timeline records notification send/failure.
- Timeline records ticket creation/failure.
- Timeline records action request.
- Timeline records action approval or rejection.
- Timeline records action completion or failure.
- Timeline records resolution and reopening.
- Timeline events are ordered by occurrence time.

### Required Tests

- Unit test for timeline event creation rules.
- Integration test for timeline after signal-to-incident flow.
- Integration test for timeline after diagnosis.
- Integration test for timeline after action approval.
- Integration test for timeline ordering.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
```

### Manual Checks

- Open an incident timeline.
- Confirm the timeline tells the full operational story.

---

## VAL-014: AI diagnosis request and result

### Related Requirements

- REQ-017
- REQ-018
- REQ-019
- REQ-020
- REQ-021
- REQ-022

### Related APIs

- API-023
- API-024
- API-025

### Acceptance Criteria

- User can request AI diagnosis for an incident.
- Diagnosis status begins as requested or generating.
- Diagnosis result includes probable cause, evidence summary, impact, recommended actions, verification steps, risk notes, and uncertainty statement when applicable.
- Diagnosis distinguishes evidence from inference.
- Diagnosis can return insufficient evidence without fabricating a cause.
- Diagnosis failure does not delete the incident.
- Current diagnosis is identifiable.
- Older diagnoses may remain as history.

### Required Tests

- Unit test for diagnosis structure validation.
- Unit test for evidence/inference separation.
- Integration test for diagnosis request.
- Integration test for insufficient evidence.
- Integration test for AI provider failure.
- API test for diagnosis detail.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run ruff check keep tests
```

### Manual Checks

- Open an incident.
- Request AI diagnosis.
- Confirm output is structured.
- Confirm uncertainty is visible when evidence is weak.
- Confirm no action is executed automatically by AI.

---

## VAL-015: Playbook list and management

### Related Requirements

- REQ-030
- REQ-031
- REQ-032
- REQ-046

### Related APIs

- API-026
- API-027
- API-028
- API-029

### Acceptance Criteria

- Existing Keep workflows are exposed as product Playbooks.
- MVP Playbooks list shows only 4 templates in Sprint 1.
- Required templates are exactly: high CPU, disk usage high, service down, and website/API unavailable.
- Playbook detail shows trigger summary, diagnostic steps summary, notification setting, ticket setting, and action policy.
- Playbooks unrelated to personal-server operation are hidden from MVP surface based on the Hidden feature threshold.
- Playbook updates cannot enable unsafe automatic actions.

### Required Tests

- Unit test for workflow-to-playbook mapping.
- API integration test for playbook list whitelist.
- Frontend test for Playbook naming.
- API integration test for unsafe action policy rejection.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
docker compose -f docker-compose.dev.yml exec keep-frontend npm run test:workflow-examples
```

### Manual Checks

- Open Playbooks.
- Confirm only MVP templates are visible.
- Confirm terminology says Playbooks, not Workflows, in primary UI.

---

## VAL-016: Playbook run

### Related Requirements

- REQ-032
- REQ-040
- REQ-041

### Related APIs

- API-030
- API-031

### Acceptance Criteria

- User can run a playbook for an incident or signal.
- Playbook run records status.
- Playbook run records step results.
- Playbook run may partially complete.
- Playbook run failures are visible and do not delete incident context.
- Playbook cannot execute approval-required or unsafe actions without action safety rules.

### Required Tests

- Integration test for playbook run on incident.
- Integration test for playbook run partial failure.
- Unit test for playbook action policy.
- Timeline integration test for playbook run effects.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm run test:workflow-examples
```

### Manual Checks

- Run a disk usage playbook from an incident.
- Confirm run status and step results.
- Confirm related timeline events.

---

## VAL-017: Action list and safety metadata

### Related Requirements

- REQ-025
- REQ-026
- REQ-027
- REQ-047

### Related APIs

- API-032
- API-033

### Acceptance Criteria

- Existing Keep actions are exposed through MVP Actions where appropriate.
- Every visible action has a risk level.
- Every action has a target type.
- Read-only diagnostic actions are clearly marked.
- Unsafe actions are not automatically executable.
- MVP seeded actions include checking uptime, disk usage, memory usage, top processes, service status, container status, and recent logs.

### Required Tests

- Unit test for action risk requirement.
- API integration test for action list.
- Frontend test for action risk display.
- Seed validation test for safe actions.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
```

### Manual Checks

- Open Actions.
- Confirm each action shows a risk level.
- Confirm unsafe or non-MVP actions are hidden or disabled.

---

## VAL-018: Read-only action execution

### Related Requirements

- REQ-025
- REQ-026
- REQ-028
- REQ-042
- REQ-047

### Related APIs

- API-034
- API-035
- API-021

### Acceptance Criteria

- Read-only action may run without additional approval.
- Action run records requested, running, and completed or failed states.
- Action run records result summary.
- Action run output is limited to `output_excerpt` or equivalent safe summary.
- Action result becomes available as incident evidence when incident-related.
- Timeline records action request and outcome.

### Required Tests

- Unit test for read-only approval bypass.
- Integration test for read-only action run.
- Integration test for action result persistence.
- Integration test for timeline event.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
```

### Manual Checks

- Run a read-only disk usage diagnostic on a server.
- Confirm output is summarized.
- Confirm incident timeline shows action completed.

---

## VAL-019: Approval-required action execution

### Related Requirements

- REQ-028
- REQ-029
- REQ-047
- REQ-048

### Related APIs

- API-034
- API-036
- API-037
- API-035

### Acceptance Criteria

- Approval-required action enters `waiting_for_approval`.
- Approval-required action does not execute before approval.
- Approved action can proceed.
- Rejected action must not execute.
- Unsafe action is blocked from automatic execution.
- Approval and rejection create timeline events when incident-related.

### Required Tests

- Unit test for approval-required action state machine.
- Integration test for request requiring approval.
- Integration test for approval then execution.
- Integration test for rejection preventing execution.
- Integration test for unsafe action blocked.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run black --check keep tests
```

### Manual Checks

- Request an approval-required action.
- Confirm it waits for approval.
- Approve it and confirm status changes.
- Request another and reject it.
- Confirm rejected action does not run.

---

## VAL-020: Integrations list and configuration

### Related Requirements

- REQ-033
- REQ-034
- REQ-035
- REQ-036
- REQ-045

### Related APIs

- API-038
- API-039
- API-040
- API-041
- API-042
- API-043

### Acceptance Criteria

- Existing Keep providers are exposed as MVP Integrations where appropriate.
- Integrations are grouped by Monitoring, AI, Notification, Ticketing, and Actions.
- Only MVP integrations are visible: Prometheus, Webhook, Qwen-compatible AI, Ollama-compatible AI, SMTP, GitHub, Jira, and SSH.
- Integration response returns non-sensitive `config_summary`.
- Integration responses do not expose secrets.
- Disabled integrations cannot perform new active work.
- Validation result is persisted or displayed.
- Integrations page does not render non-whitelist providers in cards, quick links, or onboarding CTAs.

### Required Tests

- Unit test for provider-to-integration mapping.
- API integration test for integration whitelist.
- API integration test for secret redaction.
- API integration test for disabled integration behavior.
- Frontend test for grouped integration display.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
docker compose -f docker-compose.dev.yml exec keep-frontend npm run typecheck
```

### Manual Checks

- Open Integrations.
- Confirm only MVP integrations are visible.
- Configure a test integration.
- Confirm secrets are never shown after save.

---

## VAL-021: Notification sending

### Related Requirements

- REQ-023
- REQ-040
- REQ-041

### Related APIs

- API-044
- API-045

### Acceptance Criteria

- User can send an incident notification through configured notification integration.
- Notification creates a notification record.
- Notification status is pending, sent, failed, or cancelled.
- Notification failure does not delete incident.
- Notification success or failure is represented in the incident timeline.
- Destination summary does not expose credentials.

### Required Tests

- API integration test for notification request.
- Integration test with mocked notification adapter.
- Error test for disabled integration.
- Timeline test for notification outcome.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
```

### Manual Checks

- Configure email notification integration.
- Send notification from an incident.
- Confirm notification status.
- Confirm timeline entry.

---

## VAL-022: Ticket creation

### Related Requirements

- REQ-024
- REQ-040
- REQ-041

### Related APIs

- API-046
- API-047

### Acceptance Criteria

- User can create a GitHub or Jira ticket from an incident.
- Ticket must be linked to an incident.
- Ticket creation records status.
- Ticket failure does not delete incident.
- Ticket success or failure creates a timeline event.
- Ticket response does not expose provider tokens.
- Repeated ticket creation with the same idempotency key does not create duplicates.

### Required Tests

- API integration test for ticket request.
- Integration test with mocked GitHub/Jira adapter.
- Error test for disabled integration.
- Idempotency test for duplicate request.
- Timeline test for ticket outcome.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
```

### Manual Checks

- Create a ticket from an incident.
- Confirm ticket appears under the incident.
- Confirm timeline event.
- Confirm external token is not displayed.

---

## VAL-023: Settings and MVP feature whitelist

### Related Requirements

- REQ-003
- REQ-004
- REQ-034
- REQ-038
- REQ-045
- REQ-046

### Related APIs

- API-050

### Acceptance Criteria

- Settings expose `product_mode = personal_server_mvp`.
- Settings expose enabled MVP pages.
- Settings expose enabled MVP integrations.
- Settings do not expose raw secrets.
- MVP settings enabled pages list includes only: `overview,servers,incidents,signals,playbooks,actions,integrations,settings`.
- Advanced platform features are disabled or hidden in the MVP settings response based on the Hidden feature threshold.
- Frontend uses settings to avoid showing non-MVP surfaces.

### Required Tests

- API integration test for settings response.
- Frontend test for settings-driven visibility.
- Unit test for feature whitelist.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
```

### Manual Checks

- Open Settings.
- Confirm product mode.
- Confirm enabled integrations and pages match MVP scope.

---

## VAL-024: Healthcheck and status

### Related Requirements

- Supports operational readiness.

### Related APIs

- API-048
- API-049

### Acceptance Criteria

- Healthcheck endpoint returns service health without exposing secrets.
- Status endpoint returns safe high-level component status.
- Healthcheck remains lightweight.
- Status does not expose internal credentials or sensitive infrastructure details.

### Required Tests

- API integration test for healthcheck.
- API integration test for status.
- Security test for secret absence.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
```

### Manual Checks

- Confirm backend healthcheck responds while stack is running.
- Confirm status output is safe.

---

## VAL-025: API error format

### Related Requirements

- REQ-040
- REQ-047
- REQ-048

### Related APIs

- All MVP APIs

### Acceptance Criteria

- New MVP APIs return the documented error envelope.
- Validation errors return `VALIDATION_ERROR` and HTTP 400.
- Unauthorized requests return `AUTHENTICATION_REQUIRED` and HTTP 401.
- Forbidden requests return `FORBIDDEN` and HTTP 403.
- Missing resources return `NOT_FOUND` and HTTP 404.
- Conflicting state transitions return `CONFLICT` and HTTP 409.
- External provider errors return `EXTERNAL_SERVICE_ERROR` and HTTP 502 where appropriate.
- Sensitive values are not included in error messages.

### Required Tests

- API integration tests for common error cases.
- Unit tests for domain error mapping.
- Security test for secret redaction in errors.

### Validation Commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run ruff check keep tests
```

### Manual Checks

- Trigger a known validation error.
- Confirm error shape.
- Confirm no secrets appear.

---

## 8. Given / When / Then Scenarios

### Scenario 1: First server onboarding

Given the user has no servers  
When the user opens Overview  
Then the user sees an empty state prompting them to add a server

Given the user enters server name, host, environment, and description  
When the user submits the server form  
Then the server is created with unknown health and inactive monitoring

---

### Scenario 2: Signal creates incident

Given a configured Prometheus or webhook integration  
When a disk usage signal is received  
Then the signal is stored  
And the signal appears in Signals  
And an incident is created or linked according to product rules  
And the incident timeline records the signal event

---

### Scenario 3: AI diagnosis

Given an incident with at least one related signal  
When the user requests AI diagnosis  
Then a diagnosis record is created  
And the diagnosis includes evidence and inference separately  
And uncertainty is shown if evidence is insufficient

---

### Scenario 4: Read-only diagnostic action

Given an incident related to a connected server  
When the user runs a read-only disk usage diagnostic  
Then the action runs without additional approval  
And the result is recorded  
And the timeline records the action result

---

### Scenario 5: Approval-required action

Given an action that changes server state  
When the user requests the action  
Then the action waits for approval  
And it does not execute before approval

Given the action is rejected  
When the system processes the decision  
Then the action must not execute

---

### Scenario 6: Notification

Given an incident and configured email integration  
When the user sends a notification  
Then a notification record is created  
And success or failure is recorded  
And the incident timeline is updated

---

### Scenario 7: Ticket creation

Given an incident and configured GitHub or Jira integration  
When the user creates a ticket  
Then a ticket record is created  
And the external reference is stored after creation succeeds  
And the incident timeline is updated

---

### Scenario 8: Lightweight product mode

Given the product runs in personal-server MVP mode  
When the user opens the app  
Then only MVP navigation entries are visible  
And advanced Keep platform pages are hidden

---

## 9. Unit Test Requirements

Unit tests are required for:

- Server default state.
- Server health state transitions.
- Signal normalization.
- Alert-to-Signal mapping.
- Incident origin rule.
- Incident state machine.
- Diagnosis evidence and inference separation.
- Diagnosis insufficient evidence behavior.
- Playbook whitelist and action policy.
- Action risk requirement.
- Action approval state machine.
- Unsafe action blocking.
- Integration whitelist.
- Secret redaction helpers.
- Workspace boundary helpers.
- Error mapping.

Unit tests should not require real external providers.

---

## 10. Integration Test Requirements

Integration tests are required for:

- Current user/workspace context.
- Server create/list/detail/archive.
- Signal intake through webhook.
- Signal intake through Prometheus payload.
- Signal-to-incident linking.
- Incident create/detail/resolve/reopen.
- Timeline event creation.
- Diagnosis request and retrieval using mocked AI adapter.
- Playbook run with mocked steps.
- Action run with mocked SSH/action adapter.
- Action approval and rejection.
- Integration create/update/validate/disable.
- Notification with mocked SMTP adapter.
- Ticket creation with mocked GitHub/Jira adapter.
- Error response format.
- Secret redaction.

Integration tests must use workspace-scoped data.

---

## 11. E2E Test Requirements

No mandatory E2E command is selected in `dev-environment.md`.

E2E tests are recommended but not required until an E2E configuration is added.

When E2E tests are added, they should cover:

- First server onboarding.
- Test signal creation.
- Signal-to-incident flow.
- AI diagnosis request.
- Read-only action run.
- Notification send request.
- Ticket creation request.
- MVP navigation visibility.

Do not run speculative E2E commands until `dev-environment.md` is updated.

---

## 12. Manual Validation Steps

Manual validation should use the container-first development environment.

1. Start the development stack.
2. Open the frontend at `http://localhost:3000`.
3. Confirm MVP navigation.
4. Open Overview with no data.
5. Add a server.
6. Confirm server appears in Servers.
7. Create a manual test signal.
8. Confirm signal appears in Signals.
9. Create or open an incident from the signal.
10. Request AI diagnosis.
11. Run a read-only diagnostic action.
12. Confirm timeline records the action.
13. Send a notification if configured.
14. Create a ticket if configured.
15. Resolve the incident.
16. Reopen the incident.
17. Confirm no secret is exposed in UI, API responses, or visible logs.

---

## 13. Error Scenario Coverage

Required error scenarios:

- Missing required field.
- Invalid enum value.
- Unauthenticated request.
- Cross-workspace access attempt.
- Nonexistent server.
- Nonexistent signal.
- Nonexistent incident.
- Disabled integration used for active work.
- AI provider unavailable.
- Insufficient evidence for diagnosis.
- Action requested for archived server.
- Approval-required action requested without approval.
- Rejected action execution attempt.
- Unsafe action automatic execution attempt.
- Notification provider failure.
- Ticket provider failure.
- Duplicate signal-to-incident link.
- Duplicate idempotency key with different body.
- Rate-limited signal intake where rate limiting is enabled.

---

## 14. Boundary Conditions

Boundary conditions to validate:

- No servers exist.
- Server exists but has no signals.
- Signal exists but cannot be mapped to a server.
- Incident exists with no diagnosis.
- Diagnosis exists with insufficient evidence.
- Multiple diagnoses exist and only one is current.
- Incident has multiple linked signals.
- Resolved incident receives a new related signal.
- Server is archived while historical incidents exist.
- Integration is disabled while historical records reference it.
- Action output is very large and must be summarized.
- Notification fails after incident is created.
- Ticket creation fails after incident is created.
- Product runs with optional AI provider unset.
- Product runs with optional ticket provider unset.
- Product runs with optional notification provider unset.

---

## 15. Security Validation

Security validation must confirm:

- API responses do not expose provider tokens.
- API responses do not expose SMTP passwords.
- API responses do not expose SSH private keys.
- API responses do not expose AI provider keys.
- Error messages are redacted.
- Logs do not print raw secrets.
- Integration `config_summary` contains only non-sensitive data.
- Signal `raw_payload_summary` excludes secrets.
- Action `output_excerpt` is limited and treated as sensitive.
- Ticket URLs and diagnosis content require authorization.
- `.env.example` files do not contain real credentials.

Required validation commands:

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run ruff check keep tests
```

---

## 16. Authorization Validation

Authorization validation must confirm:

- User can access only active workspace data.
- Server access is workspace-scoped.
- Signal access is workspace-scoped.
- Incident access is workspace-scoped.
- Diagnosis access is workspace-scoped.
- Action execution is workspace-scoped.
- Integration usage is workspace-scoped.
- Notification and ticket access are workspace-scoped.
- Frontend hiding is not treated as authorization.
- Backend denies forbidden access with `FORBIDDEN`.

Required validation commands:

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
```

---

## 17. Accessibility Baseline

The frontend MVP must meet a basic accessibility baseline:

- Primary navigation is keyboard reachable.
- Forms have labels.
- Buttons have accessible names.
- Empty states are readable.
- Status badges are not color-only.
- Error messages are visible and associated with relevant fields.
- Modals or dialogs can be closed by keyboard.
- Focus is not trapped incorrectly.
- Critical action approval screens clearly communicate risk.

Required validation commands:

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npm run lint
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
```

Manual checks:

- Navigate the app with keyboard.
- Create a server using keyboard.
- Open an incident using keyboard.
- Review action approval UI using keyboard.

---

## 18. Performance Baseline

The MVP performance baseline is intentionally lightweight and personal-server focused.

Acceptance criteria:

- Overview loads without requiring advanced dashboard builder data.
- Server list loads with default pagination.
- Signal list loads with default pagination.
- Incident list loads with default pagination.
- AI diagnosis may be asynchronous and should not block the UI indefinitely.
- Action execution may be asynchronous and should show running state.
- Disabled advanced features should not add visible UI load cost.
- Frontend production build succeeds.

Required validation commands:

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npm run build
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
```

Manual checks:

- Open Overview.
- Open Servers.
- Open Signals.
- Open Incidents.
- Confirm pages respond acceptably in the local container environment.

---

## 19. Regression Checklist

Before considering a sprint or feature complete, verify:

- Container stack builds.
- Container stack starts.
- Backend lint passes.
- Backend format check passes.
- Backend import order check passes.
- Frontend lint passes.
- Frontend typecheck passes.
- Backend tests pass.
- Frontend tests pass.
- Workflow example validation passes.
- Frontend build passes.
- MVP navigation is visible and advanced navigation is hidden.
- Server onboarding works.
- Signal intake works.
- Incident creation works.
- AI diagnosis request works or fails safely.
- Read-only action works or fails safely.
- Approval-required action cannot bypass approval.
- Notification and ticketing fail safely if not configured.
- No secrets appear in responses, errors, or visible logs.
- Timeline records meaningful incident events.

Required full validation command set:

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run ruff check keep tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run black --check keep tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run isort --check-only keep tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm run lint
docker compose -f docker-compose.dev.yml exec keep-frontend npm run typecheck
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
docker compose -f docker-compose.dev.yml exec keep-frontend npm run test:workflow-examples
docker compose -f docker-compose.dev.yml exec keep-frontend npm run build
```

---

## 20. Mapping to Requirements and APIs

| Validation ID | Main Requirements | Main APIs |
|---|---|---|
| VAL-001 | REQ-050 | API-048, API-049 |
| VAL-002 | REQ-003, REQ-004, REQ-038, REQ-045, REQ-046 | API-002, API-050 |
| VAL-003 | REQ-039, REQ-050 | API-001 |
| VAL-004 | REQ-005, REQ-039, REQ-040, REQ-050 | API-002 |
| VAL-005 | REQ-002, REQ-006, REQ-007, REQ-008, REQ-009, REQ-010, REQ-011, REQ-044 | API-003, API-004, API-005, API-006, API-007 |
| VAL-006 | REQ-002, REQ-016 | API-008, API-009 |
| VAL-007 | REQ-012, REQ-013, REQ-014, REQ-040 | API-010, API-011 |
| VAL-008 | REQ-043, REQ-049 | API-012 |
| VAL-009 | REQ-013, REQ-040 | API-013 |
| VAL-010 | REQ-013, REQ-040, REQ-049 | API-014 |
| VAL-011 | REQ-015, REQ-016, REQ-040, REQ-041 | API-015, API-016, API-017, API-018, API-022 |
| VAL-012 | REQ-016, REQ-041, REQ-048 | API-017, API-018, API-019, API-020, API-021 |
| VAL-013 | REQ-041, REQ-042 | API-021, API-019, API-020, API-024, API-034, API-036, API-037, API-045, API-047 |
| VAL-014 | REQ-017, REQ-018, REQ-019, REQ-020, REQ-021, REQ-022 | API-023, API-024, API-025 |
| VAL-015 | REQ-030, REQ-031, REQ-032, REQ-046 | API-026, API-027, API-028, API-029 |
| VAL-016 | REQ-032, REQ-040, REQ-041 | API-030, API-031 |
| VAL-017 | REQ-025, REQ-026, REQ-027, REQ-047 | API-032, API-033 |
| VAL-018 | REQ-025, REQ-026, REQ-028, REQ-042, REQ-047 | API-034, API-035, API-021 |
| VAL-019 | REQ-028, REQ-029, REQ-047, REQ-048 | API-034, API-036, API-037, API-035 |
| VAL-020 | REQ-033, REQ-034, REQ-035, REQ-036, REQ-045 | API-038, API-039, API-040, API-041, API-042, API-043 |
| VAL-021 | REQ-023, REQ-040, REQ-041 | API-044, API-045 |
| VAL-022 | REQ-024, REQ-040, REQ-041 | API-046, API-047 |
| VAL-023 | REQ-003, REQ-004, REQ-034, REQ-038, REQ-045, REQ-046 | API-050 |
| VAL-024 | Operational readiness | API-048, API-049 |
| VAL-025 | REQ-040, REQ-047, REQ-048 | All MVP APIs |

---

## 21. Assumptions

### ASM-001

The project uses the container-first development workflow defined in `dev-environment.md`.

### ASM-002

`docker-compose.dev.yml` is the preferred development Compose file.

### ASM-003

The MVP exposes product APIs through `/api/v1` wrappers or equivalent product-facing routes.

### ASM-004

Existing Keep routes may remain internally while product-facing UI uses MVP terminology.

### ASM-005

Signals initially map to existing Keep alerts.

### ASM-006

Playbooks initially map to existing Keep workflows.

### ASM-007

Integrations initially map to existing Keep providers.

### ASM-008

Servers are a new first-class product module unless mapped to an existing internal object later.

### ASM-009

External providers should be mocked in automated tests.

### ASM-010

No mandatory E2E command exists yet.

### ASM-011

AI diagnosis may run asynchronously.

### ASM-012

Action execution may run asynchronously.

### ASM-013

SQLite is sufficient for validation in the MVP.

---

## 22. Open Questions

### OQ-001

Should E2E tests become mandatory before first public MVP release?

### OQ-002

Should server onboarding have a dedicated E2E scenario once E2E infrastructure exists?

### OQ-003

Should `/api/v1` wrappers be tested independently from legacy Keep routes?

### OQ-004

Should product terminology be validated with snapshot tests or semantic UI tests?

### OQ-005

Should integration provider whitelist be enforced at API level, UI level, or both?

### OQ-006

Should action approval validation require database-level invariants in addition to service-level tests?

### OQ-007

Should AI diagnosis use golden test fixtures for deterministic output validation?

### OQ-008

Should notification and ticket idempotency tests be mandatory for MVP?

### OQ-009

Should performance baseline include explicit maximum page load times?

### OQ-010

Should accessibility baseline include automated axe checks?

### OQ-011

Should security validation include a dedicated secret-scanning command?

### OQ-012

Should archived server behavior be covered by automated tests in Sprint 1 or deferred?

### OQ-013

Should manual test signals be allowed to trigger notifications and tickets during validation?

### OQ-014

Should backend tests be split into unit, integration, and provider categories with separate commands?

### OQ-015

Should validation require both SQLite and PostgreSQL in future production-readiness stages?
