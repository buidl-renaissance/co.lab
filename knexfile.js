// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    }
  },

  staging: {
    client: process.env.DB_CLIENT || 'postgresql',
    connection: process.env.DB_CONNECTION_STRING ? process.env.DB_CONNECTION_STRING : {
      database: process.env.DB_NAME || 'my_db',
      user: process.env.DB_USER || 'username',
      password: process.env.DB_PASSWORD || 'password',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: process.env.DB_CLIENT || 'postgresql',
    connection: process.env.DB_CONNECTION_STRING ? process.env.DB_CONNECTION_STRING : {
      database: process.env.DB_NAME || 'my_db',
      user: process.env.DB_USER || 'username',
      password: process.env.DB_PASSWORD || 'password',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
