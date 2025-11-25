import { WBApiService } from "../services/wb_api.service.js";
import { saveTariffs } from "../postgres/knex.js";

export async function fetchTariffsJob() {
    try {
        console.log("Запущена задача: [Получение актуальных данных с API Wildberries и запись в БД]")
        const wbService = new WBApiService();
        const result = await wbService.getWBTariffs();

        await saveTariffs(result);
        console.log("")
    } catch (error) {
        console.error(error);
    }
}
