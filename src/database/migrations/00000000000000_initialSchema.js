'use strict';
// todos table
export function up(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.increments('id');
      table.string('email').notNullable();
      table.string('user_name').notNullable();
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
    })
    .createTable('todos', (table) => {
      table.increments('id');
      table.string('title').notNullable();
      table.string('description');
      table.boolean('done').notNullable(); // TODO: Default to false?
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('id').inTable('users');
    });
}

// drop todos table
export function down(knex) {
  return knex.schema
    .dropTable('todos')
    .dropTable('users');
}
