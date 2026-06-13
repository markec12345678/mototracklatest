#!/bin/bash
cd /home/z/my-project
if [ ! -d ".next/standalone" ]; then
  echo "Building production..."
  NODE_OPTIONS="--max-old-space-size=4096" node node_modules/.bin/next build
  cp -r .next/static .next/standalone/.next/ 2>/dev/null
  cp -r public .next/standalone/ 2>/dev/null
fi
echo "Starting production server on port 3000..."
cd .next/standalone && KEEP_ALIVE_TIMEOUT=0 NODE_OPTIONS="--max-old-space-size=4096" node server.js
