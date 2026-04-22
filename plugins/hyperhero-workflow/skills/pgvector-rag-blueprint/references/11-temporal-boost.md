# 11 - Temporal Proximity Boost

When query contains "new/latest/current" or "old/original/prior" keywords, scale chunk scores +-10 percent based on doc uploaded_at.

Source: appapi/server/utils/rag/temporalBoost.ts

## Detection

Three-way match:
- NEWER keywords only -> newer-first
- OLDER keywords only -> older-first
- Both (e.g. "new vs old") or neither -> no boost

## Math

Range [min, max] of uploaded_at across chunk-source docs.
If span < 7 days: skip (same batch).
t = (doc.uploaded_at - min) / span in [0, 1]
newer-first: score *= 0.92 + t * 0.18  (oldest 0.92, newest 1.10)
older-first: score *= 1.10 - t * 0.18

+-10 percent: small enough not to override strong semantics, big enough to flip ties.

## Opt-out

bot.settings.disableTemporalBoost = true

## Limitations

Requires uploaded_at to reflect actual document age; if users re-upload on updates, add a content_date column.

## Tests

appapi/test/utils/temporalBoost.test.ts (18 tests)
