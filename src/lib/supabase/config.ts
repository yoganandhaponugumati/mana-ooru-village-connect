export type SupabaseRuntimeConfig = {
  url: string;
  publishableKey: string;
};

function readEnv(name: string) {
  return import.meta.env[name] || process.env[name];
}

export function getSupabaseConfig(): SupabaseRuntimeConfig {
  const url = readEnv("VITE_SUPABASE_URL") || readEnv("SUPABASE_URL");
  const publishableKey =
    readEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ||
    readEnv("VITE_SUPABASE_ANON_KEY") ||
    readEnv("SUPABASE_PUBLISHABLE_KEY") ||
    readEnv("SUPABASE_ANON_KEY");

  if (!url || !publishableKey) {
    const missing = [
      ...(!url ? ["VITE_SUPABASE_URL"] : []),
      ...(!publishableKey ? ["VITE_SUPABASE_PUBLISHABLE_KEY"] : []),
    ];
    throw new Error(`Missing Supabase environment variable(s): ${missing.join(", ")}.`);
  }

  return { url, publishableKey };
}
