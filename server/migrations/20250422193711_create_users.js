export function up (knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('google_id').unique().notNullable();
    table.string('email').unique().notNullable();
    table.string('name');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}
export function down (knex) {
  return knex.schema.dropTable('users');
}