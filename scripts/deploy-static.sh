#!/usr/bin/env bash

set -euo pipefail

DIST_DIR="${DIST_DIR:-dist}"

: "${DEPLOY_PATH:?DEPLOY_PATH is required}"

echo "========== Deploy =========="

echo "Build Dir : ${DIST_DIR}"
echo "Deploy To : ${DEPLOY_PATH}"

if [[ ! -d "${DIST_DIR}" ]]; then
    echo "ERROR: ${DIST_DIR} 不存在"
    exit 1
fi

if [[ ! -f "${DIST_DIR}/index.html" ]]; then
    echo "ERROR: dist/index.html 不存在"
    exit 1
fi

mkdir -p "${DEPLOY_PATH}"

echo "Cleaning old files..."

rsync -av --delete "${DIST_DIR}/" "${DEPLOY_PATH}/"

echo "========== Deploy Finished =========="