# 08 - Pinned Full-Content Injection

When bot_documents.is_pinned=true, inject doc full content (all chunks in chunk_index order) into the system prompt.

Source: appapi/server/utils/rag/pinnedContent.ts

## Functions

- loadPinnedDocsForBot(botId): PinnedDoc[]
- applyPinnedTokenBudget(docs, budget): { included, excluded, warning }
- buildPinnedBlock(docs): prompt scaffold string
- preparePinnedContext(botId, budget): all-in-one

## Budget

DEFAULT_PINNED_TOKEN_BUDGET = 800_000 (tuned for Gemini 1M window, 20 percent reserved).
For Claude 200k: override to 120k. For GPT-4o 128k: override to 72k via bot.settings.pinnedTokenBudget.

## Exclusion Strategy

Exclude whole documents rather than truncate. Truncated contracts break Rule 8. A truncated clause saying "unless otherwise specified below" without the below is dangerous.

## Tests

appapi/test/utils/pinnedContent.test.ts (9 tests)
