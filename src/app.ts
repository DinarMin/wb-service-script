import knex, { migrate, seed } from "#postgres/knex.js";
import { WBApiService } from "./services/wb_api.service.js";
import { saveTariffs } from "./postgres/knex.js";

async function main() {
    await migrate.latest();
    await seed.run();
    console.log("All migrations and seeds have been run");

    const wbService = new WBApiService();
    const result = await wbService.getWBTariffs();

    await saveTariffs(result);
}

main();
