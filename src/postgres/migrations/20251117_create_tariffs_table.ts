import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("tariffs", (table) => {
        table.increments("id").primary();
        table.string("warehouse_name").notNullable();
        table.string("geo_name").nullable();
        table.decimal("box_storage_liter").nullable();
        table.decimal("box_storage_base").nullable();
        table.decimal("box_storage_coef_expr").nullable();
        table.decimal("box_delivery_base").nullable();
        table.decimal("box_delivery_liter").nullable();
        table.decimal("box_delivery_coef_expr").nullable();
        table.decimal("box_delivery_marketplace_liter").nullable();
        table.decimal("box_delivery_marketplace_coef_expr").nullable();
        table.decimal("box_delivery_marketplace_base").nullable();
        table.string("date").notNullable();
        table.unique(["date", "warehouse_name"]);
        table.timestamp("created_at").defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("tariffs");
}
