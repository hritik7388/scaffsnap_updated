import dotenv from "dotenv";
import path from "path/win32";
dotenv.config();


dotenv.config({
  path: path.resolve(__dirname, "../../../../.env")
});

// SERVICE ENV (override)
dotenv.config({
  path: path.resolve(__dirname, "../../.env")
});


/**
 * Strict env validator
 */
const authRequiredEnv = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`❌ Missing required environment variable: ${key}`);
    }
    return value;
};

/**
 * Config Interface
 */
interface AuthServiceConfig {
    NODE_ENV: string;
    SERVICE_NAME: string;
    PORT: number;

    // DB
    DATABASE_URL: string;

    // REDIS
    REDIS_URL: string;

    // JWT 
    JWT_REFRESH_SECRET: string; 
    JWT_REFRESH_EXPIRES_IN: string;

    // LOGGING
    LOG_LEVEL: string;

    // CORS
    ALLOWED_ORIGINS: string;

    // OPTIONAL (future use)
    AWS_ACCESS_KEY_ID?: string;
    AWS_SECRET_ACCESS_KEY?: string;
    AWS_REGION?: string;
    AWS_S3_BUCKET?: string;

    EMAIL_USER?: string;
    EMAIL_PASS?: string;

    FIREBASE_PROJECT_ID?: string;
    FIREBASE_CLIENT_EMAIL?: string;
    FIREBASE_PRIVATE_KEY?: string;
}

/**
 * CONFIG OBJECT
 */
export const config: AuthServiceConfig = {
    // ========================
    // SERVICE
    // ========================
    NODE_ENV: process.env.NODE_ENV || "development",

    SERVICE_NAME:
        process.env.SERVICE_NAME ||
        require("../../../../package.json").name,

    PORT: Number(process.env.PORT) || 3001,

    // ========================
    // DATABASE
    // ========================
    DATABASE_URL: authRequiredEnv("DATABASE_URL"),

    // ========================
    // REDIS
    // ========================
    REDIS_URL: authRequiredEnv("REDIS_URL"),

    // ========================
    // JWT
    // ======================== 

    JWT_REFRESH_SECRET: authRequiredEnv("JWT_REFRESH_SECRET"), 

    JWT_REFRESH_EXPIRES_IN:
        process.env.JWT_REFRESH_EXPIRES_IN || "7d",

    // ========================
    // LOGGING
    // ========================
    LOG_LEVEL: process.env.LOG_LEVEL || "info",

    // ========================
    // CORS
    // ========================
    ALLOWED_ORIGINS:
        process.env.ALLOWED_ORIGINS || "http://localhost:3000",

    // ========================
    // AWS (OPTIONAL)
    // ========================
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,

    // ========================
    // EMAIL (OPTIONAL)
    // ========================
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,

    // ========================
    // FIREBASE (OPTIONAL)
    // ========================
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
};