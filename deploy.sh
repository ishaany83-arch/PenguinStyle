#!/bin/bash

# Fly.io Deployment Script
# Run this script to deploy to Fly.io

set -e

echo "🐧 PenguinStyle - Fly.io Deployment"
echo "===================================="

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ Fly CLI not found. Installing..."
    npm install -g flyctl
fi

# Check if user is logged in
echo "🔐 Checking Fly.io authentication..."
if ! flyctl auth whoami &> /dev/null; then
    echo "📝 Please log in to Fly.io:"
    flyctl auth login
fi

# Launch or update app
echo "🚀 Launching/Updating Fly.io app..."
flyctl launch --yes 2>/dev/null || echo "App already exists, skipping launch..."

# Set secrets
echo "🔑 Setting environment variables..."
flyctl secrets set ALLOWED_HOSTS=roblox.com,y8.com,coolmathgames.com,now.gg,youtube.com
flyctl secrets set NODE_ENV=production
flyctl secrets set RATE_LIMIT_MAX_REQUESTS=30

# Deploy
echo "📦 Deploying to Fly.io..."
flyctl deploy

# Get app info
echo ""
echo "✅ Deployment complete!"
echo ""
flyctl info
echo ""
echo "🎮 Your app is live! Check the URL above."
