# 04 · Multi-Query Rewrite

LLM rewrites the user query into N variants; run `hybridSearch` against each; merge
via RRF. Improves recall on ambiguous or semantically-different phrasings.

Source: `appapi/server/utils/multiQuery.ts`

## When It Fires

- `bot.settings.useMultiQuery === true` (per-bot opt-in), OR
- `body.useMultiQuery === true` on the chat request

## Pipeline

```
1. LLM prompt: "Rewrite this query into 3 semantically different variants"
   - Variant 1: original query (always kept as first)
   - Variants 2-4: LLM-generated rewrites
   - Uses the bot's configured LLM provider (low-temp, max ~150 output tokens)

2. Parallel hybridSearch(query_i) for each variant → N chunk lists
   ⚠ IMPORTANT: in the current code these run SERIALLY, causing the ~380s
   latency seen in the 2026-04-21 incident. Parallelize with Promise.all
   for production use.

3. RRF merge the N ranked lists with k=60
   score(chunk) = Σ_i 1 / (60 + rank_i(chunk))

4. dedupe by chunk.id, sort by merged score, slice topN

5. Return { chunks, variations, rewriteMs, searchMs }
```

## Cost / Latency Tradeoff

- 4 variations × full hybridSearch each = 4× latency AND 4× pgvector index
  lookups. Use sparingly.
- Intent-boost interaction: comparison queries auto-elevate to `enhanced`
  tier (perDocTopK=8) × 4 variants = lots of chunks pre-rerank.
- Combined with `perDocTopNMode=true`: can easily hit 100+ chunks per
  variant. Budget the reranker accordingly.

## Prompt

The rewrite prompt forbids changing the semantic meaning — variants must
be paraphrases, not topic shifts. Tuned for Traditional Chinese but works
for any language the LLM supports.

## Tests

`appapi/test/utils/multiQuery.test.ts` — RRF math, dedup correctness,
variation count bounds
