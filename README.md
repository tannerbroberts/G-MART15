# G-MART15 Blackjack

We're just a couple of chill people who like to play cards

## Repository Structure

This repository contains the complete codebase for the G-MART15 Blackjack application, including:

- `client/`: React/TypeScript frontend deployed to Vercel
- `server/`: Express/Node.js backend deployed to Heroku
- `scripts/`: Shared utility scripts used across the application

## Deployment Strategy

This repository follows a CI/CD approach with automated deployments:

- **Frontend**: The `/client` directory is automatically deployed to Vercel when changes are merged to the main branch
- **Backend**: The `/server` directory is automatically deployed to Heroku when changes are merged to the main branch

### Important Notes:

- This is a monorepo containing the entire full-stack application
- Do NOT initialize separate Git repositories in the sub-directories
- Only commit changes to the main repository
- Deployments are handled automatically on merge to main branch

## Local Development

To run the application locally:

1. Clone this repository
2. Set up the server:
   ```
   cd server
   npm install
   npm run dev
   ```
3. Set up the client:
   ```
   cd client
   npm install
   npm run dev
   ```

## Database Setup

The database configuration is managed through Knex.js:
- Local development uses a local PostgreSQL database
- Production uses Heroku PostgreSQL

To set up the database locally, run:
```
node scripts/setup-database.js
```

## Deployment

Deployments happen automatically when changes are merged to the main branch. Manual deployments should not be necessary, but in case they are needed:

1. For the client: CI/CD will deploy the `/client` directory to Vercel
2. For the server: CI/CD will deploy the `/server` directory to Heroku
