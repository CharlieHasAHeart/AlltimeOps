# Tech Stack: Lightweight AIOps Platform for Personal Servers

## 1. Purpose

This document defines the selected technology stack for the lightweight AIOps platform for personal servers.

The project is derived from an existing Keep-based codebase. The selected stack intentionally preserves the current core technologies where they are already suitable, while narrowing deployment and product assumptions for a lightweight personal-server product.

The goal is to avoid unnecessary rewrites and keep the project focused on product slimming, information architecture changes, server-first workflows, AI diagnosis, notifications, ticketing, and safe SSH diagnostics.

---

## 2. Source of Truth

This `tech-stack.md` is the source of truth for technology selection.

The product source of truth remains `prd.md`.

The business domain source of truth remains `domain-model.md`.

If implementation choices conflict with this document, this document takes precedence for technology selection.

If product behavior conflicts with this document, `prd.md` takes precedence.

---

## 3. Codex Usage

Codex should use this document to determine which technologies are selected and which alternatives are not allowed.

Codex should preserve the chosen stack unless a future explicit product decision updates this file.

Codex should not introduce a new framework, package manager, database, ORM, runtime, styling system, state management library, test stack, or deployment target unless this document is updated first.

---

## 4. Non-Goals

This document does not define product requirements, business entities, database fields, API contracts, UI components, runtime commands, local commands, or implementation tasks.

This document does not authorize a full rewrite of the product.

This document does not define enterprise-scale deployment architecture.

This document does not define provider-specific integration implementation details.

This document does not define security policy beyond technology selection.

---

## 5. Technology Summary

### Selected MVP Stack

| Area | Selected Technology |
|---|---|
| Frontend language | TypeScript |
| Frontend runtime | Node.js |
| Frontend framework | Next.js |
| UI library | React |
| Backend language | Python |
| Backend framework | FastAPI |
| Backend runtime | Python 3.11+ within the existing supported range |
| Python dependency management | Poetry |
| Node package manager | npm |
| Database for MVP | SQLite |
| Future production database option | PostgreSQL |
| ORM / query layer | SQLModel with SQLAlchemy |
| Frontend validation | Zod |
| Backend validation | Pydantic |
| Authentication | Keep DB authentication with NextAuth.js frontend session handling |
| Realtime updates | Existing Pusher-compatible WebSocket approach through Soketi |
| Frontend server state | SWR |
| Frontend local UI state | Zustand |
| Form handling | React Hook Form |
| Styling | Tailwind CSS with existing component utilities |
| Backend tests | pytest |
| Frontend tests | Jest and React Testing Library |
| E2E tests | Playwright |
| Deployment target | Docker Compose on a personal server |
| Observability intake | Prometheus and generic webhooks |
| AI services | Qwen-compatible remote AI and Ollama-compatible local AI |
| Notifications | SMTP email first |
| Ticketing | GitHub Issues and Jira |
| Remote diagnostics | SSH |

---

## 6. Language and Runtime

### LANG-001: Frontend Language

The frontend shall use TypeScript.

JavaScript-only implementation is not selected for new frontend product code.

### LANG-002: Frontend Runtime

The frontend shall use Node.js as required by the existing Next.js application.

### LANG-003: Backend Language

The backend shall use Python.

The product shall not rewrite the backend in Go, Rust, Java, Kotlin, Node.js, or Ruby for the MVP.

### LANG-004: Backend Runtime Version

The backend shall target Python 3.11+ within the existing supported project range.

The MVP should treat Python 3.11 as the conservative default runtime baseline because it aligns with the existing ecosystem and avoids unnecessary compatibility risk.

### LANG-005: Rewrite Policy

The MVP shall not change the primary backend language.

Any future high-throughput data-plane service in another language must be justified by measured bottlenecks and must not be introduced as part of Sprint 1 or the MVP slimming phase.

---

## 7. Package Manager

### PKG-001: Node Package Manager

The selected Node.js package manager is **npm**.

### PKG-002: Forbidden Node Package Managers

The project shall not use pnpm, yarn, or bun unless this document is updated.

### PKG-003: Python Dependency Manager

The selected Python dependency and execution approach is **Poetry**.

### PKG-004: Forbidden Python Dependency Approaches

The project shall not switch to uv, pipenv, raw python/pip, conda, hatch, or pdm unless this document is updated.

### PKG-005: Package Manager Rationale

npm and Poetry are selected because they align with the current codebase and avoid avoidable migration work during product slimming.

---

## 8. Frontend Framework

### FE-001: Framework

The frontend shall use **Next.js**.

### FE-002: UI Library

The frontend shall use **React**.

### FE-003: Language

The frontend shall use **TypeScript** for product code.

### FE-004: Application Direction

The frontend should be slimmed by information architecture, navigation, routing visibility, integration visibility, template visibility, and product language changes rather than by replacing the framework.

### FE-005: Forbidden Frontend Frameworks

The MVP shall not introduce or migrate to:

- Vite as the main application framework
- Remix
- Astro
- SvelteKit
- Nuxt
- Vue
- Angular
- Plain server-rendered templates as the main UI

### FE-006: Frontend Component Approach

The frontend shall continue using the existing React component ecosystem while simplifying exposed product surfaces.

### FE-007: Frontend Editor Components

Existing editor components may remain where required for playbooks, but the MVP should avoid exposing complex editor-heavy flows to personal-server users unless needed.

---

## 9. Backend Framework

### BE-001: Framework

The backend shall use **FastAPI**.

### BE-002: Server Runtime

The backend may continue using the existing ASGI-compatible server approach.

### BE-003: Backend Role

The backend remains responsible for business logic, signal intake, incident management, diagnosis orchestration, playbook execution, integration coordination, notifications, ticket creation, and safe action orchestration.

### BE-004: Forbidden Backend Frameworks

The MVP shall not migrate to:

- Django
- Flask
- Litestar
- Express
- NestJS
- Spring Boot
- Rails
- Go HTTP frameworks
- Rust web frameworks

### BE-005: Backend Slimming Strategy

Backend slimming should focus on limiting exposed integrations, playbook templates, navigation metadata, feature flags, and product scope rather than changing the backend framework.

---

## 10. Database

### DB-001: MVP Database

The selected MVP database is **SQLite**.

### DB-002: MVP Database Rationale

SQLite is selected for personal-server deployment because it minimizes operational burden and fits the expected MVP scale of one user and a small number of servers.

### DB-003: Future Production Database Option

PostgreSQL is the selected future production database option for users who outgrow SQLite.

### DB-004: Existing Database Compatibility

The product should preserve compatibility with the existing persistence model where practical.

### DB-005: Forbidden MVP Databases

The MVP shall not introduce the following as required databases:

- MongoDB
- Cassandra
- DynamoDB
- Redis as primary persistence
- Elasticsearch as primary persistence
- ClickHouse as primary persistence
- MySQL as the default MVP database
- SQL Server as the default MVP database

### DB-006: Database Scope

The MVP database should store product state such as servers, signals, incidents, diagnoses, action history, integration status, and timeline records.

This document does not define database fields or schema.

---

## 11. ORM or Query Builder

### ORM-001: Selected ORM

The selected ORM/query layer is **SQLModel with SQLAlchemy**.

### ORM-002: Migration Tool

The existing migration approach may continue to use Alembic where migrations are required.

### ORM-003: ORM Rationale

SQLModel and SQLAlchemy align with the current backend stack and allow the project to avoid a persistence rewrite during product slimming.

### ORM-004: Forbidden ORM or Query Alternatives

The MVP shall not migrate to:

- Django ORM
- Tortoise ORM
- Prisma
- Peewee
- Pony ORM
- Raw SQL as the dominant data access strategy
- A custom query builder

---

## 12. Authentication

### AUTH-001: MVP Authentication Mode

The selected MVP authentication mode is **Keep DB authentication**.

### AUTH-002: Frontend Session Handling

The frontend shall continue using the existing NextAuth.js-based authentication approach where applicable.

### AUTH-003: Production Authentication Rule

No-auth mode is not selected for production or commercial MVP use.

### AUTH-004: No-Auth Exception

No-auth mode may exist only for local development, demos, isolated evaluation, or explicitly insecure internal testing.

### AUTH-005: Enterprise Auth Not Selected for MVP

The MVP shall not require Keycloak, Auth0, Okta, Azure AD, OneLogin, SAML, LDAP, or OAuth2 Proxy.

### AUTH-006: Future Auth Options

Future versions may add external identity providers if the product expands beyond personal-server users or single-operator deployments.

### AUTH-007: Authentication Rationale

DB authentication is selected because it is lighter than enterprise SSO and safer than no-auth for a personal-server product.

---

## 13. Validation

### VAL-001: Backend Validation

The backend shall use **Pydantic** for request, configuration, and domain-adjacent validation where applicable.

### VAL-002: Frontend Validation

The frontend shall use **Zod** for form and client-side validation.

### VAL-003: Form Validation

React Hook Form may be used for form state and user input handling.

### VAL-004: Validation Rationale

Pydantic and Zod are already aligned with the current technology direction and provide explicit validation without adding a new validation stack.

### VAL-005: Forbidden Validation Alternatives

The MVP shall not introduce Yup, Joi, Marshmallow, Cerberus, or custom-only validation as the primary validation approach.

---

## 14. State Management

### STATE-001: Server State

The frontend shall use **SWR** for remote server state and data fetching patterns.

### STATE-002: Local UI State

The frontend shall use **Zustand** for local UI state where shared client state is needed.

### STATE-003: Form State

The frontend shall use **React Hook Form** for form state where appropriate.

### STATE-004: State Management Rationale

SWR, Zustand, and React Hook Form align with the current frontend dependencies and are sufficient for the MVP.

### STATE-005: Forbidden State Management Alternatives

The MVP shall not introduce Redux, MobX, Recoil, Apollo Client state management, XState as a core state manager, or a custom global state framework.

---

## 15. Styling Approach

### STYLE-001: Styling System

The frontend shall use **Tailwind CSS** as the primary styling approach.

### STYLE-002: Component Utilities

The frontend may continue using existing React component utilities and lightweight component libraries already present in the project.

### STYLE-003: Design Direction

The MVP design should be minimal, server-first, and operationally focused.

### STYLE-004: Styling Rationale

Tailwind CSS aligns with the current UI stack and supports rapid simplification of navigation, empty states, server cards, incident summaries, and action panels.

### STYLE-005: Forbidden Styling Alternatives

The MVP shall not migrate to:

- Material UI as the primary design system
- Chakra UI
- Ant Design
- Bootstrap as the primary styling system
- CSS-in-JS as the dominant styling approach
- A full custom design system rewrite

---

## 16. Testing Stack

### TEST-001: Backend Unit and Integration Tests

The backend shall use **pytest**.

### TEST-002: Backend Async Testing

The backend may use pytest-compatible async testing where needed.

### TEST-003: Frontend Unit and Component Tests

The frontend shall use **Jest** and **React Testing Library**.

### TEST-004: End-to-End Tests

The selected E2E testing tool is **Playwright**.

### TEST-005: Testing Scope

The MVP test scope should prioritize:

- Signal intake behavior
- Incident creation behavior
- AI diagnosis state behavior
- Notification and ticket result behavior
- Action risk and approval behavior
- Simplified navigation visibility
- Integration whitelist behavior
- Playbook template whitelist behavior

### TEST-006: Forbidden Testing Alternatives

The MVP shall not introduce Cypress, Vitest, Mocha, Jasmine, Robot Framework, or Selenium as primary test technologies unless this document is updated.

---

## 17. Code Quality Tools

### QUALITY-001: Python Formatting

The backend shall use **Black** for Python formatting.

### QUALITY-002: Python Import Sorting

The backend shall use **isort** for Python import ordering.

### QUALITY-003: Python Linting

The backend shall use **Ruff** as the primary Python linting tool.

### QUALITY-004: Legacy Python Linting

Existing flake8 configuration may remain if already present, but new quality decisions should prefer Ruff.

### QUALITY-005: Frontend Type Checking

The frontend shall use **TypeScript** type checking.

### QUALITY-006: Frontend Linting

The frontend shall use **ESLint** with the existing Next.js and TypeScript-compatible configuration.

### QUALITY-007: Frontend Formatting

The frontend shall use **Prettier**.

### QUALITY-008: Pre-Commit

The project may continue using the existing pre-commit approach.

### QUALITY-009: Forbidden Quality Tool Replacements

The MVP shall not introduce a competing Python formatter, competing frontend formatter, or alternative type system unless this document is updated.

---

## 18. Deployment Target

### DEPLOY-001: MVP Deployment Target

The selected MVP deployment target is **Docker Compose on a personal server**.

### DEPLOY-002: Deployment Shape

The product shall be deployable as a small set of containers suitable for a single personal server.

### DEPLOY-003: Default Persistence

The MVP shall use local persistent state suitable for a personal-server deployment.

### DEPLOY-004: Realtime Component

The MVP may retain the existing Pusher-compatible WebSocket component through Soketi for realtime updates.

### DEPLOY-005: Optional Observability Components

Prometheus and other observability components may be deployed externally or as optional companion services.

### DEPLOY-006: Not Selected for MVP

The MVP shall not require:

- Kubernetes
- Helm
- OpenShift
- AWS ECS
- Terraform
- Managed cloud database
- Multi-node high availability
- Service mesh
- Air-gapped enterprise deployment

### DEPLOY-007: Future Deployment Options

Future versions may support Kubernetes or managed cloud deployments if the product expands beyond personal-server use.

---

## 19. Third-Party Services

### TPS-001: Monitoring Intake

The MVP shall support **Prometheus** and **generic webhook** signal intake.

### TPS-002: AI Services

The MVP shall support a Qwen-compatible remote AI provider and an Ollama-compatible local AI provider.

### TPS-003: Notification Service

The MVP shall support **SMTP email** as the default notification service.

### TPS-004: Ticketing Services

The MVP shall support **GitHub Issues** and **Jira** for ticket or issue creation.

### TPS-005: Remote Diagnostics

The MVP shall support **SSH** for read-only server diagnostics and approved actions.

### TPS-006: Realtime Service

The MVP may use a Pusher-compatible WebSocket service through Soketi.

### TPS-007: Analytics

Product analytics shall not be required for the MVP.

### TPS-008: Error Tracking

Error tracking may remain if already configured, but it is not a required MVP product dependency.

### TPS-009: Forbidden Third-Party Service Requirements

The MVP shall not require Datadog, New Relic, Dynatrace, PagerDuty, ServiceNow, Opsgenie, Slack, Microsoft Teams, AWS CloudWatch, Azure Monitor, GCP Monitoring, Sentry, Elastic, or Loki.

These services may be considered future integrations but must not be required for the MVP.

---

## 20. Forbidden Technologies

### FORBID-001: Backend Rewrites

The MVP must not rewrite the backend in Go, Rust, Java, Kotlin, Node.js, Ruby, or PHP.

### FORBID-002: Frontend Rewrites

The MVP must not rewrite the frontend in Vue, Angular, Svelte, Astro, Remix, or plain server-rendered templates.

### FORBID-003: Package Managers

The MVP must not use pnpm, yarn, bun, uv, pipenv, raw pip, conda, pdm, hatch, or mixed package-manager strategies.

### FORBID-004: Required Enterprise Infrastructure

The MVP must not require Kubernetes, service mesh, enterprise SSO, managed cloud databases, external queue platforms, or multi-node infrastructure.

### FORBID-005: Required Enterprise Integrations

The MVP must not require enterprise observability or ITSM integrations such as Datadog, New Relic, Dynatrace, ServiceNow, PagerDuty, or Opsgenie.

### FORBID-006: Primary Persistence Alternatives

The MVP must not use MongoDB, Elasticsearch, Redis, ClickHouse, Cassandra, DynamoDB, MySQL, or SQL Server as required primary persistence.

### FORBID-007: ORM Alternatives

The MVP must not migrate to Prisma, Django ORM, Tortoise ORM, Peewee, or a custom ORM layer.

### FORBID-008: State Management Alternatives

The MVP must not introduce Redux, MobX, Recoil, or XState as the main frontend state management solution.

### FORBID-009: Styling Alternatives

The MVP must not migrate to Material UI, Chakra UI, Ant Design, Bootstrap, or a new design system as the primary styling approach.

### FORBID-010: Autonomous Dangerous Automation

The MVP must not introduce a technology path that allows AI to execute dangerous server actions without explicit user approval.

---

## 21. Rationale

### RAT-001: Preserve Current Core Stack

The current codebase already uses Python, FastAPI, Next.js, React, TypeScript, npm, Poetry, SQLModel, SQLAlchemy, Pydantic, Zod, SWR, Zustand, Tailwind CSS, pytest, Jest, and Playwright. These technologies are suitable for the MVP and do not need to be replaced.

### RAT-002: Product Slimming Is More Valuable Than Rewriting

The current product challenge is not primarily language performance. The main problem is exposed complexity: too many providers, pages, templates, enterprise concepts, and integration surfaces.

### RAT-003: Python Is Sufficient for MVP Backend Workloads

The MVP workload is expected to be dominated by I/O, external integrations, AI calls, notifications, ticketing, and SSH diagnostics. Rewriting the backend would add risk without solving the main product problem.

### RAT-004: Next.js Is Sufficient for UI Slimming

The UI needs information architecture slimming, terminology changes, server-first pages, and reduced navigation. These goals do not require a frontend framework migration.

### RAT-005: SQLite Fits Personal Servers

SQLite is appropriate for a personal-server MVP because it is lightweight, easy to operate, and avoids requiring users to manage a separate database service.

### RAT-006: PostgreSQL Remains the Growth Path

PostgreSQL is the preferred future path for users who need more scale, reliability, concurrency, or operational maturity than SQLite.

### RAT-007: Docker Compose Matches the Target User

Personal-server users are more likely to accept Docker Compose than Kubernetes. Docker Compose keeps deployment aligned with the product positioning.

### RAT-008: DB Auth Balances Simplicity and Safety

DB authentication is more secure than no-auth while avoiding enterprise identity complexity.

### RAT-009: Limited Integrations Preserve Product Clarity

The MVP should focus on Prometheus, webhook, AI, email, GitHub/Jira, and SSH. This supports the closed loop without turning the product back into a broad integration marketplace.

### RAT-010: Safe Actions Require Clear Boundaries

SSH diagnostics are powerful but risky. The technology stack must support action risk labeling, approvals, and clear execution history rather than unrestricted automation.

---

## 22. Assumptions

### ASM-001

The project remains based on the existing Keep-derived codebase.

### ASM-002

The MVP targets personal-server users who operate a small number of servers.

### ASM-003

The MVP does not require enterprise high availability.

### ASM-004

The MVP does not require multi-organization tenancy.

### ASM-005

The current backend stack is adequate for the MVP signal volume.

### ASM-006

The current frontend stack is adequate after navigation and feature-surface slimming.

### ASM-007

SQLite is sufficient for the initial product experience.

### ASM-008

PostgreSQL compatibility is valuable but not required as the default MVP setup.

### ASM-009

Poetry and npm remain acceptable developer tooling choices.

### ASM-010

AI provider latency will be dominated by model service response time, not backend language choice.

### ASM-011

Most performance gains should come from reducing loaded features, provider surface, templates, polling, and exposed UI complexity.

### ASM-012

The product can retain existing internal capabilities while hiding advanced features from the MVP user experience.

---

## 23. Open Questions

### OQ-001

Should the MVP ship with DB authentication enabled by default, or should the first local-only demo still default to no-auth?

### OQ-002

Should PostgreSQL be tested continuously from the start even though SQLite is the MVP default?

### OQ-003

Should Slack or Microsoft Teams be promoted from future integrations into the MVP notification stack?

### OQ-004

Should local AI through Ollama be a first-class default option or an advanced setting?

### OQ-005

Should the existing WebSocket component remain required in the MVP, or can realtime updates be simplified for personal-server deployments?

### OQ-006

Should product analytics and error tracking be disabled by default for privacy-sensitive personal-server users?

### OQ-007

Should Playwright E2E coverage be required before the first public MVP release?

### OQ-008

Should the MVP retain all existing backend provider dependencies internally, or should dependency slimming happen after UI/provider whitelisting is stable?

### OQ-009

Should the project define a strict browser support matrix for personal-server users?

### OQ-010

Should future high-throughput components be evaluated only after real usage data proves a bottleneck?
