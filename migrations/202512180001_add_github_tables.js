/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('github_accounts', (table) => {
      table.string('id').primary();
      table.string('userId').notNullable();
      table.string('githubLogin').notNullable();
      table.string('githubUserId').notNullable();
      table.string('accessToken').notNullable();
      table.string('tokenType').notNullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    })
    .createTable('github_repos', (table) => {
      table.string('id').primary();
      table.string('owner').notNullable();
      table.string('name').notNullable();
      table.string('displayName').notNullable();
      table.string('projectId').nullable();
      table.boolean('isDefault').defaultTo(false);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    })
    .createTable('github_issue_links', (table) => {
      table.string('id').primary();
      table.string('collaborationId').notNullable();
      table.string('githubRepoId').notNullable();
      table.integer('issueNumber').notNullable();
      table.string('issueUrl').notNullable();
      table.string('issueState').notNullable();
      table.timestamp('lastSyncedAt').defaultTo(knex.fn.now());
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    })
    .createTable('github_pull_request_links', (table) => {
      table.string('id').primary();
      table.string('githubRepoId').notNullable();
      table.integer('pullNumber').notNullable();
      table.string('headSha').notNullable();
      table.string('status').notNullable();
      table.string('deploymentStatus').nullable();
      table.timestamp('lastSyncedAt').defaultTo(knex.fn.now());
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('github_pull_request_links')
    .dropTableIfExists('github_issue_links')
    .dropTableIfExists('github_repos')
    .dropTableIfExists('github_accounts');
};


