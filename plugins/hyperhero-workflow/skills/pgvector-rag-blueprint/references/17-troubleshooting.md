# 17 Troubleshooting Playbook

Common incidents, diagnostic SQL, fix pattern references.

## Symptom: doc status=embed_failed, chunks=null, content=null, no doc_failed notification

Cause: Postgres UTF-8 null-byte on content INSERT. See 14-null-byte-sanitization.md.
Postgres log shows: `invalid byte sequence for encoding "UTF8": 0x00`

Diagnostic SQL:
```sql
SELECT id, doc_name, status, chunk_count,
       (content IS NULL) AS content_null,
       uploaded_at, updated_at
FROM bot_documents
WHERE bot_id = $1 AND status = 'embed_failed';
```

Fix: deploy sanitizeForPostgresText. User must delete failed row and
re-upload (content column is NULL, re-embed endpoint refuses).

## Symptom: frontend 502 at ~60s, backend logs show stream completed 8min later

Cause: Railway edge proxy idle timeout during long retrieval. See 13-streaming-sse.md.

Fix: Move retrieval INSIDE the SSE generator with runWithHeartbeats.
Bytes flush every 15s.

## Symptom: comparison table has thin/missing rows for one document

Cause: retrieval top-N diluted the big doc's chunks. See 10-auto-pin-contracts.md.

Fix paths:
1. User explicitly pins both docs (08-pinned-content)
2. Enable auto-pin-on-comparison (10-auto-pin-contracts)
3. Enable perDocTopNMode=true (12-per-doc-topn)

## Symptom: verbatim clauses appear as color blocks (not just source refs)

Cause: frontend decorates all CJK-bracket spans as pills. See 15-frontend-citation-rendering.md.

Fix: Deploy double-curly source marker + narrow CJK bracket decoration
behind heuristic. Also update Rule 6 prompt to emit double-curly.

## Symptom: multi-query retrieval takes 6+ minutes

Root: multiQueryHybridSearch runs hybridSearch(variant_i) sequentially.
See 04-multi-query.md.

Fix: Promise.all parallel dispatch.

## Diagnostic Scripts

scripts/diagnose-doc.mjs.template - template for investigating a doc
stuck in embed_failed. Queries bot_documents, document_chunks,
notifications, error_logs and prints a fault tree.

## Postgres Log Time Zones (Railway)

Postgres container logs with local timezone but labels them as UTC.
For GMT+8 containers: subtract 8h from Postgres log timestamps to
match Railway app log UTC times.
