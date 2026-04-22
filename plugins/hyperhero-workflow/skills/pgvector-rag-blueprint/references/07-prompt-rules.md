# 07 - Prompt Rules 1-9 (Verbatim Discipline)

The 9 answer rules enforce verbatim-grade accuracy for legal / contract content.
Prepended to every RAG chat call after the retrieved context block.

Source: appapi/server/utils/rag/llmChat.ts:buildContextBlock

## Rules (summary)

1. Language: Traditional Chinese, Markdown.
2. No internal tags (CONTEXT N, [1], fragment N).
3. Filename verbatim - copy from context header exactly.
4. No number extrapolation - only explicit dates/numbers.
5. Ceiling vs actual - distinguish "upper bound" from "signed".
6. Source marker = {{filename §chapter/p.page}} (doubled curly braces).
7. Excel worksheet also cited: {{file.xlsx worksheet:X}}.
8. Verbatim legal clauses quoted in CJK brackets (natural Chinese quotation).
9. Comparison queries MUST produce Markdown table; each cell has clause-number + verbatim text; missing clauses marked explicitly, never substituted.

## Convention

| Marker | Purpose | Frontend |
|---|---|---|
| CJK-brackets | Verbatim legal clause | plain text |
| double-curly | Source reference | green pill |

The split was introduced 2026-04-22 after a customer flagged that a single delimiter colored legal clauses as pills. See 15-frontend-citation-rendering.md.
