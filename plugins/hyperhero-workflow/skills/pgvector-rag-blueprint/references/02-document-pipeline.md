# 02 · Document Pipeline

Upload → OCR → chunk → embed → metadata tag. Runs async via fire-and-forget
IIFE after the HTTP upload response returns, so the user's browser doesn't
hold the connection for 8-10 minutes on a 188-page scanned PDF.

## Source File

`appapi/server/api/bots/[id]/documents/upload.post.ts`

## Flow

```
[HTTP POST /api/bots/:id/documents/upload]
  ↓
1. Parse multipart/form-data → fileBuffer, filename, mimeType
   Reject if fileBuffer > MAX_FILE_SIZE (100MB)
   Reject if content_hash already exists for this bot (dedupe)
  ↓
2. INSERT bot_documents (status='uploaded')
  ↓
3. Return 200 immediately with docRecord.id
  ↓
   (IIFE background — the rest runs fire-and-forget)
  ↓
4. extractPdfHybrid (or similar per mimeType)
   - Per-page: try text extraction first (mupdf)
   - If text count < threshold: route to OCR provider
   - OCR provider is pluggable (tesseract / mistral / google / gemini)
   - Emit progress notifications every 50% and 100%
  ↓
5. sanitizeForPostgresText(result.content)
   Strip \x00 + C0 control chars — see 14-null-byte-sanitization.md
  ↓
6. UPDATE bot_documents SET content=safeContent, status='processing'
  ↓
7. processAndEmbedDocument
   - chunkText(content) — see below
   - DELETE existing chunks for this document_id
   - embedAndStoreChunks(chunks) — batched, cache-aware
   - UPDATE bot_documents SET status='embedded'|'embed_partial'|'embed_failed'
  ↓
8. tagDocumentInBackground — LLM populates document_metadata
   (category, topics, keywords, entities)
  ↓
9. emitEvent('doc:processed') — SSE event to any open admin UI
```

## Chunking

`appapi/server/utils/rag/chunker.ts`

- Target ~400 tokens per chunk with ~50 token overlap (tunable)
- Splits on paragraph boundaries first, then sentences, then hard cut
- Extracts `chunk_title` heuristically (leading `第X條` / `2.2 XXX` patterns)
- Extracts `chunk_keywords` via simple term frequency (or LLM if enabled)
- `estimateTokens(text)`: CJK char = 1 token, other word = 1.3 tokens
  (rough but avoids a tokenizer dependency)

## Embedding + Cache

`appapi/server/utils/rag/embedding.ts` + `embeddingCache.ts`

- `embedBatch(texts)` — call provider's batch API (Gemini
  `text-embedding-004`, OpenAI `text-embedding-3-large`, Cohere `embed-v3`)
- Before the API call: check `embedding_cache` by SHA-256(content) +
  (provider, model, dimensions). Hit returns cached float[].
- On API response: write-through to cache.
- Retry on transient failures (`gemini-embed-error-classify.ts` — separates
  QUOTA_EXCEEDED from 503 overload; only retries the latter).

## Status Transitions

```
uploaded → processing → embedded         ← happy path
                    → embed_partial     ← some chunks failed to embed
                    → embed_failed      ← everything failed or content is null

embed_partial/embed_failed → (user clicks "重新嵌入") → processing → …
```

`re-embed` endpoint reuses `bot_documents.content` — but if that column
is NULL (e.g., Postgres UTF-8 error on initial write), re-embed refuses
and user must re-upload. This was the exact failure mode of the 2026-04-20
null-byte incident; see `17-troubleshooting.md`.

## Observability

Every stage writes to `notifications` with `type='info' | 'doc_processed'
| 'doc_failed' | 'doc_partial'`. The catch block writes TWO or THREE
independent try/catches:

```ts
try { update status=embed_failed } catch { log }
try { insert doc_failed notification } catch { log }
try { insert error_logs row } catch { log }  // last line of defense
```

Before this defensive structure (2026-04-20 incident), a Postgres-connection-
aborted error in one step would silently skip the others, leaving the UI
with "failed" and zero error trail.

## Token Budget per Doc

Upload accepts up to **100 MB** (server-side `MAX_FILE_SIZE`). The
sanitized text from a 60MB scanned PDF is typically 100-200k chars
(~50-100k tokens). That fits in any modern LLM context but NOT in the
default pinned budget of a Claude-sized model — see `08-pinned-content.md`.

## Tests

`appapi/test/utils/pdfExtractor.test.ts` — embedded image OCR toggle
`appapi/test/utils/sanitizeForPostgresText.test.ts` — null byte safety
`appapi/test/utils/chunker.test.ts` — chunk boundaries
