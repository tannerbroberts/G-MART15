#!/bin/bash
set -e  # Exit immediately if any command fails

# ------------------------------------------------------------------------------
# Heroku Backend Deployment Guide
# ------------------------------------------------------------------------------
# This file is now a reference guide for CI/CD deployments to Heroku.
# Automated deployments happen when changes are merged to the main branch.
# 
# IMPORTANT: This repository is now configured as a monorepo.
# Do NOT initialize a separate Git repository in the server directory.
# ------------------------------------------------------------------------------

echo "===== HEROKU BACKEND DEPLOYMENT GUIDE ====="
echo ""
echo "📋 IMPORTANT: Deployments now happen automatically via CI/CD"
echo ""
echo "This script is now a reference for understanding the deployment process."
echo "When code is merged to the main branch of the repository,"
echo "the /server directory is automatically deployed to Heroku."
echo ""
echo "Pre-deployment checks:"
echo "  1. Make sure deployment tests pass: node ./tests/deployment-test.js"
echo "  2. Ensure proper Heroku environment variables are configured"
echo "  3. Verify Procfile includes web and release commands"
echo ""
echo "If you need to manually configure the Heroku app:"
echo "  - Create app: heroku create g-mart15-blackjack-api"
echo "  - Add PostgreSQL: heroku addons:create heroku-postgresql:hobby-dev"
echo "  - Set environment variables: heroku config:set NODE_ENV=production"
echo ""
echo "For deployment troubleshooting:"
echo "  - Check logs: heroku logs --tail"
echo "  - Run database migrations manually: heroku run 'npx knex migrate:latest'"
echo ""
echo "⚠️  Do NOT initialize a Git repository in this directory."
echo "⚠️  This is part of a monorepo with automated deployment."