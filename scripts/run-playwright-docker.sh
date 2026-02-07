#!/usr/bin/env bash
set -euo pipefail

# scripts/run-playwright-docker.sh
# Helper para ejecutar Playwright dentro de un contenedor y generar capturas de una lección
# Usage:
#   ./scripts/run-playwright-docker.sh <lessonId> [outputPrefix] [minioPublicEndpoint] [backendApi]
# Example:
#   ./scripts/run-playwright-docker.sh 22 lesson-22 http://host.docker.internal:9000 http://localhost:8080

LESSON_ID=${1:-}
OUT_PREFIX=${2:-lesson-${LESSON_ID}}
MINIO_PUBLIC_ENDPOINT=${3:-http://host.docker.internal:9000}
BACKEND_API=${4:-http://localhost:8080}

if [ -z "${LESSON_ID}" ]; then
  echo "Usage: $0 <lessonId> [outputPrefix] [minioPublicEndpoint] [backendApi]"
  exit 1
fi

echo "Lesson ID: ${LESSON_ID}"
echo "Output prefix: ${OUT_PREFIX}"
echo "MinIO public endpoint (for container access): ${MINIO_PUBLIC_ENDPOINT}"
echo "Backend API: ${BACKEND_API}"

# Ensure docker is available
if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required but not found in PATH"
  exit 2
fi

# Extract fileUrl from backend
echo "Fetching lesson info from ${BACKEND_API}/api/lessons/${LESSON_ID} ..."
LESSON_JSON=$(curl -sS "${BACKEND_API}/api/lessons/${LESSON_ID}") || { echo "Failed to fetch lesson JSON"; exit 3; }

FILE_URL=$(echo "$LESSON_JSON" | grep -o '"fileUrl":"[^"]*"' | sed -E 's/"fileUrl":"([^"]+)"/\1/' | sed 's/\\u002520/%20/g' || true)

if [ -z "$FILE_URL" ]; then
  echo "Couldn't extract fileUrl from lesson JSON. Output was:" >&2
  echo "$LESSON_JSON" >&2
  exit 4
fi

# Replace localhost minio host so container can reach it (host.docker.internal used by Docker Desktop)
FILE_URL_ADJUSTED=$(echo "$FILE_URL" | sed "s|http://localhost:9000|${MINIO_PUBLIC_ENDPOINT}|g")

echo "Using file URL for capture:"
echo "  ${FILE_URL_ADJUSTED}"

# Create temporary env-file to pass safely into docker (avoids shell interpretation of & and other chars)
ENV_FILE=".playwright_env"
printf '%s\n' "FILE_URL=${FILE_URL_ADJUSTED}" > "$ENV_FILE"

# Run Playwright in official container. It already includes Node and Playwright browsers.
# The container will write screenshots into the mounted workspace directory.

DOCKER_IMAGE="mcr.microsoft.com/playwright:latest"

echo "Starting Playwright container to capture screenshots (this may take a few seconds)..."

docker run --rm \
  -v "${PWD}":/workspace \
  -w /workspace \
  --env-file "$ENV_FILE" \
  ${DOCKER_IMAGE} \
  node -e "(async ()=>{try{const {chromium}=require('playwright');const fileUrl=process.env.FILE_URL;console.log('Using fileUrl=',fileUrl);const browser=await chromium.launch({args:['--no-sandbox','--disable-setuid-sandbox']});const page=await browser.newPage({viewport:{width:1280,height:800}});const html=\`<html><body style=\"margin:0;background:#111\"><video controls autoplay muted playsinline style=\"width:100%;height:100%;max-height:720px;\"><source src=\"\${fileUrl}\" type=\"video/mp4\"></video></body></html>\`;await page.setContent(html,{waitUntil:'networkidle'});await page.waitForTimeout(2000);const fullPath='${OUT_PREFIX}-full.png';await page.screenshot({path:fullPath,fullPage:true});console.log('Saved full page screenshot to',fullPath);const handle=await page.$('video');if(handle){const box=await handle.boundingBox();if(box){const clipPath='${OUT_PREFIX}-player.png';await page.screenshot({path:clipPath,clip:{x:Math.max(0,box.x),y:Math.max(0,box.y),width:Math.max(1,box.width),height:Math.max(1,box.height)}});console.log('Saved player screenshot to',clipPath);}else{console.warn('Could not get bounding box of video element');}}else{console.warn('Video element not found on page');}await browser.close();}catch(e){console.error('Error in container capture:',e);process.exit(2);} })()"

EXIT_CODE=$?

# Clean up env file
rm -f "$ENV_FILE"

if [ $EXIT_CODE -ne 0 ]; then
  echo "Playwright container exited with code ${EXIT_CODE}" >&2
  exit $EXIT_CODE
fi

echo "Done. Generated files (if successful):"
ls -la "${OUT_PREFIX}-full.png" "${OUT_PREFIX}-player.png" 2>/dev/null || echo "No screenshots found. Check container logs above."

echo "If the container couldn't access the URL, try passing a different MinIO public endpoint as 3rd arg, for example:"
echo "  ./scripts/run-playwright-docker.sh ${LESSON_ID} ${OUT_PREFIX} http://host.docker.internal:9000 ${BACKEND_API}"

exit 0
