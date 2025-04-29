#!/bin/bash
set -e

# Deploy just the client to Vercel
echo "Starting Vercel deployment..."

# Run deployment tests first
echo "Running deployment tests..."
node ../scripts/client-deployment-test.js

if [ $? -ne 0 ]; then
  echo "❌ Deployment tests failed. Fix the issues before deploying."
  exit 1
fi

# Deploy to Vercel using the CLI
echo "Deploying to Vercel..."
vercel --prod

echo "Deployment complete!"