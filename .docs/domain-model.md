# Domain Model: Lightweight AIOps Platform for Personal Servers

## 1. Purpose

This domain model defines the business world for a lightweight AIOps platform focused on personal servers.

It explains the core concepts, entities, relationships, states, lifecycles, and business rules that govern the product. The model is intended to help Codex understand what exists in the product, how those things relate to each other, and what business constraints must always hold true.

The product domain is centered on this operational loop:

**User → Server → Signal → Incident → AI Diagnosis → Notification / Ticket / Safe Action → Resolution Record**

---

## 2. Source of Truth

This `domain-model.md` is the source of truth for domain concepts and business behavior.

The product source of truth remains `prd.md`. If a product goal or scope decision conflicts with this domain model, `prd.md` takes precedence.

If an entity, state, lifecycle, or business rule is unclear, this document should be updated before implementation decisions are made.

---

## 3. Codex Usage

Codex should use this document to understand the product's business concepts and rules.

Codex should treat entity IDs and business rule IDs as stable references.

Codex should not invent additional enterprise entities, permission models, topology systems, or integration categories unless explicitly requested later.

Codex should not interpret this document as a database schema, API specification, UI specification, or technical architecture. This document describes the business domain only.

---

## 4. Non-Goals

This domain model does not define database tables, API endpoints, frontend components, package choices, runtime commands, file paths, or deployment methods.

This domain model does not define a complete enterprise AIOps domain.

This domain model does not model complex CMDB, enterprise service topology, multi-organization tenancy, advanced role-based access control, billing, licensing, or compliance reporting.

This domain model does not model provider-specific low-level configuration details.

This domain model does not allow AI to autonomously perform dangerous actions.

---

## 5. Domain Glossary

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

### User

A person who owns or operates one or more personal servers and uses the product to monitor, diagnose, and respond to issues.

### Personal Server

A server operated by an individual, indie hacker, small operator, or small team. It may host websites, APIs, databases, containers, scripts, bots, or internal tools.

### Server

A monitored operational object representing one personal server.

### Environment

A simple label that describes the purpose or context of a server, such as production, staging, development, or homelab.

### Signal

An incoming alert, webhook event, abnormal observation, or monitoring event that indicates something may need attention.

### Incident

A grouped operational problem created from one or more signals. An incident represents a user-facing unit of investigation and response.

### AI Diagnosis

A structured AI-generated explanation of an incident, including probable cause, evidence, impact, recommended actions, verification steps, risk notes, and uncertainty.

### Evidence

A factual observation used to support a diagnosis, such as a signal, server status, diagnostic action output, or timeline event.

### Inference

A conclusion derived from evidence. Inferences must be distinguishable from evidence.

### Playbook

A guided operational flow for a common problem, such as high CPU, high disk usage, service down, or website/API unavailable.

### Action

A diagnostic or remediation activity that can be suggested or executed in response to an incident.

### Safe Action

An action that is read-only or low-risk according to the product's risk model.

### Risk Level

A business classification that describes how dangerous an action is. Risk levels include read-only, low-risk, approval-required, and unsafe.

### Integration

A connection to an external capability such as monitoring, AI, notification, ticketing, or remote action execution.

### Notification

A message sent to the user about an incident, diagnosis, playbook result, or action result.

### Ticket

A tracking record created outside the platform, such as a GitHub issue or Jira ticket.

### Timeline

A chronological record of important events related to an incident.

### Health State

A simplified state that summarizes whether a server appears healthy, warning, critical, or unknown.

Server health may also include internal system/lifecycle states such as disconnected and archived.

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

---

## 6. Core Entities

### ENT-USER: User

A person using the product to operate personal servers.

Key business attributes:

- Identity
- Display name
- Contact address
- Notification preferences
- Product access status

Business meaning:

A user owns servers, configures integrations, receives notifications, reviews incidents, requests diagnosis, and approves or runs actions.

---

### ENT-WORKSPACE: Workspace

A lightweight operational boundary for one user's personal-server environment.

Key business attributes:

- Name
- Owner
- Product mode
- Default notification preferences

Business meaning:

A workspace groups the user's servers, signals, incidents, playbooks, integrations, and actions. The MVP may behave as a single-user workspace, but the workspace concept defines the boundary of ownership.

---

### ENT-SERVER: Server

A monitored personal server.

Key business attributes:

- Name
- Host or IP
- Environment
- Description
- Health state
- Connection status
- Monitoring status
- Diagnosis access status
- Last signal time
- Last incident time
- Last diagnosis time

Business meaning:

A server is the primary operational object in the product. Signals, incidents, diagnoses, and actions should be related to a server whenever possible.

---

### ENT-SERVER-SERVICE: Server Service

A service, process, container, website, API, database, cache, or scheduled job running on a server.

Key business attributes:

- Name
- Type
- Expected status
- Criticality
- Parent server
- Last known status

Business meaning:

A server service represents a business-relevant workload on a personal server. The MVP may infer or manually register services at a simple level.

---

### ENT-ENVIRONMENT: Environment

A simple label describing the context of a server.

Allowed business values:

- production
- staging
- development
- homelab
- other

Business meaning:

Environment helps users understand risk and priority. Production incidents usually deserve higher attention than development incidents.

---

### ENT-SIGNAL: Signal

An incoming alert, webhook event, or abnormal observation.

Key business attributes:

- Source
- Title
- Description
- Severity
- Status
- Received time
- Affected server if known
- Affected service if known
- Related incident if any
- Raw context summary
- Normalized context summary

Business meaning:

A signal is the raw indication that something may be wrong. Signals may or may not become incidents.

---

### ENT-SIGNAL-SOURCE: Signal Source

The origin of a signal.

Allowed MVP source categories:

- Prometheus
- Webhook
- Manual test

Business meaning:

Signal source helps the product explain where a signal came from and how trustworthy or actionable it may be.

---

### ENT-INCIDENT: Incident

A grouped operational issue requiring attention.

Key business attributes:

- Title
- Severity
- Status
- Affected server
- Affected service if known
- Related signals
- Current diagnosis
- Recommended next action
- Timeline
- Created time
- Resolved time

Business meaning:

An incident is the main unit of response. The user should be able to understand, diagnose, notify, track, and act from an incident.

---

### ENT-DIAGNOSIS: AI Diagnosis

A structured explanation generated by AI for an incident.

Key business attributes:

- Incident
- Diagnosis status
- Probable cause
- Evidence
- Impact
- Recommended actions
- Verification steps
- Risk notes
- Uncertainty statement
- Generated time

Business meaning:

A diagnosis helps the user move from symptom to understanding. It must clearly distinguish evidence from inference and must not overstate certainty.

---

### ENT-EVIDENCE: Evidence

A factual observation used in diagnosis.

Key business attributes:

- Evidence type
- Source entity
- Summary
- Observed time
- Related incident
- Reliability note if applicable

Business meaning:

Evidence supports diagnosis and recommended actions. Examples include signals, server metadata, action results, and incident timeline entries.

---

### ENT-PLAYBOOK: Playbook

A guided operational flow for a common server problem.

Key business attributes:

- Name
- Problem type
- Trigger conditions
- Diagnostic steps
- AI diagnosis behavior
- Notification behavior
- Ticket behavior
- Action policy
- Enabled status

Business meaning:

A playbook defines how the product responds to a type of operational issue.

---

### ENT-PLAYBOOK-RUN: Playbook Run

A single execution of a playbook for an incident or signal.

Key business attributes:

- Playbook
- Triggering signal or incident
- Status
- Started time
- Completed time
- Steps completed
- Result summary

Business meaning:

A playbook run records what the product did in response to a problem.

---

### ENT-ACTION: Action

A diagnostic or remediation activity available to the user.

Key business attributes:

- Name
- Description
- Risk level
- Category
- Target type
- Approval requirement
- Expected outcome

Business meaning:

Actions help users inspect or resolve incidents. Actions must be risk-labeled before use.

---

### ENT-ACTION-RUN: Action Run

A single execution of an action.

Key business attributes:

- Action
- Target server
- Related incident
- Requested by
- Approval status
- Execution status
- Result summary
- Started time
- Completed time

Business meaning:

An action run is the record of an action being requested, approved if needed, executed, and completed or failed.

---

### ENT-INTEGRATION: Integration

A configured connection to an external capability.

Allowed MVP integration categories:

- Monitoring
- AI
- Notification
- Ticketing
- Actions

Key business attributes:

- Name
- Category
- Enabled status
- Connection status
- Owner
- Last validation time

Business meaning:

Integrations enable the product to receive signals, generate diagnosis, notify users, create tickets, or execute actions.

---

### ENT-NOTIFICATION: Notification

A message sent to the user or configured destination.

Key business attributes:

- Destination
- Related incident
- Related playbook run
- Status
- Sent time
- Delivery result

Business meaning:

Notifications close the communication loop when incidents occur or important actions complete.

---

### ENT-TICKET: Ticket

An external issue or task created to track an incident.

Key business attributes:

- Provider
- External reference
- Related incident
- Status
- Created time
- Last synced status if available

Business meaning:

Tickets allow incidents to be tracked outside the platform.

---

### ENT-TIMELINE-EVENT: Timeline Event

A chronological event related to an incident.

Key business attributes:

- Related incident
- Event type
- Actor
- Summary
- Time
- Related entity if any

Business meaning:

Timeline events preserve the operational history of an incident.

---

### ENT-APPROVAL: Approval

A user decision required before an approval-required action may run.

Key business attributes:

- Related action run
- Requested by
- Approved by
- Approval status
- Decision time
- Decision note

Business meaning:

Approvals prevent unsafe or state-changing actions from running without user control.

---

### ENT-TEST-SIGNAL: Test Signal

A manually generated signal used to validate onboarding and routing.

Key business attributes:

- Source
- Target server if selected
- Severity
- Generated time
- Result status

Business meaning:

Test signals help users confirm that the product can receive, process, and respond to signals.

---

## 7. Entity Relationships

### REL-001: User owns Workspace

A user owns one or more workspaces. The MVP may expose only one workspace per user.

### REL-002: Workspace contains Servers

A workspace contains zero or more servers.

### REL-003: Server contains Server Services

A server may have zero or more server services.

### REL-004: Server belongs to Environment

A server has one environment label.

### REL-005: Signal belongs to Workspace

Every signal belongs to one workspace.

### REL-006: Signal may relate to Server

A signal may relate to one server if the affected server can be determined.

### REL-007: Signal may relate to Server Service

A signal may relate to one server service if the affected service can be determined.

### REL-008: Incident groups Signals

An incident may contain one or more related signals.

### REL-009: Incident should relate to Server when known

An incident should have an affected server when the related signals or user assignment identify one.

### REL-010: Incident may relate to Server Service

An incident may have an affected service when the problem is service-specific.

### REL-011: Incident has Diagnoses

An incident may have zero or more AI diagnoses. One diagnosis may be considered current.

### REL-012: Diagnosis uses Evidence

A diagnosis uses one or more evidence items when available.

### REL-013: Evidence may originate from Signals

A signal may become an evidence item for a diagnosis.

### REL-014: Evidence may originate from Action Runs

An action run result may become an evidence item for a diagnosis.

### REL-015: Playbook can run for Signal or Incident

A playbook run may be triggered by a signal or an incident.

### REL-016: Playbook Run may create Diagnosis

A playbook run may request or produce an AI diagnosis.

### REL-017: Playbook Run may create Notification

A playbook run may send one or more notifications.

### REL-018: Playbook Run may create Ticket

A playbook run may create or update a ticket.

### REL-019: Playbook Run may request Action Runs

A playbook run may request one or more action runs.

### REL-020: Action Run targets Server

An action run must have a target server when it is a server diagnostic or remediation action.

### REL-021: Approval controls Action Run

An action run that requires approval must have an approval decision before execution.

### REL-022: Integration enables Capability

An integration enables one or more product capabilities, such as signal intake, diagnosis, notification, ticketing, or actions.

### REL-023: Notification relates to Incident

A notification should relate to an incident when it is sent because of an incident.

### REL-024: Ticket relates to Incident

A ticket must relate to an incident.

### REL-025: Timeline Event belongs to Incident

Every timeline event belongs to one incident.

---

## 8. Entity Lifecycles

### Server Lifecycle

1. Proposed
2. Added
3. Pending connection
4. Connected
5. Monitoring active
6. Warning
7. Disconnected
8. Archived

Lifecycle notes:

- A server may exist before monitoring is active.
- A server may be connected for diagnosis access but not yet receiving monitoring signals.
- A server may be archived when the user no longer wants to monitor it.

---

### Signal Lifecycle

1. Received
2. Normalized
3. Associated
4. Suppressed or ignored
5. Incident-linked
6. Resolved or closed
7. Archived

Lifecycle notes:

- A signal can be received even if no server is identified.
- A signal can remain unlinked if it does not require an incident.
- A signal can be linked to an existing incident.

---

### Incident Lifecycle

1. Open
2. Investigating
3. Diagnosed
4. Action recommended
5. Action taken
6. Resolved
7. Reopened
8. Archived

Lifecycle notes:

- An incident can be open without a diagnosis.
- An incident can have multiple diagnoses over time.
- An incident can be reopened if new related signals arrive after resolution.

---

### Diagnosis Lifecycle

1. Not requested
2. Requested
3. Generating
4. Generated
5. Insufficient evidence
6. Superseded
7. Failed

Lifecycle notes:

- A diagnosis may fail because required AI capability is unavailable.
- A diagnosis may be superseded when new evidence is collected.

---

### Playbook Lifecycle

1. Draft
2. Enabled
3. Disabled
4. Archived

Lifecycle notes:

- Only enabled playbooks should run automatically.
- Disabled playbooks may still be viewed or manually edited.

---

### Playbook Run Lifecycle

1. Triggered
2. Running
3. Waiting for approval
4. Completed
5. Partially completed
6. Failed
7. Cancelled

Lifecycle notes:

- A playbook run may pause while waiting for user approval.
- A partial completion can occur when notification succeeds but action fails.

---

### Action Lifecycle

1. Available
2. Disabled
3. Archived

Lifecycle notes:

- An action must have a risk level before it is available.
- Disabled actions should not be suggested for execution.

---

### Action Run Lifecycle

1. Requested
2. Waiting for approval
3. Approved
4. Rejected
5. Running
6. Completed
7. Failed
8. Cancelled

Lifecycle notes:

- Read-only actions may skip approval if allowed by policy.
- Approval-required actions must not run without approval.
- Unsafe actions must not run automatically in the MVP.

---

### Integration Lifecycle

1. Not configured
2. Configured
3. Validation pending
4. Connected
5. Degraded
6. Disabled
7. Removed

Lifecycle notes:

- A configured integration is not necessarily connected.
- A degraded integration may still exist but cannot reliably support its capability.

---

### Notification Lifecycle

1. Pending
2. Sending
3. Sent
4. Failed
5. Cancelled

Lifecycle notes:

- A failed notification should be visible in the incident timeline or playbook run result.

---

### Ticket Lifecycle

1. Not created
2. Creation requested
3. Created
4. Updated
5. Closed
6. Failed

Lifecycle notes:

- A failed ticket creation should not prevent incident diagnosis from existing.

---

## 9. State Machines

### Server Health State Machine

Allowed states:

- healthy
- warning
- critical
- unknown
- disconnected
- archived

Allowed transitions:

- unknown → healthy
- unknown → warning
- unknown → critical
- healthy → warning
- healthy → critical
- warning → healthy
- warning → critical
- critical → warning
- critical → healthy
- any active state → disconnected
- disconnected → unknown
- any state → archived

Business meaning:

- healthy means no known active critical or warning condition.
- warning means attention may be needed.
- critical means immediate attention is likely needed.
- unknown means the product does not have enough recent information.
- disconnected means the product cannot currently verify the server.
- archived means the server is no longer actively monitored.
- legacy degraded -> warning (for compatibility mapping only).

---

### Signal Status State Machine

Allowed states:

- received
- normalized
- linked
- ignored
- resolved
- archived

Allowed transitions:

- received → normalized
- normalized → linked
- normalized → ignored
- linked → resolved
- ignored → archived
- resolved → archived

Business meaning:

- received means the product has accepted the signal.
- normalized means the product has interpreted the signal into product language.
- linked means the signal belongs to an incident.
- ignored means the signal will not create an incident.
- resolved means the related issue is no longer active.
- archived means the signal is retained only as history.

---

### Incident Status State Machine

Allowed states:

- open
- investigating
- diagnosed
- action_recommended
- action_taken
- resolved
- reopened
- archived

Allowed transitions:

- open → investigating
- investigating → diagnosed
- diagnosed → action_recommended
- action_recommended → action_taken
- action_taken → resolved
- diagnosed → resolved
- investigating → resolved
- resolved → reopened
- reopened → investigating
- resolved → archived
- any non-archived state → archived

Business meaning:

- open means the incident exists but investigation has not meaningfully started.
- investigating means the user or product is collecting evidence.
- diagnosed means at least one diagnosis exists.
- action_recommended means the product has suggested actions.
- action_taken means at least one action was executed or recorded.
- resolved means the issue is believed to be resolved.
- reopened means new evidence suggests the issue has returned.
- archived means the incident is historical.

---

### Diagnosis Status State Machine

Allowed states:

- not_requested
- requested
- generating
- generated
- insufficient_evidence
- failed
- superseded

Allowed transitions:

- not_requested → requested
- requested → generating
- generating → generated
- generating → insufficient_evidence
- generating → failed
- generated → superseded
- insufficient_evidence → requested
- failed → requested

Business meaning:

- insufficient_evidence is a valid outcome, not a system error.
- superseded means a newer diagnosis should be considered current.

---

### Action Run Status State Machine

Allowed states:

- requested
- waiting_for_approval
- approved
- rejected
- running
- completed
- failed
- cancelled

Allowed transitions:

- requested → running
- requested → waiting_for_approval
- waiting_for_approval → approved
- waiting_for_approval → rejected
- approved → running
- running → completed
- running → failed
- requested → cancelled
- waiting_for_approval → cancelled
- approved → cancelled

Business meaning:

- approval-required actions must pass through waiting_for_approval and approved before running.
- rejected actions must not run.
- completed means an action result exists.
- failed means the action did not complete successfully or no trustworthy result was obtained.

---

### Integration Status State Machine

Allowed states:

- not_configured
- configured
- validation_pending
- connected
- degraded
- disabled
- removed

Allowed transitions:

- not_configured → configured
- configured → validation_pending
- validation_pending → connected
- validation_pending → degraded
- connected → degraded
- degraded → connected
- connected → disabled
- degraded → disabled
- disabled → configured
- configured → removed
- disabled → removed

Business meaning:

- connected means the integration is usable for its intended capability.
- degraded means the integration exists but cannot be fully trusted.
- disabled means the user has intentionally turned it off.
- removed means it should no longer be used.

---

## 10. Business Rules

### BR-001: Server-first product model

The product must treat servers as first-class operational objects.

Enforcement hint: User-facing workflows should lead with server context whenever server context is available.

---

### BR-002: Signals may exist without known servers

The product must allow a signal to be received even when no affected server can be identified.

Enforcement hint: Unmapped signals should remain visible and should not be discarded solely because server mapping is missing.

---

### BR-003: Incidents require at least one reason to exist

An incident must be created from at least one signal, manual user action, or playbook-triggered condition.

Enforcement hint: Incidents should not appear without an origin.

---

### BR-004: Incidents should preserve related signals

When an incident is created from signals, the related signals must remain associated with that incident.

Enforcement hint: Incident history should not lose source signal context.

---

### BR-005: Diagnosis must distinguish evidence from inference

AI diagnosis must separate observed evidence from inferred probable cause.

Enforcement hint: Diagnosis output should have distinct sections for evidence and probable cause.

---

### BR-006: Diagnosis must express uncertainty

If available evidence is insufficient, AI diagnosis must state uncertainty instead of presenting a confident conclusion.

Enforcement hint: Insufficient evidence is an acceptable diagnosis outcome.

---

### BR-007: AI must not claim guaranteed root cause

AI diagnosis must not present a probable cause as guaranteed unless the evidence directly supports certainty.

Enforcement hint: Use probability-oriented language for inferred causes.

---

### BR-008: Actions require risk classification

Every available action must have a risk level before it can be suggested or executed.

Enforcement hint: Actions without risk level should be unavailable to users.

---

### BR-009: Read-only actions may run without approval

Read-only actions may be executed without additional approval when the user has access to the target server.

Enforcement hint: Read-only status must be clear to the user before execution.

---

### BR-010: State-changing actions require explicit approval

Any action that changes server state must require explicit approval before execution.

Enforcement hint: Approval must happen before action execution begins.

---

### BR-011: Dangerous actions must not run automatically in the MVP

Actions classified as unsafe or dangerous must not be executed automatically in the MVP.

Enforcement hint: Unsafe actions may be described as manual recommendations but not executed by the product.

---

### BR-012: Rejected actions must not execute

If an approval-required action is rejected, it must not run.

Enforcement hint: Rejection is final for that action run.

---

### BR-013: Action results must be recorded

Every action run that starts must produce a visible result status.

Enforcement hint: Action history should show completed, failed, or cancelled status.

---

### BR-014: Incident timeline must record meaningful events

An incident timeline must record signal linking, diagnosis generation, notifications, ticket creation, action requests, approvals, action results, and resolution events.

Enforcement hint: Users should be able to reconstruct what happened from the timeline.

---

### BR-015: Notifications should be tied to incidents

A notification about an operational issue should reference the related incident when one exists.

Enforcement hint: Notification history should be understandable from the incident.

---

### BR-016: Ticket creation requires an incident

A ticket must be associated with an incident.

Enforcement hint: The product should not create standalone tickets unrelated to an incident.

---

### BR-017: Integrations must be purpose-grouped

MVP integrations must be presented by capability category: Monitoring, AI, Notification, Ticketing, or Actions.

Enforcement hint: The product should not present a large ungrouped integration gallery in the MVP.

---

### BR-018: MVP must hide long-tail integrations

Integrations outside MVP scope must not be exposed in the primary MVP experience.

Enforcement hint: Hidden integrations may exist internally but should not distract the user.

---

### BR-019: Playbooks must have operational purpose

A playbook exposed in the MVP must map to a personal-server operational problem.

Enforcement hint: Templates unrelated to server operation should not appear in the MVP.

---

### BR-020: Test signals must be clearly marked

Manual test signals must be clearly distinguishable from real operational signals.

Enforcement hint: Test signals should not be confused with production incidents.

---

### BR-021: Server health must not imply complete observability

A healthy server state means no known active issue, not proof that all workloads are functioning perfectly.

Enforcement hint: Product language should avoid overclaiming server health.

---

### BR-022: Unknown state is valid

When the product lacks recent reliable information about a server, the server should be considered unknown rather than healthy.

Enforcement hint: Absence of data should not be interpreted as health.

---

### BR-023: Archived servers must not receive new automatic actions

Archived servers must not be targets of automatic playbook actions.

Enforcement hint: Historical incidents may still reference archived servers.

---

### BR-024: Disabled integrations must not perform active work

A disabled integration must not receive new work for signal intake, diagnosis, notifications, tickets, or actions.

Enforcement hint: Existing historical records may still reference disabled integrations.

---

### BR-025: Workspace boundaries must be respected

Entities in one workspace must not be treated as owned by another workspace.

Enforcement hint: Server, signal, incident, and action ownership should stay within the workspace boundary.

---

### BR-026: MVP terminology must remain simple

User-facing product terminology must favor Servers, Signals, Incidents, Playbooks, Actions, Integrations, and AI Diagnosis.

Enforcement hint: Enterprise-heavy terms should be hidden unless intentionally reintroduced.

---

### BR-027: User remains in control of remediation

The product must keep the user in control of state-changing remediation in the MVP.

Enforcement hint: Suggested remediation should be separated from executed remediation.

---

### BR-028: Diagnosis can be updated with new evidence

A new diagnosis may supersede an older diagnosis when new evidence becomes available.

Enforcement hint: Current diagnosis should be identifiable.

---

### BR-029: Failed external operations must not erase incident context

If notification, ticket creation, AI diagnosis, or action execution fails, the incident and signal records must remain available.

Enforcement hint: External failure should be recorded as part of the timeline.

---

### BR-030: First-value path must remain short

The MVP business flow must prioritize quick setup and first incident diagnosis over advanced configuration.

Enforcement hint: Onboarding should guide users toward one server, one signal source, one AI provider, and one notification channel.

---

## 11. Business Invariants

### INV-001

Every server belongs to exactly one workspace.

### INV-002

Every signal belongs to exactly one workspace.

### INV-003

Every incident belongs to exactly one workspace.

### INV-004

Every timeline event belongs to exactly one incident.

### INV-005

Every ticket belongs to exactly one incident.

### INV-006

Every action run must reference one action.

### INV-007

Every server-targeted action run must reference one server.

### INV-008

An action without a risk level must not be considered available.

### INV-009

An approval-required action must not run before approval is granted.

### INV-010

A rejected action run must not execute.

### INV-011

An archived server must not be used as the target for new automatic action runs.

### INV-012

A diagnosis must be associated with an incident.

### INV-013

A diagnosis must contain either a generated explanation, an insufficient-evidence result, or a failure state.

### INV-014

A disabled integration must not be used for new active operations.

### INV-015

A test signal must be distinguishable from an operational signal.

### INV-016

A resolved incident must remain historically visible until archived.

### INV-017

A signal linked to an incident must remain traceable from that incident.

### INV-018

User-facing MVP navigation must not expose out-of-scope advanced platform concepts as primary entries.

---

## 12. Ownership and Permission Semantics

### Ownership Model

The MVP assumes a simple ownership model:

- A user owns a workspace.
- A workspace owns servers, signals, incidents, playbooks, integrations, actions, notifications, tickets, and timeline events.
- A user can operate entities inside their own workspace.

### User Permissions

In the MVP, the primary user can:

- Add servers.
- View server health.
- Configure MVP integrations.
- Receive signals.
- View and manage incidents.
- Request AI diagnosis.
- Send notifications.
- Create tickets.
- Run read-only diagnostic actions.
- Approve or reject approval-required actions.
- Resolve or reopen incidents.
- Archive servers and incidents.

### Action Permission Semantics

- Read-only actions may run if the user owns the target server and the action is available.
- Low-risk actions may require confirmation depending on product policy.
- Approval-required actions must receive explicit approval before execution.
- Unsafe actions must not execute automatically in the MVP.
- Archived servers must not receive new automatic action runs.

### Integration Ownership

- Integrations are owned by the workspace.
- Disabled integrations remain visible for historical references but cannot perform new active work.
- Removed integrations should no longer be available for new operations.

### Ticket and Notification Ownership

- Tickets and notifications belong to incidents through the workspace.
- External systems may have their own permissions, but the product domain treats the created ticket or notification as related to the incident.

### Future Permission Expansion

Future versions may introduce multiple users, roles, teams, project-level permissions, or shared workspaces. These are not part of the MVP domain.

---

## 13. Edge Cases

### EC-001: Signal arrives before server is added

A signal may arrive without a known server. The product should keep the signal visible and allow later association.

### EC-002: Server is disconnected

If the server cannot be reached or monitoring information is stale, its health should become unknown or disconnected rather than healthy.

### EC-003: AI provider unavailable

If AI diagnosis cannot be generated, the incident should remain visible and the diagnosis status should show failure.

### EC-004: Insufficient evidence

If the product lacks enough information for useful diagnosis, AI diagnosis should return insufficient evidence rather than fabricate a cause.

### EC-005: Notification fails

If a notification fails, the failure should be recorded and the incident should remain active.

### EC-006: Ticket creation fails

If ticket creation fails, the incident should remain active and the failure should be recorded.

### EC-007: SSH diagnostic action fails

If a diagnostic action cannot run, the action run should be marked failed and the incident should remain available.

### EC-008: New signals arrive after resolution

If new related signals arrive after an incident is resolved, the incident may be reopened or a new incident may be created based on product policy.

### EC-009: Duplicate signals

Duplicate or repeated signals should not necessarily create duplicate incidents. The product should preserve the signals while avoiding unnecessary incident clutter.

### EC-010: Manual test signal creates noise

A manual test signal should be marked as a test and should not be confused with a real production incident.

### EC-011: Server archived with active incident

If a server is archived while incidents remain active, the incidents should remain historically visible and should clearly show that the server is archived.

### EC-012: Integration disabled during playbook run

If an integration is disabled while a playbook run is active, new operations through that integration should not proceed, and the playbook run should reflect the interruption.

### EC-013: Action approval times out

If approval is required and no decision is made, the action should remain waiting, expire, or be cancelled according to product policy.

### EC-014: Conflicting diagnoses

If multiple diagnoses exist for the same incident, the product should make the current diagnosis clear and preserve older diagnoses as history.

### EC-015: Server health conflict

If one signal indicates critical status but another source reports healthy status, the product should avoid falsely declaring full health and should show the conflict through incident or signal context.

### EC-016: User removes integration with historical records

Historical notifications, tickets, signals, or action runs should remain understandable even if the related integration is removed.

---

## 14. Assumptions

### ASM-001

The MVP is primarily single-user or single-workspace.

### ASM-002

Most users operate one to five personal servers.

### ASM-003

Prometheus and generic webhooks are sufficient initial signal sources.

### ASM-004

Email is sufficient as the default notification channel.

### ASM-005

GitHub or Jira is sufficient for MVP external tracking.

### ASM-006

SSH-based read-only diagnostics are useful for personal-server operation.

### ASM-007

Users prefer safety and control over fully autonomous remediation.

### ASM-008

Signals can be normalized into product-level severity and status without requiring complex enterprise alert enrichment in the MVP.

### ASM-009

Advanced concepts such as topology, mapping, extraction, and maintenance windows can remain hidden in the MVP.

### ASM-010

The product can provide meaningful value even when log collection is limited or absent.

### ASM-011

Server health is a simplified business state and is not a complete guarantee of all workload health.

### ASM-012

A future commercial product may add broader integrations, but the MVP must remain focused on personal-server operation.

---

## 15. Open Questions

### OQ-001

Should a workspace be visible to the user in the MVP, or should it remain an internal ownership boundary?

### OQ-002

Should a signal be allowed to create an incident automatically when no server is identified?

### OQ-003

Should incidents be auto-created for all critical signals, or only for signals matching enabled playbooks?

### OQ-004

Should AI diagnosis run automatically for every incident, or only after user request?

### OQ-005

Should the product allow users to edit AI diagnosis notes manually?

### OQ-006

Which exact actions are considered low-risk versus approval-required in the MVP?

### OQ-007

Should custom user-defined actions be available in the MVP?

### OQ-008

How should the product decide whether a new signal reopens a resolved incident or creates a new incident?

### OQ-009

Should server services be manually defined by the user, automatically discovered, or omitted from the first MVP?

### OQ-010

Should the MVP store multiple diagnoses per incident, or only the latest diagnosis?

### OQ-011

Should notification preferences be global, per server, or per playbook in the MVP?

### OQ-012

Should ticket creation be automatic based on playbook configuration, or always manually initiated in the MVP?

### OQ-013

How long should signals, incidents, diagnoses, action runs, and timeline events remain available?

### OQ-014

Should archived servers be restorable?

### OQ-015

Should test signals be allowed to trigger notifications and tickets during onboarding?

### OQ-016

Should the product support more than one user in the MVP?
