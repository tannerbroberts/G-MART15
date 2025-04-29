#!/bin/bash
set -e

# Deploy only the server directory to Heroku
echo "Starting Heroku deployment..."

# Check if git is initialized in the server subdirectory
if [ ! -d .git ]; then
  echo "Initializing git repository in server directory..."
  git init
  git add .
  git commit -m "Initial commit for Heroku deployment"
fi

# Check if Heroku remote exists
if ! git remote | grep -q heroku; then
  echo "Adding Heroku remote..."
  echo "You need to run: heroku git:remote -a YOUR_HEROKU_APP_NAME"
  exit 1
fi

# Deploy to Heroku
echo "Deploying to Heroku..."
git add .
git commit -m "Deploy to Heroku $(date)" || echo "No changes to commit"
git push heroku main --force

echo "Deployment complete!"