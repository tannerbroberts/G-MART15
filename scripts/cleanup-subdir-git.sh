#!/bin/bash
set -e  # Exit immediately if any command fails

# ------------------------------------------------------------------------------
# Subdirectory Git Repository Cleanup Script
# ------------------------------------------------------------------------------
# Purpose: Clean up Git repositories from subdirectories to ensure proper repository structure
# ------------------------------------------------------------------------------

echo "===== CLEANING UP SUBDIRECTORY GIT REPOSITORIES ====="

# Function to clean up a subdirectory
cleanup_subdir() {
  local dir=$1
  echo "Checking $dir directory..."
  
  if [ -d "$dir/.git" ]; then
    echo "📝 Found Git repository in $dir - removing..."
    rm -rf "$dir/.git"
    echo "✅ Removed Git repository from $dir"
  else
    echo "✅ No Git repository found in $dir"
  fi
  
  if [ -f "$dir/.gitignore" ]; then
    echo "📝 Found .gitignore in $dir - removing..."
    rm "$dir/.gitignore"
    echo "✅ Removed .gitignore from $dir"
  else
    echo "✅ No .gitignore found in $dir"
  fi
}

# Clean up client directory
cleanup_subdir "client"

echo ""
echo "🎉 Cleanup complete! This repository is now properly set up for the client-only structure."
echo "ℹ️  Remember: Only commit to the main repository, not to subdirectories."