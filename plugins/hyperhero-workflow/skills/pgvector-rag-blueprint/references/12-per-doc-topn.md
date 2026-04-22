# 12 - Per-Doc TopN Toggle

Toggle between "topN is global cap" (default) vs "topN is per-doc cap". Addresses the common problem where strong-signal docs starve weaker docs of retrieval slots.

Source: appapi/server/utils/rag/botSearchOptions.ts:applyPerDocTopNMode

## Modes

OFF (default): topN is global. Each doc capped at perDocTopK first, then the merged pool cut to topN. Strong docs can dominate.

ON: perDocTopK = topN, internal topN multiplied by 50 (near-uncapped), minChunksPerDoc = 0. Each doc independently gets up to topN chunks.

## Example

Bot with 20 files, topN=10:
- OFF: LLM sees 10 chunks total
- ON: LLM sees up to 200 chunks (10 per file)

## Opt-in

bot.settings.perDocTopNMode = true (default false).
Pair with Gemini 2.5 Pro/Flash (1M window) when enabling broadly.

## Interop

Intent boost + perDocTopNMode = enhanced tier topN (30) becomes 30 per doc = 300+ chunks. Check reranker can handle this pool size.

## Tests

appapi/test/utils/botSearchOptions.test.ts - 7 new cases for this toggle (18 tests total)
