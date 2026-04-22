#!/bin/bash
# Usage: ./deploy.sh <project-id>

PROJECT_ID=$1
IMAGE="gcr.io/$PROJECT_ID/claude-backend"

# Build and push
gcloud config set project $PROJECT_ID
docker build -t $IMAGE .
docker push $IMAGE

# Deploy to Cloud Run
gcloud run deploy claude-backend \
  --image $IMAGE \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000