#!/bin/bash
# Watchdog script that restarts the Next.js server when it crashes

LOG_FILE="/home/z/my-project/dev.log"
MAX_RESTARTS=10
RESTART_COUNT=0

while [ $RESTART_COUNT -lt $MAX_RESTARTS ]; do
  echo "[$(date)] Starting server (attempt $((RESTART_COUNT+1))/$MAX_RESTARTS)..." >> "$LOG_FILE"
  
  cd /home/z/my-project && KEEP_ALIVE_TIMEOUT=0 NODE_OPTIONS="--max-old-space-size=4096" node node_modules/.bin/next dev --port 3000 --turbopack >> "$LOG_FILE" 2>&1
  
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE" >> "$LOG_FILE"
  
  RESTART_COUNT=$((RESTART_COUNT+1))
  sleep 5
done

echo "[$(date)] Max restarts reached. Stopping watchdog." >> "$LOG_FILE"
