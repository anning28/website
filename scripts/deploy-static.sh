#!/usr/bin/env bash
set -euo pipefail

DIST_DIR="${DIST_DIR:-dist}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
RSYNC_DELETE="${RSYNC_DELETE:-true}"

: "${DEPLOY_HOST:?DEPLOY_HOST is required}"
: "${DEPLOY_USER:?DEPLOY_USER is required}"
: "${DEPLOY_PATH:?DEPLOY_PATH is required}"

if [[ ! -d "$DIST_DIR" ]]; then
  echo "Build output directory not found: $DIST_DIR" >&2
  exit 1
fi

if [[ ! -f "$DIST_DIR/index.html" ]]; then
  echo "Build output is missing index.html: $DIST_DIR/index.html" >&2
  exit 1
fi

if [[ "$DEPLOY_PATH" != /* ]]; then
  echo "DEPLOY_PATH must be an absolute path: $DEPLOY_PATH" >&2
  exit 1
fi

if [[ "$DEPLOY_PATH" == "/" ]]; then
  echo "Refusing to deploy to /" >&2
  exit 1
fi

REMOTE="${DEPLOY_USER}@${DEPLOY_HOST}"
REMOTE_PATH="$(printf '%q' "$DEPLOY_PATH")"
SSH_COMMAND="ssh -p ${DEPLOY_PORT} -o StrictHostKeyChecking=accept-new"
RSYNC_ARGS=(-az --checksum --delay-updates)

if [[ "$RSYNC_DELETE" == "true" ]]; then
  RSYNC_ARGS+=(--delete)
fi

$SSH_COMMAND "$REMOTE" "mkdir -p ${REMOTE_PATH}"
rsync "${RSYNC_ARGS[@]}" -e "$SSH_COMMAND" "${DIST_DIR%/}/" "${REMOTE}:${DEPLOY_PATH%/}/"

echo "Deployed ${DIST_DIR}/ to ${REMOTE}:${DEPLOY_PATH%/}/"
