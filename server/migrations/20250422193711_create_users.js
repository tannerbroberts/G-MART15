/**
 * User Table Migration
 * ------------------------------------------------------------------------------
 * Migration file: 20250422193711_create_users.js
 * Created: April 22, 2025
 * 
 * Purpose: Creates the foundational users table for Google OAuth authentication
 * This migration establishes the initial database schema for user accounts.
 * 
 * Schema Notes:
 * - id: Primary auto-incrementing identifier
 * - google_id: OAuth Google account identifier (unique)
 * - email: User's email address from Google profile (unique)
 * - name: User's display name from Google profile
 * - created_at: Timestamp when user record was created
 *
 * Deployment: This migration will run automatically during Heroku deployment
 * via the "release: npx knex migrate:latest" command in the Procfile
 */

// Migration "up" function creates the users table
export function up(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('google_id').unique().notNullable();
    table.string('email').unique().notNullable();
    table.string('name');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

// Migration "down" function removes the users table (for rollbacks)
export function down(knex) {
  return knex.schema.dropTable('users');
}