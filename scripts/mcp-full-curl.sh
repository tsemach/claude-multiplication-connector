#!/usr/bin/env bash
# Call the NestJS MCP JSON-RPC endpoint from the shell (no Claude required).
#
# Usage:
#   ./scripts/mcp-full-curl.sh initialize
#   ./scripts/mcp-full-curl.sh tools-list
#   ./scripts/mcp-full-curl.sh tools-call <number> [requestedBy]
#   ./scripts/mcp-full-curl.sh ping
#
# Optional env:
#   MCP_BASE_URL  default http://localhost:3001/mcp-full

set -euo pipefail

MCP_BASE_URL="${MCP_BASE_URL:-http://localhost:3001/mcp-full}"

help_text() {
  cat <<'EOF'
Usage:
  mcp-curl.sh initialize
  mcp-curl.sh tools-list
  mcp-curl.sh tools-call <number> [requestedBy]
  mcp-curl.sh ping

Environment:
  MCP_BASE_URL   MCP POST endpoint (default: http://localhost:3001/mcp-full)
EOF
}

usage_error() {
  help_text >&2
  exit 1
}

post_json() {
  local body=$1
  curl -sS -X POST "$MCP_BASE_URL" \
    -H 'Content-Type: application/json' \
    -d "$body"
  echo
}

cmd="${1:-}"
shift || true

case "$cmd" in
  init | initialize)
    post_json '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
    ;;
  list | tools-list)
    post_json '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
    ;;
  call | tools-call)
    number="${1:-}"
    requested_by="${2:-curl}"
    if [[ -z "$number" ]]; then
      echo 'error: tools-call requires <number>' >&2
      usage_error
    fi
    if ! [[ "$number" =~ ^[0-9]+$ ]]; then
      echo 'error: <number> must be an integer' >&2
      exit 1
    fi
    body=$(
      NUMBER="$number" REQUESTED_BY="$requested_by" node -e '
        console.log(JSON.stringify({
          jsonrpc: "2.0",
          id: 3,
          method: "tools/call",
          params: {
            name: "save_multiplication_table",
            arguments: {
              number: Number(process.env.NUMBER),
              requestedBy: process.env.REQUESTED_BY || "curl"
            }
          }
        }));
      '
    )
    post_json "$body"
    ;;
  ping)
    post_json '{"jsonrpc":"2.0","id":4,"method":"ping","params":{}}'
    ;;
  -h | --help | help)
    help_text
    exit 0
    ;;
  '')
    usage_error
    ;;
  *)
    echo "error: unknown command: $cmd" >&2
    usage_error
    ;;
esac
