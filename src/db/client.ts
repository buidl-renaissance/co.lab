import knex, { Knex } from 'knex';

// Create a singleton instance of Knex
let client: Knex;

if (process.env.NODE_ENV === 'production') {
  client = knex({
    client: process.env.DB_CLIENT,
    connection: process.env.DB_CONNECTION_STRING,
    pool: { min: 2, max: 10 }
  });
} else {
  // In development, use a global variable to prevent multiple instances during hot-reloading
  if (!(global as unknown as { client?: Knex }).client) {
    (global as unknown as { client?: Knex }).client = knex({
      client: 'sqlite3',
      connection: {
        filename: './dev.sqlite3'
      },
      useNullAsDefault: true
    });
  }
  client = (global as unknown as { client: Knex }).client;
}

export default client;