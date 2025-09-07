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
  # Send SIGTERM to Node.js for graceful shutdown
  kill -s SIGTERM $NODE_PID
  # Send SIGQUIT to Nginx for graceful shutdown
  kill -s SIGQUIT $NGINX_PID
  # Wait for processes to terminate
  wait $NODE_PID
  wait $NGINX_PID
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
