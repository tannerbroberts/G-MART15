# G-MART15 Blackjack Client Deployment Guide

## Repository Structure and Deployment Strategy

This repository contains only the client-side code of the G-MART15 Blackjack application. The server code has been moved to a separate repository.

### Repository Structure

```
G-MART15-Client/
├── client/             # React/TypeScript frontend (deploys to Vercel)
└── scripts/            # Utility scripts
```

### Automatic Deployment Process

**Frontend (Vercel)**
- Deployment is triggered when changes are pushed to the main branch
- The `/client` directory is deployed to Vercel
- The build process is configured through the CI/CD pipeline

## Important Guidelines

### DO NOT:
- Initialize Git repositories in subdirectories
- Manually deploy from subdirectories

### DO:
- Commit all changes to the main repository
- Let CI/CD handle deployments
- Run the cleanup script if you find Git repositories in subdirectories:
  ```
  ./scripts/cleanup-subdir-git.sh
  ```

## Configuration Details

### Vercel (Frontend)

The frontend deployment to Vercel is configured through the CI/CD pipeline:

- **Build Command**: `npm run build`
- **Output Directory**: `client/dist`
- **Framework**: Vite

## Manual Deployment (Emergency Only)

In case CI/CD fails, manual deployments can be performed as a last resort:

### Frontend (Vercel)
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy from client directory
cd client
vercel --prod
```

## Troubleshooting

### CI/CD Issues
1. Check GitHub Actions logs for error details
2. Make sure all tests are passing locally before pushing

### Frontend Deployment Issues
1. Check Vercel build logs in the dashboard
2. Verify environment variables are set correctly in Vercel
3. Run `npm run build` locally to confirm the build works