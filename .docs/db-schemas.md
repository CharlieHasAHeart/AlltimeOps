# DB Schemas: Lightweight AIOps Platform for Personal Servers

## 1. Purpose

This document defines how data should be stored for the lightweight AIOps platform for personal servers.

The database model supports the product loop defined in the PRD and domain model:

**Server → Signal → Incident → AI Diagnosis → Notification / Ticket / Safe Action → Timeline**

The schema is intentionally lightweight. It supports personal-server operations, safe diagnostics, AI-assisted incident understanding, and a minimal closed loop without introducing enterprise AIOps complexity.

---

## 2. Source of Truth

This `db-schemas.md` is the source of truth for database storage design.

The source documents for this schema are:

- `prd.md`
- `domain-model.md`
- `tech-stack.md`
- `architecture.md`, when available

If this document conflicts with `prd.md`, the PRD takes precedence for product scope.

If this document conflicts with `domain-model.md`, the domain model takes precedence for business meaning.

If this document conflicts with `tech-stack.md`, the tech stack takes precedence for selected database technologies.

If `architecture.md` is not yet available or does not define database-specific guidance, this document follows the product, domain, and technology decisions already established.

---

## 3. Server Health State Policy

### Product-facing health states

The product-facing server health states are:

- `healthy`
- `warning`
- `critical`
- `unknown`

### Internal lifecycle or system states

The backend/database may also store:

- `disconnected`
- `archived`

### Mapping rules

- `healthy` means the server has no known active problem.
- `warning` means the server has a non-critical problem or degraded condition.
- `critical` means the server has an urgent active problem.
- `unknown` means the system does not have enough recent data to determine health.
- `disconnected` is an internal/system state and must not be treated as `healthy`.
- `archived` is an internal lifecycle state and must not appear in the default active server list.
- `degraded` is not a canonical MVP health state.
- Any legacy `degraded` value must be mapped to `warning`.

---

## 4. MVP Database Implementation Scope

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

## 5. Codex Usage

Codex should use this document to understand which database objects exist, what each table stores, which fields are required, how records relate, and which constraints preserve product correctness.

Codex should treat database object IDs such as `DB-USERS` and `DB-SIGNALS` as stable references.

Codex should not add tables, fields, constraints, or enums for enterprise-scale features unless this document is updated first.

---

## 6. Non-Goals

This document does not define API endpoints.

This document does not define API request or response examples.

This document does not define UI components.

This document does not define local commands, installation commands, deployment commands, or runtime commands.

This document does not define ORM implementation details.

This document does not define provider-specific secret storage internals.

This document does not define billing, licensing, enterprise SSO, complex RBAC, CMDB, service topology, compliance reporting, or marketplace schemas.

---

## 7. Database Overview

### Selected Database

The MVP database is SQLite.

PostgreSQL is the future production growth path.

### Selected Data Access Stack

The selected ORM/query layer is SQLModel with SQLAlchemy.

### Storage Boundary

The database stores product state for:

- Users
- Workspaces
- Workspace memberships
- Servers
- Server services
- Integrations
- Signals
- Incidents
- Incident-to-signal links
- AI diagnoses
- Diagnosis evidence
- Playbooks
- Playbook runs
- Playbook steps
- Actions
- Action runs
- Action approvals
- Notifications
- Tickets
- Incident timeline events
- Optional test signal audit records

### Design Principles

- Server-first storage model.
- Workspace-scoped records.
- SQLite-first compatibility.
- PostgreSQL-compatible future path.
- Clear traceability from signal to incident to diagnosis to action.
- Explicit storage of action risk and approval state.
- Sensitive values are not stored as plain business fields.
- Advanced enterprise platform tables are excluded from MVP.

---

## 8. Tables

### DB-USERS: users

Maps to domain entity: `ENT-USER`

Stores product users.

Purpose:

- Identify the operator.
- Own workspaces.
- Attribute manual incident, approval, and action decisions.

---

### DB-WORKSPACES: workspaces

Maps to domain entity: `ENT-WORKSPACE`

Stores lightweight ownership boundaries.

Purpose:

- Group servers, signals, incidents, playbooks, integrations, and actions.
- Preserve future support for more than one workspace without requiring enterprise tenancy in the MVP.

---

### DB-WORKSPACE-MEMBERSHIPS: workspace_memberships

Maps to domain entities: `ENT-USER`, `ENT-WORKSPACE`

Stores user access to workspaces.

Purpose:

- Associate users with workspaces.
- Preserve a simple permission boundary even if the MVP exposes only one operator.

---

### DB-SERVERS: servers

Maps to domain entity: `ENT-SERVER`

Stores monitored personal servers.

Purpose:

- Make servers first-class operational objects.
- Track server health, monitoring status, and diagnosis access status.

---

### DB-SERVER-SERVICES: server_services

Maps to domain entity: `ENT-SERVER-SERVICE`

Stores lightweight workloads running on a server.

Purpose:

- Represent services such as websites, APIs, containers, databases, caches, cron jobs, and processes.
- Allow signals, incidents, and actions to target a service when known.

MVP note:

This table may be empty in the first release if service registration or discovery is not implemented yet.

---

### DB-INTEGRATIONS: integrations

Maps to domain entity: `ENT-INTEGRATION`

Stores configured external capabilities.

Purpose:

- Track integration availability for monitoring, AI, notification, ticketing, and action capabilities.
- Store non-sensitive configuration summaries and connection status.

---

### DB-SIGNALS: signals

Maps to domain entity: `ENT-SIGNAL`

Stores incoming alerts, webhook events, manual test signals, and abnormal observations.

Purpose:

- Preserve raw operational signals.
- Allow signals to be linked to servers, services, and incidents.
- Support incident creation and diagnosis evidence.

---

### DB-INCIDENTS: incidents

Maps to domain entity: `ENT-INCIDENT`

Stores operational incidents.

Purpose:

- Represent a user-facing problem requiring investigation or response.
- Group related signals.
- Track diagnosis, status, severity, and resolution.

---

### DB-INCIDENT-SIGNALS: incident_signals

Maps to the relationship between `ENT-INCIDENT` and `ENT-SIGNAL`

Stores many-to-many links between incidents and signals.

Purpose:

- Preserve traceability from incident to source signals.
- Allow one incident to group multiple signals.

---

### DB-DIAGNOSES: diagnoses

Maps to domain entity: `ENT-DIAGNOSIS`

Stores AI diagnosis results.

Purpose:

- Store structured AI output.
- Preserve probable cause, evidence summary, impact, recommendations, verification steps, risk notes, and uncertainty statements.

---

### DB-DIAGNOSIS-EVIDENCE: diagnosis_evidence

Maps to domain entity: `ENT-EVIDENCE`

Stores evidence used by AI diagnosis.

Purpose:

- Distinguish factual evidence from AI inference.
- Preserve traceability from diagnosis to signals, action outputs, server status, timeline events, or manual notes.

---

### DB-PLAYBOOKS: playbooks

Maps to domain entity: `ENT-PLAYBOOK`

Stores guided operational flows.

Purpose:

- Define personal-server problem handling flows such as high CPU, high disk usage, service down, and website/API unavailable.

---

### DB-PLAYBOOK-RUNS: playbook_runs

Maps to domain entity: `ENT-PLAYBOOK-RUN`

Stores executions of playbooks.

Purpose:

- Track what happened when a playbook was triggered for a signal or incident.

---

### DB-PLAYBOOK-STEPS: playbook_steps

Maps to domain entity: `ENT-PLAYBOOK-RUN`

Stores step-level records for playbook executions.

Purpose:

- Track diagnosis, notification, ticket, action, and decision steps within a playbook run.

---

### DB-ACTIONS: actions

Maps to domain entity: `ENT-ACTION`

Stores available diagnostic and remediation actions.

Purpose:

- Define safe, low-risk, approval-required, and unsafe action options.
- Support personal-server diagnostic and response workflows.

---

### DB-ACTION-RUNS: action_runs

Maps to domain entity: `ENT-ACTION-RUN`

Stores executions or attempted executions of actions.

Purpose:

- Record requested actions, approvals, execution status, result summaries, and outputs.

---

### DB-ACTION-APPROVALS: action_approvals

Maps to domain entity: `ENT-APPROVAL`

Stores explicit user approvals for action runs.

Purpose:

- Prevent approval-required actions from running without user approval.
- Preserve user control over state-changing operations.

---

### DB-NOTIFICATIONS: notifications

Maps to domain entity: `ENT-NOTIFICATION`

Stores notifications sent or attempted.

Purpose:

- Record whether incident or playbook notifications were sent successfully.
- Preserve communication history.

---

### DB-TICKETS: tickets

Maps to domain entity: `ENT-TICKET`

Stores external ticket or issue references.

Purpose:

- Link incidents to GitHub issues, Jira tickets, or future ticketing systems.

---

### DB-INCIDENT-TIMELINE-EVENTS: incident_timeline_events

Maps to domain entity: `ENT-TIMELINE-EVENT`

Stores chronological incident history.

Purpose:

- Preserve the operational story of an incident.
- Record signal links, diagnoses, notifications, tickets, action requests, approvals, action results, notes, resolution, and reopening.

---

### DB-TEST-SIGNALS: test_signals

Maps to domain entity: `ENT-TEST-SIGNAL`

Stores explicit manual test signal audit records.

Purpose:

- Support onboarding validation.
- Distinguish test activity from operational activity.

MVP note:

This table is optional if `signals.is_test` provides enough traceability.

---

## 7. Fields

### DB-USERS Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| id | string / uuid | yes | Primary key |
| email | string | yes | Unique login/contact identity |
| display_name | string | no | Human-readable user name |
| status | enum | yes | active, disabled |
| created_at | datetime | yes | Creation timestamp |
| updated_at | datetime | yes | Update timestamp |

---

### DB-WORKSPACES Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| id | string / uuid | yes | Primary key |
| name | string | yes | Workspace name |
| owner_user_id | string / uuid | yes | Owner user |
| product_mode | string | yes | personal_server_mvp by default |
| created_at | datetime | yes | Creation timestamp |
| updated_at | datetime | yes | Update timestamp |

---

### DB-WORKSPACE-MEMBERSHIPS Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| id | string / uuid | yes | Primary key |
| workspace_id | string / uuid | yes | Workspace reference |
| user_id | string / uuid | yes | User reference |
| role | enum | yes | owner, operator |
| status | enum | yes | active, disabled |
| created_at | datetime | yes | Creation timestamp |
| updated_at | datetime | yes | Update timestamp |

---

### DB-SERVERS Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| id | string / uuid | yes | Primary key |
| workspace_id | string / uuid | yes | Workspace reference |
| name | string | yes | Server display name |
| host | string | yes | Hostname or IP |
| environment | enum | yes | production, staging, development, homelab, other |
| description | text | no | Optional description |
| health_state | enum | yes | healthy, warning, critical, unknown, disconnected, archived |
| connection_status | enum | yes | pending, connected, disconnected, unknown |
| monitoring_status | enum | yes | inactive, pending, active, degraded |
| diagnosis_access_status | enum | yes | not_configured, configured, connected, failed |
| last_signal_at | datetime | no | Most recent signal time |
| last_incident_at | datetime | no | Most recent incident time |
| last_diagnosis_at | datetime | no | Most recent diagnosis time |
| archived_at | datetime | no | Soft delete/archive timestamp |
| created_at | datetime | yes | Creation timestamp |
| updated_at | datetime | yes | Update timestamp |

---

### DB-SERVER-SERVICES Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| id | string / uuid | yes | Primary key |
| workspace_id | string / uuid | yes | Workspace reference |
| server_id | string / uuid | yes | Parent server |
| name | string | yes | Service name |
| service_type | enum | yes | process, container, website, api, database, cache, cron, other |
| expected_status | string | no | Expected healthy state |
| last_known_status | enum | yes | healthy, warning, critical, unknown |
| criticality | enum | yes | low, medium, high, critical |
| archived_at | datetime | no | Soft delete/archive timestamp |
| created_at | datetime | yes | Creation timestamp |
| updated_at | datetime | yes | Update timestamp |

---

### DB-INTEGRATIONS Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| id | string / uuid | yes | Primary key |
| workspace_id | string / uuid | yes | Workspace reference |
| name | string | yes | User-facing integration name |
| provider_key | enum/string | yes | prometheus, webhook, qwen, ollama, smtp, github, jira, ssh |
| category | enum | yes | monitoring, ai, notification, ticketing, actions |
| enabled | boolean | yes | Whether integration is enabled |
| connection_status | enum | yes | not_configured, configured, validation_pending, connected, degraded, disabled, removed |
| config_summary | json/text | no | Non-sensitive configuration summary |
| last_validated_at | datetime | no | Last validation timestamp |
| removed_at | datetime | no | Soft removal timestamp |
| created_at | datetime | yes | Creation timestamp |
| updated_at | datetime | yes | Update timestamp |

---

### DB-SIGNALS Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| id | string / uuid | yes | Primary key |
| workspace_id | string / uuid | yes | Workspace reference |
| source_type | enum | yes | prometheus, webhook, manual_test |
| source_integration_id | string / uuid | no | Integration reference |
| title | string | yes | Signal title |
| description | text | no | Signal description |
| severity | enum | yes | info, warning, critical, unknown |
| status | enum | yes | received, normalized, linked, ignored, resolved, archived |
| server_id | string / uuid | no | Affected server |
| server_service_id | string / uuid | no | Affected service |
| incident_id | string / uuid | no | Related incident |
| is_test | boolean | yes | Test signal marker |
| raw_payload_summary | json/text | no | Limited raw source context |
| normalized_summary | json/text | no | Product-normalized context |
| fingerprint | string | no | Deduplication hint |
| received_at | datetime | yes | Signal intake time |
| resolved_at | datetime | no | Resolution time |
| archived_at | datetime | no | Archive timestamp |
| created_at | datetime | yes | Creation timestamp |
| updated_at | datetime | yes | Update timestamp |

---

### DB-INCIDENTS Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| id | string / uuid | yes | Primary key |
| workspace_id | string / uuid | yes | Workspace reference |
| title | string | yes | Incident title |
| description | text | no | Incident summary |
| severity | enum | yes | info, warning, critical, unknown |
| status | enum | yes | open, investigating, diagnosed, action_recommended, action_taken, resolved, reopened, archived |
| server_id | string / uuid | no | Affected server |
| server_service_id | string / uuid | no | Affected service |
| current_diagnosis_id | string / uuid | no | Current diagnosis |
| recommended_next_action | text | no | Human-readable next action |
| created_by_user_id | string / uuid | no | Manual creator |
| resolved_at | datetime | no | Resolution time |
| archived_at | datetime | no | Archive timestamp |
| created_at | datetime | yes | Creation timestamp |
| updated_at | datetime | yes | Update timestamp |

---

### DB-INCIDENT-SIGNALS Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| id | string / uuid | yes | Primary key |
| workspace_id | string / uuid | yes | Workspace reference |
| incident_id | string / uuid | yes | Incident reference |
| signal_id | string / uuid | yes | Signal reference |
| linked_reason | enum/string | no | created_from, correlated, manual, reopened |
| linked_at | datetime | yes | Link timestamp |
| created_at | datetime | yes | Creation timestamp |

---

### DB-DIAGNOSES Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| id | string / uuid | yes | Primary key |
| workspace_id | string / uuid | yes | Workspace reference |
| incident_id | string / uuid | yes | Incident reference |
| status | enum | yes | not_requested, requested, generating, generated, insufficient_evidence, failed, superseded |
| probable_cause | text | no | AI-inferred probable cause |
| evidence_summary | text | no | Evidence summary |
| impact | text | no | Impact statement |
| recommended_actions | json/text | no | Recommended actions |
| verification_steps | json/text | no | Verification steps |
| risk_notes | text | no | Risk and safety notes |
| uncertainty_statement | text | no | Required when uncertain |
| model_label | string | no | Non-sensitive AI model/provider label |
| is_current | boolean | yes | Current diagnosis flag |
| generated_at | datetime | no | Generation timestamp |
| created_at | datetime | yes | Creation timestamp |
| updated_at | datetime | yes | Update timestamp |

---

### DB-DIAGNOSIS-EVIDENCE Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| id | string / uuid | yes | Primary key |
| workspace_id | string / uuid | yes | Workspace reference |
| diagnosis_id | string / uuid | yes | Diagnosis reference |
| incident_id | string / uuid | yes | Incident reference |
| evidence_type | enum | yes | signal, action_run, timeline_event, server_status, manual_note |
| source_entity_type | string | no | Referenced entity type |
| source_entity_id | string / uuid | no | Referenced entity ID |
| summary | text | yes | Evidence summary |
| observed_at | datetime | no | Observation time |
| reliability_note | text | no | Optional note |
| created_at | datetime | yes | Creation timestamp |

---

### DB-PLAYBOOKS Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| id | string / uuid | yes | Primary key |
| workspace_id | string / uuid | yes | Workspace reference |
| name | string | yes | Playbook name |
| problem_type | enum | yes | high_cpu, disk_usage_high, service_down, website_api_unavailable, custom |
| status | enum | yes | draft, enabled, disabled, archived |
| trigger_summary | json/text | no | Business-readable trigger summary |
| diagnostic_steps_summary | json/text | no | Business-readable diagnostic steps |
| notification_enabled | boolean | yes | Notification behavior |
| ticket_enabled | boolean | yes | Ticket behavior |
| action_policy | enum | yes | read_only_only, approval_required_allowed, manual_only |
| archived_at | datetime | no | Archive timestamp |
| created_at | datetime | yes | Creation timestamp |
| updated_at | datetime | yes | Update timestamp |

---

### DB-PLAYBOOK-RUNS Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| id | string / uuid | yes | Primary key |
| workspace_id | string / uuid | yes | Workspace reference |
| playbook_id | string / uuid | yes | Playbook reference |
| incident_id | string / uuid | no | Related incident |
| signal_id | string / uuid | no | Triggering signal |
| status | enum | yes | triggered, running, waiting_for_approval, completed, partially_completed, failed, cancelled |
| result_summary | text | no | Run result summary |
| started_at | datetime | no | Start timestamp |
| completed_at | datetime | no | Completion timestamp |
| created_at | datetime | yes | Creation timestamp |
| updated_at | datetime | yes | Update timestamp |

---

### DB-PLAYBOOK-STEPS Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| id | string / uuid | yes | Primary key |
| workspace_id | string / uuid | yes | Workspace reference |
| playbook_run_id | string / uuid | yes | Playbook run reference |
| step_type | enum | yes | diagnosis, notification, ticket, action, decision |
| status | enum | yes | pending, running, completed, skipped, failed, cancelled |
| summary | text | no | Step summary |
| related_entity_type | string | no | Related entity type |
| related_entity_id | string / uuid | no | Related entity ID |
| started_at | datetime | no | Start timestamp |
| completed_at | datetime | no | Completion timestamp |
| created_at | datetime | yes | Creation timestamp |

---

### DB-ACTIONS Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| id | string / uuid | yes | Primary key |
| workspace_id | string / uuid | yes | Workspace reference |
| name | string | yes | Action name |
| description | text | no | Action explanation |
| category | enum | yes | diagnostics, remediation, notification, ticketing |
| target_type | enum | yes | server, service, incident |
| risk_level | enum | yes | read_only, low_risk, approval_required, unsafe |
| approval_required | boolean | yes | Whether approval is required |
| enabled | boolean | yes | Whether action is available |
| archived_at | datetime | no | Archive timestamp |
| created_at | datetime | yes | Creation timestamp |
| updated_at | datetime | yes | Update timestamp |

---

### DB-ACTION-RUNS Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| id | string / uuid | yes | Primary key |
| workspace_id | string / uuid | yes | Workspace reference |
| action_id | string / uuid | yes | Action reference |
| incident_id | string / uuid | no | Related incident |
| server_id | string / uuid | no | Target server |
| server_service_id | string / uuid | no | Target service |
| requested_by_user_id | string / uuid | no | Requesting user |
| status | enum | yes | requested, waiting_for_approval, approved, rejected, running, completed, failed, cancelled |
| risk_level_at_run | enum | yes | Risk level at time of run |
| result_summary | text | no | Human-readable result |
| output_excerpt | text | no | Limited output excerpt |
| error_summary | text | no | Error summary |
| requested_at | datetime | yes | Request timestamp |
| started_at | datetime | no | Start timestamp |
| completed_at | datetime | no | Completion timestamp |
| created_at | datetime | yes | Creation timestamp |
| updated_at | datetime | yes | Update timestamp |

---

### DB-ACTION-APPROVALS Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| id | string / uuid | yes | Primary key |
| workspace_id | string / uuid | yes | Workspace reference |
| action_run_id | string / uuid | yes | Action run reference |
| requested_by_user_id | string / uuid | no | Requesting user |
| decided_by_user_id | string / uuid | no | Approving or rejecting user |
| status | enum | yes | pending, approved, rejected, expired, cancelled |
| decision_note | text | no | Optional decision note |
| requested_at | datetime | yes | Request timestamp |
| decided_at | datetime | no | Decision timestamp |
| created_at | datetime | yes | Creation timestamp |
| updated_at | datetime | yes | Update timestamp |

---

### DB-NOTIFICATIONS Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| id | string / uuid | yes | Primary key |
| workspace_id | string / uuid | yes | Workspace reference |
| incident_id | string / uuid | no | Related incident |
| playbook_run_id | string / uuid | no | Related playbook run |
| integration_id | string / uuid | no | Notification integration |
| channel | enum/string | yes | email, other |
| destination_summary | string | no | Non-sensitive destination summary |
| status | enum | yes | pending, sending, sent, failed, cancelled |
| subject | string | no | Notification subject |
| message_summary | text | no | Message summary |
| failure_reason | text | no | Failure summary |
| sent_at | datetime | no | Sent timestamp |
| created_at | datetime | yes | Creation timestamp |
| updated_at | datetime | yes | Update timestamp |

---

### DB-TICKETS Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| id | string / uuid | yes | Primary key |
| workspace_id | string / uuid | yes | Workspace reference |
| incident_id | string / uuid | yes | Related incident |
| integration_id | string / uuid | no | Ticketing integration |
| provider | enum | yes | github, jira |
| external_reference | string | no | External ticket key or ID |
| external_url | string | no | External ticket URL |
| status | enum | yes | not_created, creation_requested, created, updated, closed, failed |
| title | string | yes | Ticket title |
| summary | text | no | Ticket summary |
| failure_reason | text | no | Failure summary |
| created_external_at | datetime | no | External creation timestamp |
| created_at | datetime | yes | Local creation timestamp |
| updated_at | datetime | yes | Local update timestamp |

---

### DB-INCIDENT-TIMELINE-EVENTS Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| id | string / uuid | yes | Primary key |
| workspace_id | string / uuid | yes | Workspace reference |
| incident_id | string / uuid | yes | Incident reference |
| event_type | enum/string | yes | signal_linked, incident_created, diagnosis_generated, notification_sent, ticket_created, action_requested, action_approved, action_completed, incident_resolved, incident_reopened, note |
| actor_type | enum/string | yes | user, system, ai, integration |
| actor_id | string / uuid | no | Actor reference when applicable |
| summary | text | yes | Human-readable event summary |
| related_entity_type | string | no | Related entity type |
| related_entity_id | string / uuid | no | Related entity ID |
| occurred_at | datetime | yes | Event timestamp |
| created_at | datetime | yes | Creation timestamp |

---

### DB-TEST-SIGNALS Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| id | string / uuid | yes | Primary key |
| workspace_id | string / uuid | yes | Workspace reference |
| server_id | string / uuid | no | Target server |
| signal_id | string / uuid | no | Generated signal |
| requested_by_user_id | string / uuid | no | Requesting user |
| severity | enum | yes | Test severity |
| status | enum | yes | requested, generated, failed |
| result_summary | text | no | Test result summary |
| created_at | datetime | yes | Creation timestamp |
| updated_at | datetime | yes | Update timestamp |

---

## 8. Primary Keys

### PK-001

Every table must have a single-column primary key named `id`.

### PK-002

Primary keys should use stable string or UUID identifiers.

### PK-003

Primary keys must not encode business meaning.

### PK-004

Primary keys must remain stable for the life of the record.

---

## 9. Foreign Keys

### FK-001

`workspaces.owner_user_id` references `users.id`.

### FK-002

`workspace_memberships.workspace_id` references `workspaces.id`.

### FK-003

`workspace_memberships.user_id` references `users.id`.

### FK-004

`servers.workspace_id` references `workspaces.id`.

### FK-005

`server_services.workspace_id` references `workspaces.id`.

### FK-006

`server_services.server_id` references `servers.id`.

### FK-007

`integrations.workspace_id` references `workspaces.id`.

### FK-008

`signals.workspace_id` references `workspaces.id`.

### FK-009

`signals.source_integration_id` references `integrations.id`.

### FK-010

`signals.server_id` references `servers.id`.

### FK-011

`signals.server_service_id` references `server_services.id`.

### FK-012

`signals.incident_id` references `incidents.id`.

### FK-013

`incidents.workspace_id` references `workspaces.id`.

### FK-014

`incidents.server_id` references `servers.id`.

### FK-015

`incidents.server_service_id` references `server_services.id`.

### FK-016

`incidents.current_diagnosis_id` references `diagnoses.id`.

### FK-017

`incidents.created_by_user_id` references `users.id`.

### FK-018

`incident_signals.workspace_id` references `workspaces.id`.

### FK-019

`incident_signals.incident_id` references `incidents.id`.

### FK-020

`incident_signals.signal_id` references `signals.id`.

### FK-021

`diagnoses.workspace_id` references `workspaces.id`.

### FK-022

`diagnoses.incident_id` references `incidents.id`.

### FK-023

`diagnosis_evidence.workspace_id` references `workspaces.id`.

### FK-024

`diagnosis_evidence.diagnosis_id` references `diagnoses.id`.

### FK-025

`diagnosis_evidence.incident_id` references `incidents.id`.

### FK-026

`playbooks.workspace_id` references `workspaces.id`.

### FK-027

`playbook_runs.workspace_id` references `workspaces.id`.

### FK-028

`playbook_runs.playbook_id` references `playbooks.id`.

### FK-029

`playbook_runs.incident_id` references `incidents.id`.

### FK-030

`playbook_runs.signal_id` references `signals.id`.

### FK-031

`playbook_steps.workspace_id` references `workspaces.id`.

### FK-032

`playbook_steps.playbook_run_id` references `playbook_runs.id`.

### FK-033

`actions.workspace_id` references `workspaces.id`.

### FK-034

`action_runs.workspace_id` references `workspaces.id`.

### FK-035

`action_runs.action_id` references `actions.id`.

### FK-036

`action_runs.incident_id` references `incidents.id`.

### FK-037

`action_runs.server_id` references `servers.id`.

### FK-038

`action_runs.server_service_id` references `server_services.id`.

### FK-039

`action_runs.requested_by_user_id` references `users.id`.

### FK-040

`action_approvals.workspace_id` references `workspaces.id`.

### FK-041

`action_approvals.action_run_id` references `action_runs.id`.

### FK-042

`action_approvals.requested_by_user_id` references `users.id`.

### FK-043

`action_approvals.decided_by_user_id` references `users.id`.

### FK-044

`notifications.workspace_id` references `workspaces.id`.

### FK-045

`notifications.incident_id` references `incidents.id`.

### FK-046

`notifications.playbook_run_id` references `playbook_runs.id`.

### FK-047

`notifications.integration_id` references `integrations.id`.

### FK-048

`tickets.workspace_id` references `workspaces.id`.

### FK-049

`tickets.incident_id` references `incidents.id`.

### FK-050

`tickets.integration_id` references `integrations.id`.

### FK-051

`incident_timeline_events.workspace_id` references `workspaces.id`.

### FK-052

`incident_timeline_events.incident_id` references `incidents.id`.

### FK-053

`test_signals.workspace_id` references `workspaces.id`.

### FK-054

`test_signals.server_id` references `servers.id`.

### FK-055

`test_signals.signal_id` references `signals.id`.

### FK-056

`test_signals.requested_by_user_id` references `users.id`.

---

## 10. Unique Constraints

### UQ-001: users_email

`users.email` must be unique.

### UQ-002: workspace_membership_user_workspace

`workspace_memberships.user_id` and `workspace_memberships.workspace_id` must be unique together.

### UQ-003: incident_signal_pair

`incident_signals.incident_id` and `incident_signals.signal_id` must be unique together.

### UQ-004: server_service_name_per_server

`server_services.server_id` and `server_services.name` should be unique together when service registration is enabled.

### UQ-005: integration_provider_per_workspace

`integrations.workspace_id` and `integrations.provider_key` should be unique together for singleton MVP integrations.

### UQ-006: current_diagnosis_per_incident

At most one diagnosis per incident may have `is_current = true`.

SQLite note:

This may require application-level enforcement or a partial unique index pattern compatible with the selected database.

### UQ-007: action_name_per_workspace

`actions.workspace_id` and `actions.name` should be unique together.

### UQ-008: playbook_name_per_workspace

`playbooks.workspace_id` and `playbooks.name` should be unique together.

---

## 11. Indexes

### IDX-001: users_email_unique

Fields:

- `users.email`

Purpose:

Supports user lookup and uniqueness.

### IDX-002: workspace_memberships_user_workspace

Fields:

- `workspace_memberships.user_id`
- `workspace_memberships.workspace_id`

Purpose:

Supports workspace access lookup.

### IDX-003: servers_workspace_health

Fields:

- `servers.workspace_id`
- `servers.health_state`
- `servers.updated_at`

Purpose:

Supports server lists and Overview summaries.

### IDX-004: servers_workspace_environment

Fields:

- `servers.workspace_id`
- `servers.environment`

Purpose:

Supports environment filtering.

### IDX-005: server_services_server_status

Fields:

- `server_services.server_id`
- `server_services.last_known_status`

Purpose:

Supports server detail and service health display.

### IDX-006: integrations_workspace_provider

Fields:

- `integrations.workspace_id`
- `integrations.provider_key`
- `integrations.enabled`

Purpose:

Supports integration lookup and capability checks.

### IDX-007: signals_workspace_received

Fields:

- `signals.workspace_id`
- `signals.received_at`

Purpose:

Supports recent signal lists.

### IDX-008: signals_workspace_status_severity

Fields:

- `signals.workspace_id`
- `signals.status`
- `signals.severity`

Purpose:

Supports signal filtering.

### IDX-009: signals_server_time

Fields:

- `signals.server_id`
- `signals.received_at`

Purpose:

Supports server signal history.

### IDX-010: signals_incident

Fields:

- `signals.incident_id`

Purpose:

Supports incident signal lookup.

### IDX-011: signals_fingerprint

Fields:

- `signals.workspace_id`
- `signals.fingerprint`
- `signals.received_at`

Purpose:

Supports deduplication and repeated signal handling.

### IDX-012: incidents_workspace_status

Fields:

- `incidents.workspace_id`
- `incidents.status`
- `incidents.updated_at`

Purpose:

Supports incident lists and Overview summaries.

### IDX-013: incidents_server_status

Fields:

- `incidents.server_id`
- `incidents.status`
- `incidents.updated_at`

Purpose:

Supports server incident history.

### IDX-014: incident_signals_incident

Fields:

- `incident_signals.incident_id`

Purpose:

Supports incident detail.

### IDX-015: diagnoses_incident_current

Fields:

- `diagnoses.incident_id`
- `diagnoses.is_current`

Purpose:

Supports current diagnosis lookup.

### IDX-016: diagnosis_evidence_diagnosis

Fields:

- `diagnosis_evidence.diagnosis_id`

Purpose:

Supports diagnosis evidence display.

### IDX-017: playbook_runs_incident

Fields:

- `playbook_runs.incident_id`
- `playbook_runs.created_at`

Purpose:

Supports incident automation history.

### IDX-018: playbook_steps_run

Fields:

- `playbook_steps.playbook_run_id`
- `playbook_steps.created_at`

Purpose:

Supports playbook run detail.

### IDX-019: action_runs_incident

Fields:

- `action_runs.incident_id`
- `action_runs.created_at`

Purpose:

Supports incident action history.

### IDX-020: action_runs_server

Fields:

- `action_runs.server_id`
- `action_runs.created_at`

Purpose:

Supports server action history.

### IDX-021: action_approvals_action_run

Fields:

- `action_approvals.action_run_id`

Purpose:

Supports action approval lookup.

### IDX-022: notifications_incident

Fields:

- `notifications.incident_id`
- `notifications.created_at`

Purpose:

Supports incident notification history.

### IDX-023: tickets_incident

Fields:

- `tickets.incident_id`
- `tickets.created_at`

Purpose:

Supports incident ticket history.

### IDX-024: timeline_incident_time

Fields:

- `incident_timeline_events.incident_id`
- `incident_timeline_events.occurred_at`

Purpose:

Supports timeline rendering.

### IDX-025: test_signals_workspace_time

Fields:

- `test_signals.workspace_id`
- `test_signals.created_at`

Purpose:

Supports onboarding and test history.

---

## 12. Enums

### ENUM-USER-STATUS

Allowed values:

- active
- disabled

### ENUM-WORKSPACE-ROLE

Allowed values:

- owner
- operator

### ENUM-ENVIRONMENT

Allowed values:

- production
- staging
- development
- homelab
- other

### ENUM-SERVER-HEALTH-STATE

Allowed values:

- healthy
- warning
- critical
- unknown
- disconnected
- archived

### ENUM-SERVER-CONNECTION-STATUS

Allowed values:

- pending
- connected
- disconnected
- unknown

### ENUM-MONITORING-STATUS

Allowed values:

- inactive
- pending
- active
- degraded

## `degraded` Terminology Clarification

`degraded` is not a canonical product-facing Server Health State.

Product-facing Server Health State values are:

- `healthy`
- `warning`
- `critical`
- `unknown`

Any legacy server health value of `degraded` must map to `warning`.

However, `degraded` may still appear in internal lifecycle enums for non-server-health concepts, such as integration connection quality or external provider status.

Rules:

- Do not show `degraded` as a server health value in MVP UI.
- Do not use `degraded` in product-facing server API examples.
- Internal non-server enums may use `degraded` only when clearly scoped away from Server Health State.

### ENUM-DIAGNOSIS-ACCESS-STATUS

Allowed values:

- not_configured
- configured
- connected
- failed

### ENUM-SERVICE-TYPE

Allowed values:

- process
- container
- website
- api
- database
- cache
- cron
- other

### ENUM-SERVICE-STATUS

Allowed values:

- healthy
- warning
- critical
- unknown

### ENUM-CRITICALITY

Allowed values:

- low
- medium
- high
- critical

### ENUM-SEVERITY

Allowed values:

- info
- warning
- critical
- unknown

### ENUM-SIGNAL-SOURCE-TYPE

Allowed values:

- prometheus
- webhook
- manual_test

### ENUM-SIGNAL-STATUS

Allowed values:

- received
- normalized
- linked
- ignored
- resolved
- archived

### ENUM-INCIDENT-STATUS

Allowed values:

- open
- investigating
- diagnosed
- action_recommended
- action_taken
- resolved
- reopened
- archived

### ENUM-DIAGNOSIS-STATUS

Allowed values:

- not_requested
- requested
- generating
- generated
- insufficient_evidence
- failed
- superseded

### ENUM-EVIDENCE-TYPE

Allowed values:

- signal
- action_run
- timeline_event
- server_status
- manual_note

### ENUM-PLAYBOOK-STATUS

Allowed values:

- draft
- enabled
- disabled
- archived

### ENUM-PLAYBOOK-PROBLEM-TYPE

Allowed values:

- high_cpu
- disk_usage_high
- service_down
- website_api_unavailable
- custom

### ENUM-PLAYBOOK-ACTION-POLICY

Allowed values:

- read_only_only
- approval_required_allowed
- manual_only

### ENUM-PLAYBOOK-RUN-STATUS

Allowed values:

- triggered
- running
- waiting_for_approval
- completed
- partially_completed
- failed
- cancelled

### ENUM-PLAYBOOK-STEP-TYPE

Allowed values:

- diagnosis
- notification
- ticket
- action
- decision

### ENUM-STEP-STATUS

Allowed values:

- pending
- running
- completed
- skipped
- failed
- cancelled

### ENUM-ACTION-CATEGORY

Allowed values:

- diagnostics
- remediation
- notification
- ticketing

### ENUM-ACTION-TARGET-TYPE

Allowed values:

- server
- service
- incident

### ENUM-ACTION-RISK-LEVEL

Allowed values:

- read_only
- low_risk
- approval_required
- unsafe

### ENUM-ACTION-RUN-STATUS

Allowed values:

- requested
- waiting_for_approval
- approved
- rejected
- running
- completed
- failed
- cancelled

### ENUM-APPROVAL-STATUS

Allowed values:

- pending
- approved
- rejected
- expired
- cancelled

### ENUM-INTEGRATION-CATEGORY

Allowed values:

- monitoring
- ai
- notification
- ticketing
- actions

### ENUM-INTEGRATION-STATUS

Allowed values:

- not_configured
- configured
- validation_pending
- connected
- degraded
- disabled
- removed

### ENUM-MVP-PROVIDER-KEY

Allowed MVP values:

- prometheus
- webhook
- qwen
- ollama
- smtp
- github
- jira
- ssh

### ENUM-NOTIFICATION-STATUS

Allowed values:

- pending
- sending
- sent
- failed
- cancelled

### ENUM-TICKET-PROVIDER

Allowed values:

- github
- jira

### ENUM-TICKET-STATUS

Allowed values:

- not_created
- creation_requested
- created
- updated
- closed
- failed

### ENUM-TIMELINE-ACTOR-TYPE

Allowed values:

- user
- system
- ai
- integration

### ENUM-TEST-SIGNAL-STATUS

Allowed values:

- requested
- generated
- failed

---

## 13. Nullable and Required Fields

### NULL-001: Required workspace ownership

All workspace-scoped records must have `workspace_id`.

Applies to:

- servers
- server_services
- integrations
- signals
- incidents
- incident_signals
- diagnoses
- diagnosis_evidence
- playbooks
- playbook_runs
- playbook_steps
- actions
- action_runs
- action_approvals
- notifications
- tickets
- incident_timeline_events
- test_signals

### NULL-002: Optional server mapping for signals

`signals.server_id` may be null.

Reason:

Signals may arrive before a server is mapped.

### NULL-003: Optional service mapping

`server_service_id` may be null on signals, incidents, and action runs.

Reason:

The MVP may only know the server, not the specific service.

### NULL-004: Optional incident on raw signals

`signals.incident_id` may be null.

Reason:

Not every signal must immediately create or link to an incident.

### NULL-005: Required incident for diagnosis

`diagnoses.incident_id` must not be null.

Reason:

Diagnosis only makes sense in the context of an incident.

### NULL-006: Required incident for tickets

`tickets.incident_id` must not be null.

Reason:

Tickets track incidents.

### NULL-007: Optional incident for notifications

`notifications.incident_id` may be null.

Reason:

Some notifications may relate to onboarding, test signals, or playbook runs.

### NULL-008: Optional result fields

Result fields such as `result_summary`, `output_excerpt`, `error_summary`, `failure_reason`, and `decision_note` may be null until the related operation completes or fails.

### NULL-009: Optional timestamps

Lifecycle timestamps such as `resolved_at`, `archived_at`, `generated_at`, `started_at`, `completed_at`, `sent_at`, and `decided_at` may be null until the relevant lifecycle event occurs.

### NULL-010: Optional external references

External ticket reference fields may be null until external ticket creation succeeds.

### NULL-011: Optional current diagnosis

`incidents.current_diagnosis_id` may be null until a diagnosis exists.

---

## 14. Default Values

### DEF-001: users.status

Default:

- active

### DEF-002: workspaces.product_mode

Default:

- personal_server_mvp

### DEF-003: workspace_memberships.role

Default:

- owner for workspace creator
- operator otherwise

### DEF-004: workspace_memberships.status

Default:

- active

### DEF-005: servers.environment

Default:

- production, if the user does not specify another value

### DEF-006: servers.health_state

Default:

- unknown

### DEF-007: servers.connection_status

Default:

- pending

### DEF-008: servers.monitoring_status

Default:

- inactive

### DEF-009: servers.diagnosis_access_status

Default:

- not_configured

### DEF-010: server_services.last_known_status

Default:

- unknown

### DEF-011: server_services.criticality

Default:

- medium

### DEF-012: integrations.enabled

Default:

- true after configuration
- false before configuration, if pre-seeded

### DEF-013: integrations.connection_status

Default:

- not_configured

### DEF-014: signals.status

Default:

- received

### DEF-015: signals.severity

Default:

- unknown

### DEF-016: signals.is_test

Default:

- false

### DEF-017: incidents.status

Default:

- open

### DEF-018: incidents.severity

Default:

- unknown

### DEF-019: diagnoses.status

Default:

- not_requested

### DEF-020: diagnoses.is_current

Default:

- false

### DEF-021: playbooks.status

Default:

- draft

### DEF-022: playbooks.notification_enabled

Default:

- false

### DEF-023: playbooks.ticket_enabled

Default:

- false

### DEF-024: playbooks.action_policy

Default:

- read_only_only

### DEF-025: playbook_runs.status

Default:

- triggered

### DEF-026: playbook_steps.status

Default:

- pending

### DEF-027: actions.risk_level

Default:

- read_only only for seeded diagnostic actions
- no default for user-defined actions unless explicitly classified

### DEF-028: actions.approval_required

Default:

- false for read_only actions
- true for approval_required and unsafe actions

### DEF-029: actions.enabled

Default:

- true for seeded safe actions

### DEF-030: action_runs.status

Default:

- requested

### DEF-031: action_approvals.status

Default:

- pending

### DEF-032: notifications.status

Default:

- pending

### DEF-033: tickets.status

Default:

- not_created

### DEF-034: test_signals.status

Default:

- requested

---

## 15. Timestamps

### TIME-001: created_at

All main tables must include `created_at`.

### TIME-002: updated_at

Mutable main tables must include `updated_at`.

Tables that are purely append-only may omit `updated_at`, but only if records are never changed after creation.

### TIME-003: occurred_at

Timeline events must include `occurred_at`.

### TIME-004: received_at

Signals must include `received_at`.

### TIME-005: lifecycle timestamps

Lifecycle-specific timestamps should exist where business events matter:

- `resolved_at`
- `archived_at`
- `generated_at`
- `started_at`
- `completed_at`
- `sent_at`
- `requested_at`
- `decided_at`
- `last_validated_at`

### TIME-006: timestamp semantics

All timestamps should be stored consistently in UTC.

---

## 16. Soft Delete Policy

### SOFT-001: Preferred deletion model

The MVP should use soft delete or archive state for operational records.

### SOFT-002: Servers

Servers should be archived using `archived_at` and `health_state = archived`.

Archived servers remain available for historical incident references.

### SOFT-003: Server services

Server services should be archived with `archived_at`.

### SOFT-004: Incidents

Incidents should be archived using `status = archived` and `archived_at`.

Resolved incidents should remain visible until archived.

### SOFT-005: Signals

Signals should be archived using `status = archived` and `archived_at`.

### SOFT-006: Playbooks

Playbooks should be archived using `status = archived` and `archived_at`.

### SOFT-007: Actions

Actions should be archived using `archived_at` or disabled using `enabled = false`.

### SOFT-008: Integrations

Integrations should be removed using `connection_status = removed` and `removed_at`.

### SOFT-009: Users

Users should be disabled rather than deleted in the MVP.

### SOFT-010: Historical records

Action runs, notifications, tickets, diagnoses, evidence, and timeline events should generally not be deleted while the related incident exists.

---

## 17. Cascade Delete Policy

### CAS-001: Avoid destructive cascades

The MVP should avoid destructive cascade deletion for operational records.

### CAS-002: Workspace deletion

Workspace deletion is not part of the MVP user flow.

If workspace deletion is ever introduced, it must define archival/export behavior before removal.

### CAS-003: Server deletion

Deleting or archiving a server must not delete related signals, incidents, diagnoses, action runs, notifications, tickets, or timeline events.

### CAS-004: Incident deletion

Deleting incidents is not part of the MVP user flow.

Archiving incidents should preserve signals, diagnoses, actions, notifications, tickets, and timeline events.

### CAS-005: Integration removal

Removing an integration must not delete historical signals, notifications, tickets, or action runs that reference it.

### CAS-006: Playbook deletion

Archiving a playbook must not delete historical playbook runs.

### CAS-007: Action deletion

Archiving or disabling an action must not delete historical action runs.

### CAS-008: User disabling

Disabling a user must not delete historical approvals, requested actions, or created incidents.

---

## 18. Migration Policy

### MIG-001: SQLite-first migrations

Migrations must be compatible with SQLite as the default MVP database.

### MIG-002: PostgreSQL-compatible design

Schema decisions should avoid blocking future PostgreSQL support.

### MIG-003: Non-destructive first

The first product-slimming migrations should avoid destructive data changes.

### MIG-004: Product renaming does not require table renaming

UI terms such as Signals, Playbooks, and Integrations may map to existing internal alert, workflow, and provider concepts when practical.

### MIG-005: Preserve historical readability

Migrations must preserve enough data for incidents, signals, diagnoses, action runs, notifications, and tickets to remain understandable.

### MIG-006: Avoid enterprise migration scope

Migrations must not introduce enterprise tables that are outside the MVP.

### MIG-007: Seed changes are migrations

Seeded playbooks, actions, and integration definitions should be versioned as part of schema/data migration policy.

### MIG-008: Data backfill

When new required fields are introduced to existing tables, migrations should define safe backfill values.

---

## 19. Seed Data Requirements

### SEED-001: Default workspace

The product may seed or create one default workspace for the first user.

### SEED-002: MVP integrations

The product should seed integration definitions or visible integration metadata for:

- Prometheus
- Webhook
- Qwen-compatible AI
- Ollama-compatible AI
- SMTP
- GitHub
- Jira
- SSH

### SEED-003: Default playbook templates

The product should seed MVP playbook templates for:

- High CPU
- Disk usage high
- Service down
- Website/API unavailable

### SEED-004: Default safe actions

The product should seed read-only diagnostic actions for:

- Check uptime
- Check disk usage
- Check memory usage
- Check top processes
- Check service status
- Check container status
- Collect recent logs

### SEED-005: Action risk classification

Seeded actions must include risk levels.

### SEED-006: No dangerous seeded auto-actions

The MVP must not seed automatically executable dangerous actions.

### SEED-007: Test signal template

The product may seed a manual test signal template for onboarding.

### SEED-008: Seed idempotency

Seed data should be idempotent and should not create duplicates when applied more than once.

---

## 20. Sensitive Data Handling

### SEC-001: No secrets in config_summary

`integrations.config_summary` must not contain raw secrets.

### SEC-002: No raw private keys as ordinary fields

SSH private keys must not be stored as plain business fields.

### SEC-003: No API keys in ordinary fields

AI provider keys, SMTP passwords, GitHub tokens, Jira tokens, and webhook secrets must not be stored as ordinary visible fields.

### SEC-004: Redacted destination summaries

Notification destination summaries should avoid exposing sensitive credentials or private tokens.

### SEC-005: Action output sensitivity

`action_runs.output_excerpt` may contain operationally sensitive data and should be limited and treated as workspace-scoped.

### SEC-006: Diagnosis sensitivity

Diagnosis content may include infrastructure details and must remain workspace-scoped.

### SEC-007: Ticket URL sensitivity

External ticket URLs and references may reveal operational context and must remain workspace-scoped.

### SEC-008: Raw payload minimization

`signals.raw_payload_summary` should store only what is needed for diagnosis and traceability.

### SEC-009: Secret storage separation

Secrets should be managed through the selected secret-handling mechanism rather than ordinary business columns.

### SEC-010: Historical records

Historical records should preserve useful context without exposing sensitive credentials.

---

## 21. Data Integrity Rules

### DIR-001: Workspace boundary

All workspace-scoped records must remain within their workspace boundary.

### DIR-002: Signal persistence

Signals must not be discarded solely because they cannot be mapped to a server.

### DIR-003: Incident origin

An incident must originate from at least one signal, manual user action, or playbook-triggered condition.

### DIR-004: Incident-signal traceability

A signal linked to an incident must remain traceable from the incident.

### DIR-005: Diagnosis ownership

Every diagnosis must belong to exactly one incident.

### DIR-006: Evidence traceability

Diagnosis evidence should identify its source when the source is known.

### DIR-007: Current diagnosis uniqueness

Only one diagnosis should be current for an incident.

### DIR-008: Risk required

Every action must have a risk level before becoming available.

### DIR-009: Approval-required action protection

Approval-required actions must not execute unless approved.

### DIR-010: Rejected action protection

Rejected action runs must not execute.

### DIR-011: Unsafe action restriction

Unsafe actions must not run automatically in the MVP.

### DIR-012: Action result finality

An action run that begins must eventually reach a completed, failed, or cancelled state.

### DIR-013: Ticket incident requirement

Every ticket must belong to one incident.

### DIR-014: Timeline completeness

Meaningful incident lifecycle events must be represented in `incident_timeline_events`.

### DIR-015: Disabled integration restriction

Disabled or removed integrations must not be used for new active operations.

### DIR-016: Archived server restriction

Archived servers must not be targets of new automatic action runs.

### DIR-017: Test signal clarity

Test signals must be distinguishable from operational signals.

### DIR-018: Unknown is not healthy

A server with insufficient recent data must be unknown or disconnected, not healthy.

### DIR-019: Failure preservation

Failure of AI diagnosis, notification, ticketing, or action execution must not remove the incident or signal.

### DIR-020: Historical reference preservation

Historical records should remain understandable even when related servers, integrations, playbooks, or actions are archived or removed.

---

## 22. Mapping to Domain Entities

| Database Object | Table | Domain Entity |
|---|---|---|
| DB-USERS | users | ENT-USER |
| DB-WORKSPACES | workspaces | ENT-WORKSPACE |
| DB-WORKSPACE-MEMBERSHIPS | workspace_memberships | ENT-USER / ENT-WORKSPACE |
| DB-SERVERS | servers | ENT-SERVER |
| DB-SERVER-SERVICES | server_services | ENT-SERVER-SERVICE |
| DB-INTEGRATIONS | integrations | ENT-INTEGRATION |
| DB-SIGNALS | signals | ENT-SIGNAL |
| DB-INCIDENTS | incidents | ENT-INCIDENT |
| DB-INCIDENT-SIGNALS | incident_signals | ENT-INCIDENT / ENT-SIGNAL relationship |
| DB-DIAGNOSES | diagnoses | ENT-DIAGNOSIS |
| DB-DIAGNOSIS-EVIDENCE | diagnosis_evidence | ENT-EVIDENCE |
| DB-PLAYBOOKS | playbooks | ENT-PLAYBOOK |
| DB-PLAYBOOK-RUNS | playbook_runs | ENT-PLAYBOOK-RUN |
| DB-PLAYBOOK-STEPS | playbook_steps | ENT-PLAYBOOK-RUN step records |
| DB-ACTIONS | actions | ENT-ACTION |
| DB-ACTION-RUNS | action_runs | ENT-ACTION-RUN |
| DB-ACTION-APPROVALS | action_approvals | ENT-APPROVAL |
| DB-NOTIFICATIONS | notifications | ENT-NOTIFICATION |
| DB-TICKETS | tickets | ENT-TICKET |
| DB-INCIDENT-TIMELINE-EVENTS | incident_timeline_events | ENT-TIMELINE-EVENT |
| DB-TEST-SIGNALS | test_signals | ENT-TEST-SIGNAL |

---

## 23. Assumptions

### ASM-001

The MVP uses SQLite by default.

### ASM-002

The schema should remain compatible with a future PostgreSQL option.

### ASM-003

The MVP is primarily single-user or single-workspace, but workspace boundaries are preserved.

### ASM-004

Prometheus and generic webhook signals are enough for the first release.

### ASM-005

Email, GitHub, Jira, AI provider, and SSH integrations are enough for the first closed loop.

### ASM-006

Secrets are handled outside ordinary business fields.

### ASM-007

The product may initially map new product language onto existing inherited tables where safe.

### ASM-008

Advanced Keep-style platform features remain hidden or out of scope for MVP.

### ASM-009

Server services are useful but may not be required for the first release.

### ASM-010

Action outputs may be stored as summaries or excerpts rather than full logs.

### ASM-011

Exact data retention periods are not decided yet.

### ASM-012

The current conversation does not provide a concrete `architecture.md`; this schema assumes the architecture remains aligned with the selected Keep-derived Python/FastAPI and Next.js stack.

---

## 24. Open Questions

### OQ-001

Should `test_signals` exist as a separate table, or is `signals.is_test` sufficient?

### OQ-002

Should server services be required in the MVP, or should incidents attach only to servers at first?

### OQ-003

Should signals be allowed to link to multiple incidents, or exactly one incident?

### OQ-004

Should multiple diagnoses from different AI providers be allowed to be current at the same time?

### OQ-005

Should action output be stored as full output, truncated output, or summary only?

### OQ-006

Should large diagnostic logs use an attachment-like storage mechanism?

### OQ-007

Should notifications and tickets remain first-class tables, or be modeled only as playbook steps?

### OQ-008

Should custom playbooks store full definitions in the database, or should MVP playbooks be fixed templates?

### OQ-009

Should integration status changes have a separate history table?

### OQ-010

Should server health history be tracked for charts and trends?

### OQ-011

Should manual incident notes be a separate table or timeline events with `event_type = note`?

### OQ-012

Should incident severity be derived from signals, manually editable, or both?

### OQ-013

Should archived records be restorable?

### OQ-014

Should retention policy be global, per workspace, or fixed in the MVP?

### OQ-015

Should workspace memberships remain in the first MVP if the product exposes only one user?

### OQ-016

Should current diagnosis uniqueness be enforced at the database level, application level, or both for SQLite compatibility?
