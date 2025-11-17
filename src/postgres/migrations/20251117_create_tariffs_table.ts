import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tariffs', (column) => {
    column.increments('id').primary();
    column.
  })
}