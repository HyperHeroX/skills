---
name: pgvector-rag-blueprint
description: Complete blueprint for rebuilding LineBotRAG's pgvector-based multi-tenant RAG engine in another system. Covers retrieval pipeline (hybrid search + multi-query + pluggable reranker + metadata pre-filter), feature layer (pinned full-content injection, auto comparison mode with contract auto-pin, temporal proximity boost, per-doc TopN toggle), streaming SSE with edge-timeout heartbeats, Postgres UTF-8 null-byte safety, the 9-rule verbatim prompt discipline, and the `{{...}}` vs `『...』` citation convention. Use when porting LineBotRAG's RAG behavior to another stack, auditing a fresh RAG implementation against battle-tested patterns, or onboarding a new engineer to the architecture.
version: 1.0.0
source: LineBotRAG feature/decouple-anythingllm @ 7859f12 (2026-04-22)
tags: [rag, pgvector, hybrid-search, reranker, multi-tenant, streaming-sse, llm-prompting]
---

# pgvector RAG Blueprint

Portable form of LineBotRAG's RAG engine — a multi-tenant, pgvector-backed
retrieval-augmented generation system that answers contract-grade questions
over scanned Chinese PDFs. Captures *what* the system does, *why* each piece
exists, and *how* to rebuild it in another stack.

## When to Use This Skill

Use this skill when:
- Rebuilding LineBotRAG's RAG behavior in a different codebase or language
- Auditing a new RAG implementation against patterns proven in production
- Onboarding an engineer who needs to understand *why* every piece exists —
  each reference file has a "root cause" or "customer incident" section
  explaining real motivation, not just API shape
- Deciding which RAG features to adopt incrementally — each reference `08`
  through `12` is standalone with its own scope, budget impact, and opt-out
  switch

Do NOT use this skill for:
- Quick AnythingLLM-specific tuning → use `rag-optimization` skill instead
- Generic pgvector schema design unrelated to this system's quirks
- Non-retrieval LLM work (system prompts without RAG context)

## Tech Assumptions

- **PostgreSQL 15+ with pgvector** (hard requirement)
- Async runtime; reference code is TypeScript/Drizzle — port concepts,
  not syntax
- Streaming-capable LLM provider; Gemini 2.5 Pro/Flash recommended for the
  800k pinned budget, Claude/GPT workable with smaller budgets
- Pluggable reranker: none / Cohere / bge-reranker-base / embedding-cosine

## Architecture: 4 Layers

The system stacks into four independent layers. Each layer is documented
in its own references file and can be adopted standalone.

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 4 · Frontend / Citation Rendering                        │
│    {{...}} → green pill · 『...』 → plain verbatim quote        │
│    refs: 15                                                      │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3 · Chat Handler (wiring)                                │
│    SSE stream with heartbeats · retrieval inside generator      │
│    enhanceChatContext orchestrator · ragStream with pinnedBlock │
│    refs: 13, 16                                                  │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2 · Feature Enhancements                                 │
│    · Pinned full-content injection  (ref 08)                    │
│    · Auto comparison mode            (ref 09)                   │
│    · Auto-pin contracts on compare   (ref 10)                   │
│    · Temporal proximity boost        (ref 11)                   │
│    · Per-doc TopN toggle             (ref 12)                   │
│    · Prompt Rules 1–9                (ref 07)                   │
├─────────────────────────────────────────────────────────────────┤
│  Layer 1 · Retrieval Pipeline                                   │
│    · Multi-query rewrite → N variants    (ref 04)               │
│    · Hybrid search: BM25 + pgvector + RRF (ref 03)              │
│    · Metadata pre-filter by category      (ref 06)              │
│    · Pluggable reranker                   (ref 05)              │
├─────────────────────────────────────────────────────────────────┤
│  Layer 0 · Data Plane                                           │
│    · pgvector schema                 (ref 01)                   │
│    · Document pipeline upload→OCR→chunk→embed (ref 02)          │
│    · Null-byte sanitization          (ref 14)                   │
└─────────────────────────────────────────────────────────────────┘
```

## Reference File Index

Numbered prefixes indicate suggested reading order for new engineers.

### Core — read in order
- `references/00-architecture-overview.md` — system diagram, data flow, when each layer fires
- `references/01-database-schema.md` — all tables + indexes (`bots`, `bot_documents`, `document_chunks`, `document_metadata`, `embedding_cache`, `query_cache`)
- `references/02-document-pipeline.md` — upload → OCR → chunk → embed → metadata tag
- `references/03-hybrid-search.md` — BM25 (trigram) + vector (pgvector `<=>`) + Reciprocal Rank Fusion
- `references/04-multi-query.md` — LLM query rewrite into N variants + merged ranking
- `references/05-rerankers.md` — pluggable: none / cross-encoder (bge-reranker-base) / embedding-cosine / Cohere
- `references/06-metadata-filter.md` — LLM-tagged document metadata + intent-based category pre-filter

### Prompt & Feature Layer — each standalone
- `references/07-prompt-rules.md` — the 9 answer rules (verbatim quotation, markdown table, source marker)
- `references/08-pinned-content.md` — pinned full-content injection + token budget
- `references/09-comparison-mode.md` — auto-detect comparison queries + scaffold prompt
- `references/10-auto-pin-contracts.md` — auto-load category='契約' docs when comparison mode fires
- `references/11-temporal-boost.md` — MemPalace-inspired newer/older doc bias
- `references/12-per-doc-topn.md` — global TopN vs per-doc TopN toggle

### Cross-cutting — read when wiring
- `references/13-streaming-sse.md` — SSE generator + heartbeat comments for Railway edge
- `references/14-null-byte-sanitization.md` — Postgres UTF-8 + C0 control-char strip (real customer incident)
- `references/15-frontend-citation-rendering.md` — `{{...}}` source refs vs `『...』` verbatim clauses
- `references/16-chat-handler-wiring.md` — end-to-end wiring blueprint
- `references/17-troubleshooting.md` — common issues + diagnostic SQL + pattern tracebacks

## Assets

- `assets/schema-template.sql` — ready-to-run Postgres DDL with pgvector + all RAG tables + indexes
- `assets/chat-handler-template.ts` — minimal SSE chat handler wiring retrieval + heartbeat + enhancement + ragStream

## Scripts

- `scripts/diagnose-doc.mjs.template` — diagnostic template for "why is this doc stuck?" — queries `bot_documents`, `document_chunks`, `notifications`, `error_logs` and prints a fault tree. Adapted from the 2026-04-20 null-byte incident.

## Adoption Path

### Minimum Viable — port in a weekend
1. Data plane: Layer 0 only (schema + document pipeline + null-byte strip)
2. Retrieval: Layer 1 with `hybridSearch` + simple cosine reranker
3. Prompt: Rule 1–7 only (skip verbatim + comparison rules)
4. Chat handler: blocking HTTP POST (no SSE yet)

At this point it is a working RAG. Skip to production if the use case is
general Q&A.

### Production-Grade — for contract / legal / compliance domains
5. Add multi-query rewrite + real reranker (bge-reranker-base)
6. Add prompt Rules 8–9 (verbatim clauses + markdown comparison tables)
7. Add pinned full-content + auto comparison + contract auto-pin
8. Switch to SSE with heartbeats
9. Add `{{...}}` citation convention on frontend

### Quality-of-Life
10. Temporal boost, per-doc TopN toggle, metadata pre-filter
11. Query cache, embedding cache
12. OCR pipeline for scanned PDFs

## How to Use This Skill

### To rebuild the system in another codebase

1. Read `00-architecture-overview.md` first — understand the 4-layer
   stacking before touching any file
2. Copy `assets/schema-template.sql` to bootstrap the data plane
3. Walk through `01` → `06` in order, porting each layer's core function.
   Each reference file names the source file in LineBotRAG (e.g.
   `appapi/server/utils/hybridSearch.ts`) for cross-referencing
4. Add features (07 → 12) one at a time with tests between each — every
   feature file lists its opt-out switch (`bot.settings.disableXyz`) so
   the system remains usable mid-migration
5. Wire everything via `16-chat-handler-wiring.md` + the chat handler
   template asset
6. When stuck, consult `17-troubleshooting.md` — it has exact diagnostic
   queries used in real incidents (null bytes, embed_failed, edge
   timeouts, thin retrieval coverage)

### To audit an existing RAG implementation

1. Open `17-troubleshooting.md` first — if any symptom matches, read
   the referenced feature file
2. Check the schema against `01-database-schema.md` — missing indexes
   on `bot_id`/`document_id` are the #1 perf killer
3. Verify null-byte safety per `14-null-byte-sanitization.md` — silent
   failure mode, hard to detect without Postgres logs
4. Verify SSE heartbeats per `13-streaming-sse.md` if traffic passes any
   edge proxy with an idle timeout (Railway, Cloudflare default ~60-100s)

## Source Code Cross-Reference

All reference files point to the original LineBotRAG source. Quick map:

| Layer | LineBotRAG files |
|---|---|
| Data plane | `appapi/server/db/schema.ts`, `server/api/bots/[id]/documents/upload.post.ts`, `server/utils/rag/pdfExtractor.ts`, `server/utils/rag/documentPipeline.ts`, `server/utils/rag/chunker.ts`, `server/utils/rag/embedding.ts` |
| Retrieval | `appapi/server/utils/hybridSearch.ts`, `server/utils/multiQuery.ts`, `server/utils/rag/rerankers/*`, `server/utils/rag/vectorSearch.ts` |
| Feature | `appapi/server/utils/rag/llmChat.ts`, `pinnedContent.ts`, `comparisonMode.ts`, `temporalBoost.ts`, `chatEnhancements.ts`, `botSearchOptions.ts`, `queryIntent.ts` |
| Chat handler | `appapi/server/api/chat/hybrid-stream.post.ts` et al (5 stream handlers) |
| Frontend | `appf/components/chat/ChatMarkdown.vue`, `appf/utils/sourceRefHeuristic.ts`, `appf/utils/exportWord.ts` |
