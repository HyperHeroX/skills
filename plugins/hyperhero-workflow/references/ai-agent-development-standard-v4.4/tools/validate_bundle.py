#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml
from jsonschema import Draft202012Validator

VERSION = "4.4.0"
ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
errors: list[str] = []
warnings: list[str] = []
checks: dict[str, Any] = {}


def fail(message: str) -> None:
    errors.append(message)


def warn(message: str) -> None:
    warnings.append(message)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_text(relative: str) -> str:
    path = ROOT / relative
    if not path.is_file():
        fail(f"missing file while reading: {relative}")
        return ""
    return path.read_text(encoding="utf-8")


def extract_sequential_controls(relative: str, prefix: str, expected_count: int) -> list[str]:
    text = read_text(relative)
    ids = re.findall(rf"^- \*\*({re.escape(prefix)}-\d{{3}})\*\*：", text, flags=re.MULTILINE)
    expected = [f"{prefix}-{index:03d}" for index in range(1, expected_count + 1)]
    if ids != expected:
        fail(
            f"{relative}: {prefix} controls are missing, duplicated, or out of order; "
            f"expected {expected_count}, found {len(ids)}"
        )
    return ids


def extract_control_map(text: str, prefix: str) -> dict[str, str]:
    controls: dict[str, str] = {}
    for match in re.finditer(
        rf"^- \*\*({re.escape(prefix)}-\d{{3}})\*\*：(.+)$",
        text,
        flags=re.MULTILINE,
    ):
        control_id = match.group(1)
        body = match.group(2).strip()
        if control_id in controls:
            fail(f"duplicate control in document: {control_id}")
        controls[control_id] = body
    return controls


required_files = [
    "README.md",
    "CHANGELOG.md",
    "CORRECTION_REPORT.md",
    "BUILD_SUMMARY.json",
    "AGENTS.md",
    "SECURITY.md",
    "AI_AGENT_ENGINEERING_SECURE_DEVELOPMENT_STANDARD_v4.4.md",
    "ai-agent-policy.yaml",
    "MIGRATION_GUIDE_v4.3_to_v4.4.md",
    "ADOPTION_CHECKLIST.md",
    "requirements/USER_MANDATORY_REQUIREMENTS_BASELINE.md",
    "requirements/MANDATORY_SYSTEM_REQUIREMENTS.md",
    "requirements/REQUIREMENT_TRACEABILITY_MATRIX.md",
    "requirements/REQUIREMENT_CHANGE_CONTROL.md",
    "policies/mandatory-requirements.yaml",
    "policies/lifecycle-profiles.yaml",
    "policies/development-behavior-profiles.yaml",
    "policies/review-routing.yaml",
    "policies/scan-policy.yaml",
    "policies/ssdlc-gates.yaml",
    "reference/REQUIREMENT_CONFORMANCE_STANDARD.md",
    "reference/DESIGN_PATTERNS.md",
    "reference/SSDLC_LIFECYCLE.md",
    "reference/CODE_REVIEW_STANDARD.md",
    "reference/SECURITY_SCANNING_STANDARD.md",
    "reference/GENERAL_DEVELOPMENT_BEHAVIOR_STANDARD.md",
    "reference/GENERAL_IMPLEMENTATION_QUALITY_STANDARD.md",
    "reference/FRONTEND_DEVELOPMENT_STANDARD.md",
    "reference/FRONTEND_CODE_REVIEW_STANDARD.md",
    "reference/FRONTEND_TESTING_STANDARD.md",
    "profiles/GENERAL_DEVELOPMENT_BEHAVIOR_PROFILE.md",
    "profiles/GENERAL_IMPLEMENTATION_QUALITY_PROFILE.md",
    "profiles/FRONTEND_DEVELOPMENT_PROFILE.md",
    "profiles/ARCHITECTURE_SYSTEM_PROFILE.md",
    "profiles/SECURITY_IDENTITY_PROFILE.md",
    "profiles/DATA_MANAGEMENT_PROFILE.md",
    "profiles/TEST_ENGINEERING_PROFILE.md",
    "profiles/ADMIN_OPERATIONS_PROFILE.md",
    "profiles/AI_INTEGRATION_PROFILE.md",
    "profiles/COLLABORATION_VERSIONING_PROFILE.md",
    "schemas/SYSTEM_REQUIREMENT_STATE.schema.json",
    "schemas/REQUIREMENT_CONFORMANCE_MANIFEST.schema.json",
    "schemas/AI_TASK_CONTRACT.schema.json",
    "schemas/AI_CHANGE_MANIFEST.schema.json",
    "schemas/AI_REVIEW_MANIFEST.schema.json",
    "schemas/AI_SCAN_MANIFEST.schema.json",
    "schemas/PROJECT_LIFECYCLE_STATE.schema.json",
    "examples/SYSTEM_REQUIREMENT_STATE.example.yaml",
    "examples/REQUIREMENT_CONFORMANCE_MANIFEST.example.json",
    "tools/validate_bundle.py",
]
missing = [relative for relative in required_files if not (ROOT / relative).is_file()]
if missing:
    fail(f"missing required files: {missing}")
checks["required_files"] = {"expected": len(required_files), "missing": missing}

forbidden_legacy_paths = [
    "profiles/LINUX_APPLICATION_PROFILE.md",
    "profiles/DOTNET_CSHARP_PROFILE.md",
    "profiles/FRONTEND_WEB_PROFILE.md",
    "profiles/TYPESCRIPT_VUE_NUXT_PROFILE.md",
    "policies/platform-profiles.yaml",
]
legacy_present = [relative for relative in forbidden_legacy_paths if (ROOT / relative).exists()]
if legacy_present:
    fail(f"legacy technology-bound core profiles still present: {legacy_present}")
checks["legacy_technology_profiles_removed"] = not legacy_present

# Parse every YAML and JSON artifact.
yaml_files = sorted(list(ROOT.rglob("*.yaml")) + list(ROOT.rglob("*.yml")))
json_files = sorted(ROOT.rglob("*.json"))
markdown_files = sorted(ROOT.rglob("*.md"))
parsed_yaml: dict[str, Any] = {}
parsed_json: dict[str, Any] = {}

for path in yaml_files:
    relative = path.relative_to(ROOT).as_posix()
    try:
        parsed_yaml[relative] = yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception as exc:
        fail(f"YAML parse failed: {relative}: {exc}")

for path in json_files:
    relative = path.relative_to(ROOT).as_posix()
    try:
        parsed_json[relative] = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        fail(f"JSON parse failed: {relative}: {exc}")

for relative, document in parsed_json.items():
    if relative.startswith("schemas/"):
        try:
            Draft202012Validator.check_schema(document)
        except Exception as exc:
            fail(f"invalid Draft 2020-12 schema: {relative}: {exc}")

# Validate immutable mandatory requirements.
policy = parsed_yaml.get("policies/mandatory-requirements.yaml")
if not isinstance(policy, dict):
    fail("mandatory requirement policy is missing or not an object")
    requirements: list[dict[str, Any]] = []
else:
    requirements = policy.get("spec", {}).get("requirements", [])
    if not isinstance(requirements, list):
        fail("mandatory requirement policy requirements must be an array")
        requirements = []

requirement_ids = [item.get("id") for item in requirements if isinstance(item, dict)]
expected_counts = {
    "ARCH": 9,
    "SEC": 9,
    "DATA": 4,
    "TEST": 7,
    "MGMT": 6,
    "UI": 17,
    "AI": 4,
    "DEV": 1,
}
expected_ids: list[str] = []
for prefix, count in expected_counts.items():
    expected_ids.extend(f"{prefix}-REQ-{index:03d}" for index in range(1, count + 1))

if len(requirements) != 57:
    fail(f"expected exactly 57 mandatory requirements, found {len(requirements)}")
if requirement_ids != expected_ids:
    fail("requirement IDs are missing, duplicated, out of order, or not sequential")
actual_counts = Counter(str(requirement_id).split("-")[0] for requirement_id in requirement_ids)
if dict(actual_counts) != expected_counts:
    fail(f"requirement category counts mismatch: expected {expected_counts}, found {dict(actual_counts)}")

baseline_path = ROOT / "requirements/USER_MANDATORY_REQUIREMENTS_BASELINE.md"
baseline_text = baseline_path.read_text(encoding="utf-8") if baseline_path.is_file() else ""
baseline_digest = sha256(baseline_path) if baseline_path.is_file() else ""
if isinstance(policy, dict) and policy.get("metadata", {}).get("baselineDigest") != baseline_digest:
    fail("mandatory requirement policy baselineDigest mismatch")
agent_policy = parsed_yaml.get("ai-agent-policy.yaml")
if isinstance(agent_policy, dict):
    if agent_policy.get("metadata", {}).get("version") != VERSION:
        fail("AI agent policy version mismatch")
    if agent_policy.get("metadata", {}).get("baselineDigest") != baseline_digest:
        fail("AI agent policy baselineDigest mismatch")

stages = [
    "L0-MVP",
    "L1-FORMAL-PROJECT",
    "L2-INTERNAL-TEST",
    "L3-PILOT",
    "L4-GENERAL-AVAILABILITY",
    "L5-MAINTENANCE",
    "L6-RETIREMENT",
]

for item in requirements:
    requirement_id = item.get("id")
    if item.get("strength") != "MUST":
        fail(f"{requirement_id}: strength must remain MUST")
    source_text = item.get("sourceText")
    if not isinstance(source_text, str) or not source_text.strip():
        fail(f"{requirement_id}: sourceText missing")
    elif source_text not in baseline_text:
        fail(f"{requirement_id}: sourceText is not verbatim in immutable baseline")
    profiles = item.get("profiles")
    if not isinstance(profiles, list) or not profiles:
        fail(f"{requirement_id}: at least one implementation profile is required")
    else:
        for profile in profiles:
            if not (ROOT / profile).is_file():
                fail(f"{requirement_id}: referenced profile does not exist: {profile}")
            if profile in forbidden_legacy_paths:
                fail(f"{requirement_id}: references forbidden legacy technology profile: {profile}")
    if not item.get("requiredReviewers"):
        fail(f"{requirement_id}: requiredReviewers missing")
    if not item.get("minimumEvidence"):
        fail(f"{requirement_id}: minimumEvidence missing")
    lifecycle_targets = item.get("lifecycleTargets")
    if not isinstance(lifecycle_targets, dict) or set(lifecycle_targets) != set(stages):
        fail(f"{requirement_id}: lifecycleTargets must cover exactly L0-L6")

catalog_text = read_text("requirements/MANDATORY_SYSTEM_REQUIREMENTS.md")
matrix_text = read_text("requirements/REQUIREMENT_TRACEABILITY_MATRIX.md")
for requirement_id in expected_ids:
    catalog_count = len(re.findall(rf"^###\s+{re.escape(requirement_id)}\b", catalog_text, flags=re.MULTILINE))
    matrix_count = len(re.findall(rf"^\|\s*`{re.escape(requirement_id)}`\s*\|", matrix_text, flags=re.MULTILINE))
    if catalog_count != 1:
        fail(f"{requirement_id}: expected one catalog entry, found {catalog_count}")
    if matrix_count != 1:
        fail(f"{requirement_id}: expected one traceability row, found {matrix_count}")

# Validate lifecycle.
lifecycle_policy = parsed_yaml.get("policies/lifecycle-profiles.yaml")
found_stages = set()
if isinstance(lifecycle_policy, dict):
    found_stages = set(lifecycle_policy.get("spec", {}).get("stages", {}).keys())
if found_stages != set(stages):
    fail(f"lifecycle stage set mismatch: {sorted(found_stages)}")
for stage, filename in {
    "L0-MVP": "L0_MVP.md",
    "L1-FORMAL-PROJECT": "L1_FORMAL_PROJECT.md",
    "L2-INTERNAL-TEST": "L2_INTERNAL_TEST.md",
    "L3-PILOT": "L3_PILOT.md",
    "L4-GENERAL-AVAILABILITY": "L4_GENERAL_AVAILABILITY.md",
    "L5-MAINTENANCE": "L5_MAINTENANCE.md",
    "L6-RETIREMENT": "L6_RETIREMENT.md",
}.items():
    stage_path = ROOT / "lifecycle" / filename
    if not stage_path.is_file():
        fail(f"missing lifecycle profile: lifecycle/{filename}")
    elif "不取消任何產品負責人必備需求" not in stage_path.read_text(encoding="utf-8"):
        fail(f"{stage}: lifecycle profile does not state the non-cancellation rule")

# Validate state example and templates.
state = parsed_yaml.get("examples/SYSTEM_REQUIREMENT_STATE.example.yaml")
if not isinstance(state, dict):
    fail("SYSTEM_REQUIREMENT_STATE example missing or invalid")
else:
    metadata = state.get("metadata", {})
    if metadata.get("baseline_digest") != baseline_digest:
        fail("SYSTEM_REQUIREMENT_STATE example baseline digest mismatch")
    state_items = state.get("spec", {}).get("requirements", [])
    state_ids = [item.get("id") for item in state_items if isinstance(item, dict)]
    if state_ids != expected_ids:
        fail("SYSTEM_REQUIREMENT_STATE example must cover all 57 IDs in canonical order")
    forbidden_states = {"deferred", "disabled", "not-applicable", "optional", "capability-ready"}
    allowed_maturity = {
        "registered",
        "specified",
        "designed",
        "implemented",
        "verified",
        "operational",
        "maintained",
        "retired",
        "blocked",
        "condition-not-triggered",
    }
    for item in state_items:
        maturity = item.get("status")
        if maturity in forbidden_states:
            fail(f"{item.get('id')}: forbidden requirement maturity used: {maturity}")
        if maturity not in allowed_maturity:
            fail(f"{item.get('id')}: unknown requirement maturity: {maturity}")
        if maturity == "condition-not-triggered" and not item.get("condition_evidence"):
            fail(f"{item.get('id')}: condition-not-triggered requires condition_evidence")

template = parsed_yaml.get("templates/SYSTEM_REQUIREMENT_STATE.yaml")
if not isinstance(template, dict):
    fail("SYSTEM_REQUIREMENT_STATE template missing or invalid")
else:
    template_ids = [
        item.get("id")
        for item in template.get("spec", {}).get("requirements", [])
        if isinstance(item, dict)
    ]
    if template_ids != expected_ids:
        fail("SYSTEM_REQUIREMENT_STATE template must contain all 57 IDs in canonical order")

# Validate examples against schemas.
schema_example_pairs = [
    ("schemas/SYSTEM_REQUIREMENT_STATE.schema.json", "examples/SYSTEM_REQUIREMENT_STATE.example.yaml"),
    ("schemas/SYSTEM_REQUIREMENT_STATE.schema.json", "templates/SYSTEM_REQUIREMENT_STATE.yaml"),
    ("schemas/REQUIREMENT_CONFORMANCE_MANIFEST.schema.json", "examples/REQUIREMENT_CONFORMANCE_MANIFEST.example.json"),
    ("schemas/AI_TASK_CONTRACT.schema.json", "examples/AI_TASK_CONTRACT.example.json"),
    ("schemas/AI_CHANGE_MANIFEST.schema.json", "examples/AI_CHANGE_MANIFEST.example.json"),
    ("schemas/AI_REVIEW_MANIFEST.schema.json", "examples/AI_REVIEW_MANIFEST.example.json"),
    ("schemas/AI_SCAN_MANIFEST.schema.json", "examples/AI_SCAN_MANIFEST.example.json"),
    ("schemas/PROJECT_LIFECYCLE_STATE.schema.json", "examples/PROJECT_LIFECYCLE_STATE.example.yaml"),
]
for schema_relative, example_relative in schema_example_pairs:
    schema_document = parsed_json.get(schema_relative)
    example_document = (
        parsed_json.get(example_relative)
        if example_relative.endswith(".json")
        else parsed_yaml.get(example_relative)
    )
    if schema_document is None or example_document is None:
        continue
    validation_errors = sorted(
        Draft202012Validator(schema_document).iter_errors(example_document),
        key=lambda issue: list(issue.path),
    )
    if validation_errors:
        fail(
            f"{example_relative} fails {schema_relative}: "
            + "; ".join(issue.message for issue in validation_errors[:8])
        )

# Validate the technology-neutral development standards.
gdb_ids = extract_sequential_controls(
    "reference/GENERAL_DEVELOPMENT_BEHAVIOR_STANDARD.md", "GDB", 35
)
giq_ids = extract_sequential_controls(
    "reference/GENERAL_IMPLEMENTATION_QUALITY_STANDARD.md", "GIQ", 50
)
fed_ids = extract_sequential_controls(
    "reference/FRONTEND_DEVELOPMENT_STANDARD.md", "FED", 70
)

main_text = read_text("AI_AGENT_ENGINEERING_SECURE_DEVELOPMENT_STANDARD_v4.4.md")
main_required = [
    "## 22. 通用開發行為基準（一）",
    "## 23. 通用開發行為基準（二）",
    "## 24. 前端開發基準",
    "不是 Linux 或 C#／.NET 採用規範",
    "框架無關的前端工程基準",
]
for phrase in main_required:
    if phrase not in main_text:
        fail(f"main standard missing required technology-neutral/front-end statement: {phrase}")
for forbidden in [
    "## 22. Linux 應用程式",
    "## 23. Microsoft .NET",
    "profiles/LINUX_APPLICATION_PROFILE.md",
    "profiles/DOTNET_CSHARP_PROFILE.md",
]:
    if forbidden in main_text:
        fail(f"main standard still contains technology-bound core section/reference: {forbidden}")

# The main chapters and independently loadable standards must use exactly the same
# control identifiers and normative text. This prevents a short summary from silently
# redefining an ID with different semantics.
for prefix, relative, expected_count in [
    ("GDB", "reference/GENERAL_DEVELOPMENT_BEHAVIOR_STANDARD.md", 35),
    ("GIQ", "reference/GENERAL_IMPLEMENTATION_QUALITY_STANDARD.md", 50),
    ("FED", "reference/FRONTEND_DEVELOPMENT_STANDARD.md", 70),
]:
    main_controls = extract_control_map(main_text, prefix)
    reference_controls = extract_control_map(read_text(relative), prefix)
    expected_ids_for_family = {f"{prefix}-{index:03d}" for index in range(1, expected_count + 1)}
    if set(main_controls) != expected_ids_for_family:
        fail(
            f"main standard {prefix} controls mismatch: expected {expected_count}, "
            f"found {len(main_controls)}"
        )
    if main_controls != reference_controls:
        divergent = sorted(
            control_id
            for control_id in expected_ids_for_family
            if main_controls.get(control_id) != reference_controls.get(control_id)
        )
        fail(
            f"main/reference normative text differs for {prefix}: {divergent[:12]}"
            + ("..." if len(divergent) > 12 else "")
        )
checks["normative_control_mirror_consistency"] = {
    "GDB": len(extract_control_map(main_text, "GDB")) == 35,
    "GIQ": len(extract_control_map(main_text, "GIQ")) == 50,
    "FED": len(extract_control_map(main_text, "FED")) == 70,
}

# Validate always-on and front-end routing policy.
behavior_policy = parsed_yaml.get("policies/development-behavior-profiles.yaml")
if not isinstance(behavior_policy, dict):
    fail("development behavior profile policy missing or invalid")
else:
    profiles = behavior_policy.get("spec", {}).get("profiles", {})
    for key in ["general-development-behavior", "general-implementation-quality"]:
        entry = profiles.get(key, {})
        if entry.get("alwaysApply") is not True:
            fail(f"{key}: must be alwaysApply true")
        for path_key in ["profilePath", "standardPath"]:
            path_value = entry.get(path_key)
            if not isinstance(path_value, str) or not (ROOT / path_value).is_file():
                fail(f"{key}: invalid {path_key}: {path_value}")
    frontend = profiles.get("frontend-development", {})
    expected_frontend_profile = "profiles/FRONTEND_DEVELOPMENT_PROFILE.md"
    expected_frontend_standard = "reference/FRONTEND_DEVELOPMENT_STANDARD.md"
    if frontend.get("profilePath") != expected_frontend_profile:
        fail("frontend-development profilePath mismatch")
    if frontend.get("standardPath") != expected_frontend_standard:
        fail("frontend-development standardPath mismatch")
    frontend_triggers = set(frontend.get("activateOn", []))
    required_triggers = {"user-interface", "browser-client", "page", "component", "form", "theme", "i18n", "accessibility"}
    if not required_triggers.issubset(frontend_triggers):
        fail("frontend-development activation triggers are incomplete")

agent_text = read_text("AGENTS.md")
for phrase in [
    "profiles/GENERAL_DEVELOPMENT_BEHAVIOR_PROFILE.md",
    "profiles/GENERAL_IMPLEMENTATION_QUALITY_PROFILE.md",
    "profiles/FRONTEND_DEVELOPMENT_PROFILE.md",
    "第 22、23 章是所有專案共用的開發行為基準",
]:
    if phrase not in agent_text:
        fail(f"AGENTS.md missing mandatory load/positioning statement: {phrase}")

ssdlc_policy = parsed_yaml.get("policies/ssdlc-gates.yaml")
frontend_gate_ok = False
if not isinstance(ssdlc_policy, dict):
    fail("SSDLC gate policy missing or invalid")
else:
    frontend_gate = (
        ssdlc_policy.get("spec", {})
        .get("conditionalGates", {})
        .get("frontend-change", {})
    )
    activities = frontend_gate.get("requiredByActivity", {}) if isinstance(frontend_gate, dict) else {}
    expected_frontend_activities = {
        "S2-REQUIREMENTS",
        "S3-ARCHITECTURE",
        "S6-IMPLEMENTATION",
        "S7-AUTOMATED-VERIFICATION",
        "S8-INDEPENDENT-REVIEW",
        "S9-SYSTEM-VALIDATION",
        "S10-RELEASE-ASSURANCE",
    }
    if not expected_frontend_activities.issubset(set(activities)):
        fail("SSDLC frontend conditional gates are incomplete")
    else:
        frontend_gate_ok = True
checks["frontend_ssdlc_gate"] = frontend_gate_ok

review_policy = parsed_yaml.get("policies/review-routing.yaml")
frontend_review_ok = False
if not isinstance(review_policy, dict):
    fail("review routing policy missing or invalid")
else:
    frontend_reviewers = set(
        review_policy.get("spec", {}).get("routes", {}).get("frontend", [])
    )
    expected_frontend_reviewers = {
        "Frontend Engineering Reviewer",
        "Frontend Security Reviewer",
        "Accessibility/i18n Reviewer",
    }
    if not expected_frontend_reviewers.issubset(frontend_reviewers):
        fail("frontend specialist review routing is incomplete")
    else:
        frontend_review_ok = True
checks["frontend_specialist_review_route"] = frontend_review_ok
checks["technology_neutral_core_profiles"] = True

# Important source behavior remains present.
required_phrases = {
    "requirements/USER_MANDATORY_REQUIREMENTS_BASELINE.md": [
        "所有功能或方法的啟動、執行、阻塞、錯誤、中止、結束",
        "所有功能都可以進入排程系統",
        "所有關鍵設定卡片都需搭配一個儲存按鈕",
        "所有元件必須可即時更新",
        "每次commit 版本號右邊+1",
    ],
    "profiles/ADMIN_OPERATIONS_PROFILE.md": [
        "所有功能或方法都必須產生",
        "所有功能都可排程",
        "狀態管理模組及管理頁",
    ],
    "profiles/DATA_MANAGEMENT_PROFILE.md": [
        "管理員金鑰",
        "租戶金鑰",
        "客戶金鑰",
        "只顯示一次",
        "環境變數",
    ],
    "reference/FRONTEND_DEVELOPMENT_STANDARD.md": [
        "每張關鍵設定卡片必須有獨立儲存按鈕",
        "距底部不足 20% 觸發",
        "儀表板每個元件都可即時更新",
        "浮動回到最上按鈕",
        "使用者可調字型大小",
    ],
    "profiles/COLLABORATION_VERSIONING_PROFILE.md": [
        "每次 Commit：版本號右邊 `+1`",
        "PR 進入 Stage：版本號中間 `+1`，右邊清零",
    ],
}
for relative, phrases in required_phrases.items():
    document = read_text(relative)
    for phrase in phrases:
        if phrase not in document:
            fail(f"{relative}: required source behavior missing: {phrase}")

# Frontend review and test standards must be explicit and framework-neutral.
for relative, phrases in {
    "reference/FRONTEND_CODE_REVIEW_STANDARD.md": [
        "UI-REQ-001～017",
        "FED-001～070",
        "Frontend Engineering Review",
        "Frontend Security Review",
        "Accessibility／i18n Review",
    ],
    "reference/FRONTEND_TESTING_STANDARD.md": [
        "UI-REQ-001～017",
        "FED-001～070",
        "L2 內部測試",
        "Lazy Load 20%",
        "Client-only AuthZ",
    ],
}.items():
    document = read_text(relative)
    for phrase in phrases:
        if phrase not in document:
            fail(f"{relative}: missing frontend governance phrase: {phrase}")

# Ensure obsolete downgrade machinery is not active.
authoritative_execution_files = [
    "AI_AGENT_ENGINEERING_SECURE_DEVELOPMENT_STANDARD_v4.4.md",
    "AGENTS.md",
    "policies/lifecycle-profiles.yaml",
    "policies/development-behavior-profiles.yaml",
    "profiles/ARCHITECTURE_SYSTEM_PROFILE.md",
    "profiles/ADMIN_OPERATIONS_PROFILE.md",
    "profiles/DATA_MANAGEMENT_PROFILE.md",
    "profiles/FRONTEND_DEVELOPMENT_PROFILE.md",
    "profiles/COLLABORATION_VERSIONING_PROFILE.md",
]
old_active_fragments = [
    "A/C/T/P",
    "`A` Always、`G` Stage Gate",
    "可延後的補充控制",
    "補充控制立即由 `R` 升為 MUST",
]
for relative in authoritative_execution_files:
    document = read_text(relative)
    for fragment in old_active_fragments:
        if fragment in document:
            fail(f"{relative}: obsolete lifecycle classification remains active: {fragment}")

# Markdown fence integrity.
for path in markdown_files:
    fence_count = sum(
        1 for line in path.read_text(encoding="utf-8").splitlines() if re.match(r"^\s*```", line)
    )
    if fence_count % 2:
        fail(f"unbalanced Markdown code fence: {path.relative_to(ROOT)}")

# Detect stale active references outside documents that intentionally explain migration/removal.
legacy_reference_exclusions = {"README.md", "MIGRATION_GUIDE_v4.3_to_v4.4.md", "CORRECTION_REPORT.md", "CHANGELOG.md"}
for path in ROOT.rglob("*"):
    if not path.is_file() or path.suffix not in {".md", ".yaml", ".yml", ".json", ".py"}:
        continue
    relative = path.relative_to(ROOT).as_posix()
    if relative in legacy_reference_exclusions or relative in {"VALIDATION_REPORT.json", "BUILD_SUMMARY.json", "tools/validate_bundle.py"}:
        continue
    text = path.read_text(encoding="utf-8", errors="replace")
    for legacy in forbidden_legacy_paths:
        if legacy in text:
            fail(f"stale active legacy profile reference in {relative}: {legacy}")

checks.update(
    {
        "requirements": {
            "count": len(requirements),
            "unique": len(set(requirement_ids)),
            "category_counts": dict(actual_counts),
            "all_strength_must": all(item.get("strength") == "MUST" for item in requirements),
        },
        "baseline_digest": baseline_digest,
        "lifecycle_stages": sorted(found_stages),
        "general_development_controls": len(gdb_ids),
        "general_implementation_controls": len(giq_ids),
        "frontend_development_controls": len(fed_ids),
        "yaml_files": len(yaml_files),
        "json_files": len(json_files),
        "markdown_files": len(markdown_files),
        "schema_example_pairs": len(schema_example_pairs),
    }
)

report = {
    "version": VERSION,
    "validated_at_utc": datetime.now(timezone.utc).isoformat(),
    "root": str(ROOT),
    "checks": checks,
    "errors": errors,
    "warnings": warnings,
    "status": "pass" if not errors else "fail",
}
(ROOT / "VALIDATION_REPORT.json").write_text(
    json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
)
print(json.dumps(report, ensure_ascii=False, indent=2))
sys.exit(1 if errors else 0)
