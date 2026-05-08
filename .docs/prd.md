# PRD: Lightweight AIOps Platform for Personal Servers

## 1. Purpose

This PRD defines the product scope for a lightweight AIOps platform designed for personal servers.

The product helps individual developers, indie hackers, small operators, and technical users monitor and operate one or more personal servers with minimal setup. The platform focuses on a simple operational loop:

**Connect a server → detect abnormal signals → create incidents → generate AI diagnosis → notify the user → suggest or execute safe actions → record the result.**

This document is the product source for implementation planning. It describes what the product should do, what is out of scope, and how success will be measured.

## 2. Source of Truth

This `prd.md` is the product source of truth for the lightweight personal-server AIOps product.

When product behavior, naming, scope, or priorities are unclear, this document takes precedence over inherited platform behavior.

Any product change that modifies MVP scope, target users, core workflows, or requirement decisions should be reflected in this document before implementation continues.

## 3. Codex Usage

Codex should use this PRD to understand the intended product, user experience, scope boundaries, and acceptance expectations.

Codex should treat requirements with IDs as explicit product decisions.

Codex should separate MVP requirements from future ideas. MVP requirements are the implementation priority. Future ideas should not be implemented unless explicitly requested later.

Codex should not infer enterprise features, large-scale multi-tenant platform behavior, or broad integration-marketplace behavior unless those features are explicitly listed as MVP requirements.

## 4. Non-Goals

The product is not intended to be a full enterprise AIOps platform in the MVP.

The product is not intended to replace mature observability suites.

The product is not intended to provide a marketplace of hundreds of integrations.

The product is not intended to support complex CMDB, ITSM, service topology, enterprise RBAC, compliance reporting, or multi-organization governance in the MVP.

The product is not intended to let AI freely operate production systems without safety controls.

The product is not intended to optimize for large enterprise data volumes in the MVP.

## 5. Product Background

Many personal servers run important small-scale workloads such as websites, APIs, databases, containers, automation scripts, bots, dashboards, and internal tools.

These servers often fail for simple reasons:

- Disk usage becomes too high.
- A process or container stops.
- A website or API becomes unavailable.
- Memory pressure causes instability.
- A database or cache service becomes unreachable.
- Logs grow unexpectedly.
- SSL certificates approach expiration.
- CPU usage spikes due to runaway processes.
- Scheduled jobs fail silently.

Traditional monitoring tools can detect many of these issues, but they often require manual setup, produce noisy alerts, and do not provide clear diagnosis or next-step guidance.

The product should provide a lightweight operational experience for personal servers by combining monitoring signals, incident grouping, AI-assisted diagnosis, notifications, and safe diagnostic actions.

The product should feel smaller, faster, and more focused than a general-purpose AIOps platform.

## 6. Target Users

### Primary Users

- Individual developers running one or more personal servers.
- Indie hackers running small production services.
- Technical founders operating early-stage products.
- Homelab users who want practical monitoring and diagnosis.
- Freelancers or small operators maintaining client servers.

### Secondary Users

- Small teams managing a few servers.
- DevOps learners who want a simple AIOps experience.
- Operators who already use Prometheus or webhook-based alerts and want AI-assisted diagnosis.

### User Characteristics

Target users are technical enough to deploy software and connect a server, but they do not want to configure a complex enterprise monitoring platform.

Target users value fast setup, clear diagnosis, low operational overhead, and safe remediation more than broad integration coverage.

## 7. User Problems

### Problem 1: Personal servers fail quietly

Users often discover failures only after a website, service, or automation stops working.

### Problem 2: Existing monitoring is too fragmented

Metrics, logs, alerts, uptime checks, and manual scripts often live in separate tools.

### Problem 3: Alerts do not explain what to do next

A CPU, disk, or service alert may indicate a symptom but not the likely cause or recommended action.

### Problem 4: Existing AIOps platforms are too heavy

Many AIOps products are designed for teams, enterprises, or large observability ecosystems, making them excessive for personal servers.

### Problem 5: Automation can be unsafe

Users want help diagnosing and resolving issues, but they do not want AI to run dangerous commands without review.

### Problem 6: Setup complexity blocks adoption

Users need a product that can become useful quickly, ideally after connecting one server and one notification channel.

## 8. Product Goals

### Goal 1: Make personal-server operations simple

The product should provide a clear experience centered on servers, incidents, diagnosis, and safe actions.

### Goal 2: Reduce time from signal to understanding

When an abnormal signal is received, the product should help the user understand what happened, what evidence exists, and what to do next.

### Goal 3: Provide a minimal closed loop

The MVP should support receiving signals, creating incidents, generating AI diagnosis, notifying the user, and running safe diagnostic actions.

### Goal 4: Reduce product surface area

The MVP should expose only the features required for personal-server operation.

### Goal 5: Prioritize safety

The product should clearly distinguish read-only diagnostics, low-risk actions, and actions requiring approval.

### Goal 6: Support lightweight extensibility

The product should support a small number of essential integrations without becoming an integration marketplace.

## 9. MVP Scope

The MVP is a lightweight AIOps product for monitoring and diagnosing personal servers.

### MVP Includes

- A simplified navigation structure.
- Server-centric product experience.
- Server list and server detail surfaces.
- Signal intake from Prometheus and generic webhooks.
- Incident creation from incoming signals.
- AI diagnosis for incidents.
- Notification through email and optionally one chat channel.
- Ticket or issue creation through GitHub or Jira.
- SSH-based read-only diagnostics.
- Safe action framework with risk labeling.
- Playbook-based operational flows for common personal-server problems.
- Integration settings limited to MVP integrations.
- Clear empty states and onboarding prompts.

### MVP Excludes

- Enterprise multi-tenancy.
- Complex service topology.
- CMDB.
- Large integration marketplace.
- Advanced dashboard builder.
- Advanced maintenance window management.
- Complex alert enrichment rules.
- Advanced role-based access control.
- Cloud-provider-specific monitoring.
- Automatic risky remediation without approval.

## 10. Out of Scope

The following are explicitly out of scope for the MVP:

- Enterprise SSO.
- Enterprise audit reporting.
- Multi-organization tenant management.
- Complex permission models.
- ServiceNow or enterprise ITSM workflows.
- Large-scale event streaming architecture.
- Full log storage platform.
- Full metrics storage platform.
- Full replacement for Prometheus, Grafana, Loki, Datadog, or similar systems.
- Automatic root-cause certainty claims.
- Fully autonomous production remediation.
- Complex topology visualization.
- Marketplace-style provider gallery.
- Support for hundreds of observability tools.
- Billing, subscription, or license management.
- Mobile app.
- Native desktop app.

## 11. Requirements

### MVP Product Requirements

#### REQ-001: Product Positioning

The product shall be positioned as a lightweight AIOps platform for personal servers.

#### REQ-002: Server-First Experience

The product shall present servers as first-class operational objects.

#### REQ-003: Simplified Navigation

The MVP navigation shall include only the following primary product areas:

- Overview
- Servers
- Incidents
- Signals
- Playbooks
- Actions
- Integrations
- Settings

#### REQ-004: Hidden Advanced Features

The MVP shall hide advanced platform features that are not required for personal-server operation, including topology, mapping, extraction, complex dashboards, and maintenance-window management.

#### REQ-005: Overview Page

The product shall provide an Overview page that summarizes monitored servers, active incidents, recent signals, AI diagnoses, and recent actions.

#### REQ-006: Servers Page

The product shall provide a Servers page where users can view connected personal servers.

#### REQ-007: Server Empty State

If no server is connected, the Servers page shall show a clear empty state with a call to add the first server.

#### REQ-008: Add Server Entry Point

The product shall provide an Add Server entry point from the Overview page and the Servers page.

#### REQ-009: Add Server Wizard

The MVP shall provide an Add Server wizard that guides the user through server information, monitoring setup, diagnosis access, and completion.

#### REQ-010: Server Information Capture

The Add Server flow shall capture server name, host or IP, environment, and optional description.

#### REQ-011: Personal-Server Environment Labels

The product shall support simple environment labels such as production, staging, development, and homelab.

#### REQ-012: Signals Naming

The product shall use the term Signals for incoming alerts, webhook events, and abnormal observations.

#### REQ-013: Signal Intake

The MVP shall support receiving signals from Prometheus and generic webhooks.

#### REQ-014: Signal List

The Signals page shall display received signals with source, severity, status, affected server or service when available, and timestamp.

#### REQ-015: Incident Creation

The product shall create or allow creation of incidents from relevant signals.

#### REQ-016: Incident Summary

Each incident shall show what happened, affected server or service, severity, status, related signals, AI diagnosis status, and recommended next action.

#### REQ-017: AI Diagnosis

The product shall generate an AI diagnosis for incidents.

#### REQ-018: AI Diagnosis Structure

AI diagnosis output shall use a structured format with probable cause, evidence, impact, recommended actions, verification steps, and risk notes.

#### REQ-019: Evidence-Based Diagnosis

AI diagnosis shall distinguish evidence from inference.

#### REQ-020: Diagnosis Uncertainty

AI diagnosis shall clearly state uncertainty when the available evidence is insufficient.

#### REQ-021: AI Provider Configuration

The MVP shall allow the user to configure at least one AI provider.

#### REQ-022: Local AI Option

The MVP should support a local or self-hosted AI option when available.

#### REQ-023: Email Notification

The MVP shall support email notification for incidents or playbook results.

#### REQ-024: Issue or Ticket Creation

The MVP shall support creating a GitHub issue or Jira ticket from an incident.

#### REQ-025: SSH Diagnostics

The MVP shall support SSH-based diagnostic actions for connected servers.

#### REQ-026: Read-Only Diagnostic Actions

The MVP shall include read-only diagnostic actions such as checking uptime, disk usage, memory usage, top processes, service status, container status, and recent logs.

#### REQ-027: Action Risk Levels

Each action shall have a risk level.

#### REQ-028: Default Safe Action Policy

The MVP shall allow read-only actions by default and require explicit approval for actions that change server state.

#### REQ-029: No Autonomous Dangerous Actions

The product shall not execute dangerous actions automatically in the MVP.

#### REQ-030: Playbooks Naming

The product shall use the term Playbooks for guided operational flows.

#### REQ-031: MVP Playbook Templates

The MVP shall include playbook templates for high CPU, disk usage high, service down, and website or API unavailable.

#### REQ-032: Playbook Flow

A playbook shall define a trigger, diagnostic steps, AI diagnosis, notification step, and optional safe action step.

#### REQ-033: Integrations Naming

The product shall use the term Integrations for external connections.

#### REQ-034: MVP Integrations

The MVP shall expose only the following integration categories:

- Monitoring
- AI
- Notification
- Ticketing
- Actions

#### REQ-035: MVP Integration List

The MVP shall prioritize integrations for Prometheus, webhook, AI provider, email, GitHub, Jira, and SSH.

#### REQ-036: Integration Grouping

The Integrations page shall group integrations by the operational role they serve.

#### REQ-037: Empty States

All core pages shall provide useful empty states with clear next actions.

#### REQ-038: Personal-Server Language

The UI shall use language that is understandable to personal-server operators and avoid enterprise-heavy terminology in the MVP.

#### REQ-039: Minimal Onboarding

A new user shall be guided toward connecting a server, connecting a signal source, configuring AI diagnosis, and setting up notifications.

#### REQ-040: Closed-Loop Experience

The MVP shall support a complete loop from incoming signal to incident, AI diagnosis, notification, optional ticket, and safe diagnostic action.

#### REQ-041: Incident Timeline

Each incident shall include a timeline of received signals, diagnosis generation, notifications, ticket creation, and actions.

#### REQ-042: Action History

The product shall record the result of executed actions.

#### REQ-043: Manual Test Signal

The product shall provide a way to send or simulate a test signal for onboarding and validation.

#### REQ-044: Server Health Summary

The product shall summarize server health using simple states such as healthy, warning, critical, and unknown.

#### REQ-045: Reduced Provider Surface

The MVP shall not display long-tail providers that are not part of the MVP integration list.

#### REQ-046: Reduced Template Surface

The MVP shall not display playbook templates unrelated to personal-server operation.

#### REQ-047: Clear Safety Messaging

The product shall clearly communicate when an action is read-only, low-risk, requires approval, or is unsafe for automatic execution.

#### REQ-048: Human-Controlled Remediation

The product shall keep the user in control of remediation actions that alter server state.

#### REQ-049: Personal Server First Demo

The MVP shall support a demo scenario where a personal server disk alert becomes an incident, receives AI diagnosis, sends a notification, and runs a read-only SSH diagnostic action.

#### REQ-050: Fast First Value

The product shall be designed so a technically capable user can understand the core value without learning enterprise AIOps concepts.

### Future Ideas

#### FUT-001: Advanced Service Topology

A future version may add service topology to show relationships between personal-server services, containers, and databases.

#### FUT-002: Advanced Mapping and Enrichment

A future version may add alert enrichment rules for service ownership, runbooks, tags, and custom metadata.

#### FUT-003: Maintenance Windows

A future version may add maintenance windows for planned server upgrades or migrations.

#### FUT-004: Additional Notification Channels

A future version may support Slack, Microsoft Teams, Telegram, Discord, or mobile push notifications.

#### FUT-005: Cloud Monitoring Integrations

A future version may add AWS, Azure, or GCP monitoring integrations.

#### FUT-006: Container-Native Onboarding

A future version may add deeper Docker and Kubernetes onboarding flows.

#### FUT-007: Log Context Collection

A future version may add richer log collection and log-based diagnosis.

#### FUT-008: Scheduled Health Reports

A future version may send daily or weekly server health summaries.

#### FUT-009: Safe Auto-Remediation Policies

A future version may allow users to define controlled auto-remediation policies for low-risk actions.

#### FUT-010: Multi-Server Grouping

A future version may group servers by project, environment, or customer.

## 12. User Stories

### US-001: Add first personal server

As an individual server owner, I want to add my first server so that I can monitor its health and receive useful diagnosis when something goes wrong.

### US-002: See server status

As a user, I want to see whether my server is healthy, warning, critical, or unknown so that I can quickly understand its current state.

### US-003: Receive abnormal signal

As a user, I want the platform to receive alerts or webhook events from my monitoring setup so that failures do not go unnoticed.

### US-004: Understand an incident

As a user, I want an incident page to explain what happened and what server or service is affected so that I can respond quickly.

### US-005: Get AI diagnosis

As a user, I want AI to summarize the likely cause, supporting evidence, impact, and next steps so that I do not need to manually inspect every metric and log first.

### US-006: Know when AI is uncertain

As a user, I want AI to say when evidence is insufficient so that I do not trust unsupported conclusions.

### US-007: Receive notification

As a user, I want to receive a notification when an incident occurs so that I can respond without constantly watching the dashboard.

### US-008: Create issue or ticket

As a user, I want to create a GitHub issue or Jira ticket from an incident so that I can track the problem and resolution.

### US-009: Run read-only diagnostics

As a user, I want to run safe read-only diagnostics over SSH so that I can inspect server state without risking damage.

### US-010: Review action result

As a user, I want to see the result of a diagnostic action so that I know what evidence was collected.

### US-011: Use a playbook

As a user, I want to use a playbook for common problems such as high CPU or disk usage so that I do not need to design every response flow from scratch.

### US-012: Test the setup

As a user, I want to send a test signal so that I can verify the platform is connected correctly.

### US-013: Avoid unsafe automation

As a user, I want the platform to require approval for state-changing actions so that AI does not accidentally damage my server.

### US-014: Start from simple integrations

As a user, I want to see only the integrations relevant to my personal-server operation so that setup is not overwhelming.

## 13. Core Workflows

### Workflow 1: First Server Onboarding

1. User opens the product.
2. User lands on Overview.
3. User clicks Add Server.
4. User enters server name, host or IP, environment, and optional description.
5. User chooses a monitoring setup path.
6. User configures or confirms signal intake.
7. User optionally configures SSH diagnosis access.
8. User completes the onboarding flow.
9. Product shows the server in the Servers page.
10. Product prompts the user to send a test signal.

### Workflow 2: Signal to Incident

1. A signal arrives from Prometheus or webhook.
2. Product records the signal.
3. Product displays the signal in the Signals page.
4. Product creates or associates the signal with an incident.
5. Product displays the incident in the Incidents page.
6. Product updates the Overview summary.

### Workflow 3: Incident Diagnosis

1. User opens an incident.
2. Product shows related signals and affected server information.
3. User requests AI diagnosis or diagnosis runs automatically based on playbook settings.
4. Product generates structured AI diagnosis.
5. Product displays probable cause, evidence, impact, recommended actions, verification steps, and risk notes.
6. Product marks uncertainty if evidence is insufficient.

### Workflow 4: Notification and Ticket

1. Incident is created or updated.
2. Playbook determines whether notification should be sent.
3. Product sends email notification.
4. User optionally creates a GitHub issue or Jira ticket.
5. Product records notification and ticket activity in the incident timeline.

### Workflow 5: Safe SSH Diagnosis

1. User opens incident.
2. Product suggests one or more read-only diagnostic actions.
3. User selects a diagnostic action.
4. Product shows the action risk level.
5. User runs the action.
6. Product records output and status.
7. Product attaches action result to the incident timeline.
8. AI diagnosis may use the collected evidence for an updated diagnosis.

### Workflow 6: Disk Usage Example

1. Server disk usage becomes high.
2. Prometheus or webhook sends a disk signal.
3. Product creates an incident.
4. Product runs or suggests read-only diagnostics for disk usage.
5. AI diagnosis identifies likely disk pressure and evidence.
6. Product recommends cleanup or log rotation steps.
7. Product sends notification.
8. User reviews recommended action and decides whether to act.

## 14. Business Constraints

### BC-001: Lightweight Scope

The MVP must remain focused on personal-server operation and must not expand into general enterprise AIOps during the first release.

### BC-002: Minimal Integration Surface

The MVP must avoid a large integration gallery.

### BC-003: Safety Over Automation

The product must prioritize safe diagnosis and human-controlled remediation over fully autonomous action.

### BC-004: Low Setup Friction

The product must minimize the number of concepts a user needs to understand before receiving value.

### BC-005: Personal and Small-Scale Use

The MVP should assume small numbers of servers and moderate signal volume.

### BC-006: International Customer Orientation

The product should use internationally understandable product language and should not assume country-specific enterprise integrations.

### BC-007: Commercial Readiness

The product should be designed so that a future commercial version can add paid features without changing the core personal-server workflow.

### BC-008: Upstream Complexity Reduction

If the product is derived from a broader AIOps platform, the MVP must reduce exposed complexity rather than expose all inherited capabilities.

## 15. Success Criteria

### SC-001: Clear Product Focus

A new user can identify within one minute that the product is for lightweight personal-server operations.

### SC-002: Minimal Navigation

The MVP has no more than eight primary navigation entries.

### SC-003: First Value Path

A technically capable user can understand the first-value path: add server, receive signal, create incident, generate diagnosis, notify, and run safe diagnostic action.

### SC-004: Closed Loop Demo

The MVP can demonstrate a disk usage incident from signal intake to AI diagnosis, notification, and read-only SSH diagnostic output.

### SC-005: Reduced Integration Clutter

The Integrations page shows only MVP integrations and does not display unrelated long-tail providers.

### SC-006: Reduced Template Clutter

The Playbooks page shows only personal-server-oriented templates.

### SC-007: Useful AI Output

AI diagnosis produces structured output with probable cause, evidence, impact, recommended actions, verification steps, and uncertainty when appropriate.

### SC-008: Safety Clarity

Users can clearly distinguish read-only, low-risk, approval-required, and unsafe actions.

### SC-009: Empty State Quality

Core pages provide useful empty states with clear next actions.

### SC-010: Product Terminology Consistency

The UI consistently uses Servers, Signals, Incidents, Playbooks, Actions, Integrations, and AI Diagnosis.

## 16. Assumptions

### ASM-001

The initial user is technically capable of deploying a monitoring tool or connecting an existing monitoring signal source.

### ASM-002

Most MVP users operate one to five personal servers.

### ASM-003

Prometheus and generic webhooks are sufficient initial signal sources for the MVP.

### ASM-004

Email is sufficient as the default notification channel for the MVP.

### ASM-005

GitHub or Jira is sufficient for MVP issue or ticket tracking.

### ASM-006

SSH read-only diagnostics are valuable for personal-server operation.

### ASM-007

Users prefer human approval for state-changing actions.

### ASM-008

The product can initially hide advanced inherited features rather than physically remove all underlying code.

### ASM-009

The MVP does not need enterprise-grade multi-user permission management.

### ASM-010

Users value diagnosis quality and clarity more than broad integration coverage in the first release.

## 17. Open Questions

### OQ-001

Should the MVP require a server object before signals can be received, or should signals be accepted first and mapped to servers later?

### OQ-002

Should AI diagnosis run automatically for every incident, or only when the user requests it?

### OQ-003

Which AI providers should be enabled by default in the first commercial build?

### OQ-004

Should Slack or Microsoft Teams be included in MVP notifications, or deferred to a later release?

### OQ-005

Should the MVP include a built-in lightweight uptime check, or rely entirely on external signal sources?

### OQ-006

Should SSH access be configured per server during onboarding, or only when the user first runs a diagnostic action?

### OQ-007

What state-changing actions, if any, should be allowed in the MVP with explicit approval?

### OQ-008

Should personal-server actions support custom user-defined commands in the MVP, or only predefined safe actions?

### OQ-009

Should the product support multiple users in the MVP, or assume a single operator?

### OQ-010

How long should signals, incidents, diagnosis results, and action histories be retained in the MVP?

### OQ-011

Should the product include basic server health charts in the MVP, or defer charts to a future version?

### OQ-012

What is the minimum onboarding flow required before the product is considered ready for first users?
