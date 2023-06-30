"use strict";
// todos table
export function up(knex) {
  return knex.schema.createTable("todos", (table) => {
    table.increments("id"); // id
    // Is this line needed to still create table column id?
    //table.integer('id').notNullable();
    table.string("title").notNullable();
    table.string("description");
    table.boolean("done").notNullable();
    table.foreign("user_id").references("id").inTable("users");
  });
}

// drop todos table
export function down(knex) {
  return knex.schema.dropTable("todos");
}

// users table

export function up(knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id"); // id
    // Is this line needed to still create table column id?
    //table.integer('id').notNullable();
    table.string("email").notNullable();
    table.string("user_name").notNullable();
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
  });
}

// drop users table
export function down(knex) {
  return knex.schema.dropTable("users");
}
