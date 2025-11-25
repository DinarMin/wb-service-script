import axios from "axios";
import env from "../config/env/env.js";

export interface WBResponse {
    response: {
        data: {
            dtNextBox: string;
            dtTillMax: string;
            warehouseList: Array<{
                boxDeliveryBase: string;
                boxDeliveryCoefExpr: string;
                boxDeliveryLiter: string;
                boxDeliveryMarketplaceBase: string;
                boxDeliveryMarketplaceCoefExpr: string;
                boxDeliveryMarketplaceLiter: string;
                boxStorageBase: string;
                boxStorageCoefExpr: string;
                boxStorageLiter: string;
                geoName: string;
                warehouseName: string;
            }>;
        };
    };
}

export interface ParseWBData {
    warehouse_name: string;
    geo_name: string;
    box_storage_liter: number | null;
    box_storage_coef_expr: number | null;
    box_storage_base: number | null;
    box_delivery_marketplace_liter: number | null;
    box_delivery_marketplace_coef_expr: number | null;
    box_delivery_marketplace_base: number | null;
    box_delivery_liter: number | null;
    box_delivery_coef_expr: number | null;
    box_delivery_base: number | null;
    date: string;
}

class WBApiError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "WBApiError";
    }
}

/* 
Сервис получения данных tariffs от WB API 
*/

export class WBApiService {
    private readonly apiUrl = "https://common-api.wildberries.ru/api/v1/tariffs/box";
    private readonly apiKey = env.API_KEY_WB;

    /* 
    Форматирует дату в строку yyyy-mm-dd
    */

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    /* 
    Получение акуольнаых данных с API Wildberries
    @param date Дата для получение данных
    @returns {<Promise<ParseWBData[]} Массив структурированных данных
    @throws {Error} Не удалось получить данные из API
    */

    async getWBTariffs(date: Date = new Date()): Promise<ParseWBData[]> {
        console.log("⌛ Начат процесс получение актуальных данных с API Wildberries.");

        if (!this.apiKey) {
            throw new WBApiError("⛔ WB API KEY отсутствует или недействителен.");
        }

        try {
            const response = await axios.get<WBResponse>(this.apiUrl, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                params: {
                    date: this.formatDate(date),
                },
                timeout: 10000,
            });

            const parsedWBData: ParseWBData[] = this.parseData(response.data, date);
            console.log("✅ Получение актуальных данных успешно завершена.");
            return parsedWBData;
        } catch (error) {
            console.error(error);
            throw new WBApiError(`❌ Ошибка при получении данных WB API tariffs: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /*
    Заменяет в числоах запятые на точки
    @param value Строкаовое значение числа
    @returns {number | null} Обработанное число или null
     */

    private parseNumber(value: string): number | null {
        if (!value || value === "-") return null;
        const parsed = parseFloat(value.replace(",", ".").trim());
        return isNaN(parsed) ? null : parsed;
    }

    /* 
    Парсит ответ от API Wildberries
    @param data Ответ от API
    @param date Дата тарифов
    @returns {ParsedTariff[]} Массив структурированных данных
    */
    private parseData(data: WBResponse, date: Date): ParseWBData[] {
        try {
            return data.response.data.warehouseList.map((warehouse) => ({
                warehouse_name: warehouse.warehouseName,
                geo_name: warehouse.geoName,
                box_storage_liter: this.parseNumber(warehouse.boxStorageLiter) || null,
                box_storage_coef_expr: this.parseNumber(warehouse.boxStorageCoefExpr) || null,
                box_storage_base: this.parseNumber(warehouse.boxStorageBase) || null,
                box_delivery_marketplace_liter: this.parseNumber(warehouse.boxDeliveryMarketplaceLiter) || null,
                box_delivery_marketplace_coef_expr: this.parseNumber(warehouse.boxDeliveryMarketplaceCoefExpr) || null,
                box_delivery_marketplace_base: this.parseNumber(warehouse.boxDeliveryMarketplaceBase),
                box_delivery_liter: this.parseNumber(warehouse.boxDeliveryLiter) || null,
                box_delivery_coef_expr: this.parseNumber(warehouse.boxDeliveryCoefExpr) || null,
                box_delivery_base: this.parseNumber(warehouse.boxDeliveryBase) || null,
                date: this.formatDate(date),
            }));
        } catch (error) {
            console.error(error);
            throw new Error("❌ Ошибка в формате данных от WB API tariffs!");
        }
    }
}
