# 16 Chat Handler Wiring Blueprint

End-to-end integration of all layers. Use assets/chat-handler-template.ts as starting code.

## Required Parts

1. Bot lookup by workspaceSlug to get bot record with tenantId
2. Guardrail input scan (toxic content block)
3. Query cache lookup (if hit, replay as SSE with X-Cache: HIT)
4. buildSearchOptionsFromBot(bot, message) returns retrieval opts
5. Open SSE Response IMMEDIATELY (before retrieval) using createSSEStream(pipeline())
6. pipeline generator:
   - runWithHeartbeats over multiQuery OR hybridSearch
   - runWithHeartbeats over enhanceChatContext
   - yield-from ragStream with pinnedBlock
7. Tee the stream: accumulate fullResponse and resolveContextRefs at sources event
8. Post-stream: save to queryCache, persist chatMessages

## Bot Narrowing

The outer `if (!bot) throw` pattern does NOT carry narrowing into async
generator closures in TypeScript. Capture as `const activeBot = bot`
(after the throw) and reference `activeBot` inside the generator.

## Critical Gotchas

- Do not set dynamic response headers (X-Pinned-Docs etc) - headers flush
  before retrieval results exist. Use static X-Streaming-Retrieval: true marker instead.
- Do not forget to sanitize content before DB write (see 14).
- Do not use CJK brackets for new source refs (see 15); emit double-curly.

## 10 LineBotRAG handlers using this pattern

Internal: chat/hybrid-stream, chat/stream, chat/c/[guid]/sessions/[sessionId]/stream, chat/index (blocking variant)
Public: public/chat/[publicId]/stream, public/chat/[publicId]/thread/[threadSlug]/stream, public/chat/[publicId]/index
External: v1/external/bots/[id]/chat, v1/external/bots/[id]/chat/stream
Inbox: inbox/conversations/[id]/messages
