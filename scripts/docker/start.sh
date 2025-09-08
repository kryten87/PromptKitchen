#!/bin/bash
set -e

# Start node in the background
node packages/backend/dist/server.js &
NODE_PID=$!

# Start nginx in the foreground
nginx -g 'daemon off;' &
NGINX_PID=$!

# Function to gracefully shut down processes
graceful_shutdown() {
  echo "Caught signal, shutting down gracefully..."
  # Check if NODE_PID is set and the process exists
  if [ -n "$NODE_PID" ] && kill -0 "$NODE_PID" 2>/dev/null; then
    kill -s SIGTERM "$NODE_PID"
    wait "$NODE_PID"
  fi
  # Check if NGINX_PID is set and the process exists
  if [ -n "$NGINX_PID" ] && kill -0 "$NGINX_PID" 2>/dev/null; then
    kill -s SIGQUIT "$NGINX_PID"
    wait "$NGINX_PID"
  fi
  echo "Shutdown complete."
}

# Trap SIGINT and SIGTERM to trigger graceful shutdown
trap 'graceful_shutdown' SIGINT SIGTERM

# Wait for any of the background processes to exit.
# The '-n' flag waits for the next job to terminate.
# This is important so the script doesn't exit immediately.
wait -n

# If one process dies, shut down the other.
# This part will be reached if a process exits for a reason other than the trapped signals.
echo "A process has exited. Shutting down the container."
graceful_shutdown
