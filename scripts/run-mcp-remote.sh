#!/usr/bin/env bash
# Run mcp-remote with Node 20+ (required by undici; Node 18 crashes with ReferenceError: File is not defined).
# Use this as claude_desktop_config.json "command" when a security wrapper pins Node 18 on PATH.
#
# Extra mcp-remote flags (e.g. --debug) can be passed through this script:
#   claude_desktop_config.json → server.args: ["--debug"]
# Debug logs are written under ~/.mcp-auth/ (see mcp-remote). If the MCP child exits right after
# initialize, check stderr for "Shutting down..." — mcp-remote exits on stdin EOF; a wrapper or
# host closing the pipe looks like "process exiting early" in Claude Desktop logs.
set -euo pipefail
URL="${MCP_REMOTE_URL:-http://127.0.0.1:3001/mcp-save}"
NVM_NODES="${NVM_DIR:-$HOME/.nvm}/versions/node"

pick_npx() {
  [[ -d "$NVM_NODES" ]] || return 1
  local v dir
  while IFS= read -r v; do
    dir="$NVM_NODES/$v/bin"
    [[ -x "$dir/node" ]] || continue
    if "$dir/node" -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 20 ? 0 : 1)' 2>/dev/null; then
      printf '%s\n' "$dir/npx"
      return 0
    fi
  done < <(ls -1 "$NVM_NODES" 2>/dev/null | LC_ALL=C sort -Vr)
  return 1
}

NPX="$(pick_npx || true)"
if [[ -n "$NPX" ]]; then
  # npx runs the downloaded package with `node` from PATH; prepend this Node so it is not v18.
  export PATH="$(dirname "$NPX"):$PATH"
  exec "$NPX" -y mcp-remote@0.1.38 "$URL" "$@"
fi
exec npx -y mcp-remote@0.1.38 "$URL" "$@"
