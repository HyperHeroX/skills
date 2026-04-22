-- pgvector-rag-blueprint schema template
-- Adapt to your migration tool (Drizzle, Prisma, raw SQL).
-- Requires: PostgreSQL 15+, pgvector, pg_trgm

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Tenants + Bots (simplified — your multi-tenant plumbing may differ)
CREATE TABLE tenants (
  id serial PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE bots (
  id serial PRIMARY KEY,
  tenant_id int NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  workspace_slug text UNIQUE NOT NULL,
  public_id text UNIQUE NOT NULL,
  system_prompt text,
  temperature text,
  top_n int,                         -- legacy; prefer tier in settings JSONB
  similarity_threshold text,         -- parsed as float
  settings jsonb,                    -- all per-bot knobs live here
  status text NOT NULL DEFAULT 'active',
  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW()
);
CREATE INDEX bots_tenant_id_idx ON bots (tenant_id);
CREATE INDEX bots_workspace_slug_idx ON bots (workspace_slug);

-- Documents
CREATE TABLE bot_documents (
  id serial PRIMARY KEY,
  bot_id int NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  tenant_id int NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  doc_name text NOT NULL,
  file_size int,
  file_type text,
  status text NOT NULL DEFAULT 'uploaded',
  is_embedded bool NOT NULL DEFAULT false,
  is_pinned bool NOT NULL DEFAULT false,
  content text,                      -- sanitized (no \x00) — see skill ref 14
  token_count int,
  chunk_count int,
  expected_chunk_count int,
  content_hash text,
  uploaded_at timestamp NOT NULL DEFAULT NOW(),
  embedded_at timestamp,
  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW(),
  UNIQUE (bot_id, doc_name)
);
CREATE INDEX bot_documents_bot_id_idx ON bot_documents (bot_id);
CREATE INDEX bot_documents_is_pinned_idx ON bot_documents (is_pinned);
CREATE INDEX bot_documents_content_hash_idx ON bot_documents (bot_id, content_hash);

-- Chunks (the retrievable unit)
CREATE TABLE document_chunks (
  id serial PRIMARY KEY,
  bot_id int NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  document_id int NOT NULL REFERENCES bot_documents(id) ON DELETE CASCADE,
  doc_name text NOT NULL,
  chunk_index int NOT NULL,
  content text NOT NULL,
  chunk_title text,
  chunk_keywords text[],
  chunk_question text,
  vector_id text,
  embedding vector,                  -- dim inferred on first INSERT; match your provider
  token_count int,
  created_at timestamp NOT NULL DEFAULT NOW()
);
CREATE INDEX document_chunks_bot_id_idx ON document_chunks (bot_id);
CREATE INDEX document_chunks_document_id_idx ON document_chunks (document_id);
CREATE INDEX document_chunks_content_trgm_idx ON document_chunks USING GIN (content gin_trgm_ops);
-- HNSW for vector search (tune m/ef_construction per corpus size):
-- CREATE INDEX document_chunks_embedding_idx ON document_chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- Metadata
CREATE TABLE document_metadata (
  id serial PRIMARY KEY,
  bot_id int NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  document_id int NOT NULL UNIQUE REFERENCES bot_documents(id) ON DELETE CASCADE,
  doc_name text NOT NULL,
  category text,
  summary text,
  topics jsonb,
  entities jsonb,
  keywords jsonb,
  language text DEFAULT 'zh-TW',
  tagged_at timestamp,
  tagging_status text NOT NULL DEFAULT 'pending',
  tagging_error text
);
CREATE INDEX document_metadata_category_idx ON document_metadata (category);

-- Embedding cache (dimension-agnostic)
CREATE TABLE embedding_cache (
  id serial PRIMARY KEY,
  content_hash text NOT NULL,
  provider text NOT NULL,
  model text NOT NULL,
  dimensions int NOT NULL,
  embedding_data real[] NOT NULL,
  hit_count int NOT NULL DEFAULT 0,
  last_accessed_at timestamp NOT NULL DEFAULT NOW(),
  created_at timestamp NOT NULL DEFAULT NOW(),
  UNIQUE (content_hash, provider, model)
);

-- Query cache (full LLM response replay)
CREATE TABLE query_cache (
  id serial PRIMARY KEY,
  bot_id int NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  query_hash text NOT NULL,
  response_text text NOT NULL,
  chunks_meta jsonb,
  created_at timestamp NOT NULL DEFAULT NOW(),
  UNIQUE (bot_id, query_hash)
);

-- Observability
CREATE TABLE notifications (
  id serial PRIMARY KEY,
  tenant_id int NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb,
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE error_logs (
  id serial PRIMARY KEY,
  source text NOT NULL,
  level text NOT NULL DEFAULT 'error',
  message text NOT NULL,
  stack text,
  url text, method text, status_code int,
  user_agent text, user_id int, tenant_id int,
  context jsonb,
  created_at timestamp NOT NULL DEFAULT NOW()
);
CREATE INDEX error_logs_created_at_idx ON error_logs (created_at);
