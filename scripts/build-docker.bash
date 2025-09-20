#!/bin/bash

# This script builds and pushes the Docker image for the Prompt Kitchen application.
# It extracts the version from package.json, builds the image, tags it with 'latest'
# and the version number, and then pushes both tags to a Docker registry.

# --- Configuration ---
# The name of the Docker image.
# IMPORTANT: Change this to your Docker Hub username or registry prefix.
# For example: 'yourusername/prompt-kitchen'
IMAGE_NAME="kryten87/prompt-kitchen"

# The path to the Dockerfile.
DOCKERFILE="scripts/docker/Dockerfile"

# --- Script Start ---

# Set the script to exit immediately if a command exits with a non-zero status.
set -e

# Navigate to the root of the repository to ensure paths are correct.
cd "$(dirname "$0")/.."

echo "--- Extracting Version ---"
# Extract the version from package.json.
VERSION=$(grep '"version":' package.json | awk -F'"' '{print $4}')

if [ -z "$VERSION" ]; then
  echo "Error: Could not find version in package.json"
  exit 1
fi

echo "Version found: $VERSION"
echo "Image to be built: $IMAGE_NAME:$VERSION"

echo "--- Building Docker Image ---"
# Build the Docker image and tag it with 'latest'.
docker build -t "${IMAGE_NAME}:latest" -f "${DOCKERFILE}" .
echo "Successfully built ${IMAGE_NAME}:latest"

echo "--- Tagging Docker Image ---"
# Tag the 'latest' image with the specific version number.
docker tag "${IMAGE_NAME}:latest" "${IMAGE_NAME}:${VERSION}"
echo "Successfully tagged image as ${IMAGE_NAME}:${VERSION}"

echo "--- Pushing Docker Image ---"
# Push both the 'latest' and version-specific tags to the Docker registry.
docker push "${IMAGE_NAME}:latest"
docker push "${IMAGE_NAME}:${VERSION}"

echo "--- Done ---"
echo "Successfully pushed ${IMAGE_NAME}:latest and ${IMAGE_NAME}:${VERSION} to the registry."
