#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Trap CTRL-C and kill all background processes
trap 'kill $(jobs -p)' SIGINT

# Start backend dev server
npm run dev:backend &

# Start frontend dev server
npm run dev:frontend &

# Wait for all background processes to finish
wait
