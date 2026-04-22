# 06 · Metadata Pre-Filter

Before running hybrid search across ALL bot documents, first LLM-tag each
doc with `{category, topics, keywords, entities}` and use the user query's
intent to pre-filter candidate docs by category.

Source: `appapi/server/utils/documentTagger.ts` + `document_metadata` table.

## Why

Retrieval on a bot with 100+ docs wastes reranker budget on obviously-
irrelevant docs (e.g. March 財報 when user asks about April 月報).

## Flow

1. At upload: `tagDocumentInBackground(botId, docId, content)` runs an LLM
   pass that produces `{category: '契約' | '報告' | ..., topics[], keywords[]}`.
   Persist to `document_metadata`.

2. At query: if `bot.settings.useMetadataFilter === true` (default),
   classify query intent → category set → filter `document_chunks` to
   `document_id IN (SELECT document_id FROM document_metadata WHERE
   category = ANY($categories))` before vector search.

## Opt-out

`bot.settings.useMetadataFilter = false` bypasses the filter. Useful when
metadata tagging is stale or incomplete.

## Cross-reference

Used by `10-auto-pin-contracts.md` with the same `category='契約'` filter,
but for a different purpose (auto-pinning, not filtering out).

## Pitfall

If a query spans multiple categories (e.g. "how does the contract's
penalty clause compare to last month's report?") the filter can accidentally
exclude one side. Track false-negative rate via `error_logs` / sample
audits.
