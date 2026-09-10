#!/bin/bash

# Oracle Cloud Deployment Script for PenguinStyle
# This script automates Docker image building and pushing to Docker Hub

set -e

echo "🐧 PenguinStyle - Oracle Cloud Deployment"
echo "=========================================="

# Configuration
DOCKER_USERNAME=${1:-""}
DOCKER_PASSWORD=${2:-""}
ORACLE_INSTANCE_IP=${3:-""}

if [ -z "$DOCKER_USERNAME" ] || [ -z "$DOCKER_PASSWORD" ] || [ -z "$ORACLE_INSTANCE_IP" ]; then
    echo "❌ Missing required arguments"
    echo "Usage: bash oracle-deploy.sh <docker_username> <docker_password> <oracle_instance_ip>"
    echo ""
    echo "Example:"
    echo "  bash oracle-deploy.sh myuser mypass 123.45.67.89"
    exit 1
fi

# Step 1: Build Docker image locally
echo "📦 Building Docker image locally..."
docker build -t penguin-style:latest .

# Step 2: Tag for Docker Hub
echo "🏷️  Tagging image for Docker Hub..."
docker tag penguin-style:latest $DOCKER_USERNAME/penguin-style:latest

# Step 3: Login to Docker Hub
echo "🔐 Logging into Docker Hub..."
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

# Step 4: Push to Docker Hub
echo "📤 Pushing image to Docker Hub..."
docker push $DOCKER_USERNAME/penguin-style:latest

# Step 5: Deploy to Oracle Instance
echo "🚀 Deploying to Oracle Cloud instance..."
echo "   Instance IP: $ORACLE_INSTANCE_IP"

# SSH into Oracle instance and run container
ssh -i ~/.ssh/oracle_key opc@$ORACLE_INSTANCE_IP << 'DEPLOY'
set -e

echo "📥 Pulling image from Docker Hub..."
docker pull $DOCKER_USERNAME/penguin-style:latest

echo "🛑 Stopping old container (if exists)..."
docker stop penguin-style || true
docker rm penguin-style || true

echo "▶️  Starting new container..."
docker run -d \
  -p 3000:3000 \
  --name penguin-style \
  --restart always \
  -e NODE_ENV=production \
  -e ALLOWED_HOSTS=roblox.com,y8.com,coolmathgames.com,now.gg,youtube.com \
  -e RATE_LIMIT_MAX_REQUESTS=30 \
  $DOCKER_USERNAME/penguin-style:latest

echo "✅ Container deployed successfully!"
docker ps | grep penguin-style
DEPLOY

echo ""
echo "✅ Deployment complete!"
echo "🎮 Your app is running at: http://$ORACLE_INSTANCE_IP:3000"
echo ""
echo "Next steps:"
echo "1. Open Security List in Oracle Cloud Console"
echo "2. Add ingress rule for port 3000 (TCP)"
echo "3. Access your app at http://$ORACLE_INSTANCE_IP:3000"
