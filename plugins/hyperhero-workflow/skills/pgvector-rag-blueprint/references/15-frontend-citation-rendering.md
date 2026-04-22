# 15 · Frontend Citation Rendering

Two markers, two meanings:

| Marker | Purpose | Frontend |
|---|---|---|
| `『...』` (CJK brackets) | Verbatim legal clause (natural Chinese quotation) | plain text, quotes preserved |
| `{{...}}` (double curly) | Source reference (filename + chapter + page) | green ctx-tag pill |

Source: `appf/components/chat/ChatMarkdown.vue` + `appf/utils/sourceRefHeuristic.ts`

## Why Two Markers

Earlier version used `『...』` for both. Customer (2026-04-22) flagged:
contract text naturally contains `『』` for book titles, emphasized terms,
or nested quotations (`『"銷售收入"之定義』`). Coloring everything inside
made the UI chaotic — legal clauses appeared as solid green blocks.

Switching source refs to `{{...}}` — which never appears in natural
Chinese prose — resolves the collision with zero ambiguity.

## Decoration Logic

`decorateContextTags()` in `ChatMarkdown.vue`:

1. **Primary**: wrap every `{{...}}` as ctx-tag green pill (always)
2. **Backward-compat**: for legacy `『...』` in old chat history rows,
   apply `looksLikeSourceRef` heuristic — only wrap if the content
   contains a file extension OR chapter/page marker; else leave plain

## Heuristic Pattern (legacy compat)

`sourceRefHeuristic.ts` matches:
```
.pdf | .docx | .xlsx | .pptx | .txt | .md | .html
§N
第N章|節|條|項|款|頁
p.N
```

Zero false positives on actual legal clause text (tested against
the exact 2026-04-22 customer screenshot phrases).

## Tests

`appf/test/nuxt/sourceRefHeuristic.test.ts` — 28 cases:
- 25 positive (file exts, chapter markers, Chinese numerals)
- 8 negative (customer screenshot clauses + list labels + generic legal)
- 4 edge (empty, embedded marker, bare noun, English "PDF" token)
