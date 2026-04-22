# 00 · Architecture Overview

## What the System Does

Multi-tenant RAG service. Each tenant owns N bots. Each bot owns its own
knowledge base (documents → chunks → embeddings). When a user sends a chat
message, the system retrieves the most relevant chunks from *that bot's*
knowledge base, optionally injects whole pinned documents, and asks an
LLM to answer — with strict verbatim-quotation discipline for legal /
contract content.

## Request Flow (single chat message)

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. HTTP POST /api/chat/hybrid-stream                             │
│    body: { workspaceSlug, message, useMultiQuery?, useCache? }   │
└──────────────────────────────────────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│ 2. Bot lookup by workspaceSlug → bot.id, tenant.id, settings     │
│ 3. Guardrail (Bedrock) → block if toxic                          │
│ 4. Cache lookup: responseHash(bot.id, query) — if HIT, replay    │
└──────────────────────────────────────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│ 5. SSE stream opens → immediate ": stream-start\n\n" flush       │
│    (heartbeats fire every 15s during steps 6-9 to hold edge)     │
└──────────────────────────────────────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│ 6. RETRIEVAL PIPELINE                                            │
│    ┌──────────────────────────────────────┐                      │
│    │ buildSearchOptionsFromBot(bot, q)    │ → tier + flags       │
│    │ - retrievalTier: simple/normal/enh   │   + intent boost     │
│    │ - perDocTopNMode, useMultiQuery...   │   + metadataFilter   │
│    └──────────────────────────────────────┘                      │
│                         ↓                                        │
│    ┌──────────────────────────────────────┐                      │
│    │ (optional) multiQueryHybridSearch    │ → 3-4 query variants │
│    │   LLM rewrite → N searches → RRF     │   merged by rank     │
│    └──────────────────────────────────────┘                      │
│                         ↓                                        │
│    ┌──────────────────────────────────────┐                      │
│    │ hybridSearch                          │                     │
│    │ - (optional) metadata pre-filter      │                     │
│    │ - vectorSearchPerDoc (pgvector <=>)  │                     │
│    │ - BM25 (pg_trgm similarity)           │                     │
│    │ - Reciprocal Rank Fusion merge       │                     │
│    │ - balanceTopNPerDoc (min per doc)     │                     │
│    └──────────────────────────────────────┘                      │
│                         ↓                                        │
│    ┌──────────────────────────────────────┐                      │
│    │ reranker (pluggable)                  │                     │
│    │ - none / cross-encoder / cosine       │                     │
│    └──────────────────────────────────────┘                      │
└──────────────────────────────────────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│ 7. ENHANCEMENT LAYER (enhanceChatContext)                        │
│    ┌──────────────────────────────────────┐                      │
│    │ 7a. Load pinned docs → pinnedBlock    │                     │
│    │     (is_pinned=true, budget-capped)   │                     │
│    │ 7b. Detect comparison mode            │                     │
│    │     (isComparisonQuery + ≥2 docs)     │                     │
│    │ 7c. Auto-pin contracts on comparison  │                     │
│    │     (category='契約', budget-capped)  │                     │
│    │ 7d. Apply temporal boost on chunks    │                     │
│    │     (新/舊 keyword → doc age bias)    │                     │
│    │                                       │                     │
│    │ returns: pinnedBlock + rescored chunks│                     │
│    └──────────────────────────────────────┘                      │
└──────────────────────────────────────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│ 8. LLM STREAM (ragStream)                                        │
│    - buildContextBlock(chunks, pinnedBlock)                     │
│    - prepend system prompt + Rules 1-9                          │
│    - provider.stream() — tokens flow back through SSE           │
└──────────────────────────────────────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│ 9. POST-PROCESSING                                               │
│    - resolveContextRefs: replace [CONTEXT N] → {{檔名 §X p.N}}   │
│    - tee: capture fullResponse for cache + citationInserter     │
│    - SSE 'sources' event → SSE 'done' event                     │
└──────────────────────────────────────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│ 10. CLIENT SIDE                                                  │
│    - ChatMarkdown.vue: {{...}} → green pill, 『...』 → plain    │
│    - stream-complete → insert citations from auto-matcher       │
└──────────────────────────────────────────────────────────────────┘
```

## Key Data Models

```
tenants
  └── bots (one bot = one workspace)
        ├── bot_documents (PDF/DOCX/etc uploads)
        │     └── document_chunks (embedded segments, ordered by chunk_index)
        │     └── document_metadata (category, topics, keywords, entities)
        ├── chat_sessions
        │     └── chat_messages
        └── chat_connections (external integrations: LINE, widget…)
```

Cross-cutting:

```
embedding_cache — dedupe embedding calls across bots/tenants by content hash
query_cache — cache full LLM responses keyed by (bot.id, query-hash)
notifications — user-facing events: upload progress, doc_processed, doc_failed
error_logs — persistent backend error trail for post-mortems
```

## Design Invariants

These are the contracts every layer must honor:

1. **Tenant isolation** — every retrieval query filters by `bot_id`. Bots
   never share chunks. (Cross-bot is supported via `botSubordinates` with
   explicit opt-in.)
2. **Verbatim discipline** — Rule 8 forbids the LLM from paraphrasing
   contract clauses. All quoted text uses `『...』`.
3. **Source traceability** — every claim must cite a file. Source refs use
   `{{檔名 §章節 p.頁碼}}` so the frontend can decorate without ambiguity.
4. **Null-byte safety** — every text write to `bot_documents.content` or
   `document_chunks.content` goes through `sanitizeForPostgresText` to
   strip `\x00` and C0 control chars (see `14-null-byte-sanitization.md`).
5. **Graceful degradation** — every feature (pinned, comparison, temporal,
   per-doc TopN) is gated by a `bot.settings.disableXyz` flag so operators
   can turn anything off without code changes.
6. **Budget guards** — pinned + auto-pin share a token budget (default
   800k for Gemini 1M window). When budget exceeded, *exclude whole docs*,
   never truncate — truncated contracts break Rule 8.

## Why Not X?

- **Why not AnythingLLM / Dify?** System originally ran on AnythingLLM
  but diverged because cross-tenant isolation, custom verbatim rules,
  and pinned full-content injection were not supported. See
  `rag-optimization` skill for the AnythingLLM tuning history.
- **Why not Chroma / Pinecone?** pgvector is already required for the
  operational metadata (bots, tenants, chunks). Keeping everything in
  Postgres avoids a second datastore and lets metadata filter + vector
  search share indexes.
- **Why not a single LLM call with all content?** Because bots can own
  20+ documents totaling 2M+ tokens. Even Gemini 1M can't fit that —
  retrieval is required for most queries; pinned + auto-pin are
  surgical overrides for specific query classes.

## Source Files in LineBotRAG

- `appapi/server/api/chat/hybrid-stream.post.ts` — the full flow as code
- `appapi/server/utils/rag/chatEnhancements.ts` — step 7 orchestrator
- `appapi/server/utils/hybridSearch.ts` — step 6 pipeline
- `appapi/server/utils/rag/llmChat.ts` — step 8 + buildContextBlock
