# 03 · Hybrid Search (BM25 + pgvector + RRF)

Combine keyword match (BM25 via `pg_trgm` similarity) with vector match
(pgvector cosine distance `<=>`), then merge with Reciprocal Rank Fusion.

## Source File

`appapi/server/utils/hybridSearch.ts`

## Why Hybrid

Pure vector search misses exact-term queries (product names, 條號,
日期). Pure keyword search misses semantic queries ("合約到期日" vs
"期滿日期"). RRF merge is cheap, robust, and parameter-free.

## Core Signature

```ts
hybridSearch(bot, query, options): Promise<HybridChunk[]>

options: {
  topN: number              // final cap (default 10 for normal tier)
  vectorTopN: number        // raw vector search depth (default 20)
  keywordTopN: number       // raw keyword search depth (default 20)
  scoreThreshold: number    // drop chunks below this cosine score
  perDocTopK: number        // per-doc cap via vectorSearchPerDoc (default 4)
  metadataFilter: boolean   // pre-filter by document_metadata.category
  rerank: boolean           // run the pluggable reranker after merge
  minChunksPerDoc: number   // guarantee per-doc floor via balanceTopNPerDoc
  documentIds?: number[]    // restrict to specific docs (used by auto-pin)
  botIds?: number[]         // supervisor-bot: search self + subordinates
}
```

## Pipeline

```
1. (optional) metadata pre-filter → candidate docIds
   See 06-metadata-filter.md

2. Vector search (pgvector):
   vectorSearchPerDoc(botId, query, perDocTopK, scoreThreshold, 500, docIds)
   - ROW_NUMBER() OVER (PARTITION BY doc_name ORDER BY embedding <=> q)
   - ensures each doc gets at least perDocTopK chunks in the pool

3. Keyword search (BM25-ish via pg_trgm):
   SELECT ... WHERE content % query OR similarity(content, query) > threshold
   ORDER BY similarity DESC LIMIT keywordTopN
   - Requires pg_trgm extension + GIN gin_trgm_ops index

4. CJK synonym expansion (optional):
   Tokenize query → map each token through CJK_SYNONYM_GROUPS →
   expand query with synonyms before keyword search
   Example: 契約期程 → 契約期間 | 契約年期 (all three searched)

5. Reciprocal Rank Fusion merge:
   score(chunk) = Σ 1 / (k + rank_i(chunk))  where k = 60
   Iterate over (vectorResults, keywordResults), accumulate scores by chunk.id

6. balanceTopNPerDoc(ranked, topN, minChunksPerDoc)
   Guarantee each doc gets at least minChunksPerDoc in final topN even if
   it was outranked globally. Prevents strong-signal docs from crowding out
   weaker ones.

7. (optional) rerank → see 05-rerankers.md

8. Final slice: ranked.slice(0, topN)
```

## Per-Doc Top-K vs Global Top-N

**Critical distinction**: `perDocTopK` controls the raw candidate pool, NOT
the final result count. Global `topN` cuts the merged list at the end.

See `12-per-doc-topn.md` for the `perDocTopNMode` toggle that swaps these
semantics (turns `topN` into a per-doc cap).

## Tier Presets

`appapi/server/utils/rag/queryIntent.ts` defines 3 tier levels:

| Tier | topN | perDocTopK | minChunksPerDoc | Use case |
|---|---|---|---|---|
| simple | 4 | 2 | 1 | Single-fact lookups, low latency |
| normal | 10 | 4 | 1 | Default; general Q&A |
| enhanced | 30 | 8 | 2 | Comparison / diff / multi-doc coverage |

Comparison-intent queries (matching `isComparisonQuery` regex) auto-upgrade
to `enhanced` — `resolveTier(persisted, query)`.

## Key Invariants

- Every query filters `WHERE bot_id = ANY($botIds)` — NEVER run a search
  without a bot scope. Supervisor bots pass `[selfId, ...subordinateIds]`.
- `embedding IS NOT NULL` — chunks mid-embed must not appear in results.
- Result rows are always `{ id, text, source, score, rerankScore?,
  originalScore?, metadata? }` — stable `HybridChunk` shape.

## Tests

`appapi/test/utils/hybridSearch.test.ts` — balanceTopNPerDoc edge cases
`appapi/test/utils/hybridSearchKeywords.test.ts` — CJK synonym expansion
`appapi/test/utils/queryIntent.test.ts` — tier + intent boost

## Pitfalls

- Forgetting the pg_trgm GIN index → keyword search becomes minutes-long
  sequential scan on 100k+ rows.
- Forgetting HNSW on `embedding` column → vector search works but slowly.
- Raw keyword `%` operator without `similarity()` threshold → no ranking,
  just binary match.
- RRF merging `rerankScore` (from reranker) with `score` (raw RRF) — keep
  them in separate fields; pipeline order is raw RRF → rerank → final.
