/**
 * pgvector-rag-blueprint · Chat handler template
 *
 * Copy this into your server routes. Adapt to your framework (shown in Nitro
 * style for direct compatibility with LineBotRAG). The template wires every
 * layer: SSE with heartbeats, retrieval, enhancement, verbatim-prompt LLM stream.
 *
 * See references/16-chat-handler-wiring.md for the step-by-step explanation.
 */
import { useDatabase } from '~/server/db'
import { bots } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { ragStream } from '~/server/utils/rag/llmChat'
import { createSSEStream, runWithHeartbeats } from '~/server/utils/rag/streamHelper'
import { multiQueryHybridSearch } from '~/server/utils/multiQuery'
import { hybridSearch, type HybridChunk } from '~/server/utils/hybridSearch'
import { applyGuardrail } from '~/server/utils/bedrock-guardrails'
import { getCachedResponse, setCachedResponse } from '~/server/utils/queryCacheStore'
import {
  enhanceChatContext,
  type ChatEnhancementResult,
} from '~/server/utils/rag/chatEnhancements'

function sseEncode(obj: Record<string, unknown>): string {
  return `data: ${JSON.stringify(obj)}\n\n`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    workspaceSlug: string
    message: string
    useCache?: boolean
    useMultiQuery?: boolean
  }>(event)

  if (!body.message || !body.workspaceSlug) {
    throw createError({ statusCode: 400, message: 'message and workspaceSlug are required' })
  }

  const db = useDatabase()
  const [bot] = await db.select().from(bots).where(eq(bots.workspaceSlug, body.workspaceSlug)).limit(1)
  if (!bot) throw createError({ statusCode: 404, message: 'Bot not found' })

  // Guardrail
  const guard = await applyGuardrail(body.message, 'INPUT')
  if (guard.blocked) {
    return new Response(
      sseEncode({ type: 'guardrail', textResponse: guard.blockedMessage, close: true }),
      { headers: { 'Content-Type': 'text/event-stream' } },
    )
  }

  const { buildSearchOptionsFromBot } = await import('~/server/utils/rag/botSearchOptions')
  const baseSearchOpts = buildSearchOptionsFromBot(bot, body.message)
  const useCache = body.useCache !== false
  const useMultiQuery = body.useMultiQuery !== undefined ? body.useMultiQuery : baseSearchOpts.useMultiQuery

  // Cache replay (pre-SSE shortcut — optional)
  if (useCache) {
    const cached = await getCachedResponse(bot.id, body.message)
    if (cached) {
      const payload = [
        sseEncode({ type: 'cacheHit', close: false }),
        sseEncode({ type: 'textResponseChunk', textResponse: cached.responseText, close: false }),
        sseEncode({ type: 'finalizeResponseStream', close: true }),
      ].join('')
      return new Response(payload, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', 'X-Cache': 'HIT' },
      })
    }
  }

  // NARROW bot for async-generator closure
  const activeBot = bot

  const retrievalState: {
    chunks: HybridChunk[]
    enhancement: ChatEnhancementResult | null
  } = { chunks: [], enhancement: null }

  async function* pipeline() {
    // Retrieval (multi-query OR single) inside generator so heartbeats flush
    if (useMultiQuery) {
      yield* runWithHeartbeats(
        () => multiQueryHybridSearch(activeBot, body.message, baseSearchOpts),
        (mq) => { retrievalState.chunks = mq.chunks },
      )
    } else {
      yield* runWithHeartbeats(
        () => hybridSearch(activeBot, body.message, baseSearchOpts),
        (c) => { retrievalState.chunks = c },
      )
    }

    // Enhancement (pinned, comparison-mode, auto-pin-contracts, temporal boost)
    yield* runWithHeartbeats(
      () => enhanceChatContext(activeBot, body.message, retrievalState.chunks),
      (enh) => {
        retrievalState.enhancement = enh
        retrievalState.chunks = enh.chunks
      },
    )

    // LLM stream with pinnedBlock prepended
    const systemPrompt = activeBot.systemPrompt || ''
    yield* ragStream(
      activeBot.id, activeBot.tenantId, systemPrompt,
      body.message, [] /* history */, retrievalState.chunks,
      { pinnedBlock: retrievalState.enhancement!.pinnedBlock },
    )
  }

  // Consider tee-wrapping pipeline() to also: resolve {{CONTEXT N}} refs,
  // capture fullResponse for setCachedResponse, enforce hard line/total
  // length limits. See LineBotRAG chat/hybrid-stream.post.ts for the full
  // tee pattern with CONTEXT resolver.

  return new Response(createSSEStream(pipeline()), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'X-Cache': 'MISS',
      'X-Streaming-Retrieval': 'true',
    },
  })
})
