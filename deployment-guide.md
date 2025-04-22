# G-MART15 Blackjack Deployment Guide

This guide outlines the steps required to deploy the G-MART15 multiplayer blackjack application using Heroku for the backend, Vercel for the frontend, and Google OAuth for authentication.

**Date: April 22, 2025**

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Google OAuth Setup](#google-oauth-setup)
- [Database Setup](#database-setup)
- [Heroku Deployment (Backend)](#heroku-deployment-backend)
- [Vercel Deployment (Frontend)](#vercel-deployment-frontend)
- [Continuous Integration/Deployment](#continuous-integrationdeployment)
- [Post-Deployment Verification](#post-deployment-verification)

## Prerequisites

- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
- [Vercel CLI](https://vercel.com/download)
- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [PostgreSQL](https://www.postgresql.org/download/) (local installation for testing)
- Heroku account
- Vercel account
- Google Developer account

## Environment Setup

### Create Environment Files

1. Create a root `.env` file:

```
# PostgreSQL Connection
DATABASE_URL=postgres://username:password@localhost:5432/blackjack
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_DATABASE=blackjack

# Authentication
SESSION_SECRET=your_session_secret_here
JWT_SECRET=your_jwt_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Environment
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

2. Create a `.env.production` file with similar structure (you'll fill this with actual production values later):

```
# PostgreSQL Connection
DATABASE_URL=${HEROKU_POSTGRESQL_URL}

# Authentication
SESSION_SECRET=${SESSION_SECRET}
JWT_SECRET=${JWT_SECRET}

# Google OAuth
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}

# Environment
NODE_ENV=production
PORT=${PORT}
FRONTEND_URL=https://your-app-name.vercel.app
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project named "G-MART15 Blackjack"
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure the OAuth consent screen:
   - User Type: External
   - App name: G-MART15 Blackjack
   - User support email: your-email@example.com
   - Developer contact information: your-email@example.com
6. Save and continue
7. Add scopes:
   - `./auth/userinfo.email`
   - `./auth/userinfo.profile`
8. Add test users (your email and team members)
9. Create OAuth client ID:
   - Application type: Web application
   - Name: G-MART15 Blackjack Web Client
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:5173`
     - `https://your-app-name.herokuapp.com`
     - `https://your-app-name.vercel.app`
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/google/callback`
     - `https://your-app-name.herokuapp.com/auth/google/callback`
10. Click "Create" and note your Client ID and Client Secret

## Database Setup

### Local Development Database

1. Create the PostgreSQL database:

```bash
createdb blackjack
```

2. Run the database setup script:

```bash
npm run db:setup
```

### Heroku PostgreSQL Setup

1. The Heroku PostgreSQL addon will be added during Heroku setup
2. After setting up Heroku, you'll need to run migrations on your production database

## Heroku Deployment (Backend)

### Initial Setup

1. Log in to Heroku:

```bash
heroku login
```

2. Create a new Heroku application:

```bash
heroku create g-mart15-blackjack-api
```

3. Add PostgreSQL addon:

```bash
heroku addons:create heroku-postgresql:mini
```

4. Set environment variables:

```bash
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your_session_secret_here
heroku config:set JWT_SECRET=your_jwt_secret_here
heroku config:set GOOGLE_CLIENT_ID=your_google_client_id
heroku config:set GOOGLE_CLIENT_SECRET=your_google_client_secret
heroku config:set FRONTEND_URL=https://your-app-name.vercel.app
```

### Manual Deployment

1. Ensure you've committed all changes to Git
2. Add Heroku as a remote:

```bash
heroku git:remote -a g-mart15-blackjack-api
```

3. Push to Heroku:

```bash
git push heroku main
```

4. Run database migrations:

```bash
heroku run npx knex migrate:latest
```

### Set Up Heroku PostgreSQL Tables

After deploying to Heroku, you need to set up your database tables:

```bash
heroku run node scripts/setup-database.js
```

## Vercel Deployment (Frontend)

### Initial Setup

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Log in to Vercel:

```bash
vercel login
```

3. Navigate to the client directory:

```bash
cd client
```

4. Create a `vercel.json` file:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://g-mart15-blackjack-api.herokuapp.com/api/$1" },
    { "source": "/auth/(.*)", "destination": "https://g-mart15-blackjack-api.herokuapp.com/auth/$1" }
  ]
}
```

### Environment Variables in Vercel

Add the following environment variables in the Vercel dashboard or using the CLI:

```bash
vercel env add VITE_API_URL https://g-mart15-blackjack-api.herokuapp.com
```

### Manual Deployment

1. From the client directory, run:

```bash
vercel
```

2. Follow the prompts to configure your project
3. For production deployment:

```bash
vercel --prod
```

## Continuous Integration/Deployment

### GitHub Actions Setup

1. Create a `.github/workflows` directory in your project root
2. Create a `deploy.yml` file inside that directory:

```yaml
name: Deploy G-MART15 Blackjack

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm run tannersays
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.14
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "g-mart15-blackjack-api"
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
      - name: Run database migrations
        run: heroku run npx knex migrate:latest --app g-mart15-blackjack-api
        env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: cd client && npm install
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

3. Set up the required secrets in your GitHub repository:
   - `HEROKU_API_KEY`: Your Heroku API key
   - `HEROKU_EMAIL`: Your Heroku account email
   - `VERCEL_TOKEN`: Your Vercel token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

## Post-Deployment Verification

### Testing Authentication Flow

1. Access your deployed frontend at `https://your-app-name.vercel.app`
2. Click the "Sign in with Google" button
3. Complete the Google authentication process
4. You should be redirected back to your application and logged in

### Monitoring and Logging

- View Heroku logs:

```bash
heroku logs --tail
```

- Check Vercel deployment logs in the Vercel dashboard

## Common Issues and Troubleshooting

### CORS Issues
- Ensure your CORS configuration in the backend matches your frontend URL
- Double-check the environment variables for `FRONTEND_URL`

### Database Connection Issues
- Verify your `DATABASE_URL` is correctly set in Heroku
- Check if Heroku PostgreSQL addon is properly provisioned

### Google OAuth Issues
- Verify the authorized origins and redirect URIs in Google Console
- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correctly set

### Deployment Failures
- Check your Heroku and Vercel logs for specific error messages
- Ensure your application builds locally before attempting deployment

## Next Steps After Deployment

1. Set up proper SSL certificates for your domains
2. Configure custom domains in both Heroku and Vercel
3. Implement database backups on Heroku
4. Set up monitoring and alerting for your application
5. Create a staging environment for testing before production deployments

Remember to never commit sensitive information like API keys, secrets, or passwords to your repository. Always use environment variables for these values.