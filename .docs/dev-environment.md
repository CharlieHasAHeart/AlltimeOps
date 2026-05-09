# Dev Environment: Container-First Development

## 1. Purpose

This document defines the container-first development environment for the lightweight AIOps platform for personal servers.

The project is based on a Keep-derived codebase, but local development should be organized around containers first. Host-machine commands should be limited to Docker Compose orchestration, file editing, and optional helper commands.

Container-first development means:

- Backend runs inside a backend container.
- Frontend runs inside a frontend container.
- Websocket service runs inside a websocket container.
- SQLite state is stored in the shared `./state` volume.
- Dependency installation, tests, linting, migrations, and seeding run inside containers.
- Host-level Python, Poetry, Node.js, and npm are not required for normal development.

---

## 2. Source of Truth

This `dev-environment.md` is the source of truth for installing, running, testing, migrating, seeding, and validating the project in a container-first workflow.

Related source documents:

- `tech-stack.md`
- `architecture.md`
- `api-design.md`
- `db-schemas.md`

If this document conflicts with `tech-stack.md`, `tech-stack.md` takes precedence for technology choices.

If this document conflicts with `architecture.md`, `architecture.md` takes precedence for architecture boundaries.

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

---

## 4. Codex Usage

Codex should use this document whenever it needs to run or validate the project.

Codex must prefer Docker Compose commands over host-level Python, Poetry, Node.js, or npm commands.

Codex should not run host dependency installation commands unless a section explicitly marks the command as a host-only exception.

### Validation Command Policy

Codex must use commands from `dev-environment.md` by default.

If an exact command cannot run because of repository reality, container service name differences, missing script names, missing `docker-compose.dev.yml`, or a documented environment mismatch, Codex may use a documented equivalent command only if all conditions are met:

1. The equivalent command runs inside the correct container or uses the closest available project-approved container.
2. The equivalent command validates the same behavior.
3. The exact failed or unavailable command is recorded in `codex-execution-report.md`.
4. The equivalent command is recorded in `codex-execution-report.md`.
5. The reason for substitution is recorded in `codex-execution-report.md`.
6. `dev-environment.md` is updated if the equivalent command becomes the new standard.

Codex must not silently replace validation commands.

Codex must not use host-level Python, Poetry, Node, or npm commands as equivalents unless `dev-environment.md` explicitly allows that exception.

---

## 5. Non-Goals

This document does not define product requirements.

This document does not define API contracts.

This document does not define database schema fields.

This document does not define business rules.

This document does not define implementation task order.

This document does not define production Kubernetes deployment.

---

## 6. Operating System Assumptions

### OS-001: Supported host systems

Use one of:

- Ubuntu 22.04 LTS or newer
- macOS 14 or newer
- Windows with WSL2 Ubuntu

### OS-002: Required host tools

Only these host tools are required for normal container-first development:

```bash
docker --version
docker compose version
git --version
```

### OS-003: Shell

Use a POSIX-compatible shell.

Preferred shell:

```bash
bash
```

### OS-004: Docker Compose syntax

Use Docker Compose v2:

```bash
docker compose
```

Do not use legacy `docker-compose`.

---

## 7. Runtime Versions

### RUNTIME-001: Runtime ownership

Runtime versions are owned by containers, not the host machine.

### RUNTIME-002: Backend runtime

Backend container uses Python 3.11 as the selected baseline.

The backend project dependency range allows Python `>=3.11,<3.14`, but container development should standardize on Python 3.11.

### RUNTIME-003: Frontend runtime

Frontend container uses Node.js 20 LTS as the selected baseline.

### RUNTIME-004: Package manager versions

Package managers run inside containers:

- Backend: Poetry
- Frontend: npm

### RUNTIME-005: Host runtime not required

Normal development must not require host-level Python, Poetry, Node.js, or npm.

---

## 8. Package Manager Policy

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

### PKG-001: Backend package manager

Backend dependencies must be managed with Poetry inside the backend container.

Allowed backend dependency command:

```bash
docker compose exec keep-backend poetry install --with dev
```

### PKG-002: Frontend package manager

Frontend dependencies must be managed with npm inside the frontend container.

Allowed frontend dependency command:

```bash
docker compose exec keep-frontend npm install
```

### PKG-003: Host package manager restriction

Do not run host-level package installation by default.

Forbidden host commands:

```bash
poetry install --with dev
npm install
cd keep-ui && npm install
pip install -r requirements.txt
```

### PKG-004: Forbidden alternative package managers

Do not use:

```bash
pnpm
yarn
bun
uv
pipenv
conda
pdm
hatch
```

### PKG-005: npm policy

Because the current frontend uses npm scripts, use npm only.

Do not use:

```bash
pnpm install
yarn install
bun install
```

---

## 9. Dependency Installation

## 8.1 Container image dependency installation

The preferred dependency path is to build development images.

### DEP-001: Build development containers

Run from repository root:

```bash
docker compose -f docker-compose.dev.yml build
```

### DEP-002: Start development containers after build

Run from repository root:

```bash
mkdir -p state
docker compose -f docker-compose.dev.yml up -d
```

## 8.2 In-container dependency refresh

Use this only when dependency files changed and the development image is already running.

### DEP-003: Refresh backend dependencies inside container

Run from repository root:

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry install --with dev
```

### DEP-004: Refresh frontend dependencies inside container

Run from repository root:

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npm install
```

## 8.3 Dependency reset

### DEP-005: Rebuild containers without cache

Run from repository root:

```bash
docker compose -f docker-compose.dev.yml build --no-cache
```

---

## 10. Local Development Commands

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

## 9.1 Primary container-first workflow

### DEV-001: Start the development stack

Run from repository root:

```bash
mkdir -p state
docker compose -f docker-compose.dev.yml up -d
```

### DEV-002: Follow all logs

Run from repository root:

```bash
docker compose -f docker-compose.dev.yml logs -f
```

### DEV-003: Follow backend logs

Run from repository root:

```bash
docker compose -f docker-compose.dev.yml logs -f keep-backend
```

### DEV-004: Follow frontend logs

Run from repository root:

```bash
docker compose -f docker-compose.dev.yml logs -f keep-frontend
```

### DEV-005: Follow websocket logs

Run from repository root:

```bash
docker compose -f docker-compose.dev.yml logs -f keep-websocket-server
```

### DEV-006: Stop the development stack

Run from repository root:

```bash
docker compose -f docker-compose.dev.yml down
```

### DEV-007: Restart backend only

Run from repository root:

```bash
docker compose -f docker-compose.dev.yml restart keep-backend
```

### DEV-008: Restart frontend only

Run from repository root:

```bash
docker compose -f docker-compose.dev.yml restart keep-frontend
```

### DEV-009: Open backend shell

Run from repository root:

```bash
docker compose -f docker-compose.dev.yml exec keep-backend bash
```

### DEV-010: Open frontend shell

Run from repository root:

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend sh
```

## 9.2 Local URLs

### DEV-011: Frontend URL

```text
http://localhost:3000
```

### DEV-012: Backend URL

```text
http://localhost:8080
```

### DEV-013: Websocket URL

```text
http://localhost:6001
```

## 9.3 Optional observability profile

### DEV-014: Start with Grafana and Prometheus

Run from repository root:

```bash
mkdir -p state
docker compose -f docker-compose.dev.yml --profile grafana up -d
```

### DEV-015: Grafana URL

```text
http://localhost:3001
```

### DEV-016: Prometheus URL

```text
http://localhost:9090
```

---

## 10. Build Commands

### BUILD-001: Build all development images

Run from repository root:

```bash
docker compose -f docker-compose.dev.yml build
```

### BUILD-002: Build backend image only

Run from repository root:

```bash
docker compose -f docker-compose.dev.yml build keep-backend
```

### BUILD-003: Build frontend image only

Run from repository root:

```bash
docker compose -f docker-compose.dev.yml build keep-frontend
```

### BUILD-004: Build frontend production artifact inside container

Run from repository root with the development stack running:

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npm run build
```

### BUILD-005: Build backend package inside container

Run from repository root with the development stack running:

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry build
```

---

## 11. Lint Commands

### LINT-001: Backend Ruff lint

Run from repository root with the development stack running:

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run ruff check keep tests
```

### LINT-002: Backend Black check

Run from repository root with the development stack running:

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run black --check keep tests
```

### LINT-003: Backend import order check

Run from repository root with the development stack running:

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run isort --check-only keep tests
```

### LINT-004: Frontend lint

Run from repository root with the development stack running:

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npm run lint
```

### LINT-005: Full lint validation

Run from repository root with the development stack running:

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run ruff check keep tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run black --check keep tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run isort --check-only keep tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm run lint
```

---

## 12. Typecheck Commands

### TYPE-001: Frontend typecheck

Run from repository root with the development stack running:

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npm run typecheck
```

### TYPE-002: Backend typecheck

No mandatory backend typecheck command is selected for the MVP.

Do not introduce mypy or pyright unless `tech-stack.md` and this document are updated.

---

## 13. Test Commands

### TEST-001: Backend tests

Run from repository root with the development stack running:

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
```

### TEST-002: Backend tests with parallelism

Run from repository root with the development stack running:

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests -n auto
```

### TEST-003: Frontend tests

Run from repository root with the development stack running:

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
```

### TEST-004: Workflow example validation

Run from repository root with the development stack running:

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npm run test:workflow-examples
```

### TEST-005: Full test validation

Run from repository root with the development stack running:

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
docker compose -f docker-compose.dev.yml exec keep-frontend npm run test:workflow-examples
```

---

## 14. E2E Commands

### E2E-001: E2E status

No mandatory E2E command is selected for the MVP.

### E2E-002: Forbidden speculative E2E command

Do not run:

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npx playwright test
```

unless a Playwright config and E2E test directory are added and this document is updated.

### E2E-003: Future E2E command placeholder

When E2E tests are added, the command must be documented here before use.

---

## 15. Database Startup

### DB-001: Default local database

The default local MVP database is SQLite.

### DB-002: SQLite state location

The database is stored under:

```text
./state/db.sqlite3
```

### DB-003: Start database through container stack

SQLite does not require a separate database container.

Run from repository root:

```bash
mkdir -p state
docker compose -f docker-compose.dev.yml up -d keep-backend
```

### DB-004: Do not run external databases by default

Do not start PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch, ClickHouse, or Snowflake for the default personal-server MVP development path.

### DB-005: Redis default

Redis is not required for the default container-first MVP development mode if scheduler, consumer, watcher, topology processor, and maintenance windows are disabled.

---

## 16. Migration Commands

### MIG-001: Automatic migration path

Backend startup runs the existing Keep startup flow, including migration handling.

Preferred migration command:

```bash
docker compose -f docker-compose.dev.yml up -d keep-backend
```

### MIG-002: Manual migration command

Run from repository root with the development stack running:

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run python -c "from keep.api.core.db_on_start import migrate_db; migrate_db()"
```

### MIG-003: Full startup provisioning command

Run from repository root with the development stack running:

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run python -c "import keep.api.config as c; c.on_starting()"
```

### MIG-004: Forbidden direct database editing

Do not manually edit:

```text
state/db.sqlite3
```

### MIG-005: Forbidden raw Alembic commands

Do not run raw Alembic commands unless this document is updated with an approved exact command.

---

## 17. Seed Commands

### SEED-001: Default seed path

The existing startup flow provisions the single tenant, default user, providers, workflows, dashboards, and deduplication rules when provisioning is enabled.

### SEED-002: Run seed/provision command

Run from repository root with the development stack running:

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry run python -c "import keep.api.config as c; c.on_starting()"
```

### SEED-003: Disable provisioning

Set this in the backend container environment when provisioning should be disabled:

```bash
PROVISION_RESOURCES=false
```

### SEED-004: MVP seed direction

The personal-server MVP should seed only:

- MVP integration metadata
- server-oriented playbook templates
- safe read-only diagnostic actions
- lightweight product settings

### SEED-005: Default local credentials in DB auth mode

If DB authentication is enabled and default user creation is active, default local credentials are:

```text
KEEP_DEFAULT_USERNAME=keep
KEEP_DEFAULT_PASSWORD=keep
```

unless overridden.

---

## 18. Code Generation Commands

### CODEGEN-001: Frontend workflow YAML JSON schema

Run from repository root with the development stack running:

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npm run build:workflow-yaml-json-schema
```

### CODEGEN-002: Monaco workers

Run from repository root with the development stack running:

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npm run build-monaco-workers
```

### CODEGEN-003: No backend code generation selected

No mandatory backend code generation command is selected for the MVP.

### CODEGEN-004: Forbidden speculative code generation

Do not run provider cache generation, OpenAPI client generation, Prisma generation, GraphQL generation, or protobuf generation unless this document is updated with exact commands.

---

## 19. Environment Variables

## 19.1 Backend container environment

The backend development container must define:

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

### ENV-001: AUTH_TYPE

Local default:

```text
NO_AUTH
```

Production-like local testing may use DB authentication after this document is updated with exact commands.

### ENV-002: SECRET_MANAGER_TYPE

Local default:

```text
FILE
```

### ENV-003: SECRET_MANAGER_DIRECTORY

Container path:

```text
/state
```

### ENV-004: DATABASE_CONNECTION_STRING

Container SQLite value:

```text
sqlite:////state/db.sqlite3?check_same_thread=False
```

### ENV-005: OPENAI_API_KEY

Optional unless testing AI diagnosis.

Set through local `.env` or shell environment:

```bash
OPENAI_API_KEY=<redacted>
```

Never commit this value.

## 19.2 Frontend container environment

The frontend development container must define:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
API_URL=http://keep-backend:8080
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=secret
PUSHER_HOST=localhost
PUSHER_PORT=6001
PUSHER_APP_KEY=keepappkey
NEXT_PUBLIC_PRODUCT_MODE=personal_server_mvp
```

### ENV-006: NEXT_PUBLIC_API_URL

Browser-facing API URL:

```text
http://localhost:8080
```

### ENV-007: API_URL

Server-side frontend container API URL:

```text
http://keep-backend:8080
```

### ENV-008: NEXTAUTH_URL

Local frontend URL:

```text
http://localhost:3000
```

### ENV-009: NEXTAUTH_SECRET

Local-only value:

```text
secret
```

Use a stronger value outside local development.

## 19.3 Websocket container environment

The websocket development container must define:

```bash
SOKETI_USER_AUTHENTICATION_TIMEOUT=3000
SOKETI_DEBUG=1
SOKETI_DEFAULT_APP_ID=1
SOKETI_DEFAULT_APP_KEY=keepappkey
SOKETI_DEFAULT_APP_SECRET=keepappsecret
```

---

## 20. `.env.example` Requirements

### ENVEX-001: Root `.env.example`

The root `.env.example` must include:

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
OPENAI_API_KEY=
PRODUCT_MODE=personal_server_mvp
ENABLED_PROVIDERS=prometheus,webhook,qwen,ollama,smtp,github,jira,ssh
ENABLED_PAGES=overview,servers,incidents,signals,playbooks,actions,integrations,settings
```

### ENVEX-002: Frontend `keep-ui/.env.example`

The frontend `.env.example` must include:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
API_URL=http://keep-backend:8080
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=secret
PUSHER_HOST=localhost
PUSHER_PORT=6001
PUSHER_APP_KEY=keepappkey
NEXT_PUBLIC_PRODUCT_MODE=personal_server_mvp
```

### ENVEX-003: Secret placeholders

`.env.example` files must not include real secrets.

Forbidden in `.env.example`:

- real OpenAI keys
- GitHub tokens
- Jira tokens
- SMTP passwords
- SSH private keys
- webhook secrets

---

## 21. Mock and Local Services

### LOCAL-001: SQLite

SQLite is the default database and runs as a file in the shared `./state` volume.

### LOCAL-002: Websocket service

Run through the Compose service:

```bash
docker compose -f docker-compose.dev.yml up -d keep-websocket-server
```

### LOCAL-003: Grafana and Prometheus

Optional local observability services:

```bash
docker compose -f docker-compose.dev.yml --profile grafana up -d
```

### LOCAL-004: AI provider

AI is optional for local development.

For Qwen-compatible testing, provide:

```bash
OPENAI_API_KEY=<redacted>
```

For local AI, use the Ollama-compatible integration after it is configured.

### LOCAL-005: SMTP

SMTP should be configured through integration settings.

Do not hard-code SMTP credentials in Compose files or `.env.example`.

### LOCAL-006: GitHub and Jira

GitHub and Jira should be configured through integration settings.

Do not hard-code provider tokens in Compose files or `.env.example`.

---

## 22. Allowed Commands

### ALLOW-001: Container stack commands

```bash
docker compose -f docker-compose.dev.yml build
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml --profile grafana up -d
docker compose -f docker-compose.dev.yml logs -f
docker compose -f docker-compose.dev.yml down
```

### ALLOW-002: Container shell commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend bash
docker compose -f docker-compose.dev.yml exec keep-frontend sh
```

### ALLOW-003: Backend in-container commands

```bash
docker compose -f docker-compose.dev.yml exec keep-backend poetry install --with dev
docker compose -f docker-compose.dev.yml exec keep-backend poetry run ruff check keep tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run black --check keep tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run isort --check-only keep tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests
docker compose -f docker-compose.dev.yml exec keep-backend poetry run pytest tests -n auto
docker compose -f docker-compose.dev.yml exec keep-backend poetry run python -c "from keep.api.core.db_on_start import migrate_db; migrate_db()"
docker compose -f docker-compose.dev.yml exec keep-backend poetry run python -c "import keep.api.config as c; c.on_starting()"
```

### ALLOW-004: Frontend in-container commands

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npm install
docker compose -f docker-compose.dev.yml exec keep-frontend npm run dev
docker compose -f docker-compose.dev.yml exec keep-frontend npm run build
docker compose -f docker-compose.dev.yml exec keep-frontend npm run lint
docker compose -f docker-compose.dev.yml exec keep-frontend npm run typecheck
docker compose -f docker-compose.dev.yml exec keep-frontend npm test -- --runInBand
docker compose -f docker-compose.dev.yml exec keep-frontend npm run test:workflow-examples
docker compose -f docker-compose.dev.yml exec keep-frontend npm run build:workflow-yaml-json-schema
docker compose -f docker-compose.dev.yml exec keep-frontend npm run build-monaco-workers
```

---

## 23. Forbidden Commands

### FORBID-001: Host dependency installation

Do not run on the host:

```bash
poetry install --with dev
cd keep-ui && npm install
pip install -r requirements.txt
```

### FORBID-002: Host runtime commands

Do not run on the host:

```bash
poetry run keep api --port 8080 --host 0.0.0.0
cd keep-ui && npm run dev
cd keep-ui && npm run build
cd keep-ui && npm test
```

Use container commands instead.

### FORBID-003: Legacy Docker Compose

Do not use:

```bash
docker-compose up
docker-compose down
```

Use:

```bash
docker compose
```

### FORBID-004: Alternative package managers

Do not use:

```bash
pnpm
yarn
bun
uv
pipenv
conda
pdm
hatch
```

### FORBID-005: Direct Python execution

Do not run project Python directly on the host:

```bash
python script.py
python3 script.py
```

Use documented container commands.

### FORBID-006: Direct database editing

Do not manually edit:

```text
state/db.sqlite3
```

### FORBID-007: Removing local state by default

Do not run:

```bash
rm -rf state
```

unless intentionally resetting all local data and secrets.

### FORBID-008: Kubernetes and infrastructure tools

Do not use these for MVP local development:

```bash
kubectl
helm
terraform
```

### FORBID-009: Speculative E2E

Do not run:

```bash
docker compose -f docker-compose.dev.yml exec keep-frontend npx playwright test
```

unless this file is updated.

---

## 24. Common Errors and Fixes

### ERR-001: `docker-compose.dev.yml` does not exist

Cause:

The repository has not yet added the container-first development Compose file.

Fix:

Create `docker-compose.dev.yml` according to this document.

Temporary fallback only if `docker-compose.dev.yml` is not available:

```bash
mkdir -p state
docker compose up -d
```

This fallback may use published images and is not the preferred source-development path.

---

### ERR-002: Backend container exits on startup

Cause:

Environment variables, SQLite path, or dependency installation may be incorrect.

Fix:

```bash
docker compose -f docker-compose.dev.yml logs -f keep-backend
docker compose -f docker-compose.dev.yml exec keep-backend poetry install --with dev
docker compose -f docker-compose.dev.yml restart keep-backend
```

---

### ERR-003: Frontend container cannot reach backend

Cause:

`API_URL` inside the frontend container points to `localhost` instead of the backend service name.

Fix:

Set frontend container environment:

```bash
API_URL=http://keep-backend:8080
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Then restart frontend:

```bash
docker compose -f docker-compose.dev.yml restart keep-frontend
```

---

### ERR-004: Browser cannot reach backend

Cause:

`NEXT_PUBLIC_API_URL` is wrong.

Fix:

Set:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Then restart frontend:

```bash
docker compose -f docker-compose.dev.yml restart keep-frontend
```

---

### ERR-005: SQLite database cannot be created

Cause:

`./state` does not exist or is not mounted to `/state`.

Fix:

```bash
mkdir -p state
docker compose -f docker-compose.dev.yml restart keep-backend
```

---

### ERR-006: Websocket connection fails

Cause:

`keep-websocket-server` is not running or frontend Pusher variables are wrong.

Fix:

```bash
docker compose -f docker-compose.dev.yml up -d keep-websocket-server
docker compose -f docker-compose.dev.yml restart keep-frontend
```

---

### ERR-007: Port 3000 already in use

Cause:

Another frontend container or host process is using port 3000.

Fix:

```bash
docker compose -f docker-compose.dev.yml ps
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d
```

---

### ERR-008: Port 8080 already in use

Cause:

Another backend container or host process is using port 8080.

Fix:

```bash
docker compose -f docker-compose.dev.yml ps
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d
```

---

### ERR-009: AI diagnosis fails locally

Cause:

No AI provider key is configured.

Fix:

Set a local secret outside version control:

```bash
OPENAI_API_KEY=<redacted>
```

Then restart backend:

```bash
docker compose -f docker-compose.dev.yml restart keep-backend
```

---

### ERR-010: Dependency changes are not reflected

Cause:

Container image or in-container dependencies are stale.

Fix:

```bash
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up -d
```

---

## 25. Assumptions

### ASM-001

The project should move from host-first development to container-first development.

### ASM-002

A `docker-compose.dev.yml` file should be added for source-mounted development containers.

### ASM-003

The existing root `docker-compose.yml` can remain as a published-image quickstart, but it is not the preferred development workflow.

### ASM-004

Backend dependencies are managed with Poetry inside the backend container.

### ASM-005

Frontend dependencies are managed with npm inside the frontend container.

### ASM-006

The default local database is SQLite mounted through `./state:/state`.

### ASM-007

The frontend app lives under `keep-ui`.

### ASM-008

The backend app lives under the repository root Python package `keep`.

### ASM-009

The personal-server MVP does not require Kubernetes for local development.

### ASM-010

No mandatory E2E command is selected until E2E configuration is added.

---

## 26. Open Questions

### OQ-001

Should `docker-compose.dev.yml` build from dedicated `Dockerfile.dev` files or reuse existing production Dockerfiles with development overrides?

### OQ-002

Should backend and frontend dependency directories be stored in named Docker volumes to improve rebuild speed?

### OQ-003

Should the frontend use `npm install` or `npm ci` after a valid package lock is confirmed?

### OQ-004

Should DB authentication replace `NO_AUTH` as the default container development mode?

### OQ-005

Should Redis be added to the development stack for workflow parity with upstream Keep?

### OQ-006

Should a `make dev` wrapper be introduced, or should raw Docker Compose commands remain the source of truth?

### OQ-007

Should Grafana and Prometheus remain optional profile services or be part of the default personal-server demo stack?

### OQ-008

Should a separate `docker-compose.test.yml` be added for isolated test execution?

### OQ-009

Should the backend test database be a separate SQLite file from the development database?

### OQ-010

Should a one-command reset be documented for intentional local state deletion?
