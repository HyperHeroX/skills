# 10 - Auto-Pin Contracts on Comparison

When comparison fires AND >=2 docs are category=contract (from document_metadata), auto-load their full content without explicit user pin.

Source: appapi/server/utils/rag/chatEnhancements.ts + pinnedContent.loadFullContentForDocNames

## Incident (2026-04-22)

User: "compare OT contract vs priority contract". Bot had 2 contracts + 9 monthly reports. Retrieval top-30 only pulled 5-10 chunks from the 363-chunk OT contract. Comparison table had missing rows.

## Gating (ALL must hold)

1. comparison.detection.active === true
2. >= 2 comparison docs
3. >= 2 unpinned candidates
4. After category filter: >= 2 contracts
5. Remaining pinned budget can fit all of them
6. Else: emit warning, skip auto-load (never half-load)

## Block Label

Separate from user-pinned: "contract comparison data (auto-loaded full text)" vs "pinned documents".

## Opt-out

bot.settings.disableAutoPinOnComparison = true
Category whitelist currently = [contract]; expand cautiously.
