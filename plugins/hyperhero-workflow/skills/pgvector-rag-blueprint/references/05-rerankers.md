# 05 · Pluggable Rerankers

After hybrid search merges BM25 + vector results, an optional reranker
re-scores the top-K chunks against the original query for final ranking.

Source: `appapi/server/utils/rag/rerankers/*` + `appapi/server/utils/rag/nativeReranker.ts`

## Interface

```ts
interface RerankerProvider {
  rerank(query: string, candidates: RerankerCandidate[], topK: number):
    Promise<RerankerResult[]>
}

type RerankerCandidate = { id: string, text: string }
type RerankerResult = { id: string, score: number }
```

## Implementations

| Provider | Model | Cost | Latency | Chinese quality |
|---|---|---|---|---|
| `none` | pass-through, keep RRF order | — | 0 | baseline |
| `embedding-cosine` | re-embed query + cos sim | embed API × 1 | ~200ms | OK |
| `cross-encoder` (local) | `Xenova/bge-reranker-base` | free | 1-3s CPU, 60s warm | **best for CJK** |
| `ms-marco` | `cross-encoder/ms-marco-TinyBERT-L-6` | free | fast | **BAD for CJK** (English-trained) |
| `cohere` | `rerank-multilingual-v3.0` | $2/1k queries | 200-400ms | best overall |

Use `bge-reranker-base` for Chinese corpora — it was trained on zh + en
multilingual data. The English-only ms-marco variants actively hurt
ranking for CJK content.

## Selection

`bot.settings.reranker` = `'none' | 'embedding' | 'cross-encoder' | 'cohere'`.
Default: `'cross-encoder'` on Railway (transformers.js / onnxruntime).

## First-Call Latency

bge-reranker-base is ~350MB. On Railway it downloads on first use
(~60s warm-up). Pre-warm on server boot if latency matters.

## Composition

```
hybridSearch (RRF-ranked topN' > topN)
  → reranker(query, candidates[:60], topK=topN)
  → final topN
```

`topN'` is the candidate pool size (often 60-100) fed into the reranker;
`topN` is what ultimately reaches the LLM.

## Pitfall

Don't overwrite `chunk.score` with `rerankScore` — keep both fields.
Downstream code (cache, citation matcher) sometimes relies on the original
RRF score for tie-breaking.
