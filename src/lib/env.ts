/**
 * Centralized Environment Configuration & Validation
 * Provides fail-safe runtime checking for both client-side and server-side configurations.
 */

export interface AppEnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isProduction: boolean;
  isDevelopment: boolean;
  appUrl: string;
  firebaseApiKey?: string;
  firebaseProjectId?: string;
  firebaseMessagingSenderId?: string;
  firebaseAppId?: string;
  openWeatherApiKey?: string;
}

function getEnvVar(key: string, defaultValue = ""): string {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    const val = import.meta.env[key];
    if (typeof val === "string") return val.trim();
  }
  if (typeof process !== "undefined" && process.env) {
    const val = process.env[key];
    if (typeof val === "string") return val.trim();
  }
  return defaultValue;
}

export const env: AppEnvConfig = {
  supabaseUrl: getEnvVar("VITE_SUPABASE_URL"),
  supabaseAnonKey:
    getEnvVar("VITE_SUPABASE_ANON_KEY") || getEnvVar("VITE_SUPABASE_PUBLISHABLE_KEY"),
  isProduction: getEnvVar("NODE_ENV") === "production" || getEnvVar("MODE") === "production",
  isDevelopment: getEnvVar("NODE_ENV") !== "production" && getEnvVar("MODE") !== "production",
  appUrl: getEnvVar("VITE_APP_URL", "https://grammitra-app.vercel.app"),
  firebaseApiKey: getEnvVar("VITE_FIREBASE_API_KEY"),
  firebaseProjectId: getEnvVar("VITE_FIREBASE_PROJECT_ID"),
  firebaseMessagingSenderId: getEnvVar("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  firebaseAppId: getEnvVar("VITE_FIREBASE_APP_ID"),
  openWeatherApiKey: getEnvVar("VITE_OPENWEATHER_API_KEY"),
};

/**
 * Validates that essential environment variables are set.
 * In development, issues helpful diagnostic warnings.
 */
export function validateEnvironment(): { isValid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!env.supabaseUrl) {
    missing.push("VITE_SUPABASE_URL");
  }
  if (!env.supabaseAnonKey) {
    missing.push("VITE_SUPABASE_ANON_KEY / VITE_SUPABASE_PUBLISHABLE_KEY");
  }

  if (missing.length > 0 && env.isDevelopment) {
    console.warn(
      `[GramMitra Security Warning] Missing required environment variables:\n- ${missing.join("\n- ")}`,
    );
  }

  return {
    isValid: missing.length === 0,
    missing,
  };
}
