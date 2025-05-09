/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('collaborations', table => {
    table.string('id').primary();
    table.string('title').notNullable();
    table.text('description');
    table.json('template').notNullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.json("answers").notNullable();
    table.json("participants").notNullable();
    table
      .enum("status", ["active", "completed", "archived"])
      .defaultTo("active");
    table.json("analysis").notNullable();   
    table.json("transcripts").notNullable();
    table.text("summary").notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("collaborations");
};
  // // Using raw SQL for MySQL table creation
  // return knex.raw(`
  //   CREATE TABLE collaborations (
  //     id VARCHAR(255) PRIMARY KEY,
  //     title VARCHAR(255) NOT NULL,
  //     description TEXT,
  //     template JSON NOT NULL,
  //     createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  //     updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  //     answers JSON NOT NULL,
  //     participants JSON NOT NULL,
  //     status ENUM('active', 'completed', 'archived') DEFAULT 'active',
  //     analysis JSON NOT NULL,
  //     transcripts JSON NOT NULL,
  //     summary TEXT NOT NULL
  //   );
    
  //   CREATE TABLE templates (
  //     id VARCHAR(255) PRIMARY KEY,
  //     name VARCHAR(255) NOT NULL,
  //     description TEXT,
  //     questions JSON NOT NULL,
  //     createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  //     updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  //     isActive BOOLEAN DEFAULT TRUE,
  //     category VARCHAR(255),
  //     tags JSON
  //   );
    
  //   CREATE TABLE users (
  //     id VARCHAR(255) PRIMARY KEY,
  //     email VARCHAR(255) NOT NULL UNIQUE,
  //     name VARCHAR(255),
  //     password VARCHAR(255) NOT NULL,
  //     createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  //     updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  //     isActive BOOLEAN DEFAULT TRUE
  //   );
  // `);

