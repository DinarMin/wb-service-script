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
    date: Date;
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
}

// Сервис получения данных tariffs от WB API

export class WBApiService {
    private readonly apiUrl = "https://common-api.wildberries.ru/api/v1/tariffs/box";
    private readonly apiKey = env.API_KEY_WB;

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    async getWBTariffs(date: Date = new Date()) {
        try {
            if (!this.apiKey) {
                throw new Error("WB API KEY отсутствует или недействителен");
            }

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

            const parsedWBData = this.parseData(response.data, date);
            return parsedWBData;
        } catch (error) {
            console.error(error);
        }
    }

    private parseNumber(value: string): number | null {
        if (!value || value === "-") return null;
        const parsed = parseFloat(value.replace(",", ".").trim());
        return isNaN(parsed) ? null : parsed;
    }

    private parseData(data: WBResponse, date: Date): ParseWBData[] {
        try {
            return data.response.data.warehouseList.map((warehouse) => ({
                date: new Date(date),
                warehouse_name: warehouse.warehouseName,
                geo_name: warehouse.geoName,
                box_storage_liter: this.parseNumber(warehouse.boxStorageLiter),
                box_storage_coef_expr: this.parseNumber(warehouse.boxStorageCoefExpr),
                box_storage_base: this.parseNumber(warehouse.boxStorageBase),
                box_delivery_marketplace_liter: this.parseNumber(warehouse.boxDeliveryMarketplaceLiter),
                box_delivery_marketplace_coef_expr: this.parseNumber(warehouse.boxDeliveryMarketplaceCoefExpr),
                box_delivery_marketplace_base: this.parseNumber(warehouse.boxDeliveryMarketplaceBase),
                box_delivery_liter: this.parseNumber(warehouse.boxDeliveryLiter),
                box_delivery_coef_expr: this.parseNumber(warehouse.boxDeliveryCoefExpr),
                box_delivery_base: this.parseNumber(warehouse.boxDeliveryBase),
            }));
        } catch (error) {
            console.error(error);
            throw new Error("Ошибка в формате данных от WB API tariffs!")
        }
    }
}
