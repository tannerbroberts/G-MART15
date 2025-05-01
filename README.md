# G-MART15 Blackjack Client

We're just a couple of chill people who like to play cards

## Repository Structure

This repository contains the client-side codebase for the G-MART15 Blackjack application:

- `client/`: React/TypeScript frontend deployed to Vercel
- `scripts/`: Utility scripts used in the application

## Deployment Strategy

The frontend is automatically deployed to Vercel when changes are merged to the main branch.

### Important Notes:

- This repository contains only the client-side code of the application
- The server code has been moved to a separate repository
- Deployments are handled automatically on merge to main branch

## Local Development

To run the client application locally:

1. Clone this repository
2. Set up the client:
   ```
   cd client
   npm install
   npm run dev
   ```

Or from the root directory:
```
npm run dev
```

## Deployment

Deployments happen automatically when changes are merged to the main branch. The client code will be deployed to Vercel through the configured CI/CD pipeline.
