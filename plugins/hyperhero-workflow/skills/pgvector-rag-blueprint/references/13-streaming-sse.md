# 13 · Streaming SSE with Heartbeats

SSE chat streams must emit bytes steadily or edge proxies (Railway ~60s,
Cloudflare ~100s) cut the connection. Retrieval that takes 5+ minutes
will blow through any idle timeout.

Source: `appapi/server/utils/rag/streamHelper.ts` (`createSSEStream`, `runWithHeartbeats`)

## Pattern

Build the SSE generator in this order — all inside the generator, NOT
before Response:

```ts
async function* pipeline() {
  // createSSEStream flushes ": stream-start\n\n" immediately before
  // iterating the generator, so first byte is out within microseconds.

  yield* runWithHeartbeats(
    () => doRetrieval(bot, query, opts),
    (chunks) => { state.chunks = chunks },
  )
  yield* runWithHeartbeats(
    () => enhanceChatContext(bot, query, state.chunks),
    (enh) => { state.enhancement = enh; state.chunks = enh.chunks },
  )
  yield* ragStream(bot.id, bot.tenantId, systemPrompt, query, history,
                   state.chunks, { pinnedBlock: state.enhancement.pinnedBlock })
}

return new Response(createSSEStream(pipeline()), {
  headers: { 'Content-Type': 'text/event-stream' },
})
```

## runWithHeartbeats

Races the work promise against a 15-second timer. On timer win (promise
pending), yields a `heartbeat` event. Loop until promise settles. Throws
on rejection.

`heartbeat` events serialize as SSE comments (`: heartbeat <timestamp>`).
EventSource clients ignore comments per spec → zero frontend change.

## Incident (2026-04-21)

Earlier implementation did retrieval BEFORE returning the Response. A
381s multi-query retrieval meant Railway edge 502d the client while the
backend completed fine. User saw "failed" with no trail.

## Handlers Using This Pattern (5)

- `chat/hybrid-stream.post.ts`
- `chat/stream.post.ts`
- `chat/c/[guid]/sessions/[sessionId]/stream.post.ts`
- `public/chat/[publicId]/stream.post.ts`
- `public/chat/[publicId]/thread/[threadSlug]/stream.post.ts`
- `v1/external/bots/[id]/chat/stream.post.ts`
