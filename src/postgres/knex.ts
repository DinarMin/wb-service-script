import _knex from "knex";
import knexConfig from "#config/knex/knexfile.js";

const knex = _knex(knexConfig);
export default knex;

function logMigrationResults(action: string, result: [number, string[]]) {
    if (result[1].length === 0) {
        console.log(["latest", "up"].includes(action) ? "All migrations are up to date" : "All migrations have been rolled back");
        return;
    }
    console.log(`Batch ${result[0]} ${["latest", "up"].includes(action) ? "ran" : "rolled back"} the following migrations:`);
    for (const migration of result[1]) {
        console.log("- " + migration);
    }
}
function logMigrationList(list: [{ name: string }[], { file: string }[]]) {
    console.log(`Found ${list[0].length} Completed Migration file/files.`);
    for (const migration of list[0]) {
        console.log("- " + migration.name);
    }
    console.log(`Found ${list[1].length} Pending Migration file/files.`);
    for (const migration of list[1]) {
        console.log("- " + migration.file);
    }
}

function logSeedRun(result: [string[]]) {
    if (result[0].length === 0) {
        console.log("No seeds to run");
    }
    console.log(`Ran ${result[0].length} seed files`);
    for (const seed of result[0]) {
        console.log("- " + seed?.split(/\/|\\/).pop());
    }
    // Ran 5 seed files
}

function logSeedMake(name: string) {
    console.log(`Created seed: ${name.split(/\/|\\/).pop()}`);
}

export const migrate = {
    latest: async () => {
        logMigrationResults("latest", await knex.migrate.latest());
    },
    rollback: async () => {
        logMigrationResults("rollback", await knex.migrate.rollback());
    },
    down: async (name?: string) => {
        logMigrationResults("down", await knex.migrate.down({ name }));
    },
    up: async (name?: string) => {
        logMigrationResults("up", await knex.migrate.up({ name }));
    },
    list: async () => {
        logMigrationList(await knex.migrate.list());
    },
    make: async (name: string) => {
        if (!name) {
            console.error("Please provide a migration name");
            process.exit(1);
        }
        console.log(await knex.migrate.make(name, { extension: "js" }));
    },
};

export const seed = {
    run: async () => {
        logSeedRun(await knex.seed.run());
    },
    make: async (name: string) => {
        if (!name) {
            console.error("Please provide a seed name");
            process.exit(1);
        }
        logSeedMake(await knex.seed.make(name));
    },
};

/* 
Запись данных в Базу данных
param tariffs Массив структурированных данных
return {Promise<void>} Ничего не возвращает либо Ошибку error
*/

export async function saveTariffs(tariffs: any): Promise<void> {
    try {
        console.log("⌛Начат процесс записи актуальных данных с API Wildberries в базу данных.")
        return await knex.transaction(async (knex) => {
            for (const tariff of tariffs) {
                const exists = await knex("tariffs")
                    .where({
                        warehouse_name: tariff.warehouse_name,
                        geo_name: tariff.geo_name,
                    })
                    .first();

                if (!exists) {
                    await knex("tariffs").insert({
                        ...tariff,
                    });
                } else {
                    await knex("tariffs").where({ id: exists.id }).update({
                        date: tariff.date,
                        box_storage_liter: tariff.box_storage_liter,
                        box_storage_coef_expr: tariff.box_storage_coef_expr,
                        box_storage_base: tariff.box_storage_base,
                        box_delivery_marketplace_liter: tariff.box_delivery_marketplace_liter,
                        box_delivery_marketplace_coef_expr: tariff.box_delivery_marketplace_coef_expr,
                        box_delivery_marketplace_base: tariff.box_delivery_marketplace_base,
                        box_delivery_liter: tariff.box_delivery_liter,
                        box_delivery_coef_expr: tariff.box_delivery_coef_expr,
                        box_delivery_base: tariff.box_delivery_base,
                    });
                }
            }
            console.log("✅ Запись актуальных данных успешно завершена.")
        });
    } catch (error) {
        console.error(error);
        throw new Error(`❌ Ошибка при записи тарифов: ${error instanceof Error ? error.message : error}`);
    }
}
