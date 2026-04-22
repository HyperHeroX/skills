# 01 · Database Schema

All RAG state lives in Postgres. Extensions required: **pgvector** (for
`embedding vector` column) and **pg_trgm** (for BM25-like similarity).

See `assets/schema-template.sql` for a ready-to-run DDL.

## Required Tables

### `tenants`, `bots` — ownership

Standard multi-tenant pattern. A `bot` is a "workspace" with:
- `workspace_slug TEXT UNIQUE` — stable external identifier (tenant-prefixed,
  e.g. `test-tenant-a_仁愛之家_6c4e1c`)
- `public_id TEXT UNIQUE` — short id for public URLs / LINE bot config
- `settings JSONB` — per-bot knobs (see every feature file for what goes here)
- `similarity_threshold TEXT` — parsed as float; `0` means "include all"
- `top_n INT` — legacy column, still read as fallback
- `system_prompt TEXT` — prepended to the RAG answer prompt

### `bot_documents` — per-bot uploaded files

```sql
bot_documents (
  id serial PRIMARY KEY,
  bot_id int NOT NULL,
  tenant_id int NOT NULL,
  doc_name text NOT NULL,
  doc_path text,                    -- legacy; may be null post-decouple
  file_size int,
  file_type text,                   -- 'application/pdf', etc.
  status text NOT NULL DEFAULT 'uploaded',
  is_embedded bool NOT NULL DEFAULT false,
  is_pinned bool NOT NULL DEFAULT false,   -- pinned = always inject full content
  content text,                     -- raw extracted text (nullable on failure)
  token_count int,
  chunk_count int,
  expected_chunk_count int,
  content_hash text,                -- SHA-256 of upload bytes; dedupe
  uploaded_at timestamp NOT NULL DEFAULT NOW(),
  embedded_at timestamp,
  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW(),

  UNIQUE (bot_id, doc_name)          -- one doc name per bot; re-upload = upsert
)
CREATE INDEX bot_documents_bot_id_idx ON bot_documents (bot_id);
CREATE INDEX bot_documents_is_pinned_idx ON bot_documents (is_pinned);
CREATE INDEX bot_documents_content_hash_idx ON bot_documents (bot_id, content_hash);
```

Status values observed in production:
- `uploaded` — bytes received
- `processing` — OCR running
- `embedding` — chunks being embedded
- `embedded` — done, ready for retrieval
- `embed_partial` — some chunks failed to embed
- `embed_failed` — everything failed (see `14-null-byte-sanitization.md`)

### `document_chunks` — the retrievable units

```sql
document_chunks (
  id serial PRIMARY KEY,
  bot_id int NOT NULL,
  document_id int NOT NULL REFERENCES bot_documents(id) ON DELETE CASCADE,
  doc_name text NOT NULL,
  chunk_index int NOT NULL,          -- 0-based, for re-assembly on pinned-full-content
  content text NOT NULL,             -- the actual text. Guaranteed \x00-free.

  -- RAGFlow-inspired multi-field boost (search layer weights these separately)
  chunk_title text,                  -- e.g. "2.2 本契約期間"
  chunk_keywords text[],             -- LLM or heuristic-extracted terms
  chunk_question text,               -- typical Q this chunk answers

  vector_id text,                    -- legacy external vector store id
  embedding vector,                  -- pgvector; dim matches provider (e.g. 768, 1536)
  token_count int,
  created_at timestamp NOT NULL DEFAULT NOW()
)
CREATE INDEX document_chunks_bot_id_idx ON document_chunks (bot_id);
CREATE INDEX document_chunks_document_id_idx ON document_chunks (document_id);
-- Also add pg_trgm GIN indexes for BM25-like search (see 03-hybrid-search.md)
CREATE INDEX document_chunks_content_trgm_idx ON document_chunks
  USING GIN (content gin_trgm_ops);
```

**Critical**: the `embedding vector` column has **no fixed dimension** — it's
inferred from the first INSERT. Match your embedding provider (Gemini
text-embedding-004 = 768, OpenAI ada-002 = 1536).

### `document_metadata` — LLM-tagged metadata for pre-filter

```sql
document_metadata (
  id serial PRIMARY KEY,
  bot_id int NOT NULL,
  document_id int NOT NULL UNIQUE REFERENCES bot_documents(id) ON DELETE CASCADE,
  doc_name text NOT NULL,
  category text,                     -- '契約' / '報告' / '月報' …
  summary text,
  topics jsonb,                      -- array of strings
  entities jsonb,
  keywords jsonb,
  language text DEFAULT 'zh-TW',
  tagged_at timestamp,
  tagging_status text NOT NULL DEFAULT 'pending',
  tagging_error text
)
CREATE INDEX document_metadata_category_idx ON document_metadata (category);
```

Used by:
- **06-metadata-filter** — pre-filter by category when query intent maps
  to a category
- **10-auto-pin-contracts** — auto-load `category='契約'` docs on comparison
  queries

### `embedding_cache` — cross-tenant embedding reuse

```sql
embedding_cache (
  id serial PRIMARY KEY,
  content_hash text NOT NULL,        -- SHA-256 of the text segment
  provider text NOT NULL,            -- 'gemini' / 'openai' / 'cohere' / …
  model text NOT NULL,
  dimensions int NOT NULL,
  embedding_data real[] NOT NULL,    -- stored as float4[] because dimensions vary
  created_at timestamp NOT NULL DEFAULT NOW(),
  last_accessed_at timestamp NOT NULL DEFAULT NOW(),
  hit_count int NOT NULL DEFAULT 0,
  UNIQUE (content_hash, provider, model)
)
```

Stored as `real[]` rather than `vector` because embedding cache must hold
multiple dimensions — queried via raw SQL, not the pgvector operator. The
cache is a write-through: every `embedSingle()` / `embedBatch()` checks
cache first, then writes on miss.

### `query_cache` — full LLM response replay

```sql
query_cache (
  id serial PRIMARY KEY,
  bot_id int NOT NULL,
  query_hash text NOT NULL,          -- SHA-256 of normalized query
  response_text text NOT NULL,
  chunks_meta jsonb,                 -- { source, preview } for each chunk
  created_at timestamp NOT NULL DEFAULT NOW(),
  UNIQUE (bot_id, query_hash)
)
```

Cache hit bypasses retrieval + LLM entirely — responds from SSE in <100ms.

### `notifications`, `error_logs` — observability

```sql
notifications (
  id serial PRIMARY KEY,
  tenant_id int NOT NULL,
  type text NOT NULL,                -- 'info' | 'doc_processed' | 'doc_failed' | …
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb,                    -- { botId, docId, current, total, … }
  created_at timestamp NOT NULL DEFAULT NOW()
)

error_logs (
  id serial PRIMARY KEY,
  source text NOT NULL,              -- 'backend' / 'frontend'
  level text NOT NULL DEFAULT 'error',
  message text NOT NULL,
  stack text,
  url text, method text, status_code int,
  user_agent text, user_id int, tenant_id int,
  context jsonb,
  created_at timestamp NOT NULL DEFAULT NOW()
)
```

The 2026-04-20 null-byte incident was diagnosed by cross-referencing
`notifications` (showed 188/188 OCR done) with **missing** `doc_failed`
notification and Postgres logs (showed `invalid byte sequence for encoding
"UTF8": 0x00`). Without the explicit `error_logs` fallback in the catch
block (now in place), the incident would have been nearly undiagnosable.

## Optional Tables

- `bot_subordinates` — supervisor bot pattern (cross-bot knowledge sharing)
- `chat_sessions` / `chat_messages` — conversation history
- `chat_connections` — external integration tokens (LINE, widgets)
- `api_tokens` — external API access (tenant-scoped)
- `usage_logs` / `point_transactions` — token usage + billing

## Indexing Priorities (by severity if missing)

1. `document_chunks.bot_id` — every retrieval query starts here. Missing =
   full table scan per query.
2. `document_chunks.document_id` — used on re-embed, doc delete cascade,
   pinned load. Missing = slow cascades.
3. pg_trgm GIN on `document_chunks.content` — BM25 side of hybrid search.
   Missing = minutes-long text search.
4. pgvector HNSW on `document_chunks.embedding` — vector search. Missing =
   still works but linear scan (slow on 100k+ rows).
5. `bot_documents.is_pinned` — pinned lookup on every chat call. Missing =
   slight tax but not critical.

## Migration Notes

- Drizzle migrations in LineBotRAG: `appapi/server/db/migrations/*.sql`
- The `SQL migration runner` (commit `fd71164`) is idempotent — it treats
  Postgres "already exists" errors as success so re-running is safe. Port
  this pattern if you use drizzle-kit; drizzle-kit alone is not idempotent.
