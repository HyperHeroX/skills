# AI Agent 工程與安全開發規範 v4.4 整合契約

> 這份文件是 `devteam` 與 `autodev` 的路由層；規範原文、57 項需求、Policy、Profile、Schema、範本與 Validator 均保留在同目錄的 `ai-agent-development-standard-v4.4/` bundle。原文是唯一需求來源，本文件不得取代或改寫它。

## 版本與權威來源

- Standard version: `4.4.0`
- Baseline digest: `77478e2a918e6dc7984f79534abcd5415cdbb07bb2c7de2346aceb03e5484f4f`
- Immutable baseline: [requirements/USER_MANDATORY_REQUIREMENTS_BASELINE.md](ai-agent-development-standard-v4.4/requirements/USER_MANDATORY_REQUIREMENTS_BASELINE.md)
- Machine-readable catalog and routing policy: [requirements/MANDATORY_SYSTEM_REQUIREMENTS.md](ai-agent-development-standard-v4.4/requirements/MANDATORY_SYSTEM_REQUIREMENTS.md) and [policies/mandatory-requirements.yaml](ai-agent-development-standard-v4.4/policies/mandatory-requirements.yaml)
- Full standard: [AI_AGENT_ENGINEERING_SECURE_DEVELOPMENT_STANDARD_v4.4.md](ai-agent-development-standard-v4.4/AI_AGENT_ENGINEERING_SECURE_DEVELOPMENT_STANDARD_v4.4.md)
- Source bundle overview and validator: [README.md](ai-agent-development-standard-v4.4/README.md) and [tools/validate_bundle.py](ai-agent-development-standard-v4.4/tools/validate_bundle.py)

The copied bundle is kept byte-for-byte compatible with the supplied source so its `SHA256SUMS.txt` and `VALIDATION_REPORT.json` remain meaningful. Update the bundle from the source directory as a whole; put HyperHeroX-specific routing changes in this adapter or the workflow documents.

## Mandatory load order

Before any write, planning decision, code generation, test change, migration, deployment, or release decision, load the following in order:

1. `requirements/USER_MANDATORY_REQUIREMENTS_BASELINE.md`
2. `profiles/GENERAL_DEVELOPMENT_BEHAVIOR_PROFILE.md`
3. `profiles/GENERAL_IMPLEMENTATION_QUALITY_PROFILE.md`
4. The target project's `AGENTS.md` and protected policy files
5. `policies/mandatory-requirements.yaml` and the target project's requirement state
6. The selected lifecycle document (`lifecycle/Lx_*.md`), task contract, security invariants, requirements, ADR, and threat model
7. The domain Profile(s) selected by the Requirement IDs
8. For any UI/client/browser/page/component/form/router/state/theme/i18n/accessibility work, `profiles/FRONTEND_DEVELOPMENT_PROFILE.md`, plus the frontend review and testing standards
9. The relevant review, scan, test, and release-assurance rules

If the baseline digest, Requirement IDs, source conditions, or protected policy cannot be verified, stop the write path and mark the task `blocked`. A runtime feature switch changes runtime behavior only; it never removes a requirement or its test/documentation obligation.

## Requirement coverage map

All 57 entries are `MUST` and must remain traceable to the baseline, policy, implementation, tests, documentation, and evidence. The canonical full text and IDs are in the linked catalog; this map routes the work to its implementation Profile.

| Area | Requirement IDs | Load for design/review |
|---|---|---|
| Architecture | `ARCH-REQ-001`–`ARCH-REQ-009` | [ARCHITECTURE_SYSTEM_PROFILE.md](ai-agent-development-standard-v4.4/profiles/ARCHITECTURE_SYSTEM_PROFILE.md), [DESIGN_PATTERNS.md](ai-agent-development-standard-v4.4/reference/DESIGN_PATTERNS.md) |
| Security and identity | `SEC-REQ-001`–`SEC-REQ-009` | [SECURITY_IDENTITY_PROFILE.md](ai-agent-development-standard-v4.4/profiles/SECURITY_IDENTITY_PROFILE.md), [SECURITY_SCANNING_STANDARD.md](ai-agent-development-standard-v4.4/reference/SECURITY_SCANNING_STANDARD.md) |
| Data | `DATA-REQ-001`–`DATA-REQ-004` | [DATA_MANAGEMENT_PROFILE.md](ai-agent-development-standard-v4.4/profiles/DATA_MANAGEMENT_PROFILE.md), [GENERAL_IMPLEMENTATION_QUALITY_STANDARD.md](ai-agent-development-standard-v4.4/reference/GENERAL_IMPLEMENTATION_QUALITY_STANDARD.md) |
| Testing | `TEST-REQ-001`–`TEST-REQ-007` | [TEST_ENGINEERING_PROFILE.md](ai-agent-development-standard-v4.4/profiles/TEST_ENGINEERING_PROFILE.md), [FRONTEND_TESTING_STANDARD.md](ai-agent-development-standard-v4.4/reference/FRONTEND_TESTING_STANDARD.md) when UI applies |
| Management | `MGMT-REQ-001`–`MGMT-REQ-006` | [ADMIN_OPERATIONS_PROFILE.md](ai-agent-development-standard-v4.4/profiles/ADMIN_OPERATIONS_PROFILE.md) |
| Interface | `UI-REQ-001`–`UI-REQ-017` | [FRONTEND_DEVELOPMENT_PROFILE.md](ai-agent-development-standard-v4.4/profiles/FRONTEND_DEVELOPMENT_PROFILE.md), [FRONTEND_DEVELOPMENT_STANDARD.md](ai-agent-development-standard-v4.4/reference/FRONTEND_DEVELOPMENT_STANDARD.md) |
| AI | `AI-REQ-001`–`AI-REQ-004` | [AI_INTEGRATION_PROFILE.md](ai-agent-development-standard-v4.4/profiles/AI_INTEGRATION_PROFILE.md) |
| Collaboration/versioning | `DEV-REQ-001` | [COLLABORATION_VERSIONING_PROFILE.md](ai-agent-development-standard-v4.4/profiles/COLLABORATION_VERSIONING_PROFILE.md) |

## Required preflight and evidence

Every task/change must record an AI Preflight before implementation. Use the source format in [AGENTS.md](ai-agent-development-standard-v4.4/AGENTS.md) and include at least:

- Task ID, candidate revision, product lifecycle stage, SSDLC activity, and risk
- Baseline digest plus direct and indirect Requirement IDs
- Verbatim source requirements and source-explicit conditions
- Goal, non-goals, allowed paths, forbidden paths, and existing reusable components
- Data flow, trust boundaries, tenant scope, permission scope, secrets, events, jobs, and rollback/monitoring plan
- Pattern decision, test plan, independent review/scan/conformance plan, and stop conditions

The completion record must bind implementation, tests, docs, reviews, scans, requirement state, and release artifacts to the same candidate revision and baseline digest. Builder self-approval is not valid. Scanner errors, missing evidence, unresolved deviations, or unreviewed Requirement IDs are fail-closed blockers.

## Cross-cutting implementation gates

Use the following routing when planning and reviewing. The detailed normative wording remains in the linked Profiles and catalog.

### Architecture

- Model multi-tenancy by default with administrator-controlled enablement and software isolation unless hardware isolation is explicitly required; protect tenant data, cache, jobs, files, logs, and AI context, and audit administrator cross-tenant inspection.
- Evaluate the best design pattern during analysis for every new module, core use case, cross-module integration, and major refactor. Compare a simple design, record the decision in `docs/design-patterns.md` or an ADR, and test the chosen boundary, failure, concurrency, cancellation, and security behavior.
- Prefer DI/IoC, an Event Bus for publish/subscribe, explicit module contracts, versioned IPC, safe exception mapping, Worker Service for an independent companion/monitor lifecycle, and OpenAPI plus an administrator-operable API page.

### Security

- Apply the same authoritative RBAC and tenant permission model to UI actions, API, services, jobs, events, files, plugins, and schedulers; enforce it server-side.
- Default every account to least privilege and prevent self-escalation. First startup must establish the highest administrator credentials and then close the initialization path.
- Preserve user-selectable 2FA, Authenticator, PassKey, and Email Verify Code, with administrator-enforced inheritance when configured. Use Token as the primary authorization mechanism and OAuth as the second option with the required leading providers.
- Make CORS configurable in the system, maintain graded system/program logs, record cross-tenant inspection audits, protect privacy, and keep sensitive details out of user-facing errors and logs.

### Data

- Persist cache/checkpoint state needed to resume unfinished behavior after restart.
- Preserve the three-level key model: administrator key for tenant data, tenant key for customer data, and customer key for their own data. Generate keys at account creation, show each owner only once, wrap database-stored keys with the upper-level key, and source the system administrator key from environment configuration.
- Validate input and output through a chained validation pipeline. Provide administrator-controlled backup download policy, inherited role restrictions, scoped downloads, encryption/integrity/retention, restore tests, and audit evidence.

### Testing

- Plan and evidence unit, collection/integration, stress, benchmark, concurrency, white-box, gray-box, shallow-black-box, black-box, and automated E2E tests as applicable to the requirement and lifecycle stage.
- For browser tasks, verify interaction, data correctness, screenshots, visual layout/text/contrast, RWD, dark/light theme, accessibility, performance, and console errors with the repository's approved browser automation workflow. Do not label unavailable provider, browser, or deployment E2E as passed.

### Management

- Expose started/running/blocked/error/aborted/finished status for every function or method through the state management/SSE module and management page.
- Register every function with a controlled scheduler adapter and management page; provide plugin lifecycle controls for replaceable modules; provide resource, file, and permission management with RBAC and tenant scope.

### Interface

- Apply RWD and AA accessibility by default, pluggable themes and i18n, save buttons on critical setting cards, blur-save only where real-time save is specified, hover-only scrollbars where space requires them, lazy loading near the bottom of long lists, high contrast, live dashboard updates, visible version, configurable floating back-to-top, notification read/delete state, visible login/account actions, collapsible sidebar, user font sizing, and reusable components.

### AI

- Maintain a local provider/model catalog sourced from `https://llmgateway.io/models` and refresh it periodically.
- Record OpenAI-compatible support, concurrency/rate limits, cost, applicability (text/vision/embedding), and adjustable model parameters. If agents call tools, provide governed SKILLS, MCP, Plugin, and Connector capabilities and management pages; treat all model/tool output as untrusted input.

### Versioning

- Preserve the source version rule: each commit increments the rightmost version number; a PR entering `stage` increments the middle version number and resets the rightmost number. Record the exact version evidence in the change and release manifests.

## Binding to devteam

`devteam` must use this contract as a pre-step before its existing configuration-sync step and bind each 11-step output to requirements:

1. Requirement Gathering: register all 57 requirements, source conditions, Requirement IDs in scope, and acceptance evidence.
2. System Architecture: document tenant/trust boundaries, DI/IoC, Event Bus, IPC, Worker, OpenAPI, security boundaries, data keys, and pattern candidates.
3. System Analysis: create the pattern decision and simple-design comparison; map requirements to modules, events, permissions, errors, jobs, UI, and tests.
4. Project Planning: select lifecycle/SSDLC stage, risk, reviewers, scanners, test types, evidence owners, and rollback/monitoring.
5. Database Design: cover tenant scope, key wrapping, validation, cache persistence, backups, retention, audit, indexes, and restore evidence.
6. Task Breakdown: each task gets Requirement IDs, source conditions, allowed/forbidden paths, required gates, and one OpenSpec change lifecycle.
7. Backend: enforce server-side permission/tenant checks, validation, exception redaction, logging, Event Bus/SSE states, scheduler adapters, API/OpenAPI, and data controls.
8. Frontend: load the frontend Profile and implement all triggered UI/management requirements with reusable components, RWD, AA, theme/i18n, status, notifications, and visible account/version controls.
9. Testing: execute the full requirement-driven test matrix and independent browser evidence where UI applies.
10. Iteration: fail closed on any deviation, missing evidence, scanner error, or unresolved bug; re-run affected requirements after repair.
11. Deployment: bind build/test/review/scan/conformance/deployment evidence to the same revision and baseline; verify stage/runtime behavior before completion.

## Binding to AutoDEV

`autodev` must load this contract before its ten stages and carry the same Requirement IDs and digest through every stage:

- Planning: create the preflight, requirement matrix, lifecycle/risk decision, architecture/pattern/tenant/security/data plan, and task contracts.
- OpenSpec development: add Requirement IDs, source conditions, baseline digest, required gates, and evidence paths to every change; do not edit product code without an active change.
- Security and code review: use the security/data/architecture gates above and independent reviewers; reject requirement downgrades, self-approval, unsafe dynamic loading, missing server authorization, and untraceable changes.
- Testing: cover all applicable testing categories and fail closed when a required provider/browser/runtime check is unavailable.
- Container/deployment/UI/visual stages: verify runtime state, management pages, tenant/RBAC boundaries, API docs, SSE/scheduler/plugin/resource/file flows, RWD/AA/theme/i18n/notifications, screenshots, and console health as applicable.
- Optimization: preserve requirement behavior while improving performance, observability, cache durability, concurrency, and recovery; do not optimize by removing a mandatory capability.
- Final acceptance: require a passing independent Requirement Conformance Manifest, no unapproved deviation, complete evidence, same revision/digest across artifacts, and lifecycle-stage completion.

## State, manifests, and validation

The devteam state should retain these contract fields alongside step state:

```json
{
  "standard_version": "4.4.0",
  "baseline_digest": "77478e2a918e6dc7984f79534abcd5415cdbb07bb2c7de2346aceb03e5484f4f",
  "direct_requirement_ids": [],
  "indirect_requirement_ids": [],
  "candidate_revision": null,
  "requirement_conformance": "NOT_STARTED"
}
```

Use the source schemas and examples for task, change, review, scan, lifecycle, requirement-state, and conformance manifests. A task is complete only when all direct and indirect requirements are reviewed and evidenced for the current lifecycle stage.

To validate the copied source bundle from its directory, run:

```bash
python tools/validate_bundle.py .
```

The command validates the bundle itself; it does not prove a product has implemented the requirements. Product conformance still requires project-specific implementation, tests, independent review, scans, and runtime evidence.
