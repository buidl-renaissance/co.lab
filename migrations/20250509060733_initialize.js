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
