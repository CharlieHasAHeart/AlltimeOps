# Execution Plan: Lightweight AIOps Platform for Personal Servers

## 1. Purpose

This document defines the implementation order for transforming the existing Keep-derived platform into a lightweight AIOps product for personal servers.

The plan is designed for Codex-driven implementation. It sequences work so that the product first becomes safe to develop, then becomes visibly lightweight, then adds the missing Server-first model, then completes the closed loop:

**Server → Signal → Incident → AI Diagnosis → Notification / Ticket / Safe Action → Timeline**

---

## 2. Source of Truth

This `execution-plan.md` is based on:

- `prd.md`
- `domain-model.md`
- `tech-stack.md`
- `architecture.md`
- `db-schemas.md`
- `api-design.md`
- `dev-environment.md`
- `acceptance-and-validation.md`

If this document conflicts with `prd.md`, the PRD takes precedence for product scope.

If this document conflicts with `domain-model.md`, the domain model takes precedence for business meaning.

If this document conflicts with `architecture.md`, the architecture document takes precedence for system organization.

If this document conflicts with `db-schemas.md`, the database schema document takes precedence for persistence.

If this document conflicts with `api-design.md`, the API design document takes precedence for API contracts.

If this document conflicts with `dev-environment.md`, the development environment document takes precedence for commands.

If this document conflicts with `acceptance-and-validation.md`, the acceptance document takes precedence for completion criteria.

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

## Objective Acceptance Thresholds

When execution tasks use terms like hidden, reduced, lightweight, clear, or fast, they must be validated using measurable checks from `acceptance-and-validation.md`.

Core thresholds for Sprint 1:

- Primary navigation has exactly 8 entries: Overview, Servers, Incidents, Signals, Playbooks, Actions, Integrations, Settings.
- Integrations surface shows only MVP whitelist entries.
- Playbooks surface shows only MVP templates.
- Hidden features are absent from navigation, Overview links, onboarding, and MVP settings enabled-page list.
- Empty states include what is missing, why it matters, one primary action, and no more than one secondary action.
- First-value flow is testable: open app -> add server -> create test signal -> observe signal or incident.

---

## 4. Codex Usage

Codex should use this document to determine implementation order.

Codex should complete tasks in dependency order unless a task is explicitly listed as parallelizable.

Codex should update `codex-execution-report.md` and `codex-metrics.json` after every task.

Codex should not treat a task as complete unless the task's validation commands pass or the failure is documented with exact reason, scope, and next action.

## Validation Runtime Mapping

Canonical validation commands use:

- backend service: `keep-backend`
- frontend service: `keep-frontend`
- websocket service: `keep-websocket-server`

If these services do not exist in the active Compose project, Codex must discover available services with:

```bash
docker compose -f docker-compose.dev.yml ps --services
```

If `docker-compose.dev.yml` is unavailable, Codex may inspect the default Compose project with:

```bash
docker compose ps --services
```

Allowed documented-equivalent service mapping:

| Canonical Service | Acceptable Equivalent Service Names |
|---|---|
| `keep-backend` | `keep-api`, `api`, `backend`, `keep`, `keep-backend-dev` |
| `keep-frontend` | `keep-ui`, `frontend`, `web`, `ui`, `keep-frontend-dev` |
| `keep-websocket-server` | `soketi`, `websocket`, `pusher` |

Rules:

- Prefer canonical service names.
- If canonical services are unavailable, use a documented equivalent from this table.
- Record the original command, discovered service name, equivalent command, and result in `codex-execution-report.md`.
- If no equivalent service exists, validation is blocked and must be reported as blocked.

---

## 5. Non-Goals

This document does not define product vision.

This document does not define full database field definitions.

This document does not define full API request or response bodies.

This document does not explain the local development environment in detail.

This document does not define general Codex behavior rules.

This document does not include enterprise SSO, billing, license management, CMDB, complex topology, provider marketplace expansion, Kubernetes deployment, or enterprise compliance work.

---

## 6. Implementation Strategy

### STRAT-001: Container-first foundation before product changes

Start by making the container-first development environment reliable. Product changes should not begin until the stack can build, run, lint, test, and validate through Docker Compose.

### STRAT-002: Hide before deleting

The first product slimming phase should hide or unregister non-MVP surfaces before deleting legacy Keep code. This reduces migration risk.

### STRAT-003: Product wrapper before deep rewrite

Signals should initially wrap existing Alerts.

Playbooks should initially wrap existing Workflows.

Integrations should initially wrap existing Providers.

Actions should initially wrap existing Actions with added safety semantics.

Servers are the main new first-class product module.

Use existing Keep routes where practical.

Add product wrappers only where required by the current milestone.

Full `/api/v1` normalization is future work.

### STRAT-004: Server-first model before closed loop

Implement Servers before signal mapping, incident diagnosis, action execution, and overview metrics depend on server context.

### STRAT-005: Safety before automation

Action risk, approval, and unsafe-action blocking must exist before any server action execution is exposed.

### STRAT-006: Timeline as the audit spine

Every meaningful incident lifecycle event should be recorded through the timeline service as soon as the corresponding feature exists.

### STRAT-007: Testable milestones

Each milestone must end with exact validation commands from `dev-environment.md` and acceptance IDs from `acceptance-and-validation.md`.

Exact commands are required by default.

If an exact command cannot run, use a documented equivalent only under the Validation Command Policy.

---

## 7. Milestones

## Sprint 1 API Scope

Sprint 1 must not implement the full API catalog.

### Sprint 1 Required API IDs

| API ID | Endpoint / Route | Scope |
|---|---|---|
| API-001 | `/api/v1/me` or existing `/whoami` wrapper | required |
| API-002 | `/api/v1/overview` | required |
| API-003 | `GET /api/v1/servers` | required |
| API-004 | `POST /api/v1/servers` | required |
| API-005 | `GET /api/v1/servers/{server_id}` | required |
| API-006 | `PATCH /api/v1/servers/{server_id}` | required |
| API-007 | `POST /api/v1/servers/{server_id}/archive` | required |
| API-010 | `/alerts` powering Signals | compatibility required |
| API-015 | `/incidents` powering Incidents | compatibility required |
| API-026 | `/workflows` powering Playbooks | compatibility required |
| API-032 | `/actions` powering Actions | compatibility required |
| API-038 | `/providers` powering Integrations | compatibility required |
| API-050 | `/api/v1/settings` or existing `/settings` wrapper | required |

### Sprint 1 Deferred API IDs

All API IDs not listed above are deferred unless the active execution task explicitly requires them.

Deferred API IDs must not be implemented only because they appear in `api-design.md`.

Full `/api/v1` normalization is future work.

### MILESTONE-001: Container-first development baseline

Goal:

Create a reliable container-first development workflow.

Primary tasks:

- TASK-001
- TASK-002
- TASK-003

Primary validation:

- VAL-001
- VAL-024

---

### MILESTONE-002: Lightweight product shell

Goal:

Introduce personal-server MVP mode, hide non-MVP navigation and advanced platform routes, and expose safe settings.

Primary tasks:

- TASK-004
- TASK-005
- TASK-006
- TASK-007

Primary validation:

- VAL-002
- VAL-003
- VAL-023
- VAL-025

---

### MILESTONE-003: Server-first foundation

Goal:

Add the Server module and basic server API/UI.

Primary tasks:

- TASK-008
- TASK-009
- TASK-010
- TASK-011

Primary validation:

- VAL-004
- VAL-005
- VAL-006

---

### MILESTONE-004: Signals and incident loop

Goal:

Map Keep Alerts to product Signals and connect signals to Incidents and Timeline.

Primary tasks:

- TASK-012
- TASK-013
- TASK-014
- TASK-015
- TASK-016

Primary validation:

- VAL-007
- VAL-008
- VAL-009
- VAL-010
- VAL-011
- VAL-012
- VAL-013

---

### MILESTONE-005: AI diagnosis

Goal:

Expose AI diagnosis as an evidence-based incident capability.

Primary tasks:

- TASK-017
- TASK-018
- TASK-019

Primary validation:

- VAL-014
- VAL-013
- VAL-025

---

### MILESTONE-006: Playbooks and integrations

Goal:

Map Workflows to Playbooks, Providers to Integrations, and expose only MVP integrations and playbook templates.

Primary tasks:

- TASK-020
- TASK-021
- TASK-022
- TASK-023

Primary validation:

- VAL-015
- VAL-016
- VAL-020
- VAL-023

---

### MILESTONE-007: Actions, notifications, and tickets

Goal:

Complete the operational loop with safe actions, approval gates, notifications, and ticketing.

Primary tasks:

- TASK-024
- TASK-025
- TASK-026
- TASK-027
- TASK-028

Primary validation:

- VAL-017
- VAL-018
- VAL-019
- VAL-021
- VAL-022
- VAL-013

---

### MILESTONE-008: Final validation and release readiness

Goal:

Run full regression, confirm acceptance, and produce final execution reporting.

Primary tasks:

- TASK-029
- TASK-030
- TASK-031

Primary validation:

- VAL-001 through VAL-025
- Regression checklist in Section 19 of `acceptance-and-validation.md`

---

## 8. Tasks

## TASK-001: Add container-first development Compose file

### Goal

Create a source-mounted container development workflow using `docker-compose.dev.yml`.

### References

- `dev-environment.md`: Sections 5-24
- `tech-stack.md`: Sections 6-19
- `architecture.md`: Sections 5, 8, 18
- Validation: VAL-001, VAL-024

### Preconditions

- Existing repository contains backend Python package under `keep`.
- Existing repository contains frontend under `keep-ui`.
- Existing root Docker Compose files may remain unchanged.

### Expected Changes

- Add `docker-compose.dev.yml`.
- Define `keep-backend`, `keep-frontend`, and `keep-websocket-server`.
- Mount source directories into containers.
- Mount `./state` to `/state`.
- Use SQLite connection string inside backend container.
- Expose frontend on `3000`, backend on `8080`, websocket on `6001`.

### Files or Areas to Modify

- `docker-compose.dev.yml`
- `.env.example`
- `keep-ui/.env.example`
- Optional development Dockerfiles if required

### Steps

1. Add a development Compose file.
2. Configure backend service with Poetry, Python 3.11, source mount, and `/state` volume.
3. Configure frontend service with Node.js 20, npm, source mount, and correct backend URLs.
4. Configure websocket service with Soketi-compatible settings.
5. Ensure default backend environment disables scheduler, consumer, topology processor, watcher, and maintenance windows for MVP local development.
6. Add required environment examples.

### Validation

```bash
docker compose -f docker-compose.dev.yml build
mkdir -p state
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml logs -f
```

### Definition of Done

- Development containers build.
- Development stack starts.
- Frontend is reachable at `http://localhost:3000`.
- Backend is reachable at `http://localhost:8080`.
- Websocket service starts.
- No host-level Poetry or npm command is required for normal development.

### Reporting Requirements

Update `codex-execution-report.md` with:

- Task ID
- Files changed
- Compose services added
- Validation result
- Known issues

Update `codex-metrics.json` with:

- `tasks_completed += 1`
- `container_first_dev_enabled = true`
- `validation.container_build = "passed" | "failed"`

---

## TASK-002: Add or update environment examples for container-first development

### Goal

Provide safe `.env.example` files for backend and frontend container development.

### References

- `dev-environment.md`: Sections 19-20
- `architecture.md`: Section 16
- `db-schemas.md`: Section 20
- Validation: VAL-001, VAL-020, VAL-023

### Preconditions

- TASK-001 is complete or in progress.

### Expected Changes

- Root `.env.example` includes backend container variables.
- `keep-ui/.env.example` includes frontend container variables.
- No real secrets are included.

### Files or Areas to Modify

- `.env.example`
- `keep-ui/.env.example`
- Documentation comments if existing env examples exist

### Steps

1. Add backend variables for SQLite, file secret manager, product mode, enabled providers, and enabled pages.
2. Add frontend variables for browser API URL, container API URL, NextAuth, and Pusher/Soketi.
3. Ensure secret placeholders are blank or clearly redacted.
4. Do not commit real provider tokens.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run ruff check keep tests
```

### Definition of Done

- Env examples contain all required keys.
- Env examples contain no real secrets.
- Container stack can use equivalent environment successfully.

### Reporting Requirements

Update `codex-execution-report.md` with env files changed and secret-redaction confirmation.

Update `codex-metrics.json` with:

- `env_examples_updated = true`
- `secret_placeholders_only = true`

---

## TASK-003: Establish baseline validation report

### Goal

Create initial execution reporting files and record the baseline validation status.

### References

- `acceptance-and-validation.md`: Sections 5, 6, 19
- `dev-environment.md`: Sections 22-24
- Validation: VAL-001, VAL-024, VAL-025

### Preconditions

- TASK-001 is complete.
- Development stack starts.

### Expected Changes

- Add `codex-execution-report.md`.
- Add `codex-metrics.json`.
- Record baseline pass/fail status for required validation commands.

### Files or Areas to Modify

- `codex-execution-report.md`
- `codex-metrics.json`

### Steps

1. Create `codex-execution-report.md`.
2. Create `codex-metrics.json`.
3. Run the baseline validation commands that are available.
4. Record failures honestly with exact command output summary and likely cause.
5. Do not mark baseline as fully passing unless every required command passes.

### Validation

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

### Definition of Done

- Report file exists.
- Metrics file exists.
- Baseline validation status is recorded.
- Failures are documented without hiding them.

### Reporting Requirements

Update `codex-execution-report.md` with full baseline command results.

Update `codex-metrics.json` with:

- `baseline_recorded = true`
- `baseline_validation_status`
- `baseline_failed_commands`
- `baseline_passed_commands`

---

## TASK-004: Introduce personal-server MVP product mode

### Goal

Add a backend/frontend configuration concept for `personal_server_mvp`.

### References

- PRD: MVP Scope, Requirements
- `domain-model.md`: ENT-WORKSPACE, ENT-INTEGRATION
- `architecture.md`: CONFIG-002, CONFIG-003, CONFIG-004
- `api-design.md`: API-050
- `db-schemas.md`: DB-WORKSPACES, DB-INTEGRATIONS
- Validation: VAL-002, VAL-023

### Preconditions

- TASK-001 and TASK-003 are complete.

### Expected Changes

- Product mode can be set through environment/config.
- Settings API can expose product mode.
- Frontend can read product mode.
- Product mode defaults to `personal_server_mvp` for MVP development.

### Files or Areas to Modify

- Backend config
- Settings route or settings service
- Frontend config access
- Tests for config behavior

### Steps

1. Add or map `PRODUCT_MODE=personal_server_mvp`.
2. Add or map `NEXT_PUBLIC_PRODUCT_MODE=personal_server_mvp`.
3. Add enabled page and provider whitelist configuration.
4. Expose product mode through settings response.
5. Ensure default behavior remains safe if env vars are missing.
6. Add tests for product mode configuration.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
docker compose -f docker-compose.dev.yml exec keep-frontend npm run typecheck
```

### Definition of Done

- Product mode is available in backend configuration.
- Product mode is available to frontend.
- Tests confirm MVP mode behavior.
- No secrets are exposed.

### Reporting Requirements

Update `codex-execution-report.md` with config behavior and test results.

Update `codex-metrics.json` with:

- `"product_mode": "personal_server_mvp"`
- `"frontend_product_mode": "personal_server_mvp"`
- `enabled_pages_count`
- `enabled_providers_count`

---

## TASK-005: Hide non-MVP frontend navigation and surfaces

### Goal

Slim the UI by exposing only MVP product areas.

### References

- PRD: Product Goals, MVP Scope, Out of Scope
- `architecture.md`: ARCH-011, FORBID-009
- `api-design.md`: API-050
- Validation: VAL-002, VAL-023

### Preconditions

- TASK-004 is complete.

### Expected Changes

Visible primary navigation should include only:

- Overview
- Servers
- Incidents
- Signals
- Playbooks
- Actions
- Integrations
- Settings

Non-MVP surfaces should be hidden from primary navigation.

### Files or Areas to Modify

- Frontend navigation components
- Frontend route guards or page visibility config
- Tests for navigation visibility

### Steps

1. Find primary navigation source.
2. Add product mode filtering.
3. Rename product labels where needed.
4. Hide advanced platform entries.
5. Add frontend tests for visible and hidden navigation.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npm run lint
docker compose -f docker-compose.dev.yml exec keep-frontend npm run typecheck
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
```

### Definition of Done

- Primary navigation contains exactly 8 entries: Overview, Servers, Incidents, Signals, Playbooks, Actions, Integrations, Settings.
- Advanced platform navigation entries are absent from primary navigation, Overview links, onboarding links, and MVP settings enabled-page list.
- Frontend tests pass.
- No route is broken by hidden navigation.

### Reporting Requirements

Update `codex-execution-report.md` with visible and hidden navigation list.

Update `codex-metrics.json` with:

- `primary_nav_items_visible`
- `non_mvp_nav_items_hidden`
- `frontend_tests_passed`

---

## TASK-006: Add backend route registration controls for lightweight mode

### Goal

Prevent non-MVP routes from being primary active product routes in lightweight mode.

### References

- `architecture.md`: APP-002, CONFIG-003, ARCH-011
- `api-design.md`: Non-MVP existing routes table
- Validation: VAL-002, VAL-023, VAL-025

### Preconditions

- TASK-004 is complete.
- Existing `keep/api/api.py` route registration is understood.

### Expected Changes

- Route registration can be conditioned on product mode.
- MVP routes remain available.
- System routes remain available.
- Non-MVP routes are hidden, disabled, or admin-only according to the chosen approach.

### Files or Areas to Modify

- `keep/api/api.py`
- Backend config
- Route tests

### Steps

1. Identify route registration block.
2. Define MVP allowed routes.
3. Gate non-MVP route registration behind product mode or feature flags.
4. Ensure healthcheck, status, settings, whoami, pusher, and metrics behavior remains appropriate.
5. Add tests or smoke checks for route availability.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run ruff check keep tests
```

### Definition of Done

- MVP backend routes are available.
- Non-MVP routes are not exposed as primary product API in MVP mode.
- Route gating is configurable and testable.
- No core app startup regression.

### Reporting Requirements

Update `codex-execution-report.md` with route gating strategy and affected routes.

Update `codex-metrics.json` with:

- `backend_route_gating_enabled = true`
- `mvp_routes_count`
- `non_mvp_routes_hidden_count`

---

## TASK-007: Normalize product terminology in UI

### Goal

Replace primary product language with MVP terms while preserving internal compatibility.

### References

- `domain-model.md`: Domain Glossary
- `architecture.md`: Existing Codebase Mapping
- `api-design.md`: Product language mapping
- Validation: VAL-002, VAL-007, VAL-015, VAL-020

### Preconditions

- TASK-005 is complete.

### Expected Changes

Primary UI terminology:

- Alerts → Signals
- Workflows → Playbooks
- Providers → Integrations
- Keep platform dashboard → Overview
- Server-first product language is used where relevant.

### Files or Areas to Modify

- Frontend labels
- Navigation text
- Empty states
- Page headings
- Tests and snapshots

### Steps

1. Identify user-facing strings for Alerts, Workflows, Providers, and dashboard concepts.
2. Replace primary MVP labels.
3. Avoid renaming internal code aggressively.
4. Update tests that assert user-facing text.
5. Leave advanced legacy labels only in hidden or internal contexts.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npm run lint
docker compose -f docker-compose.dev.yml exec keep-frontend npm run typecheck
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
```

### Definition of Done

- Primary UI uses MVP terminology.
- Internal compatibility remains intact.
- Tests pass.

### Reporting Requirements

Update `codex-execution-report.md` with terminology changes.

Update `codex-metrics.json` with:

- `terminology_alerts_to_signals = true`
- `terminology_workflows_to_playbooks = true`
- `terminology_providers_to_integrations = true`

---

## TASK-008: Add Server database model and migration

### Goal

Create the first-class Server persistence model.

### References

- `domain-model.md`: ENT-SERVER, ENT-SERVER-SERVICE
- `db-schemas.md`: DB-SERVERS, DB-SERVER-SERVICES
- `api-design.md`: API-003 through API-009
- Validation: VAL-005, VAL-006

### Preconditions

- TASK-003 is complete.
- Migration flow is validated.

### Expected Changes

- Add server model.
- Add optional server service model if implementing services in this milestone.
- Add migration for required server-scope tables only.
- Preserve SQLite compatibility.

### Files or Areas to Modify

- `keep/api/models/db/`
- Migration versions
- Persistence repositories or DB access layer
- Tests

### Steps

1. Add Server model matching `db-schemas.md` at schema level.
2. Add Server Service model if included.
3. Add migration.
4. Ensure workspace/tenant scoping.
5. Add tests for model creation and defaults.
6. Run migration validation.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run python -c "from keep.api.core.db_on_start import migrate_db; migrate_db()"
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run black --check keep tests
```

### Definition of Done

- Server table exists after migration.
- Server defaults match acceptance criteria.
- SQLite migration succeeds.
- Deferred target-state tables are not required in this task.
- Tests pass.

### Reporting Requirements

Update `codex-execution-report.md` with models and migration ID.

Update `codex-metrics.json` with:

- `server_model_added = true`
- `server_service_model_added = true | false`
- `migration_added = true`

---

## TASK-009: Add Server repository and domain/application services

### Goal

Implement Server business and persistence access behind proper architecture boundaries.

### References

- `architecture.md`: MOD-002, LAYER-003, LAYER-004, LAYER-005
- `domain-model.md`: ENT-SERVER
- `db-schemas.md`: DB-SERVERS
- Validation: VAL-005

### Preconditions

- TASK-008 is complete.

### Expected Changes

- Server repository.
- Server application service.
- Server domain validation/default logic.
- Tests for defaults, archive behavior, and workspace scoping.

### Files or Areas to Modify

- Backend application services
- Backend domain services
- Backend repositories
- Backend tests

### Steps

1. Add repository functions for create, list, get, update, archive.
2. Add domain rules for default states and archive behavior.
3. Add application service that enforces workspace/tenant scope.
4. Add tests.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run ruff check keep tests
```

### Definition of Done

- Server logic does not live in API routes.
- Repository owns database access.
- Workspace scoping is enforced.
- Tests pass.

### Reporting Requirements

Update `codex-execution-report.md` with service and repository changes.

Update `codex-metrics.json` with:

- `server_repository_added = true`
- `server_service_added = true`
- `server_workspace_scope_tests = "passed" | "failed"`

---

## TASK-010: Add Server API routes

### Goal

Expose product-facing Server APIs.

### References

- `api-design.md`: API-003 through API-009
- `domain-model.md`: ENT-SERVER, ENT-SERVER-SERVICE
- `db-schemas.md`: DB-SERVERS, DB-SERVER-SERVICES
- Validation: VAL-005, VAL-006, VAL-025

### Preconditions

- TASK-009 is complete.

### Expected Changes

- New Server route.
- API responses follow product shape.
- Authorization and workspace scope enforced.
- Errors use MVP error envelope where applicable.

### Files or Areas to Modify

- `keep/api/routes/servers.py`
- `keep/api/api.py`
- API schemas
- Backend tests

### Steps

1. Add routes for list, create, detail, update, archive.
2. Add service endpoints for server services if included.
3. Register routes in MVP mode.
4. Add validation and error handling.
5. Add API tests.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run black --check keep tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run isort --check-only keep tests
```

### Definition of Done

- Server APIs match `api-design.md`.
- API tests cover create/list/detail/update/archive.
- Authorization is enforced.
- Errors are documented and tested.

### Reporting Requirements

Update `codex-execution-report.md` with endpoint list and test results.

Update `codex-metrics.json` with:

- `server_api_added = true`
- `server_api_tests_passed = true`

---

## TASK-011: Add Server UI and Overview empty state

### Goal

Expose server-first product experience in the frontend.

### References

- PRD: MVP Scope, Core Workflows
- `api-design.md`: API-002 through API-009
- Validation: VAL-004, VAL-005, VAL-006

### Preconditions

- TASK-010 is complete.
- TASK-005 is complete.

### Expected Changes

- Servers page.
- Server list.
- Add server flow.
- Server detail page.
- Overview empty state prompts first server onboarding.
- Optional server services UI if implemented.

### Files or Areas to Modify

- Frontend routes/pages
- Frontend server feature components
- Frontend API client
- Frontend tests

### Steps

1. Add API client functions for Server APIs.
2. Add Servers navigation target.
3. Add server list and empty state.
4. Add create server form.
5. Add server detail view.
6. Add tests for core UI states.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npm run lint
docker compose -f docker-compose.dev.yml exec keep-frontend npm run typecheck
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
docker compose -f docker-compose.dev.yml exec keep-frontend npm run build
```

### Definition of Done

- User can add and view a server through UI.
- Empty state includes what is missing, why it matters, one primary action (`Add Server`), and no more than one secondary action.
- Frontend build passes.
- Tests pass.

### Reporting Requirements

Update `codex-execution-report.md` with UI paths and manual validation notes.

Update `codex-metrics.json` with:

- `server_ui_added = true`
- `overview_empty_state_added = true`
- `frontend_build_passed = true`

---

## TASK-012: Add Signal product wrapper over Alerts

### Goal

Expose existing Keep Alerts as product Signals.

### References

- `domain-model.md`: ENT-SIGNAL
- `api-design.md`: API-010, API-011
- `architecture.md`: Existing Codebase Mapping
- Validation: VAL-007

### Preconditions

- TASK-007 is complete.
- Existing alerts route/model is available.

### Expected Changes

- Signal service or wrapper.
- Signal response normalization.
- UI and API use Signals terminology.
- Existing alert behavior remains internally compatible.

### Files or Areas to Modify

- Alert/signal route wrappers
- Signal application service
- Frontend Signals page/API client
- Tests

### Steps

1. Define Signal DTO mapping from existing Alert data.
2. Add or wrap `/api/v1/signals`.
3. Preserve existing `/alerts` compatibility.
4. Add tests for unmapped signal visibility.
5. Update UI labels.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
docker compose -f docker-compose.dev.yml exec keep-frontend npm run typecheck
```

### Definition of Done

- Signals list works.
- Signal detail works.
- Existing alerts are not broken.
- UI uses Signals terminology.

### Reporting Requirements

Update `codex-execution-report.md` with alert-to-signal mapping.

Update `codex-metrics.json` with:

- `signals_wrapper_added = true`
- `alerts_compatibility_preserved = true`

---

## TASK-013: Add manual test signal flow

### Goal

Allow users to create manual test signals for onboarding and validation.

### References

- `domain-model.md`: ENT-TEST-SIGNAL, ENT-SIGNAL
- `api-design.md`: API-012
- `db-schemas.md`: DB-TEST-SIGNALS or `signals.is_test`
- Validation: VAL-008

### Preconditions

- TASK-012 is complete.
- TASK-010 is complete if test signals can target servers.

### Expected Changes

- Test signal creation API.
- Test signal marker.
- UI action for creating test signal.
- Tests for test signal distinction.

### Files or Areas to Modify

- Signal routes/services
- Frontend Signals or onboarding UI
- Backend and frontend tests

### Steps

1. Add test signal endpoint or wrapper.
2. Mark generated signal as test.
3. Add optional server target.
4. Add UI affordance.
5. Add tests.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
```

### Definition of Done

- Test signal can be generated.
- Test signal is visibly marked.
- Test signal does not masquerade as operational signal.

### Reporting Requirements

Update `codex-execution-report.md` with test signal behavior.

Update `codex-metrics.json` with:

- `test_signal_flow_added = true`

---

## TASK-014: Add webhook and Prometheus signal intake wrappers

### Goal

Expose MVP signal intake endpoints while reusing existing Keep alert/provider intake where possible.

### References

- `api-design.md`: API-013, API-014
- `domain-model.md`: ENT-SIGNAL, ENT-INTEGRATION
- Validation: VAL-009, VAL-010

### Preconditions

- TASK-012 is complete.
- Integration/provider mapping is at least partially available.

### Expected Changes

- Webhook intake endpoint.
- Prometheus Alertmanager-compatible intake endpoint.
- Normalization to Signal.
- Disabled integration behavior.
- Tests with sample payloads.

### Files or Areas to Modify

- Signal intake routes
- Provider/integration wrappers
- Signal normalization helpers
- Backend tests

### Steps

1. Add webhook intake route.
2. Add Prometheus intake route.
3. Validate integration context.
4. Normalize severity and payload summary.
5. Add payload tests.
6. Ensure no secrets are echoed.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run ruff check keep tests
```

### Definition of Done

- Webhook payload creates Signal.
- Prometheus payload creates Signal.
- Invalid payloads return validation errors.
- Disabled integrations are blocked.
- Tests pass.

### Reporting Requirements

Update `codex-execution-report.md` with intake endpoints and fixtures.

Update `codex-metrics.json` with:

- `webhook_intake_added = true`
- `prometheus_intake_added = true`
- `signal_intake_tests_passed = true`

---

## TASK-015: Strengthen incident creation, linking, and lifecycle

### Goal

Ensure Incidents support the MVP closed loop and Signal relationships.

### References

- `domain-model.md`: ENT-INCIDENT, ENT-SIGNAL, State Machines
- `api-design.md`: API-015 through API-022
- `db-schemas.md`: DB-INCIDENTS, DB-INCIDENT-SIGNALS
- Validation: VAL-011, VAL-012

### Preconditions

- TASK-012 is complete.

### Expected Changes

- Incident origin rule.
- Signal-to-incident linking.
- Resolve and reopen behavior.
- Invalid transition handling.
- Workspace scoping.

### Files or Areas to Modify

- Existing incident routes/services
- Incident models or relationship models if needed
- Timeline service integration
- Tests

### Steps

1. Audit existing incident behavior.
2. Add or adapt signal linking.
3. Add origin enforcement.
4. Add resolve/reopen product APIs or wrappers.
5. Add invalid transition tests.
6. Add workspace/tenant scope tests.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run ruff check keep tests
```

### Definition of Done

- Incidents can be created and listed.
- Signals can link to incidents.
- Resolve and reopen work.
- Invalid transitions are blocked.
- Tests pass.

### Reporting Requirements

Update `codex-execution-report.md` with incident lifecycle behavior.

Update `codex-metrics.json` with:

- `incident_signal_linking_added = true`
- `incident_lifecycle_validated = true`

---

## TASK-016: Add incident timeline service and API

### Goal

Record and expose meaningful incident lifecycle events.

### References

- `domain-model.md`: ENT-TIMELINE-EVENT
- `db-schemas.md`: DB-INCIDENT-TIMELINE-EVENTS
- `api-design.md`: API-021
- `architecture.md`: MOD-011
- Validation: VAL-013

### Preconditions

- TASK-015 is complete or in progress.

### Expected Changes

- Timeline persistence and service.
- Timeline API.
- Timeline writes for incident creation, signal linking, resolve, and reopen.
- Tests for ordering and event creation.

### Files or Areas to Modify

- Timeline model/repository/service
- Incident service
- Timeline route
- Backend tests
- Frontend incident detail timeline component

### Steps

1. Add timeline persistence if not already available.
2. Add timeline service.
3. Add timeline events to incident flows.
4. Add API to list timeline events.
5. Add frontend timeline display.
6. Add tests.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
```

### Definition of Done

- Timeline records meaningful incident events.
- Timeline API returns ordered events.
- Incident detail can display timeline.
- Tests pass.

### Reporting Requirements

Update `codex-execution-report.md` with timeline events implemented.

Update `codex-metrics.json` with:

- `timeline_service_added = true`
- `timeline_event_types_count`

---

## TASK-017: Add AI diagnosis domain structure

### Goal

Define structured diagnosis behavior that separates evidence from inference.

### References

- `domain-model.md`: ENT-DIAGNOSIS, ENT-EVIDENCE
- `db-schemas.md`: DB-DIAGNOSES, DB-DIAGNOSIS-EVIDENCE
- `api-design.md`: API-023 through API-025
- Validation: VAL-014

### Preconditions

- TASK-015 and TASK-016 are complete.
- Existing `/ai` route capabilities are understood.

### Expected Changes

- Diagnosis model/persistence if missing.
- Evidence records or evidence abstraction.
- Diagnosis status handling.
- Tests for insufficient evidence and structured result.

### Files or Areas to Modify

- AI/diagnosis services
- Models/repositories
- Tests

### Steps

1. Add diagnosis data structures.
2. Add evidence collection service.
3. Add rules for insufficient evidence.
4. Add current diagnosis behavior.
5. Add tests.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run ruff check keep tests
```

### Definition of Done

- Diagnosis can represent generated, failed, insufficient evidence, and superseded states.
- Evidence is distinct from inference.
- Tests pass.

### Reporting Requirements

Update `codex-execution-report.md` with diagnosis structure.

Update `codex-metrics.json` with:

- `diagnosis_structure_added = true`
- `diagnosis_tests_passed = true`

---

## TASK-018: Add AI diagnosis API wrapper

### Goal

Expose incident-scoped AI diagnosis APIs using or wrapping existing `/ai`.

### References

- `api-design.md`: API-023, API-024, API-025
- `architecture.md`: INT-003
- Validation: VAL-014, VAL-025

### Preconditions

- TASK-017 is complete.

### Expected Changes

- List incident diagnoses.
- Request diagnosis.
- Get diagnosis detail.
- AI adapter errors are handled safely.
- Diagnosis timeline events are recorded.

### Files or Areas to Modify

- AI route or diagnosis route
- Diagnosis application service
- Timeline service
- Tests

### Steps

1. Add or wrap diagnosis routes.
2. Gather incident evidence.
3. Call AI adapter through proper boundary.
4. Store diagnosis.
5. Record timeline event.
6. Add tests for success, failure, and insufficient evidence.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run black --check keep tests
```

### Definition of Done

- Diagnosis APIs match target contract.
- AI failures do not delete incidents.
- Timeline records diagnosis events.
- Tests pass.

### Reporting Requirements

Update `codex-execution-report.md` with AI route mapping.

Update `codex-metrics.json` with:

- `diagnosis_api_added = true`
- `ai_failure_safe = true`

---

## TASK-019: Add AI diagnosis UI

### Goal

Allow users to request and view AI diagnosis from incident detail.

### References

- PRD: MVP Scope, Core Workflows
- `api-design.md`: API-023 through API-025
- Validation: VAL-014

### Preconditions

- TASK-018 is complete.

### Expected Changes

- Diagnosis panel on incident detail.
- Request diagnosis action.
- Loading/status states.
- Evidence/inference display.
- Uncertainty display.
- Failure display.

### Files or Areas to Modify

- Frontend incident detail components
- Frontend diagnosis components
- Frontend API client
- Frontend tests

### Steps

1. Add diagnosis API client.
2. Add diagnosis request button.
3. Add status display.
4. Add structured diagnosis display.
5. Add tests.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npm run lint
docker compose -f docker-compose.dev.yml exec keep-frontend npm run typecheck
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
docker compose -f docker-compose.dev.yml exec keep-frontend npm run build
```

### Definition of Done

- User can request diagnosis.
- Diagnosis displays evidence, probable cause, actions, risk, verification, and uncertainty.
- UI handles failure safely.
- Tests pass.

### Reporting Requirements

Update `codex-execution-report.md` with diagnosis UI behavior.

Update `codex-metrics.json` with:

- `diagnosis_ui_added = true`

---

## TASK-020: Add Integration product wrapper over Providers

### Goal

Expose existing Keep Providers as MVP Integrations with whitelist and category grouping.

### References

- `domain-model.md`: ENT-INTEGRATION
- `api-design.md`: API-038 through API-043
- `architecture.md`: MOD-008, INT-007
- Validation: VAL-020, VAL-023

### Preconditions

- TASK-004 is complete.
- Existing providers route/model is available.

### Expected Changes

- Provider-to-integration mapping.
- MVP provider whitelist.
- Category grouping.
- Sensitive config summary behavior.
- Tests for whitelist and secret redaction.

### Files or Areas to Modify

- Provider/integration routes
- Integration service/wrapper
- Frontend integrations page
- Tests

### Steps

1. Add mapping from provider keys to integration categories.
2. Whitelist Prometheus, Webhook, Qwen, Ollama, SMTP, GitHub, Jira, SSH.
3. Hide all other providers in MVP mode.
4. Normalize responses.
5. Add tests.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
docker compose -f docker-compose.dev.yml exec keep-frontend npm run typecheck
```

### Definition of Done

- Integrations page shows only MVP integrations: Prometheus, Webhook, Qwen, Ollama, SMTP, GitHub, Jira, SSH.
- Provider secrets are not returned.
- Disabled integrations cannot perform new active work.
- Tests pass.

### Reporting Requirements

Update `codex-execution-report.md` with provider whitelist.

Update `codex-metrics.json` with:

- `integrations_wrapper_added = true`
- `mvp_integrations_visible_count`

---

## TASK-021: Add Playbook product wrapper over Workflows

### Goal

Expose existing Keep Workflows as MVP Playbooks.

### References

- `domain-model.md`: ENT-PLAYBOOK, ENT-PLAYBOOK-RUN
- `api-design.md`: API-026 through API-031
- Validation: VAL-015, VAL-016

### Preconditions

- TASK-007 is complete.
- Existing workflows route/model is available.

### Expected Changes

- Workflow-to-playbook mapping.
- MVP playbook template whitelist.
- Playbook list/detail/run wrappers.
- Tests for personal-server templates.

### Files or Areas to Modify

- Workflow/playbook routes
- Playbook service/wrapper
- Frontend playbook pages
- Tests

### Steps

1. Add product mapping for Workflows to Playbooks.
2. Whitelist high CPU, disk usage high, service down, website/API unavailable.
3. Add run endpoint or wrapper.
4. Add frontend playbook pages.
5. Add tests.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
docker compose -f docker-compose.dev.yml exec keep-frontend npm run test:workflow-examples
```

### Definition of Done

- Playbooks UI and API use product language.
- Only 4 MVP playbooks are exposed: high CPU, disk usage high, service down, website/API unavailable.
- Playbook run works or fails safely.
- Tests pass.

### Reporting Requirements

Update `codex-execution-report.md` with workflow-to-playbook mapping.

Update `codex-metrics.json` with:

- `playbooks_wrapper_added = true`
- `mvp_playbooks_visible_count`

---

## TASK-022: Add playbook run result and timeline integration

### Goal

Ensure playbook runs produce traceable results and timeline events.

### References

- `domain-model.md`: ENT-PLAYBOOK-RUN, ENT-TIMELINE-EVENT
- `api-design.md`: API-030, API-031
- Validation: VAL-016, VAL-013

### Preconditions

- TASK-016 and TASK-021 are complete.

### Expected Changes

- Playbook run records steps.
- Partial failure is represented.
- Timeline records playbook effects.

### Files or Areas to Modify

- Playbook service
- Timeline service
- Playbook run API
- Tests

### Steps

1. Add playbook run status mapping.
2. Add step result mapping.
3. Add timeline events for playbook start, completion, and failures.
4. Add tests.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm run test:workflow-examples
```

### Definition of Done

- Playbook run result is visible.
- Partial failure is preserved.
- Timeline records relevant playbook events.
- Tests pass.

### Reporting Requirements

Update `codex-execution-report.md` with playbook run lifecycle.

Update `codex-metrics.json` with:

- `playbook_timeline_integration = true`

---

## TASK-023: Add MVP settings API and UI finalization

### Goal

Expose product mode, enabled pages, enabled integrations, and advanced feature state through Settings.

### References

- `api-design.md`: API-050
- `architecture.md`: CONFIG-002 through CONFIG-007
- Validation: VAL-023

### Preconditions

- TASK-004, TASK-020, and TASK-021 are complete.

### Expected Changes

- Settings API returns product mode and whitelists.
- Settings UI shows lightweight product configuration.
- Advanced features are not exposed as primary settings.

### Files or Areas to Modify

- Settings route/service
- Frontend settings page
- Tests

### Steps

1. Add settings response for product mode.
2. Add enabled page list.
3. Add enabled integration list.
4. Add tests for settings response and UI.
5. Ensure no secrets are returned.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
```

### Definition of Done

- Settings show personal-server MVP mode.
- Settings enabled pages are exactly: overview,servers,incidents,signals,playbooks,actions,integrations,settings.
- Settings enabled integrations are exactly: prometheus,webhook,qwen,ollama,smtp,github,jira,ssh.
- Settings return no secrets.
- Tests pass.

### Reporting Requirements

Update `codex-execution-report.md` with settings API behavior.

Update `codex-metrics.json` with:

- `settings_api_updated = true`
- `settings_ui_updated = true`

---

## TASK-024: Add action risk and approval model

### Goal

Add action risk classification and approval enforcement.

### References

- `domain-model.md`: ENT-ACTION, ENT-ACTION-RUN, ENT-APPROVAL
- `db-schemas.md`: DB-ACTIONS, DB-ACTION-RUNS, DB-ACTION-APPROVALS
- `api-design.md`: API-032 through API-037
- Validation: VAL-017, VAL-019

### Preconditions

- TASK-016 is complete.
- Existing actions route/model is available.

### Expected Changes

- Every visible action has risk level.
- Approval-required action state is represented.
- Rejected action cannot execute.
- Unsafe action cannot run automatically.
- Tests for safety rules.

### Files or Areas to Modify

- Actions model/service/wrapper
- Approval model if needed
- Action APIs
- Timeline service
- Tests

### Steps

1. Add or map risk level metadata.
2. Add approval-required behavior.
3. Add approval and rejection endpoints.
4. Add unsafe action blocking.
5. Add timeline events.
6. Add tests.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run black --check keep tests
```

### Definition of Done

- Action safety rules are enforced.
- Approval endpoints work.
- Unsafe actions are blocked.
- Tests pass.

### Reporting Requirements

Update `codex-execution-report.md` with action safety behavior.

Update `codex-metrics.json` with:

- `action_risk_enabled = true`
- `action_approval_enabled = true`
- `unsafe_action_blocking_enabled = true`

---

## TASK-025: Add read-only SSH diagnostic action path

### Goal

Allow safe read-only diagnostics against a server through the controlled Actions boundary.

### References

- PRD: MVP Scope
- `architecture.md`: INT-006, ARCH-007, FORBID-005
- `api-design.md`: API-034, API-035
- Validation: VAL-018

### Preconditions

- TASK-010 is complete.
- TASK-020 is complete for SSH integration visibility.
- TASK-024 is complete.

### Expected Changes

- Read-only server diagnostic actions are available.
- Action execution targets server.
- SSH adapter does not bypass action service.
- Output is summarized.
- Timeline records result.

### Files or Areas to Modify

- Action service
- SSH/action adapter
- Integration wrapper for SSH
- Frontend action run UI
- Tests

### Steps

1. Define seeded read-only actions.
2. Route execution through action service.
3. Validate target server and integration.
4. Execute through SSH adapter or mockable adapter.
5. Store summarized output.
6. Add tests.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
```

### Definition of Done

- Read-only action can run without approval.
- Output is summarized.
- Timeline records action request and completion.
- Tests pass.

### Reporting Requirements

Update `codex-execution-report.md` with read-only actions added.

Update `codex-metrics.json` with:

- `read_only_actions_seeded_count`
- `ssh_diagnostic_path_added = true`

---

## TASK-026: Add action UI for runs and approvals

### Goal

Expose safe action execution and approval decisions in the frontend.

### References

- `api-design.md`: API-032 through API-037
- Validation: VAL-017, VAL-018, VAL-019

### Preconditions

- TASK-024 is complete.
- TASK-025 is complete or mocked.

### Expected Changes

- Actions list.
- Action detail or run affordance.
- Incident action panel.
- Approval and rejection UI.
- Risk labels.
- Output summary display.

### Files or Areas to Modify

- Frontend action components
- Incident detail components
- Frontend API client
- Tests

### Steps

1. Add action API client methods.
2. Add risk label display.
3. Add run action flow.
4. Add approval/reject flow.
5. Add action result display.
6. Add tests.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npm run lint
docker compose -f docker-compose.dev.yml exec keep-frontend npm run typecheck
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
docker compose -f docker-compose.dev.yml exec keep-frontend npm run build
```

### Definition of Done

- User can view action risk.
- User can run read-only action.
- User can approve or reject approval-required action.
- UI does not allow unsafe autonomous execution.
- Tests pass.

### Reporting Requirements

Update `codex-execution-report.md` with action UI behavior.

Update `codex-metrics.json` with:

- `action_ui_added = true`
- `approval_ui_added = true`

---

## TASK-027: Add notification API and incident integration

### Goal

Allow users to send incident notifications through configured notification integrations.

### References

- `domain-model.md`: ENT-NOTIFICATION
- `db-schemas.md`: DB-NOTIFICATIONS
- `api-design.md`: API-044, API-045
- Validation: VAL-021, VAL-013

### Preconditions

- TASK-016 is complete.
- TASK-020 is complete.

### Expected Changes

- Notification records.
- Notification send API.
- SMTP integration boundary or mockable notification adapter.
- Timeline events.
- Tests for success and failure.

### Files or Areas to Modify

- Notification service/repository
- Notification route
- Integration adapter
- Incident detail UI
- Tests

### Steps

1. Add notification persistence if missing.
2. Add send notification API.
3. Use notification adapter boundary.
4. Record success/failure.
5. Add timeline events.
6. Add frontend UI if in scope.
7. Add tests.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
```

### Definition of Done

- Incident notification can be requested.
- Success/failure is recorded.
- Timeline records result.
- Secrets are not exposed.
- Tests pass.

### Reporting Requirements

Update `codex-execution-report.md` with notification behavior.

Update `codex-metrics.json` with:

- `notification_api_added = true`
- `notification_timeline_integration = true`

---

## TASK-028: Add ticket API and incident integration

### Goal

Allow users to create GitHub or Jira tickets from incidents.

### References

- `domain-model.md`: ENT-TICKET
- `db-schemas.md`: DB-TICKETS
- `api-design.md`: API-046, API-047
- Validation: VAL-022, VAL-013

### Preconditions

- TASK-016 is complete.
- TASK-020 is complete.

### Expected Changes

- Ticket records.
- Ticket create API.
- GitHub/Jira adapter boundary or mockable adapter.
- Idempotency handling.
- Timeline events.
- Tests for success, failure, and duplicate protection.

### Files or Areas to Modify

- Ticket service/repository
- Ticket route
- Integration adapters
- Incident detail UI
- Tests

### Steps

1. Add ticket persistence if missing.
2. Add ticket create API.
3. Use ticket adapter boundary.
4. Add idempotency behavior for external ticket creation.
5. Record success/failure.
6. Add timeline events.
7. Add tests.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
```

### Definition of Done

- Incident ticket can be requested.
- Ticket is linked to incident.
- Duplicate requests with same idempotency key do not create duplicates.
- Timeline records result.
- Secrets are not exposed.
- Tests pass.

### Reporting Requirements

Update `codex-execution-report.md` with ticket behavior.

Update `codex-metrics.json` with:

- `ticket_api_added = true`
- `ticket_idempotency_enabled = true`

---

## TASK-029: Add regression and acceptance test coverage

### Goal

Ensure all core validation IDs have automated or documented manual validation coverage.

### References

- `acceptance-and-validation.md`: VAL-001 through VAL-025
- All product documents

### Preconditions

- TASK-001 through TASK-028 are complete or feature-complete.

### Expected Changes

- Tests cover core features.
- Manual validation checklist is documented in execution report.
- Known gaps are explicitly listed.

### Files or Areas to Modify

- Backend tests
- Frontend tests
- `codex-execution-report.md`
- `codex-metrics.json`

### Steps

1. Map existing tests to VAL IDs.
2. Add missing tests where practical.
3. Document manual-only validations.
4. Run full validation command set.
5. Record results.

### Validation

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

### Definition of Done

- Every VAL ID has automated test coverage or documented manual validation.
- Full validation set passes or failures are documented.
- Execution report is complete.

### Reporting Requirements

Update `codex-execution-report.md` with a VAL ID coverage matrix.

Update `codex-metrics.json` with:

- `validation_ids_total = 25`
- `validation_ids_automated_count`
- `validation_ids_manual_count`
- `full_validation_status`

---

## TASK-030: Perform security and authorization validation

### Goal

Validate workspace scoping, secret redaction, and safe error behavior.

### References

- `acceptance-and-validation.md`: Sections 13, 15, 16
- `architecture.md`: Authorization Strategy
- `api-design.md`: Sections 6, 7, 10, 19
- Validation: VAL-020, VAL-025

### Preconditions

- TASK-029 is in progress or complete.

### Expected Changes

- Tests cover forbidden access.
- Tests cover secret redaction.
- Tests cover error redaction.
- Report documents findings.

### Files or Areas to Modify

- Backend security tests
- API tests
- `codex-execution-report.md`
- `codex-metrics.json`

### Steps

1. Add cross-workspace access tests.
2. Add secret redaction tests for integrations.
3. Add error redaction tests.
4. Add action authorization tests if missing.
5. Run backend tests.

### Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run ruff check keep tests
```

### Definition of Done

- Authorization tests pass.
- Secret redaction tests pass.
- Unsafe action tests pass.
- No known secret exposure remains undocumented.

### Reporting Requirements

Update `codex-execution-report.md` with security validation results.

Update `codex-metrics.json` with:

- `authorization_tests_passed = true`
- `secret_redaction_tests_passed = true`
- `unsafe_action_tests_passed = true`

---

## TASK-031: Produce final MVP execution report

### Goal

Finalize reporting for implementation status, validations, known gaps, and metrics.

### References

- `acceptance-and-validation.md`: Sections 5, 19, 20
- All task reporting requirements

### Preconditions

- TASK-001 through TASK-030 are complete or explicitly marked as deferred.

### Expected Changes

- `codex-execution-report.md` contains milestone summaries.
- `codex-metrics.json` contains final metrics.
- Open questions and deferred work are listed.

### Files or Areas to Modify

- `codex-execution-report.md`
- `codex-metrics.json`

### Steps

1. Summarize each milestone.
2. Summarize each task.
3. Include validation commands and results.
4. Include acceptance coverage matrix.
5. Include known risks and deferred items.
6. Include final metrics.

### Validation

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

### Definition of Done

- Final report exists.
- Final metrics exist.
- Validation status is transparent.
- Known failures are documented.
- Deferred work is documented.

### Reporting Requirements

Update `codex-execution-report.md` with final status.

Update `codex-metrics.json` with:

- `execution_plan_completed = true | false`
- `tasks_completed`
- `tasks_deferred`
- `milestones_completed`
- `full_validation_status`
- `known_blockers`

---

## 8. Task Dependencies

| Task | Depends On |
|---|---|
| TASK-001 | none |
| TASK-002 | TASK-001 |
| TASK-003 | TASK-001 |
| TASK-004 | TASK-001, TASK-003 |
| TASK-005 | TASK-004 |
| TASK-006 | TASK-004 |
| TASK-007 | TASK-005 |
| TASK-008 | TASK-003 |
| TASK-009 | TASK-008 |
| TASK-010 | TASK-009 |
| TASK-011 | TASK-010, TASK-005 |
| TASK-012 | TASK-007 |
| TASK-013 | TASK-012, TASK-010 |
| TASK-014 | TASK-012 |
| TASK-015 | TASK-012 |
| TASK-016 | TASK-015 |
| TASK-017 | TASK-015, TASK-016 |
| TASK-018 | TASK-017 |
| TASK-019 | TASK-018 |
| TASK-020 | TASK-004 |
| TASK-021 | TASK-007 |
| TASK-022 | TASK-016, TASK-021 |
| TASK-023 | TASK-004, TASK-020, TASK-021 |
| TASK-024 | TASK-016 |
| TASK-025 | TASK-010, TASK-020, TASK-024 |
| TASK-026 | TASK-024, TASK-025 |
| TASK-027 | TASK-016, TASK-020 |
| TASK-028 | TASK-016, TASK-020 |
| TASK-029 | TASK-001 through TASK-028 |
| TASK-030 | TASK-029 |
| TASK-031 | TASK-001 through TASK-030 |

---

## 9. Parallelizable Work

The following tasks may proceed in parallel after prerequisites are satisfied:

### Group A: After TASK-004

- TASK-005: Hide non-MVP frontend navigation
- TASK-006: Backend route registration controls
- TASK-020: Integration wrapper

### Group B: After TASK-010 and TASK-012

- TASK-013: Manual test signal
- TASK-014: Webhook and Prometheus intake
- TASK-015: Incident creation and linking

### Group C: After TASK-016

- TASK-017: AI diagnosis structure
- TASK-024: Action risk and approval model
- TASK-027: Notification API
- TASK-028: Ticket API

### Group D: Frontend work after APIs stabilize

- TASK-011: Server UI
- TASK-019: Diagnosis UI
- TASK-026: Action UI

---

## 10. Sequential Work

The following work should remain sequential:

1. TASK-001 before all container validation.
2. TASK-004 before UI and route slimming.
3. TASK-008 → TASK-009 → TASK-010 before Server UI.
4. TASK-012 before signal intake and incident linking.
5. TASK-015 before timeline and diagnosis.
6. TASK-016 before diagnosis, actions, notifications, and tickets rely on timeline.
7. TASK-024 before any approval-required action execution.
8. TASK-029 → TASK-030 → TASK-031 for release readiness.

---

## 11. Validation per Milestone

### MILESTONE-001 Validation

```bash
docker compose -f docker-compose.dev.yml build
mkdir -p state
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm run build
```

Acceptance IDs:

- VAL-001
- VAL-024

---

### MILESTONE-002 Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm run lint
docker compose -f docker-compose.dev.yml exec keep-frontend npm run typecheck
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
```

Acceptance IDs:

- VAL-002
- VAL-003
- VAL-023
- VAL-025

---

### MILESTONE-003 Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run black --check keep tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run isort --check-only keep tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm run build
```

Acceptance IDs:

- VAL-004
- VAL-005
- VAL-006

---

### MILESTONE-004 Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run ruff check keep tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
```

Acceptance IDs:

- VAL-007
- VAL-008
- VAL-009
- VAL-010
- VAL-011
- VAL-012
- VAL-013

---

### MILESTONE-005 Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm run lint
docker compose -f docker-compose.dev.yml exec keep-frontend npm run typecheck
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
```

Acceptance IDs:

- VAL-014
- VAL-013
- VAL-025

---

### MILESTONE-006 Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
docker compose -f docker-compose.dev.yml exec keep-frontend npm run test:workflow-examples
```

Acceptance IDs:

- VAL-015
- VAL-016
- VAL-020
- VAL-023

---

### MILESTONE-007 Validation

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm run lint
docker compose -f docker-compose.dev.yml exec keep-frontend npm run typecheck
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
```

Acceptance IDs:

- VAL-017
- VAL-018
- VAL-019
- VAL-021
- VAL-022
- VAL-013

---

### MILESTONE-008 Validation

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

Acceptance IDs:

- VAL-001 through VAL-025

---

## 12. Reporting Requirements

### REPORT-001: `codex-execution-report.md`

This file must be updated after every task.

Required sections:

- Current task ID
- Task status
- Files changed
- Product/document references
- Validation commands run
- Validation result
- Known failures
- Manual checks performed
- Next task recommendation

If a documented equivalent command is used, `codex-execution-report.md` must include:

- original command
- equivalent command
- reason for substitution
- whether the equivalent validates the same behavior
- result of the equivalent command

### REPORT-002: `codex-metrics.json`

This file must be updated after every task.

Required top-level fields:

```json
{
  "tasks_completed": 0,
  "tasks_deferred": 0,
  "milestones_completed": 0,
  "full_validation_status": "not_run",
  "known_blockers": [],
  "last_task_id": null,
  "last_validation_commands": [],
  "last_validation_status": "not_run"
}
```

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

## Metrics Counter Update Rules

Codex must update metrics deterministically.

### `tasks_completed`

Increment by 1 only when:

- the task Definition of Done is satisfied,
- required validation passed or documented-equivalent validation passed,
- `codex-execution-report.md` is updated,
- `codex-metrics.json` is updated.

### `tasks_deferred`

Increment by 1 only when:

- a task is explicitly deferred,
- the reason is documented,
- affected dependencies are documented.

### `milestones_completed`

Increment by 1 only when:

- all required tasks in the milestone are complete or explicitly deferred,
- milestone validation has passed or a documented blocker is accepted,
- milestone summary is recorded.

### `full_validation_status`

Allowed values:

- `not_run`
- `passed`
- `failed`
- `blocked`
- `partial`

### `last_validation_status`

Allowed values:

- `not_run`
- `passed`
- `failed`
- `blocked`
- `partial`

Codex must not increment counters speculatively.

### REPORT-003: Failure reporting

If a validation command fails, the report must include:

- Exact command
- Exit status if available
- Short failure summary
- Whether the failure blocks the current task
- Recommended next action

### REPORT-004: Deferred task reporting

If a task is deferred, the report must include:

- Reason for deferral
- Risk of deferral
- Dependencies affected
- Required future action

### REPORT-005: Acceptance coverage reporting

Before final completion, report must map:

- VAL IDs covered by automated tests
- VAL IDs covered by manual checks
- VAL IDs not yet covered

---

## 13. Risks

### RISK-001: Existing Keep route complexity

Existing routes may include platform assumptions that conflict with the lightweight product model.

Mitigation:

Use wrappers and product mode before destructive refactors.

### RISK-002: Server module is new

The current codebase may not have a dedicated Server route/model.

Mitigation:

Implement Server as a focused new module with minimal dependencies.

### RISK-003: Workflows may be too powerful for Playbooks

Existing Workflows may expose too much complexity.

Mitigation:

Use Playbook whitelist and simplified UI wrapper.

### RISK-004: Providers may expose too many integrations

Existing Providers may create marketplace sprawl.

Mitigation:

Use MVP integration whitelist and hidden non-MVP providers.

### RISK-005: Action execution safety

Existing Actions may not enforce personal-server risk and approval semantics.

Mitigation:

Add action safety layer before exposing execution.

### RISK-006: AI output uncertainty

AI diagnosis may overstate root cause.

Mitigation:

Require evidence/inference separation and uncertainty statement.

### RISK-007: Container-first dev file may not exist

The repository may currently have only production/quickstart Compose files.

Mitigation:

Add `docker-compose.dev.yml` as the first task.

### RISK-008: Validation baseline may initially fail

Existing tests or lint may fail before product changes.

Mitigation:

Record baseline honestly and separate pre-existing failures from new regressions.

### RISK-009: SQLite compatibility

Existing migrations may assume behavior better suited for PostgreSQL.

Mitigation:

Validate SQLite migration path early.

### RISK-010: Timeline retrofitting

Existing incident flows may not have centralized timeline event creation.

Mitigation:

Add dedicated timeline service and gradually wire events.

---

## 14. Assumptions

### ASM-001

The project remains based on the existing Keep-derived codebase.

### ASM-002

The current backend is a FastAPI monolith under `keep/api`.

### ASM-003

Existing Alerts can be mapped to Signals.

### ASM-004

Existing Workflows can be mapped to Playbooks.

### ASM-005

Existing Providers can be mapped to Integrations.

### ASM-006

Existing Actions can be reused with a safety layer.

### ASM-007

Servers need a new first-class module unless later mapped to an existing internal concept.

### ASM-008

The project should use container-first development.

### ASM-009

SQLite is sufficient for the MVP validation path.

### ASM-010

Advanced platform features should be hidden before being deleted.

### ASM-011

External provider behavior should be tested with mocks.

### ASM-012

No mandatory E2E command exists yet.

### ASM-013

`/api/v1` product APIs may wrap existing unversioned Keep routes.

### ASM-014

Product UI terminology can change before internal code terminology is fully renamed.

### ASM-015

Some validation commands may fail at baseline due to pre-existing issues; these must be reported transparently.

---

## 15. Open Questions

### OQ-001

Should `/api/v1` wrappers be implemented immediately, or should existing unversioned routes be used during Sprint 1?

### OQ-002

Should `servers` be implemented as a new table, or initially mapped to an existing topology/entity concept?

### OQ-003

Should Server Services be included in the first Server milestone or deferred?

### OQ-004

Should DB authentication replace `NO_AUTH` in the default container development workflow?

### OQ-005

Should Redis be included in `docker-compose.dev.yml` for workflow parity with upstream Keep?

### OQ-006

Should timeline persistence be added as a new table or mapped to existing incident event data?

### OQ-007

Should action approval be a new table or metadata on existing action runs?

### OQ-008

Should notifications and tickets be first-class persisted objects or action/playbook step records?

### OQ-009

Should AI diagnosis results be stored in new diagnosis tables or mapped to existing AI suggestion models?

### OQ-010

Should integration whitelist be enforced at backend route level, frontend UI level, or both from Sprint 1?

### OQ-011

Should non-MVP routes be unregistered in lightweight mode or only hidden from the UI?

### OQ-012

Should a one-command reset for local state be documented after MVP stabilizes?

### OQ-013

Should E2E tests become mandatory before first external release?

### OQ-014

Should the execution plan be split into multiple sprint files after this first implementation plan?

### OQ-015

Should metrics in `codex-metrics.json` be validated by a schema file?
