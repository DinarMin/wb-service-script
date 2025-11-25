import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.union([z.undefined(), z.enum(["development", "production"])]),

    POSTGRES_HOST: z.union([z.undefined(), z.string()]),
    POSTGRES_PORT: z
        .string()
        .regex(/^[0-9]+$/)
        .transform((value) => parseInt(value)),
    POSTGRES_DB: z.string(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),

    APP_PORT: z.union([
        z.undefined(),
        z
            .string()
            .regex(/^[0-9]+$/)
            .transform((value) => parseInt(value)),
    ]),
    API_KEY_WB: z.string().min(1, "WB API KEY отсутствует или недействителен"),
    GOOGLE_APPLICATION_CREDENTIALS: z.string().min(1, "GOOGLE SHEETS CREGENTIALS отсутствует или недействителен"),
    GOOGLE_SHEETS_ID: z.string().min(1, "GOOGLE_SHEETS_ID отсутствует или недействителен"),
});

const env = envSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_PORT: process.env.POSTGRES_PORT,
    POSTGRES_DB: process.env.POSTGRES_DB,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    APP_PORT: process.env.APP_PORT,
    API_KEY_WB: process.env.API_KEY_WB,
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    GOOGLE_SHEETS_ID: process.env.GOOGLE_SHEETS_ID,
});

export default env;
