
export default {
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgres://localhost:5432/blackjack',
  migrations: { directory: './migrations' },
};

