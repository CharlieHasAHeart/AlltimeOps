# AGENTS.md

## 1. Purpose

This document tells Codex how to work inside this repository.

The repository is being transformed from a broad Keep-derived AIOps platform into a lightweight AIOps product for personal servers.

Codex must work from the project documents, follow the execution plan, use the container-first development environment, validate against the acceptance standards, and maintain implementation reporting.

This file is operational guidance. It does not replace the product, domain, architecture, database, API, development, execution, or acceptance documents.

---

## 2. Canonical Project Decisions

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

### MVP Provider Whitelist

The MVP provider whitelist is:

- `prometheus`
- `webhook`
- `qwen`
- `ollama`
- `smtp`
- `github`
- `jira`
- `ssh`

Rules:

- Qwen is the default cloud LLM provider for the MVP.
- Ollama is the default local/self-hosted LLM provider for the MVP.
- OpenAI is not part of the default MVP provider whitelist.
- OpenAI-compatible providers may be considered later, but must be documented as future scope, not MVP scope.

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

---

## 3. Instruction Priority

Codex must follow instructions in this order:

1. System and safety instructions.
2. `AGENTS.md`.
3. `execution-plan.md`.
4. `acceptance-and-validation.md`.
5. `dev-environment.md`.
6. `architecture.md`.
7. `api-design.md`.
8. `db-schemas.md`.
9. `domain-model.md`.
10. `prd.md`.
11. `tech-stack.md`.
12. Existing repository conventions.

If two instructions conflict, Codex must follow the higher-priority instruction and document the conflict in `codex-execution-report.md`.

Codex must not silently resolve conflicts by guessing.

---

## 4. Required Reading Order

Before starting implementation, Codex must read the project documents in this order:

1. `AGENTS.md`
2. `prd.md`
3. `domain-model.md`
4. `tech-stack.md`
5. `architecture.md`
6. `db-schemas.md`
7. `api-design.md`
8. `dev-environment.md`
9. `acceptance-and-validation.md`
10. `execution-plan.md`

Before starting a specific task, Codex must reread the task section in `execution-plan.md` and the related validation section in `acceptance-and-validation.md`.

Codex must not implement from memory when a project document defines the rule.

---

## 5. Work Process

Codex must use this work process for every task:

1. Identify the current task from `execution-plan.md`.
2. Read the task's references.
3. Check prerequisites.
4. Inspect existing code before modifying files.
5. Make the smallest coherent change that satisfies the task.
6. Add or update tests required by the task.
7. Run the exact validation commands required by the task.
8. Update `codex-execution-report.md`.
9. Update `codex-metrics.json`.
10. Report completion status clearly.

Codex must not skip directly to implementation without checking dependencies and validation requirements.

Codex must not combine unrelated tasks unless `execution-plan.md` says they are parallelizable.

---

## 6. Planning Rules

Codex must follow `execution-plan.md` for task order.

Codex must not reorder sequential tasks unless a blocker requires it.

Codex may work on parallelizable tasks only when:

- all prerequisites are complete,
- the tasks are listed as parallelizable in `execution-plan.md`,
- the work does not cause hidden coupling,
- the reporting files clearly state which tasks were worked on.

Codex must not create a new implementation plan that conflicts with `execution-plan.md`.

Codex may document proposed changes to the plan in `codex-execution-report.md`, but must not treat proposed changes as approved unless the relevant project document is updated.

---

## 7. Implementation Rules

Codex must preserve the architectural direction defined in `architecture.md`.

Business logic must live in application services or domain services.

Database access is allowed only through repositories or approved persistence services.

Frontend code must not own final business rules.

Frontend code must not directly access the database.

Integration adapters must not directly mutate core domain state.

AI providers must not execute actions.

SSH execution must not bypass action service, risk classification, approval rules, result recording, or timeline recording.

Notifications and ticketing must go through their service boundaries.

Timeline events must be recorded for meaningful incident lifecycle events.

Codex must prefer wrappers and product-mode gating before destructive rewrites.

Codex must hide non-MVP Keep platform surfaces before deleting legacy code.

---

## 8. File Modification Rules

Codex must modify only files required for the current task.

Codex must inspect existing files before editing them.

Codex must preserve existing behavior unless the current task explicitly requires changing it.

Codex must not perform broad renames unless the execution plan calls for them.

Codex must not delete legacy Keep modules during early slimming tasks unless a project document explicitly says deletion is required.

Codex must not edit generated files manually unless the project document identifies them as manually editable.

Codex must not silently change product documents to match implementation shortcuts.

If implementation requires a document change, Codex must update the relevant document and record why in `codex-execution-report.md`.

---

## 9. Dependency Management Rules

Codex must follow `dev-environment.md` for all dependency commands.

The project uses container-first development.

Backend dependency commands must run inside the backend container.

Frontend dependency commands must run inside the frontend container.

Codex must not change the package manager.

Codex must not introduce unnecessary dependencies.

Codex must not add a dependency when the same result can be achieved with existing project libraries.

Codex must document any required dependency addition in `codex-execution-report.md`, including:

- package name,
- package version or range,
- reason,
- affected area,
- validation commands run.

## Dependency Command Policy

Dependency installation is allowed only inside approved development containers.

Allowed in-container commands:

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry install --with dev
docker compose -f docker-compose.dev.yml exec keep-frontend npm install
```

Forbidden host-level commands:

```bash
poetry install --with dev
npm install
cd keep-ui && npm install
pip install -r requirements.txt
```

Rules:

- `poetry install --with dev` is allowed only inside the backend container.
- `npm install` is allowed only inside the frontend container.
- Host-level dependency installation is forbidden by default.
- Do not use pnpm, yarn, bun, uv, pipenv, conda, pdm, or hatch.

Forbidden dependency actions:

```bash
pnpm
yarn
bun
uv
pipenv
conda
pdm
hatch
pip install -r requirements.txt
```

Host-level dependency installation is forbidden unless `dev-environment.md` is updated to permit it.

---

## 10. Database Change Rules

Codex must follow `db-schemas.md` for persistence design.

Codex must not implement every table in `db-schemas.md` by default.

Codex must treat `db-schemas.md` as the target-state database design.

Sprint 1 database changes must be limited to the current execution task.

Codex must not create migrations for future-scope tables unless the current task explicitly requires them.

Codex must not add database tables, fields, indexes, constraints, or enums without checking `db-schemas.md`.

Codex must not silently change database behavior without updating `db-schemas.md`.

Codex must preserve SQLite-first compatibility.

Codex must avoid destructive migrations in early slimming work.

Codex must not manually edit the SQLite database.

Codex must not run raw Alembic commands unless `dev-environment.md` explicitly allows the command.

Every database change must include:

- migration or documented migration decision,
- model updates,
- repository or persistence updates,
- tests,
- validation command results,
- update to `codex-execution-report.md`,
- update to `codex-metrics.json`.

Sensitive values must not be stored as ordinary business fields.

Secrets must not appear in config summaries, logs, errors, API responses, fixtures, or seed data.

---

## 11. API Change Rules

Codex must follow `api-design.md` for API contracts.

Codex must not add, remove, rename, or reshape product-facing APIs without updating `api-design.md`.

Codex must not silently change request or response shapes.

Codex must preserve compatibility with existing Keep routes when the plan calls for wrappers.

Codex must not assume full `/api/v1` migration is required for Sprint 1.

Codex must follow the phased API rollout strategy:

- keep existing Keep routes available internally,
- add product wrappers only where required,
- document any new wrapper,
- do not silently rename or remove existing routes.

Codex must use product terminology for new MVP API surfaces:

- Alerts become Signals.
- Workflows become Playbooks.
- Providers become Integrations.
- Servers are first-class product objects.
- AI output is Diagnosis.
- Operational history is Timeline.

Codex must use MVP product terminology in user-facing UI and product-facing documentation.

Codex may preserve legacy Keep terminology in internal code, existing route names, and compatibility adapters.

Codex must not perform broad internal renames solely for terminology cleanup unless the execution plan explicitly requires it.

New MVP APIs should use the common response and error envelopes defined in `api-design.md`.

API responses must not expose secrets.

API errors must not expose secrets.

API changes must include tests for:

- success behavior,
- validation failure,
- authorization failure,
- not found behavior,
- relevant conflict behavior,
- secret redaction when applicable.

---

## 12. Testing and Validation Rules

Codex must follow `acceptance-and-validation.md` for completion standards.

Codex must follow `dev-environment.md` for validation commands.

Codex must not skip validation.

Codex may use a documented equivalent validation command only under the Validation Command Policy.

Codex must not treat an undocumented substitute as valid validation.

Codex must not run host-level validation commands when container-first commands are specified.

Codex must not use host-level Python, Poetry, Node, or npm commands as equivalents unless `dev-environment.md` explicitly allows that exception.

Required validation commands must use this style:

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
```

Codex must run the validation commands required by the current task.

If an exact command is unavailable, Codex may run a documented equivalent only when it validates the same behavior and the substitution is fully recorded.

If a validation command fails, Codex must:

1. record the exact command,
2. record the failure summary,
3. determine whether the failure is new or pre-existing when possible,
4. fix the issue if it is within the current task scope,
5. document unresolved failures in `codex-execution-report.md`.

Codex must not mark a task complete if required validation fails unless the failure is clearly unrelated, documented, and accepted as a known blocker.

Codex must not mark a task complete when both the exact command and documented equivalent were not run, unless the reason is recorded as a blocker.

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

Codex must not use vague acceptance language as proof of completion.

When a task says a feature is hidden, reduced, clear, lightweight, or fast, Codex must validate it against `Objective Acceptance Thresholds` in `acceptance-and-validation.md`.

---

## 13. Documentation Sync Rules

Codex must keep project documents synchronized with implementation.

If implementation changes product behavior, update the relevant product document.

If implementation changes domain meaning, update `domain-model.md`.

If implementation changes technology choices, update `tech-stack.md`.

If implementation changes module boundaries or dependency direction, update `architecture.md`.

If implementation changes persistence, update `db-schemas.md`.

If implementation changes APIs, update `api-design.md`.

If implementation changes commands or environment variables, update `dev-environment.md`.

If implementation changes acceptance criteria or validation commands, update `acceptance-and-validation.md`.

If implementation changes task order or task scope, update `execution-plan.md`.

Codex must not silently let implementation drift away from documentation.

---

## 14. Security Rules

Codex must not commit secrets.

Codex must not create examples containing real API keys, tokens, passwords, private keys, webhook secrets, SMTP credentials, GitHub tokens, Jira tokens, or AI provider keys.

Codex must not log secrets.

Codex must not expose secrets in API responses.

Codex must not expose secrets in error messages.

Codex must not expose secrets in test fixtures.

Codex must not expose secrets in `codex-execution-report.md` or `codex-metrics.json`.

Integration responses may include only non-sensitive `config_summary`.

Signal payloads may expose only safe summaries.

Action output must be summarized or excerpted and treated as operationally sensitive.

AI diagnosis content must remain workspace-scoped.

Ticket URLs and external references must remain workspace-scoped.

Authorization must be enforced on the backend.

Frontend hiding is not a security boundary.

---

## 15. Environment Variable Rules

Codex must follow `dev-environment.md` for environment variables.

Canonical frontend variable:

```bash
NEXT_PUBLIC_PRODUCT_MODE=personal_server_mvp
```

Deprecated compatibility variables (allowed only for temporary legacy mapping):

```bash
NEXT_PUBLIC_SLIM_MODE
NEXT_PUBLIC_PRODUCT_MODE=lite
```

The default container-first backend environment uses:

```bash
AUTH_TYPE=NO_AUTH
SECRET_MANAGER_TYPE=FILE
SECRET_MANAGER_DIRECTORY=/state
DATABASE_CONNECTION_STRING=sqlite:////state/db.sqlite3?check_same_thread=False
PORT=8080
KEEP_API_URL=http://localhost:8080
KEEP_METRICS=true
SCHEDULER=false
CONSUMER=false
KEEP_TOPOLOGY_PROCESSOR=false
WATCHER=false
MAINTENANCE_WINDOWS=false
USE_NGROK=false
PROVISION_RESOURCES=true
PRODUCT_MODE=personal_server_mvp
ENABLED_PROVIDERS=prometheus,webhook,qwen,ollama,smtp,github,jira,ssh
ENABLED_PAGES=overview,servers,incidents,signals,playbooks,actions,integrations,settings
```

Codex must not add required environment variables without updating:

- `.env.example`,
- `keep-ui/.env.example` if frontend-related,
- `dev-environment.md`,
- `codex-execution-report.md`.

Environment examples must use blank or redacted placeholders for secrets.

---

## 16. Metrics and Reporting Rules

Codex must maintain these files:

- `codex-execution-report.md`
- `codex-metrics.json`

Codex must update both after every task.

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

`codex-execution-report.md` must include:

- current task ID,
- task status,
- files changed,
- references used,
- validation commands run,
- validation results,
- known failures,
- manual checks performed,
- next task recommendation.

`codex-metrics.json` must include at least:

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

Codex must keep JSON valid.

Codex must not inflate metrics.

Codex must not mark a validation as passed unless the command actually passed.

Codex must not remove known blockers without documenting the fix.

---

## 17. Assumption Policy

Codex must avoid guessing.

If information is missing, Codex should inspect the repository first.

If the repository does not answer the question, Codex should inspect the project documents.

If uncertainty remains, Codex should choose the safest minimal implementation that preserves existing behavior and document the assumption.

All assumptions must be recorded in `codex-execution-report.md`.

If an assumption affects product scope, API shape, database behavior, security, or task order, Codex must update the relevant project document or mark the issue as a blocker.

---

## 18. Blocker Policy

A blocker exists when Codex cannot proceed safely without violating project documents or safety rules.

Examples of blockers:

- required file is missing,
- required validation command cannot run,
- `docker-compose.dev.yml` is absent before TASK-001 completion,
- API behavior conflicts with `api-design.md`,
- database change conflicts with `db-schemas.md`,
- package manager change would be required,
- secret exposure is detected,
- task prerequisite is incomplete,
- tests fail for reasons outside current task scope.

When blocked, Codex must:

1. stop the unsafe work,
2. document the blocker in `codex-execution-report.md`,
3. update `codex-metrics.json`,
4. provide the smallest safe next step,
5. not pretend the task is complete.

Codex may continue with a parallelizable unblocked task only if `execution-plan.md` allows it and the report clearly documents the switch.

---

## 19. Completion Procedure

Before marking a task complete, Codex must verify:

1. The task goal is met.
2. Preconditions were satisfied.
3. Expected changes were made.
4. Files modified are within task scope.
5. Required tests were added or updated.
6. Required validation commands were run.
7. Validation results were recorded.
8. Documentation remains synchronized.
9. `codex-execution-report.md` was updated.
10. `codex-metrics.json` was updated.
11. No secrets were introduced.
12. No unrelated package manager or dependency changes were made.
13. No silent API or database behavior changes were made.
14. Known issues are documented.

Before marking a milestone complete, Codex must run the milestone validation commands in `execution-plan.md`.

Before marking the MVP implementation complete, Codex must run the full validation set from `acceptance-and-validation.md`.

---

## 20. Final Response Format

When reporting work completion, Codex must respond with:

```markdown
## Status
Done / Partially done / Blocked

## Task
TASK-XXX: Task name

## Summary
- What changed
- Why it changed
- What was intentionally not changed

## Files Changed
- path/to/file
- path/to/file

## Validation
- `exact command` — passed / failed / not run
- `exact command` — passed / failed / not run

## Reporting
- `codex-execution-report.md` updated: yes / no
- `codex-metrics.json` updated: yes / no

## Known Issues
- None
```

If blocked, Codex must use:

```markdown
## Status
Blocked

## Blocker
Describe the blocker.

## Evidence
State what was inspected or what command failed.

## Safe Next Step
Describe the smallest safe next step.
```

Codex must not claim success when validation was not run or failed.
