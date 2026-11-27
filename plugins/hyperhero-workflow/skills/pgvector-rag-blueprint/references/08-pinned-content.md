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
For other models, set bot.settings.pinnedTokenBudget with the same headroom: at least 20 percent of the model's current context window reserved for prompt and reply.

## Exclusion Strategy

Exclude whole documents rather than truncate. Truncated contracts break Rule 8. A truncated clause saying "unless otherwise specified below" without the below is dangerous.

## Tests

appapi/test/utils/pinnedContent.test.ts (9 tests)
