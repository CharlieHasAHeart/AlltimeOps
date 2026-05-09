# Architecture: Lightweight AIOps Platform for Personal Servers

## 1. Purpose

This document defines how the lightweight AIOps platform for personal servers should be organized.

The system is derived from an existing Keep-based codebase, but the target product is narrower and more focused. The architecture must support a server-first operational loop:

**Server → Signal → Incident → AI Diagnosis → Notification / Ticket / Safe Action → Timeline**

This document defines application boundaries, module boundaries, layering, dependency direction, request lifecycle, authorization placement, integration boundaries, background job boundaries, and forbidden architecture patterns.

---

## 2. Source of Truth

This `architecture.md` is the source of truth for system organization.

The product source of truth is `prd.md`.

The business domain source of truth is `domain-model.md`.

The selected technology source of truth is `tech-stack.md`.

The database storage source of truth is `db-schemas.md`.

If architecture conflicts with product scope, `prd.md` takes precedence.

If architecture conflicts with domain meaning, `domain-model.md` takes precedence.

If architecture conflicts with technology selection, `tech-stack.md` takes precedence.

---

## 3. Codex Usage

Codex should use this document to determine where code belongs, how modules should depend on each other, where business logic must live, where database access is allowed, where authorization checks must happen, and how third-party integrations should be isolated.

Codex should preserve the architecture boundaries defined here unless this file is explicitly updated.

Codex should not introduce new architectural layers, external services, direct database access paths, frontend business-rule ownership, or integration shortcuts that violate this document.

---

## 4. Non-Goals

This document does not define full database schema.

This document does not define full API contracts.

This document does not define UI design specs.

This document does not define local commands, installation commands, runtime commands, or deployment commands.

This document does not define provider-specific implementation details.

This document does not define enterprise-scale architecture, high availability, multi-region deployment, service mesh, billing architecture, or complex enterprise tenancy.

This document does not require rewriting the existing backend or frontend stack.

---

## 5. System Overview

The system is a lightweight AIOps application for personal servers.

The system has five major application areas:

1. **Frontend Application**
   - Presents the server-first product experience.
   - Allows users to view servers, signals, incidents, playbooks, actions, integrations, and settings.
   - Sends user requests to the backend.
   - Does not own business rules.

2. **Backend API**
   - Receives frontend requests and external signal intake.
   - Authenticates and authorizes requests.
   - Coordinates application services.
   - Returns product state to the frontend.

3. **Application and Domain Services**
   - Own business workflows and product decisions.
   - Handle server onboarding, signal processing, incident creation, AI diagnosis orchestration, playbook execution, action safety, notification, ticketing, and timeline recording.

4. **Persistence Layer**
   - Owns database access.
   - Stores users, workspaces, servers, signals, incidents, diagnoses, playbooks, actions, notifications, tickets, integrations, and timeline events.

5. **Integration Adapters**
   - Isolate calls to Prometheus, webhook intake, AI providers, SMTP, GitHub, Jira, SSH, and any future external service.
   - Do not own core business state transitions.

The architecture should prioritize simplicity, safety, traceability, and fast first value over enterprise extensibility.

---

## 6. Application Boundaries

### APP-001: Frontend Boundary

The frontend is responsible for:

- Rendering product pages.
- Collecting user input.
- Showing empty states and onboarding prompts.
- Displaying server health, signals, incidents, diagnoses, playbook runs, action results, integrations, and timeline entries.
- Calling backend APIs.
- Managing local UI state.

The frontend is not responsible for:

- Creating incidents directly from signals.
- Deciding action risk.
- Approving actions without backend validation.
- Running SSH commands.
- Calling AI providers directly.
- Creating tickets directly.
- Sending notifications directly.
- Accessing the database.

---

### APP-002: Backend API Boundary

The backend API is responsible for:

- Authentication.
- Authorization.
- Request validation.
- Routing requests to application services.
- Handling external signal intake.
- Returning domain state to the frontend.
- Enforcing business rules through application and domain services.

The backend API should not contain complex business logic inline when that logic belongs in services.

The backend may expose both legacy Keep routes and product-facing wrapper routes during migration.

Wrapper routes are allowed when they clarify MVP product concepts.

Legacy routes must not leak non-MVP product surfaces into primary UI.

---

### APP-003: Application Service Boundary

Application services are responsible for use-case orchestration.

Examples:

- Add server.
- Receive signal.
- Create incident.
- Generate AI diagnosis.
- Run playbook.
- Request action.
- Approve action.
- Execute safe action.
- Send notification.
- Create ticket.
- Record timeline event.

Application services may coordinate repositories and integration adapters.

Application services must not contain provider-specific low-level protocol details.

---

### APP-004: Domain Service Boundary

Domain services are responsible for business rules that are independent of transport and external tools.

Examples:

- Incident state transitions.
- Signal-to-incident association decisions.
- Diagnosis result interpretation rules.
- Action risk and approval rules.
- Server health state derivation.
- Timeline event requirements.
- Workspace boundary rules.

Domain services must not call external providers directly.

Domain services must not access the database directly.

---

### APP-005: Persistence Boundary

Persistence is responsible for database access.

Only repositories or persistence services may read and write database records.

Business logic must not be hidden inside database models, ORM lifecycle hooks, or migration scripts.

---

### APP-006: Integration Boundary

Integration adapters are responsible for external systems.

Examples:

- Prometheus adapter.
- Webhook adapter.
- AI adapter.
- SMTP adapter.
- GitHub adapter.
- Jira adapter.
- SSH adapter.

Integration adapters must return normalized results to application services.

Integration adapters must not directly mutate incidents, signals, diagnoses, actions, tickets, or notifications.

---

## 7. Module Boundaries

The MVP should be organized around the following business modules.

### MOD-001: Users and Workspaces

Owns:

- Users
- Workspaces
- Workspace memberships
- Workspace ownership boundaries

Responsibilities:

- Determine workspace context.
- Provide user ownership context.
- Support authorization checks.

Must not own:

- Server monitoring.
- Incident lifecycle.
- Action execution.
- Provider-specific behavior.

---

### MOD-002: Servers

Owns:

- Server records
- Server health state
- Server environment labels
- Server service records
- Server onboarding status

Responsibilities:

- Add and update servers.
- Represent monitored personal servers.
- Track health, connection, monitoring, and diagnosis access status.
- Provide server context to incidents, signals, and actions.

Must not own:

- Signal intake.
- AI diagnosis.
- Notification delivery.
- SSH execution implementation.

---

### MOD-003: Signals

Owns:

- Incoming signals
- Signal normalization
- Signal status
- Signal source metadata
- Test signal distinction

Responsibilities:

- Accept signals from allowed sources.
- Normalize signals into product language.
- Persist signals even when server mapping is missing.
- Link signals to incidents when directed by incident services.

Must not own:

- Incident lifecycle beyond requesting or proposing association.
- AI diagnosis.
- Ticket creation.
- Action execution.

---

### MOD-004: Incidents

Owns:

- Incident lifecycle
- Incident status
- Incident severity
- Incident-signal links
- Current diagnosis reference
- Recommended next action summary

Responsibilities:

- Create incidents.
- Associate signals.
- Manage incident state transitions.
- Reopen resolved incidents when appropriate.
- Preserve incident traceability.

Must not own:

- AI provider calls.
- Notification transport.
- Ticket provider calls.
- SSH execution.

---

### MOD-005: Diagnosis

Owns:

- AI diagnosis orchestration
- Diagnosis state
- Diagnosis evidence
- Diagnosis uncertainty rules
- Current diagnosis selection

Responsibilities:

- Collect evidence from signals, timelines, server context, and action results.
- Request AI diagnosis through AI integration boundary.
- Store structured diagnosis.
- Distinguish evidence from inference.
- Mark insufficient evidence when appropriate.

Must not own:

- Direct external AI client details outside adapter boundary.
- Incident creation.
- Action execution.

---

### MOD-006: Playbooks

Owns:

- Playbook definitions
- Playbook run lifecycle
- Playbook step records
- High-level operational flow

Responsibilities:

- Define guided flows for personal-server problems.
- Trigger diagnosis, notifications, tickets, and safe actions through application services.
- Record playbook execution results.

Must not own:

- Direct provider calls.
- Direct database writes outside repositories.
- Business rules owned by incidents, diagnosis, or actions.

---

### MOD-007: Actions

Owns:

- Action definitions
- Action risk level
- Action run lifecycle
- Action approval lifecycle
- Action result recording

Responsibilities:

- Classify actions by risk.
- Require approval for state-changing actions.
- Prevent unsafe autonomous execution.
- Coordinate execution through action integration adapters.
- Record action results and timeline events.

Must not own:

- SSH protocol implementation details outside adapter.
- AI diagnosis.
- Notification transport.

---

### MOD-008: Integrations

Owns:

- Integration metadata
- Integration enabled/disabled state
- Connection status
- Non-sensitive configuration summaries

Responsibilities:

- Present and manage MVP integration capabilities.
- Group integrations by monitoring, AI, notification, ticketing, and actions.
- Validate integration availability.
- Prevent disabled integrations from being used for new active work.

Must not own:

- Domain state transitions.
- Incident creation.
- Direct business lifecycle changes.

---

### MOD-009: Notifications

Owns:

- Notification records
- Notification lifecycle
- Notification delivery orchestration

Responsibilities:

- Send incident and playbook notifications through notification adapters.
- Record success or failure.
- Add timeline events for meaningful notification outcomes.

Must not own:

- Incident state decisions.
- SMTP low-level details outside adapter.

---

### MOD-010: Tickets

Owns:

- Ticket records
- External ticket references
- Ticket lifecycle

Responsibilities:

- Create GitHub or Jira tracking records through ticket adapters.
- Link tickets to incidents.
- Record success or failure.
- Add timeline events for ticket operations.

Must not own:

- Incident diagnosis.
- Provider-specific implementation details outside adapter.

---

### MOD-011: Timeline

Owns:

- Incident timeline events

Responsibilities:

- Record meaningful incident lifecycle events.
- Preserve chronological incident history.
- Provide traceability across signals, diagnoses, notifications, tickets, actions, approvals, and resolution.

Must not own:

- Business decisions about whether an incident is resolved.
- External provider calls.

---

### MOD-012: Configuration

Owns:

- Product configuration
- Feature flags
- MVP visible pages
- MVP visible integrations
- MVP visible playbook templates

Responsibilities:

- Keep the product in lightweight personal-server mode.
- Hide non-MVP advanced features.
- Define allowed integration and page surfaces.

Must not own:

- Runtime business decisions.
- Incident lifecycle.
- Database state transitions.

---

## 8. Recommended Directory Structure

The existing Keep-derived repository may already have established directories. This structure describes the recommended product organization for new or refactored MVP code.

### Backend Recommended Structure

```text
backend/
  api/
    routes/
    dependencies/
    schemas/
  application/
    servers/
    signals/
    incidents/
    diagnosis/
    playbooks/
    actions/
    integrations/
    notifications/
    tickets/
    timeline/
  domain/
    servers/
    signals/
    incidents/
    diagnosis/
    playbooks/
    actions/
    integrations/
    timeline/
  persistence/
    models/
    repositories/
    migrations/
  integrations/
    monitoring/
    ai/
    notification/
    ticketing/
    actions/
  jobs/
    workers/
    schedulers/
  config/
  tests/
```

### Frontend Recommended Structure

```text
frontend/
  app/
    overview/
    servers/
    incidents/
    signals/
    playbooks/
    actions/
    integrations/
    settings/
  components/
    server/
    incident/
    signal/
    diagnosis/
    playbook/
    action/
    integration/
    layout/
  features/
    servers/
    signals/
    incidents/
    diagnosis/
    playbooks/
    actions/
    integrations/
  lib/
    api/
    auth/
    config/
    validation/
  state/
  tests/
```

### Existing Codebase Mapping

If the existing project uses `keep/` for backend and `keep-ui/` for frontend, the architecture should be applied inside those existing boundaries rather than forcing a disruptive repository restructure.

The product naming may change in the UI while internal legacy names remain during transition.

Examples:

- Feed may remain an internal alert/feed concept while the UI exposes Signals.
- Workflow may remain an internal engine concept while the UI exposes Playbooks.
- Provider may remain an internal adapter concept while the UI exposes Integrations.

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
- `/alerts` may continue to back Signals.
- `/workflows` may continue to back Playbooks.
- `/providers` may continue to back Integrations.
- Dashboard internals may power Overview.
- Topology must not replace Server in user-facing MVP UI.

---

## 9. Layering Model

The system should follow this layered model:

```text
Frontend UI
  ↓
Frontend API Client
  ↓
Backend API Routes
  ↓
Application Services
  ↓
Domain Services
  ↓
Repositories
  ↓
Database

Application Services
  ↓
Integration Adapters
  ↓
External Systems
```

### LAYER-001: Frontend UI Layer

Allowed:

- Render UI.
- Collect user input.
- Display product state.
- Call backend API.
- Perform client-side validation for user experience.

Forbidden:

- Direct database access.
- Direct third-party provider calls for product operations.
- Final business-rule enforcement.
- Final authorization decisions.
- Direct SSH, AI, SMTP, GitHub, or Jira calls.

---

### LAYER-002: Backend API Layer

Allowed:

- Authenticate request.
- Resolve workspace context.
- Validate request shape.
- Enforce request-level authorization.
- Call application services.
- Return responses.

Forbidden:

- Embedding complex domain logic directly in route handlers.
- Direct provider implementation details.
- Direct database access except through approved repository/service abstractions.

---

### LAYER-003: Application Service Layer

Allowed:

- Coordinate use cases.
- Enforce business workflows.
- Call domain services.
- Call repositories.
- Call integration adapters.
- Create timeline events through timeline service.

Forbidden:

- Transport-specific UI assumptions.
- Provider-specific protocol logic.
- Raw SQL or database access outside repositories.

---

### LAYER-004: Domain Service Layer

Allowed:

- Make business decisions.
- Validate state transitions.
- Classify action risk.
- Determine allowed incident transitions.
- Determine diagnosis state rules.
- Determine server health rules.

Forbidden:

- Database access.
- External provider calls.
- HTTP-specific logic.
- UI-specific logic.

---

### LAYER-005: Repository / Persistence Layer

Allowed:

- Read and write database records.
- Encapsulate database queries.
- Preserve persistence invariants.
- Support transactions where needed.

Forbidden:

- Calling external integrations.
- Owning business decisions.
- Sending notifications.
- Running actions.
- Calling AI providers.

---

### LAYER-006: Integration Adapter Layer

Allowed:

- Communicate with external systems.
- Normalize provider responses.
- Surface provider errors to application services.

Forbidden:

- Directly changing business state.
- Direct database access.
- Bypassing action approval.
- Creating incidents without application service mediation.

---

## 10. Dependency Direction

### DEP-001: Allowed dependency direction

Dependencies must flow inward from transport and adapters toward application and domain rules.

Allowed direction:

```text
Frontend → Backend API → Application Services → Domain Services
Application Services → Repositories
Application Services → Integration Adapters
Repositories → Database
Integration Adapters → External Systems
```

### DEP-002: Forbidden reverse dependencies

The following dependencies are forbidden:

- Domain services depending on API routes.
- Domain services depending on frontend code.
- Domain services depending on integration adapters.
- Repositories depending on application services.
- Integration adapters depending on repositories.
- Frontend depending directly on database.
- AI adapter depending directly on incident repository.
- SSH adapter depending directly on action repository.
- Notification adapter depending directly on incident repository.

### DEP-003: Business logic ownership

Business logic must live in application services or domain services.

Business logic must not live in:

- React components.
- Frontend API clients.
- Integration adapters.
- Database models.
- Migration scripts.
- Low-level utility functions with hidden side effects.

### DEP-004: Database access ownership

Database access is allowed only in:

- Repository layer.
- Approved persistence services.

Database access is forbidden in:

- Frontend.
- Integration adapters.
- Domain services.
- React components.
- AI provider clients.
- SSH execution clients.
- Notification clients.
- Ticket clients.

---

## 11. Request Lifecycle

### REQ-LIFE-001: Frontend user request lifecycle

1. User interacts with frontend.
2. Frontend performs client-side validation for usability.
3. Frontend sends request to backend API.
4. Backend authenticates request.
5. Backend resolves workspace context.
6. Backend checks authorization.
7. Backend validates request.
8. Backend calls application service.
9. Application service enforces business workflow.
10. Application service calls domain services for business decisions.
11. Application service reads or writes through repositories.
12. Application service calls integration adapters if needed.
13. Application service records timeline events if relevant.
14. Backend returns result.
15. Frontend updates display.

### REQ-LIFE-002: External signal intake lifecycle

1. External monitoring source sends signal.
2. Backend signal intake endpoint receives signal.
3. Backend validates source and payload.
4. Backend resolves target workspace and integration context.
5. Signal application service normalizes signal.
6. Signal is persisted.
7. Incident service determines whether to create or link an incident.
8. Timeline service records relevant event.
9. Playbook service may trigger an enabled playbook.
10. Diagnosis, notification, ticket, or action flows may be scheduled or executed according to policy.

### REQ-LIFE-003: AI diagnosis lifecycle

1. User or playbook requests diagnosis.
2. Backend checks authorization.
3. Diagnosis service gathers evidence.
4. Diagnosis service validates whether evidence is sufficient.
5. Diagnosis service calls AI adapter.
6. AI adapter returns normalized diagnosis result.
7. Diagnosis service stores diagnosis.
8. Incident service updates current diagnosis reference if appropriate.
9. Timeline service records diagnosis event.
10. Result is returned or made available to the frontend.

### REQ-LIFE-004: Action execution lifecycle

1. User or playbook requests an action.
2. Backend checks authorization.
3. Action service validates target server and action availability.
4. Action service checks risk level.
5. If approval is required, action run enters waiting-for-approval.
6. If approval is granted or not required, action service calls action adapter.
7. Adapter executes or requests execution.
8. Action service records result.
9. Timeline service records action outcome.
10. Diagnosis may be updated with new evidence if applicable.

---

## 12. Authentication Flow

### AUTH-FLOW-001: MVP authentication

The MVP uses Keep DB authentication with frontend session handling through the existing NextAuth.js approach where applicable.

### AUTH-FLOW-002: Login

1. User submits credentials.
2. Backend or existing auth service validates credentials.
3. Session is established.
4. Frontend receives authenticated session context.
5. Subsequent requests carry authenticated identity.

### AUTH-FLOW-003: Workspace context

Each authenticated request must resolve the active workspace.

The MVP may default to the user's only workspace.

### AUTH-FLOW-004: No-auth restrictions

No-auth mode may exist only for local development, demos, isolated evaluation, or explicitly insecure testing.

No-auth mode is not selected for production or commercial MVP use.

### AUTH-FLOW-005: External authentication not required

The MVP does not require Keycloak, Auth0, Okta, SAML, LDAP, OAuth2 Proxy, or enterprise SSO.

---

## 13. Authorization Strategy

### AUTHZ-001: Authorization placement

Authorization checks must happen in the backend before application services perform protected operations.

### AUTHZ-002: Workspace boundary

Every protected operation must be scoped to the active workspace.

A user must not access servers, signals, incidents, diagnoses, playbooks, integrations, actions, notifications, tickets, or timeline events outside their workspace.

### AUTHZ-003: Action authorization

Action execution must check:

- User has access to workspace.
- Target server belongs to workspace.
- Action belongs to workspace.
- Action is enabled.
- Action risk level is defined.
- Approval is present when required.

### AUTHZ-004: Integration authorization

Integration usage must check:

- Integration belongs to workspace.
- Integration is enabled.
- Integration is connected or otherwise usable for the requested capability.

### AUTHZ-005: Frontend authorization limits

The frontend may hide or disable UI controls, but backend authorization remains mandatory.

Frontend checks are not sufficient for security.

### AUTHZ-006: Future multi-user roles

The MVP may use simple owner/operator semantics.

Complex RBAC is not part of the MVP.

---

## 14. Error Handling Strategy

### ERR-001: Error ownership

Errors should be translated at layer boundaries.

Integration-specific errors should not leak raw provider details into domain logic.

### ERR-002: User-facing errors

User-facing errors should be understandable and actionable.

Examples:

- Integration is not connected.
- AI diagnosis failed.
- Not enough evidence for diagnosis.
- Action requires approval.
- SSH diagnostic failed.
- Notification failed.
- Ticket creation failed.

### ERR-003: Domain errors

Domain errors should represent business rule violations.

Examples:

- Cannot run approval-required action without approval.
- Cannot target archived server with automatic action.
- Cannot create ticket without incident.
- Cannot use disabled integration.

### ERR-004: External integration errors

External integration errors should be captured and recorded in the relevant operation result.

External errors must not delete incidents, signals, or timeline records.

### ERR-005: Partial failure

Playbook runs may partially complete.

Example:

- Diagnosis succeeds.
- Email notification fails.
- Ticket creation succeeds.
- SSH action is skipped.

The system must preserve partial results.

### ERR-006: Error timeline recording

Meaningful failures in diagnosis, notification, ticketing, action execution, or playbook execution should create timeline events when related to an incident.

### ERR-007: Sensitive error redaction

Errors must not expose raw secrets, tokens, private keys, or credentials.

---

## 15. Logging Strategy

### LOG-001: Structured application logging

Backend logs should be structured enough to support troubleshooting.

### LOG-002: Required log context

Logs for operational flows should include non-sensitive identifiers such as:

- workspace identifier
- server identifier when available
- signal identifier when available
- incident identifier when available
- playbook run identifier when available
- action run identifier when available
- integration category or provider key when safe

### LOG-003: No sensitive logs

Logs must not include:

- API keys
- passwords
- SSH private keys
- raw secrets
- full sensitive payloads
- full action outputs when they may contain secrets

### LOG-004: Frontend debug logging

Frontend debug logs should not be noisy in production.

WebSocket binding, polling, and development refresh logs should be development-only.

### LOG-005: Integration logging

Integration adapters should log high-level success or failure, not raw credentials or sensitive provider responses.

### LOG-006: Audit-style business events

Incident timeline events are the product-level operational history.

Logs are not a substitute for timeline events.

---

## 16. Configuration Strategy

### CONFIG-001: Environment-based configuration

Runtime configuration should be environment-based.

### CONFIG-002: Product mode

The product must support a lightweight personal-server mode.

This mode controls visible pages, visible integrations, visible playbook templates, and default onboarding behavior.

### CONFIG-003: Feature visibility

Advanced platform features should be hidden through configuration or feature flags rather than physically removed during early slimming.

### CONFIG-004: MVP integration whitelist

Configuration should allow only MVP integrations to be exposed in the primary product experience:

- Prometheus
- Webhook
- Qwen-compatible AI
- Ollama-compatible AI
- SMTP
- GitHub
- Jira
- SSH

### CONFIG-005: Secrets

Secrets must be managed through the selected secret-handling mechanism and must not be exposed through normal configuration summaries.

### CONFIG-006: Defaults

Defaults should favor personal-server simplicity:

- SQLite by default.
- Docker Compose deployment target.
- DB authentication for production-like use.
- Email as default notification.
- Read-only actions by default.

### CONFIG-007: No enterprise defaults

The MVP should not default to enterprise SSO, Kubernetes, ServiceNow, Datadog, PagerDuty, or broad provider marketplace behavior.

---

## 17. Caching Strategy

### CACHE-001: Default caching posture

The MVP should use minimal caching.

Caching should not obscure operational correctness.

### CACHE-002: Frontend data caching

Frontend remote state may use SWR caching for product views.

Frontend caching must not replace backend authorization or business validation.

### CACHE-003: Backend caching

Backend caching may be used for short-lived non-sensitive lookup data such as integration metadata or visible provider lists.

Backend caching should not be used for action approval state, incident status transitions, or security-sensitive decisions unless strong invalidation exists.

### CACHE-004: AI diagnosis caching

AI diagnosis results should be persisted as diagnosis records, not treated as transient cache only.

A newer diagnosis may supersede an older diagnosis.

### CACHE-005: Integration status caching

Integration status may be cached briefly for display, but active operations must still validate whether the integration can be used.

### CACHE-006: Forbidden cache behavior

The system must not use cache to bypass:

- authorization
- action approval
- risk checks
- workspace boundary checks
- incident state transition rules

---

## 18. Background Jobs, if applicable

Background jobs are applicable for this system.

### JOB-001: Allowed background job responsibilities

Background jobs may handle:

- Playbook execution.
- AI diagnosis generation.
- Notification sending.
- Ticket creation.
- Action execution.
- Integration validation.
- Signal post-processing.
- Timeline side-effect recording when tied to asynchronous flows.

### JOB-002: Request response decoupling

Long-running operations should not block user-facing requests when they can be represented as pending or running states.

Examples:

- AI diagnosis generation.
- SSH diagnostics.
- Ticket creation.
- Notification delivery.

### JOB-003: Job state persistence

Background work must update persisted state such as diagnosis status, playbook run status, action run status, notification status, or ticket status.

### JOB-004: Idempotency

Background jobs that may be retried should be designed to avoid duplicate tickets, duplicate notifications, duplicate action executions, or duplicate timeline events.

### JOB-005: Job authorization context

Background jobs must preserve workspace and authorization context from the original request or trigger.

### JOB-006: Job failure handling

Job failures must be recorded in the relevant entity state and, when incident-related, in the incident timeline.

### JOB-007: Forbidden job behavior

Background jobs must not:

- Execute approval-required actions without approval.
- Execute unsafe actions automatically.
- Use disabled integrations for new active work.
- Modify records outside their workspace boundary.

---

## 19. Third-Party Integration Boundaries

### INT-001: Prometheus boundary

Prometheus integration is a monitoring integration.

Allowed responsibilities:

- Receive or query monitoring signals.
- Provide signal context.

Forbidden responsibilities:

- Direct incident mutation.
- Direct action execution.
- Direct notification sending.

---

### INT-002: Webhook boundary

Webhook integration is a generic signal intake boundary.

Allowed responsibilities:

- Accept external events.
- Normalize events into signals.

Forbidden responsibilities:

- Bypassing signal service.
- Creating incidents without application service mediation.
- Executing actions directly.

---

### INT-003: AI provider boundary

AI integrations are diagnosis providers.

Allowed responsibilities:

- Generate structured diagnosis from provided evidence.
- Return normalized diagnosis output.

Forbidden responsibilities:

- Accessing database directly.
- Executing actions.
- Sending notifications.
- Creating tickets.
- Mutating incidents directly.

---

### INT-004: SMTP boundary

SMTP integration is a notification adapter.

Allowed responsibilities:

- Send email notification.
- Return delivery success or failure.

Forbidden responsibilities:

- Deciding incident status.
- Creating incident timeline directly without notification service.
- Accessing database directly.

---

### INT-005: GitHub and Jira boundary

GitHub and Jira integrations are ticketing adapters.

Allowed responsibilities:

- Create or update external tracking records.
- Return external references.

Forbidden responsibilities:

- Owning incident lifecycle.
- Creating tickets without ticket service mediation.
- Accessing database directly.

---

### INT-006: SSH boundary

SSH integration is an action execution adapter.

Allowed responsibilities:

- Execute approved or allowed diagnostic actions.
- Return output, status, and error summaries.

Forbidden responsibilities:

- Deciding whether an action is safe.
- Bypassing approval.
- Running arbitrary unsafe commands automatically.
- Writing directly to database.
- Updating incidents directly.

---

### INT-007: Future integration boundary

Future integrations must be categorized as one of:

- Monitoring
- AI
- Notification
- Ticketing
- Actions

A future integration must not cross category boundaries without an application service coordinating the workflow.

---

## 20. Architecture Constraints

### ARCH-001: Keep current core stack

The architecture must keep the selected stack:

- Next.js
- React
- TypeScript
- Python
- FastAPI
- SQLModel / SQLAlchemy
- SQLite-first database
- Docker Compose deployment target

### ARCH-002: No backend rewrite for MVP

The MVP must not rewrite the backend in another language.

### ARCH-003: Server-first product architecture

Server must be treated as a first-class product object.

### ARCH-004: Signals are product-level abnormal observations

Signals must be the product-level abstraction over alerts, webhook events, and test signals.

### ARCH-005: Playbooks are product-level workflows

Playbooks must be the user-facing abstraction over operational flows.

### ARCH-006: Integrations are product-level providers

Integrations must be the user-facing abstraction over providers.

### ARCH-007: Actions are controlled operations

Actions must pass through risk classification, approval checks, execution, result recording, and timeline recording.

### ARCH-008: AI diagnosis is advisory

AI diagnosis must remain advisory and evidence-based.

AI must not directly execute actions.

### ARCH-009: Timeline is required for traceability

Meaningful incident events must be recorded in the timeline.

### ARCH-010: Workspace boundary required

All user-owned operational data must be workspace-scoped.

### ARCH-011: Advanced features hidden in MVP

Topology, mapping, extraction, complex dashboards, maintenance windows, enterprise auth, and provider marketplace behavior must remain hidden or out of scope in the MVP.

---

## 21. Forbidden Architecture Patterns

### FORBID-001: Frontend-owned business rules

The frontend must not be the source of truth for incident state transitions, action risk, approval state, or workspace authorization.

### FORBID-002: Direct frontend database access

The frontend must not access the database directly.

### FORBID-003: Provider-owned domain state

Integration adapters must not directly create, update, or delete domain entities.

### FORBID-004: AI-owned actions

AI providers must not execute actions or decide to bypass approvals.

### FORBID-005: SSH bypass

SSH execution must not bypass the action service, risk classification, approval rules, or action result recording.

### FORBID-006: Notification bypass

Notification adapters must not directly modify incidents or create timeline records outside notification service coordination.

### FORBID-007: Ticketing bypass

Ticket adapters must not directly modify incidents or create timeline records outside ticket service coordination.

### FORBID-008: Database logic as business logic

Business rules must not be hidden primarily in database models, triggers, migration scripts, or ORM hooks.

### FORBID-009: Broad integration marketplace in MVP

The MVP must not expose a broad provider marketplace.

### FORBID-010: Enterprise architecture creep

The MVP must not require Kubernetes, service mesh, external queue platforms, enterprise SSO, multi-region deployment, complex RBAC, or managed cloud infrastructure.

### FORBID-011: Unsafe autonomous remediation

The system must not include an architecture path where unsafe or approval-required actions run automatically without explicit user approval.

### FORBID-012: Cross-workspace leakage

No module may read or write workspace-scoped data outside the active workspace.

---

## 22. Assumptions

### ASM-001

The project remains based on the existing Keep-derived codebase.

### ASM-002

The current repository may not exactly match the recommended directory structure, so architecture rules may be applied inside existing directories.

### ASM-003

The MVP is primarily single-user or single-workspace but should preserve workspace boundaries.

### ASM-004

SQLite is sufficient for the MVP deployment target.

### ASM-005

PostgreSQL remains a future growth path.

### ASM-006

The initial integration set is limited to Prometheus, webhook, Qwen-compatible AI, Ollama-compatible AI, SMTP, GitHub, Jira, and SSH.

### ASM-007

The MVP can retain existing internal Keep concepts while exposing new product language in the UI.

### ASM-008

Advanced platform features can be hidden through configuration or feature flags before they are physically removed.

### ASM-009

Background jobs are available or can be represented using the existing backend worker mechanism.

### ASM-010

Personal-server users value simple setup, clear diagnosis, and safe actions more than broad enterprise integrations.

### ASM-011

The current prompt references `architecture.md` as an input to `db-schemas.md`, but the architecture is being generated after the initial database document. Future revisions should align both documents.

---

## 23. Open Questions

### OQ-001

Should the existing Keep directory structure be preserved entirely, or should new product modules be introduced gradually inside it?

### OQ-002

Should the MVP expose a single workspace only, or should workspace switching be visible?

### OQ-003

Should AI diagnosis run synchronously for small incidents or always through background jobs?

### OQ-004

Should SSH diagnostics always run through background jobs, even for short read-only commands?

### OQ-005

Should action execution support only predefined safe actions in MVP, or allow custom user-defined commands with strict approval?

### OQ-006

Should playbook definitions remain compatible with the existing workflow engine, or should a simplified playbook abstraction wrap the existing engine?

### OQ-007

Should frontend routes be renamed immediately from legacy terms, or should the UI show new names while keeping old internal routes?

### OQ-008

Should integration whitelist behavior be enforced only in UI, or also in backend capability checks?

### OQ-009

Should timeline event creation be centralized in a dedicated timeline service for all modules?

### OQ-010

Should server health be computed on read, persisted on write, or periodically refreshed?

### OQ-011

Should external signal intake require integration authentication in the first MVP?

### OQ-012

Should no-auth mode be fully removed from production builds or only disabled by default?

### OQ-013

Should action output be stored in the database, external storage, or summarized only?

### OQ-014

Should future multi-user permissions use owner/operator roles or a more granular model?

### OQ-015

Should the architecture introduce a dedicated command bus or event bus later, or keep direct application service orchestration for the MVP?
