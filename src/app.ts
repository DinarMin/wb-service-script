import { migrate, seed } from "#postgres/knex.js";
import { fetchTariffsJob } from "./jobs/fetchTariffs.job.js";
import { updateGoogleSheetsJob } from "./jobs/updateGoogleSheets.job.js";
import cron from "node-cron";
import env from "#config/env/env.js";

async function main() {
    console.log("Приложение запускается...");

    console.log("Выполняется первичная миграция таблицы в базу данных...");
    await migrate.latest();
    await seed.run();
    console.log("Все миграции и сиды были успешно выполнены ");

    await fetchTariffsJob();
    await updateGoogleSheetsJob();

    cron.schedule(env.UPDATE_CRON, async () => {
        await fetchTariffsJob();
        await updateGoogleSheetsJob();
    });

    console.log(`
    Планировщик запущен по расписанию "${env.UPDATE_CRON}"
    `);
}

main().catch((err) => {
    console.error("Ошибка при запуске приложения:", err);
    process.exit(1);
});
