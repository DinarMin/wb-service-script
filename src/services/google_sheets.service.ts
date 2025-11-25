import { google } from "googleapis";
import env from "../config/env/env.js";
import knex from "../postgres/knex.js";
import type { ParseWBData } from "./wb_api.service.js";

export interface fullDataWB extends ParseWBData {
    id: string | number;
}
/* 
Запись данных в GoogleSheets 
@param 
@returns {Promise<void>} Ничего не возвращает
 */

export async function exportTariffsToSheet(): Promise<void> {
    try {
        const credentials = JSON.parse(env.GOOGLE_APPLICATION_CREDENTIALS);

        const auth = new google.auth.GoogleAuth({
            credentials: {
                ...credentials,
                private_key: credentials.private_key.replace(/\\n/g, "\n"),
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        console.log("⌛ Начат процесс сохранение/обновление данных в Google Sheets");

        const spreadsheets = env.GOOGLE_SHEETS_ID;
        const range = "stocks_coefs!A1";
        const sheetName = "stocks_coefs";

        const columns = await knex("tariffs").columnInfo();
        const cols = Object.keys(columns).filter((c) => c !== "created_at");
        const tariffs: fullDataWB[] = await knex("tariffs").select(cols);

        const conversion = toSheetsConversion(tariffs);

        await sheets.spreadsheets.values.clear({
            spreadsheetId: spreadsheets,
            range: sheetName,
        });

        await sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheets,
            range,
            valueInputOption: "RAW",
            requestBody: { values: conversion },
        });

        console.log("✅ Данные успешно записаны в Google Sheets");
    } catch (error) {
        console.error("❌ Произошла ошибка сохранение/обновление данных в Google Sheets:", error);
    }
}

/* 
Форматирует заголовки на русский язык
@param rows Массив структурированных данных {type ParseWBData}
@returns any[] Массив массивов
 */

function toSheetsConversion(rows: fullDataWB[]): any[][] {
    if (rows.length === 0) return [];

    const headers = [
        "ID",
        "Склад",
        "Округ",
        "За литр хранения",
        "База хранения",
        "Коэф. хранения",
        "База доставки",
        "За литр доставки",
        "Коэф. доставки",
        "За литр МП",
        "Коэф. МП-доставки",
        "База МП-доставки",
        "Актуально до",
    ];

    const values = rows.map((row) => [
        row.id,
        row.warehouse_name,
        row.geo_name,
        row.box_storage_liter || "N/A",
        row.box_storage_base || "N/A",
        row.box_storage_coef_expr || "N/A",
        row.box_delivery_base || "N/A",
        row.box_delivery_liter || "N/A",
        row.box_delivery_coef_expr || "N/A",
        row.box_delivery_marketplace_liter || "N/A",
        row.box_delivery_marketplace_coef_expr || "N/A",
        row.box_delivery_marketplace_base || "N/A",
        row.date,
    ]);

    return [headers, ...values];
}