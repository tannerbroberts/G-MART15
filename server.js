require("dotenv").config();
const express = require('express');

// Muh Routes
const redirectRouter = require('./routes/redirect');
const giffyRouter = require('./routes/giffy.js');
const app = express();

// Muh Middlewares
app.use(express.json());

// All paths go to this handler
// Eventually serves the app code for the Giffy app
app.get('/', (_req, res) => res.send('Hello World!'));

// Handles CRUD opperations for the Giffy app
app.use('/giffy', giffyRouter);

// Stops people form being idiots
app.use(redirectRouter);

app.listen(3000, () => console.log('Example app listening on port 3000!'));

/**
 * Story 1: Vite:
 *   - Estimate: 5, 10, 11: / 3 = 8:40 hour estimate
 *   - Assignee: Ryan
 *   - Start time: April 7th, 2025, 6:15 PM
 *   - Create a vite app with react and typescript and SWC
 *   - The vite app should be able to compile typescript code and place it in the /dist folder, ready to be served by the express server.
 *   - The "start" command, after setting this up, should run both the vite dev server (compiling the typescript code) and this express server on two different ports.
 *   - The "/" route should serve the compiled react app code, meaning we can see the same client, React app in the browser by going to localhost:3000 or localhost:5173 (vite default port)
 */

/**
 * Story 2: Backend, table creation:
 *   - Estimate: 8, 9, 10: 27 / 3 = 9 hour estimate
 *   - Assignee: Ali
 *   - Start time: April 7th, 2025, 7:00 PM
 *   - Create a sharable MySQL schema (can send to everybody and used quickly to create the needed database)
 *   - Help everybody set up their local MySQL database
 *   - Create the following tables, and decide on an appropriate data type for each column:
 *   - Create table: Users:
 *     - Create column: user_id
 *     - Create column: username
 *     - Create column: password
 *     - Create column: points
 *     - Create column: current_game_id (id's in the future?)
 *   - Create table: ActiveGames:
 *     - Create column: game_id
 *     - Create column: players (player_id:hand_id)
 *   - Create game_hand table:
 *     - Create column: hand_id
 */

/**
 * Story 3 (spike): Determine game rules
 *   - Estimate: 4, 5, 6: 15 / 3 = 5 hour estimate
 *   - Assignee: Georgia
 *   - Start time: April 7th, 2025, 7:00 PM
 *   - Own and propose a single set of game rules, for which the assignee will be held responsible in terms of future specifications (tell us how the game works, and what the benefits are)
 *   - The rules should be easy to extend on (balatro, as an example)
 *   - The rules should be easy to implement
 *   - The rules should be generous in terms of counting cards, but not so generous as to be unreasonable or unrealistic
 *   - What are the game rules?
 *   - What are the rules for the dealer?
 *   - What are the rules for the player?
 *   - Can the player double down?
 *   - Can the player split?
 *   - Can the player surrender?
 *   - Can the player hit?
 *   - Can the player stand?
 *   - Can the player bet?
 *   - Can the player go bust?
 *   - Can the player win?
 *   - Can the player lose?
 *   - Can the player tie?
 *   - Can the player push?
 *   - Can the player get blackjack?
 *   - Can the player get 21?
 *   - What are the winnings for a bet?
 *   - What is the table limit?
 *   - What is the table minimum? (give numbers to show the results)
 *   - The team does not need to agree to use this proposal in it's entirety, but it will be used as a starting point for the game rules, 
 * and to the extent that these rules ARE used, the assignee must be able to explain the rules and the reasoning behind them.
 */

/**
 * Story 4 (spike and play, backend only): Implementation for "login with google"
 *   - Estimate: 8, 10, 10, 19: 47 / 4: 11:45 hour estimate
 *   - Assignee: Tanner
 *   - Start time: April 7th, 2025, 8:00 PM
 *   - What is required for logging in with google email?
 *   - Testing with postman should yield a successful login response while running the express server
 */

/**
 * Story 5:
 *   - Estimate: 
 */

/**
 * Story 6:
 *   - Estimate: 
 */

/**
 * Story 7:
 *   - Estimate: 
 */

/**
 * Story 8:
 *   - Estimate: 
 */

/**
 * Story 9:
 *   - Estimate: 
 */

/**
 * Story 10:
 *   - Estimate: 
 */

/**
 * Story 11:
 *   - Estimate: 
 */

/**
 * Story 12:
 *  - Estimate: 
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */

/**
 * Story ####:
 *   - Estimate:
 */
