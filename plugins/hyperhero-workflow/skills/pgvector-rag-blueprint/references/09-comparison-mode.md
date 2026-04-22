# 09 - Auto Comparison Mode

Detect comparison intent + >=2 distinct docs, inject scaffold forcing Markdown-table output with verbatim per-doc clauses.

Source: appapi/server/utils/rag/comparisonMode.ts + queryIntent.ts

## Detection

1. isComparisonQuery(query) matches comparison keywords regex
2. Total distinct docs in scope >= 2
3. Retrieved-only docs need >= minRetrievedChunkCount (default 3) chunks to count - pinned always qualify

## Why chunk-count threshold

Without it, a single-chunk monthly report gets added to the comparison, forcing LLM to create a column for it and hallucinate content.

## Scaffold

- Lists detected comparison documents by name
- Requires Markdown table, one column per doc
- Requires clause-number + verbatim per cell
- Missing clauses explicitly marked, never substituted

## Intent Boost

queryIntent.resolveTier() auto-upgrades tier to enhanced for comparison queries.

## Opt-out

bot.settings.disableComparisonMode = true

## Tests

appapi/test/utils/comparisonMode.test.ts (13 tests)
