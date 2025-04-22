const knex = require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgres://localhost:5432/blackjack',
});
export default knex;