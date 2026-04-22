# 14 · Postgres UTF-8 Null-Byte Safety

PostgreSQL UTF-8 TEXT columns reject any byte `\x00`. PDFs (especially
scanned or merged ones) occasionally emit `\x00` for low-confidence
glyphs or embedded image metadata. ONE byte breaks the whole INSERT.

Source: `appapi/server/utils/rag/pdfExtractor.ts:sanitizeForPostgresText`

## Function

```ts
export function sanitizeForPostgresText(text: string): string {
  // Strip \x00 plus other C0 control chars (except \t \n \r). Also DEL \x7F.
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}
```

Preserves: tab, LF, CR, all non-ASCII UTF-8 (CJK, emoji, diacritics).

## Defense in Depth — applied at 3 points

1. **pdfExtractor return** — sanitize before handing content upstream
2. **documentPipeline.processAndEmbedDocument** — covers DOCX/TXT/MD/HTML
   pipelines that don't route through pdfExtractor
3. **upload.post.ts** — re-apply before writing `content` column to DB

## Incident (2026-04-20)

A 188-page scanned PDF uploaded to the `仁愛之家` bot:
- OCR completed cleanly (188/188 progress notification written)
- Write to `bot_documents.content` failed with Postgres log:
  `ERROR: invalid byte sequence for encoding "UTF8": 0x00`
- Catch block ran; `doc_failed` notification insert ALSO failed because
  the Postgres connection was in aborted state
- User saw "failed" status with ZERO error trail in UI or `error_logs`

After fix: same PDF revealed **1575 control chars stripped**, 285 chunks
embedded, 8m34s end-to-end.

## Observability Hardening

The catch block now wraps each recovery step in its own try/catch so a
cascading abort cannot wipe all three:

```ts
try { update status = embed_failed }         catch { log }
try { insert doc_failed notification }        catch { log }
try { insert error_logs row (last resort) }   catch { log }
```

## Recovery Caveat

If `bot_documents.content` is NULL (write failed), the re-embed endpoint
refuses because it reuses the stored content. User must delete the failed
row and re-upload.

## Tests

`appapi/test/utils/sanitizeForPostgresText.test.ts` — 12 tests covering
`\x00`, other C0, CJK preservation, emoji preservation, idempotence.
