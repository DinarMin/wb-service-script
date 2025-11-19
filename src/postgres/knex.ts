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

// Запись данных в БД

export async function saveTariffs(tariffs: any): Promise<void> {
    try {
        return await knex.transaction(async (t) => {
            for (const item of tariffs) {
                await t("tariffs").insert({
                    date: item.date,
                    warehouse_name: item.warehouse_name,
                    geo_name: item.geo_name,
                    box_storage_liter: item.box_storage_liter,
                    box_storage_coef_expr: item.box_storage_coef_expr,
                    box_storage_base: item.box_storage_base,
                    box_delivery_marketplace_liter: item.box_delivery_marketplace_liter,
                    box_delivery_marketplace_coef_expr: item.box_delivery_marketplace_coef_expr,
                    box_delivery_marketplace_base: item.box_delivery_marketplace_base,
                    box_delivery_liter: item.box_delivery_liter,
                    box_delivery_coef_expr: item.box_delivery_coef_expr,
                    box_delivery_base: item.box_delivery_base,
                });
            }
        });
    } catch (error) {
        console.error(error);
        throw new Error("Ошибка в транзакции/записи WB API tariffs в базу данных");
    }
}
