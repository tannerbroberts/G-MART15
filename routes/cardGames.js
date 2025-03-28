// Example routes for card games:

/**
 * Blackjack Game State
 * - Player Hand
 * - Dealer Hand (never sent to the client)
 * - Deck (ordered on purpose to allow for card counting)
 * - Points
 * - Table
 * - Generous game rules (makes card counting easier)
 * - The discard pile
 * 
 * Register (came to the site via QR code with a user's id embedded in it as a query param)
 * /register (post) (the player needs to be accepted to the table by any other player)
 * 
 * Register (came to the site via URL lookup)
 * /register (post) (the player needs to be accepted to the table by any other player)
 * 
 * Delete Account
 * /deleteAccount (delete) (the player needs to be accepted to the table by any other player)
 * 
 * Login
 * /login (post) (the player needs to be accepted to the table by any other player)
 * 
 * Logout
 * /logout (post) (the player needs to be accepted to the table by any other player)
 * 
 * Make a new game
 * /createTable (post) (the player needs to be accepted to the table by any other player)
 * 
 * Game State
 * /gameState (get) (the player needs to be accepted to the table by any other player)
 */

/**
 * Solitaire Game State
 * - Tableau
 * - Foundations
 * - Stock
 * - Waste
 * - Points
 * - The player
 * 
 * The Routes:
 * /solitaire/game/:gameId (post)
 * - If not started, the game state is created and pushed to the "games" table
 * 
 * /start/easy (post)
 * /start/medium (post)
 * /start/hard (post)
 *
 * /start
 * /deckState
 * /gameState
 * /score
 * /faceUpCards
 * /userInput (???)
 * 
 * 
 */
