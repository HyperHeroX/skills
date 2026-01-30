#!/bin/bash

# DevTem Stop Hook
# Prevents session exit when a devtem-loop is active
# Based on ralph-wiggum: https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum

set -euo pipefail

# Read hook input from stdin (advanced stop hook API)
HOOK_INPUT=$(cat)

# Check if devtem-loop is active
DEVTEM_STATE_FILE=".claude/devtem-loop.local.md"

if [[ ! -f "$DEVTEM_STATE_FILE" ]]; then
  # No active loop - allow exit
  exit 0
fi

# Parse markdown frontmatter (YAML between ---) and extract values
FRONTMATTER=$(sed -n '/^---$/,/^---$/{ /^---$/d; p; }' "$DEVTEM_STATE_FILE")
ITERATION=$(echo "$FRONTMATTER" | grep '^iteration:' | sed 's/iteration: *//')
MAX_ITERATIONS=$(echo "$FRONTMATTER" | grep '^max_iterations:' | sed 's/max_iterations: *//')
COMPLETION_PROMISE=$(echo "$FRONTMATTER" | grep '^completion_promise:' | sed 's/completion_promise: *//' | sed 's/^"\(.*\)"$/\1/')
FEATURE_NAME=$(echo "$FRONTMATTER" | grep '^feature_name:' | sed 's/feature_name: *//' | sed 's/^"\(.*\)"$/\1/')

# Validate numeric fields
if [[ ! "$ITERATION" =~ ^[0-9]+$ ]]; then
  echo "⚠️  DevTem loop: State file corrupted (invalid iteration)" >&2
  rm "$DEVTEM_STATE_FILE"
  exit 0
fi

if [[ ! "$MAX_ITERATIONS" =~ ^[0-9]+$ ]]; then
  echo "⚠️  DevTem loop: State file corrupted (invalid max_iterations)" >&2
  rm "$DEVTEM_STATE_FILE"
  exit 0
fi

# Check if max iterations reached
if [[ $MAX_ITERATIONS -gt 0 ]] && [[ $ITERATION -ge $MAX_ITERATIONS ]]; then
  echo "🛑 DevTem loop: Max iterations ($MAX_ITERATIONS) reached."
  rm "$DEVTEM_STATE_FILE"
  exit 0
fi

# Get transcript path from hook input
TRANSCRIPT_PATH=$(echo "$HOOK_INPUT" | jq -r '.transcript_path')

if [[ ! -f "$TRANSCRIPT_PATH" ]]; then
  echo "⚠️  DevTem loop: Transcript file not found" >&2
  rm "$DEVTEM_STATE_FILE"
  exit 0
fi

# Read last assistant message from transcript
if ! grep -q '"role":"assistant"' "$TRANSCRIPT_PATH"; then
  echo "⚠️  DevTem loop: No assistant messages found" >&2
  rm "$DEVTEM_STATE_FILE"
  exit 0
fi

LAST_LINE=$(grep '"role":"assistant"' "$TRANSCRIPT_PATH" | tail -1)
LAST_OUTPUT=$(echo "$LAST_LINE" | jq -r '
  .message.content |
  map(select(.type == "text")) |
  map(.text) |
  join("\n")
' 2>&1)

if [[ $? -ne 0 ]] || [[ -z "$LAST_OUTPUT" ]]; then
  echo "⚠️  DevTem loop: Failed to parse assistant message" >&2
  rm "$DEVTEM_STATE_FILE"
  exit 0
fi

# Check for DEVTEM_STATUS block with EXIT_SIGNAL: true
if echo "$LAST_OUTPUT" | grep -q "EXIT_SIGNAL: true"; then
  # Check for completion promise
  if [[ -n "$COMPLETION_PROMISE" ]]; then
    PROMISE_TEXT=$(echo "$LAST_OUTPUT" | perl -0777 -pe 's/.*?<promise>(.*?)<\/promise>.*/$1/s; s/^\s+|\s+$//g' 2>/dev/null || echo "")
    if [[ "$PROMISE_TEXT" = "$COMPLETION_PROMISE" ]]; then
      echo "✅ DevTem loop: Detected <promise>$COMPLETION_PROMISE</promise> with EXIT_SIGNAL: true"
      rm "$DEVTEM_STATE_FILE"
      exit 0
    fi
  fi
fi

# Check if all steps complete (read from status.json if exists)
if [[ -f "docs/.devtem/status.json" ]]; then
  CURRENT_STEP=$(jq -r '.current_step // 0' docs/.devtem/status.json 2>/dev/null || echo "0")
  EXIT_SIGNAL=$(jq -r '.exit_signal // false' docs/.devtem/status.json 2>/dev/null || echo "false")
  
  # If step > 11 and exit_signal is true, allow exit
  if [[ "$CURRENT_STEP" -gt 11 ]] && [[ "$EXIT_SIGNAL" == "true" ]]; then
    echo "✅ DevTem loop: All steps complete, exit_signal=true"
    rm "$DEVTEM_STATE_FILE"
    exit 0
  fi
fi

# Check circuit breaker
if [[ -f "docs/.devtem/circuit_breaker.json" ]]; then
  CB_STATE=$(jq -r '.state // "CLOSED"' docs/.devtem/circuit_breaker.json 2>/dev/null || echo "CLOSED")
  
  if [[ "$CB_STATE" == "OPEN" ]]; then
    echo "🚫 DevTem loop: Circuit breaker OPEN - require user intervention" >&2
    echo "   Run '/devtem-loop continue' to reset and continue, or '/cancel-devtem' to stop." >&2
    
    # Don't remove state file, but allow exit with system message
    jq -n \
      --arg msg "🚫 Circuit breaker OPEN. Run 'continue' to reset or '/cancel-devtem' to stop." \
      '{
        "decision": "approve",
        "systemMessage": $msg
      }'
    exit 0
  fi
fi

# Not complete - continue loop with SAME PROMPT
NEXT_ITERATION=$((ITERATION + 1))

# Extract prompt (everything after the closing ---)
PROMPT_TEXT=$(awk '/^---$/{i++; next} i>=2' "$DEVTEM_STATE_FILE")

if [[ -z "$PROMPT_TEXT" ]]; then
  echo "⚠️  DevTem loop: State file corrupted (no prompt)" >&2
  rm "$DEVTEM_STATE_FILE"
  exit 0
fi

# Update iteration in frontmatter
TEMP_FILE="${DEVTEM_STATE_FILE}.tmp.$$"
sed "s/^iteration: .*/iteration: $NEXT_ITERATION/" "$DEVTEM_STATE_FILE" > "$TEMP_FILE"
mv "$TEMP_FILE" "$DEVTEM_STATE_FILE"

# Update session history
if [[ -f "docs/.devtem/session_history.md" ]]; then
  CURRENT_ROLE=$(jq -r '.current_role // "Unknown"' docs/.devtem/status.json 2>/dev/null || echo "Unknown")
  CURRENT_STEP=$(jq -r '.current_step // 0' docs/.devtem/status.json 2>/dev/null || echo "0")
  echo "### $(date -u +%Y-%m-%dT%H:%M:%SZ) - Iteration $NEXT_ITERATION" >> docs/.devtem/session_history.md
  echo "- Step: $CURRENT_STEP" >> docs/.devtem/session_history.md
  echo "- Role: $CURRENT_ROLE" >> docs/.devtem/session_history.md
  echo "" >> docs/.devtem/session_history.md
fi

# Build system message
CURRENT_STEP_INFO=""
if [[ -f "docs/.devtem/status.json" ]]; then
  CURRENT_STEP=$(jq -r '.current_step // 1' docs/.devtem/status.json 2>/dev/null || echo "1")
  CURRENT_ROLE=$(jq -r '.current_role // "Product Manager"' docs/.devtem/status.json 2>/dev/null || echo "Product Manager")
  CURRENT_STEP_INFO=" | Step $CURRENT_STEP as $CURRENT_ROLE"
fi

SYSTEM_MSG="🎭 DevTem iteration $NEXT_ITERATION$CURRENT_STEP_INFO | To complete: all 11 steps + <promise>$COMPLETION_PROMISE</promise>"

# Output JSON to block the stop and feed prompt back
jq -n \
  --arg prompt "$PROMPT_TEXT" \
  --arg msg "$SYSTEM_MSG" \
  '{
    "decision": "block",
    "reason": $prompt,
    "systemMessage": $msg
  }'

exit 0
