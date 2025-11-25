import { exportTariffsToSheet } from "../services/google_sheets.service.js";

export async function updateGoogleSheetsJob() {
    try {
        console.log("Запущена задача: [Cохранение/обновление данных в Google Sheets]")
        await exportTariffsToSheet();
    } catch (error) {
        console.error(error);
    }
}
