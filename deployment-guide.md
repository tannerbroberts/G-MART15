# G-MART15 Blackjack Deployment Guide

## Monorepo Structure and Deployment Strategy

This repository is configured as a **monorepo**, containing both the frontend and backend code in a single repository. Deployments are handled automatically when code is merged to the main branch.

### Repository Structure

```
G-MART15/
├── client/             # React/TypeScript frontend (deploys to Vercel)
├── server/             # Express/Node.js backend (deploys to Heroku)
├── scripts/            # Shared utility scripts
└── .github/workflows/  # CI/CD configuration
```

### Automatic Deployment Process

1. **Frontend (Vercel)**
   - Deployment is triggered when changes are pushed to the main branch
   - The `/client` directory is deployed to Vercel
   - Configuration is managed via `vercel.json` in the root directory

2. **Backend (Heroku)**
   - Deployment is triggered when changes in the server directory are pushed to main
   - The `/server` directory is deployed to Heroku
   - Configuration is managed via GitHub Actions workflow in `.github/workflows/heroku-deploy.yml`

## Important Guidelines

### DO NOT:
- Initialize Git repositories in subdirectories
- Manually deploy from subdirectories
- Create separate `.gitignore` files in subdirectories

### DO:
- Commit all changes to the main repository
- Let CI/CD handle deployments
- Run the cleanup script if you find Git repositories in subdirectories:
  ```
  ./scripts/cleanup-subdir-git.sh
  ```

## Configuration Details

### Vercel (Frontend)

The frontend deployment to Vercel is configured through `vercel.json` in the root directory:

- **Build Command**: `cd client && npm install && npm run build`
- **Output Directory**: `client/dist`
- **Framework**: Vite
- **API Proxying**: Requests to `/api/*` and `/auth/*` are proxied to the Heroku backend

### Heroku (Backend)

The backend deployment to Heroku is configured through GitHub Actions:

- **Trigger**: Push to `main` branch with changes in `/server` directory
- **Tests**: Server tests and deployment validation are run before deployment
- **Deployment**: Uses the `akhileshns/heroku-deploy` action
- **App Directory**: Specifies the `server` directory for deployment

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

### Backend (Heroku)
```bash
# Install Heroku CLI if not already installed
brew install heroku/brew/heroku

# Login to Heroku
heroku login

# From the server directory
cd server
git push heroku main
```

## Troubleshooting

### CI/CD Issues
1. Check GitHub Actions logs for error details
2. Verify GitHub secrets (HEROKU_API_KEY, HEROKU_EMAIL) are properly set
3. Make sure all tests are passing locally before pushing

### Frontend Deployment Issues
1. Check Vercel build logs in the dashboard
2. Verify environment variables are set correctly in Vercel
3. Run `npm run build` locally to confirm the build works

### Backend Deployment Issues
1. Check Heroku logs: `heroku logs --tail --app gmart15-blackjack-express`
2. Verify environment variables are set correctly in Heroku
3. Run validation tests: `node ./tests/deployment-test.js`