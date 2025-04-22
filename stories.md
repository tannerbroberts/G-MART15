
# Story 1: Vite:
- Estimate: 5, 10, 11: / 3 = 8:40 hour estimate
- Assignee: Ryan
- Start time: Today, April 7th, 2025, 6:15 PM
- Create a vite app with react and typescript and SWC
- The vite app should be able to compile typescript code and place it in the /dist folder, ready to be served by the express server.
- The "start" command, after setting this up, should run both the vite dev server (compiling the typescript code) and this express server on two different ports.
- The "/" route should serve the compiled react app code, meaning we can see the same client, React app in the browser by going to localhost:3000 or localhost:5173 (vite default port)

# Story 2: Backend, table creation:
- Estimate: 8, 9, 10: 27 / 3 = 9 hour estimate
- Assignee: Ali
- Start time: Today, April 7th, 2025, 7:00 PM
- Create a sharable MySQL schema (can send to everybody and used quickly to create the needed database)
- Help everybody set up their local MySQL database
- Create the following tables, and decide on an appropriate data type for each column:
- Create table: Users:
  - Create column: user_id
  - Create column: username
  - Create column: password
  - Create column: points
  - Create column: current_game_id (id's in the future?)
- Create table: ActiveGames:
  - Create column: game_id
  - Create column: players (player_id:hand_id)
- Create game_hand table:
  - Create column: hand_id

# Story 3 (spike): Determine game rules
- Estimate: 4, 5, 6: 15 / 3 = 5 hour estimate
- Assignee: Georgia
- Start time: Today, April 7th, 2025, 7:00 PM
- Own and propose a single set of game rules, for which the assignee will be held responsible in terms of future specifications (tell us how the game works, and what the benefits are)
- The rules should be easy to extend on (balatro, as an example)
- The rules should be easy to implement
- The rules should be generous in terms of counting cards, but not so generous as to be unreasonable or unrealistic
- What are the game rules?
- What are the rules for the dealer?
- What are the rules for the player?
- Can the player double down?
- Can the player split?
- Can the player surrender?
- Can the player hit?
- Can the player stand?
- Can the player bet?
- Can the player go bust?
- Can the player win?
- Can the player lose?
- Can the player tie?
- Can the player push?
- Can the player get blackjack?
- Can the player get 21?
- What are the winnings for a bet?
- What is the table limit?
- What is the table minimum? (give numbers to show the results)
- The team does not need to agree to use this proposal in it's entirety, but it will be used as a starting point for the game rules,
and to the extent that these rules ARE used, the assignee must be able to explain the rules and the reasoning behind them.

# Story 4 (spike and play, backend only): Implementation for "login with google"
- Estimate: 8, 10, 10, 19: 47 / 4: 11:45 hour estimate
- Assignee: Tanner
- What is required for logging in with google email?
- Testing with postman should yield a successful login response while running the express server

# Story 5: Look and feel
- Estimate: 6, 6, 8, 9, 12 / 5: 8:12
- Assinee: Maggie
- Put together a proposal for the following screens on the client app:
  - The game screen (multiplayer)
    - User has joined a table
      - Different game states include
        - The reshuffling of the shoe
        - initial reveal of cards (the flop)
        - Waiting for a game-play decision, bet, hit, stand, stay, etc.
        - Win/Loss visualizations
  - Navigation page
  - The signin page (signin with google, there'll be a button there somewhere)
  - The stats screen
  - The user setting page
  - Any and all of these may be combined, or turned into an overlay, or a drawer, or whatever.
  - If the proposal is accepted, you will become the go-to person with answers about the designs
  - If it is rejected... Sad, but you'll not need to do anything else
  - Keep these things in mind:
    - Card assets
      - Suit
      - numbers
      - readable font
      - Card backs
      - Chips/coins assets
    - Accessibility
    - Dealer hand
    - Animations
    - Buttons
    - Menus
    - Background table assets
    - Music and ambiance
    - Tab sounds/vibration
    - Avatars
    - General styles

# Story 6: Card Component 1
- Estimate: 8, 10, 10, 12, 15: 55 / 5 = 11
- Assignee: Ryan
- object called location taken as a prop
  - { x: number, y: number }
- Image asset placeholder for the back of a card
- Image assets for suits and numbers
- Build out the "Hand" component, but give it a better name, cuz calling something hand is just dumb, a "Hand" is just two cards
- Card needs to have a large size and a small size
- Card position needs to be animated when it changes, likely just a transition property on css, but may be more complex

# Story 7: Music and ambiance
- Estimate: 10, 12, 15, 18, 24: 19:30
- Assignee: Georgia
- Figure out how to play a sound in React, (useSound hook)
- Button click/tap sounds
- Shuffle
- Card dealt
- Ambiance
- Win
- Loss
- Push
- Insurance?
- Toggle buttons for settings
- Opening overlays
- Closing overlays
- New player joins
- Player disconnect
- Bankrupcy
- Make using sounds STUPIDLY easy, develop some sort of custom hook if you like, see Tanner for further knowledge if desired.
- People need to be able to easily understand how to trigger a sound effect, and reliably trigger it.
- Sound effects should be able to overlap eachother

# Story 8: Login screen & Main Menu screen
- Estimate: 12, 12, 13, 15, 15 / 5 = 13:12
- Assignee: Maggie
- Login/Create new account
  - Render the Login with Google button in the center vertically and horizontally
  - Welcome text and title
- Main Menu:
  - New game button
  - Join game button
    - Enter a gameId
    - Implement a scan a QR code library or sahmthing (if on mobile)
- Create username
  - Just a text input for now... I guess... I mean, I don't know.

# Story 9 DEPLOY!!!
- Estimate: 20, 15, 15, 15, 10: 15
- Assignee: Ali/Ryan
- Ali Host the client on Vercel
- Host the express server on Clever Cloud
  - Ideally, hook it up to a github pull request pipeline
  - Options include but are not limited to Tanner's Heroku pet server
- Ali/Ryan? Host the SQL server on Clever Cloud
  - Setup the admin privledges (you can do anything, even drop a bomb on the tables, and blow them up, super scary)
  - Setup the user credentials that the express server will be using to access the mysql server
  - Be able to user the admin account somehow, ssh commandline, whatever, just need admin access
- Write the connection code that hooks up the express server to the MySQL server (5 connection pool limit)

# Story 10 Main Menu Meat
Main Menu Screen: Core Elements  
- Welcome/Header
- Display a welcoming message and the logged-in user’s username (the one that they chose after creating an account)
- Prominently show the user's total winnings and other basic stats
	- Games played
- New Game Section
- Join/Create game text box: User enters a desired tableID (max 20 characters).
- Button: join/create
- On submit, attempts to create a table with that ID.
	- Send a request to create a table
		- Response should have success or failure
			- Connect to the table socket connection with the response (don't do this on the main menu, just FYI)
- If tableID is too long, redirect to error page: "Your table ID is too long".
- If the user has created 3 tables in the last minute, set a state value for countdown (should be exposed in a countdown context) and show the countdown page for as long as the countdown exists, also show a back button so the user can immediately join a table that already exists.
	- This is just FYI, the main menu page only needs to handle setting state when a rate limiting response is given
- Select from one of three public games
- Search bar to filter the public games list
- Button: "Join Table", disabled if no public table is selected, enabled if one is selected from the list.
- On submit, attempts to join the table.
- If tableID is too long, redirect to error page.
- If table is full, show a "table full" error page, and a back button.
- If table does not exist, create it and join.
- Menu navigation to settings page (sound controls, persistent across sessions).
- Loading Indicators for components that rely on fetched state
- Show loading spinners or progress bars during network requests (e.g., when creating/joining a table).
- Logout
- Button: "Logout" (optional, but standard for Google-authenticated apps).

Key Behaviors  

- TableID Validation: Any tableID input longer than 20 characters sends user to an error page.
- Rate Limiting: If user tries to create more than 3 tables/minute, redirect to countdown page.
- Table Full Handling: If a join is attempted on a full table (6 players), show an error.
- Loading States: Always show a loading indicator while waiting for server responses.
- Persistent Settings: Sound settings are saved and loaded on each login.
- Public tables list

# Story 11 Smoke Break / Game hasn't started yet lobby

Frontend-
*Buttons
- User that created the table initially gets a start button
	- Once the game has started, people just take "smoke breaks"
- Rejoin after hand (Sit Down)
- Share link (gives an invite to the game link, probably just a few lines of code as the link popping up after clicking)
- Exit lobby (Leaves the game, returns you to main menu)
*Visual differences
- This is just the table, but in the middle is the QR code, possibly replacing player hand?  
- A grey tint over the screen, or a vague smoke effect (depending on difficulty of implementation)
- QR code is on screen  

- Connects to main menu through exit lobby button

Backend Features for Smoke Break (Spectator) Mode  
1. Player State Management 
- Maintain a player status flag per seat:
- `active` (playing hand)
- `smoke_break` (temporarily inactive, spectator mode)
- `pending_game_start`
- When a player initiates a smoke break, update their status to `smoke_break`.
- Prevent game actions from `smoke_break` players but keep them connected.

1. Connection & Heartbeat Handling
- Establish a socket connection.
- Implement heartbeat pings to all connected clients.
	- Server sends a "ping" twice a second
	- Client listens for a "ping" and sends a "pong" in response
	- Server removes a user if they miss sending a "pong" 3 times in a row.
- For players on smoke break:
- - Respond to heartbeat pings normally to avoid being kicked from the table
    - Maintain their reserved seat during the break.

1. Seat Reservation System
- While on smoke break, the player’s seat remains reserved.
- Other players cannot take that seat.
- When the player returns (clicks "Rejoin after hand"), update status back to `active`.
	- they will wait for the current hand to be over and be dealt the next hand

4. Game State Synchronization  

- Broadcast game state updates to all connected clients, including those on smoke break via socket connection.
- Ensure smoke break players receive all card deals and table updates in real time.
- Hide or disable UI elements related to player actions for smoke break players.

5. Invitation & QR Code Link Generation  

- Generate a QR code based off of the full URL path (including the tableId path variable)
- This URL is nothing special, if a user tries to join a table that's full, they won't be able to, no big deal.

6. Rejoin & Cash Out Handling  

- Rejoin after hand: When a player clicks this, verify their seat and change status to `active`.
- Cash out: Remove player from table, free seat, and update game state accordingly.

7. Security & Anti-Abuse  

- Validate all status changes and socket messages server-side.
- Prevent spoofing by authenticating players on every action.



# Backlog of thoughts and things

# Server routes for login
- Estimate:
- Assignee:
- post/login
  - log in with google? I don't actually know how that'll work
- post/login/newAccount/start
  - Checks to see if the email isn't already in use, sends an email to the user
  - Puts the email into the users table with a "pending" flag or something
- post/login/newAccount/verify
  - The email sent to the user contains a 6 character key
  - The user coppies the key into the login screen and clicks a button
  - or when the last character is entered, the request is sent
  - Successful verrification moves the user to the screen where they select their username
- post/login/newAccount/checkUser
  - The input auto-sends a request when typing stops for 1000 ms
  - body has the user's desired name, response contains weather that name is taken
- post/login/newAccount/create

# Avatar Component and multiplayer layout options
  - Specify where the players will be in each of the different 1, 2, 3, 4, 5, 6 player game layouts
# Table assets
# Chips/Tokens/Coins/Dollars
# Buttons and the layout for hit, stay, stand, etc.
- Needs a usability focus here, maybe even mock up a series of potential game steps and make sure the location of the button still feels right
# What does creating a table look like?
# What does joining a table look like? (I'd love to use QR code generators and query params/route variables)
# Table (gameplay) screen
# Stats screen
# Settings screen
# QR code generator
# Setup the SQL server in production
# Setup the game server in production

# User first time viral hook journey:
  - Friend pulls up the QR code for their table, or sends a link through chat
    - QR code gets scanned, and the link clicked
    - The chat link is clicked
  - The user creates an account/logs in
  - The user immediately joins the table

  # AI Prompt:
  Im a brand new developer.

We want to build a multiplayer blackjack game for the web and we want it to be mobile first.
 We will use react, and express server for the backend.
 Navigation between screens will use react router, send react app from the basepath of the URL, client side app state will be managed with some context, backend will maintain SQL server of game tables, decks, players, etc.
 Unique tableID will be user defined, tableIDs and game sessions will be stored in SQL database, if multiple people enter the same tableID, then they will all join the same table, unless the table is full then we will need to tell them the table is full.
 if a user joins a non-existant table, the table is created for them.
 join requests will be first-come first-serve.
 There is no validation for table passwords or the like.
 Anyone can join any table as long as they know the table name.
 there can be no more than 6 players at a table.
 If users disconnect, then they forfit any money bet.
 Any money won will be added to the payers total, no need to cash out.
 Users will need to log in with Google, and an account using email address will be made in the database.
 Users will be identified by a username that they choose, no more than 20 characters long, filtered for inappropriate names.
 Settings page will have sound control.
 Settings will be persistent across sessions.
 Don't be opinionated about client look and feel.
 tableID must be less than 20 characters, invalid tableID will take you to an error page that says "your table ID is too long" or the like.
 yes we will show loading indicators during network req.
 Games will be multiplayer, dealer will deal cards to each user in the order they joined the table.
 Each player decision will be listened for, but only one players decision will be made at a time.
 If players make a decision when it is not their turn, the server will ignore them.
 Game state will be synchronized between clients by socket server streams and route updates.
 If a user disconnects and socket server stops receiving responses to pings sent every second, then the user will be automatically removed from the table.
 We will prevent abuse by using google login, and if a user creates more than 3 tables in a minute it will be rate limited, attempting to create a 4th table within 60 seconds will redirect to a countdown page where they will be notified when they can create another table.
