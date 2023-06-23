'use strict';

export function up(knex) {
  return knex.schema
  // .createTable('todos', (table) => {
  //   table.increments(); // id
  //   table.integer('app_id').notNullable();
  //   table.string('client_number').notNullable();
  //   table.string('client_group_id').notNullable();
  //   table.string('project_name').notNullable();
  //   table.string('project_number').notNullable();
  //   table.string('category').notNullable();
  //   table.string('item_name').notNullable();
  //   table.string('item_url').notNullable();
  //   table.string('due_date');
  //   table.string('status');
  //   table.string('created_by').notNullable();
  //   table.string('updated_by').notNullable();
  //   table.timestamps(false, true); // created_at, updated_at
  // })
}

export function down(knex) {
  return knex.schema
  // .dropTable('todos')
}