import { createClient } from "@supabase/supabase-js";
process.loadEnvFile(".env");

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

console.log("Connecting to Supabase URL:", url);
const supabase = createClient(url, key);

async function check() {
  try {
    const { data, error } = await supabase.from("notifications").select("id, dedupe_key").limit(5);
    if (error) {
      console.error("Error fetching notifications:", error);
    } else {
      console.log("Success! Notifications sample count:", data.length);
    }

    // Check if there are duplicate dedupe_keys right now
    const { data: allNotifs, error: err2 } = await supabase
      .from("notifications")
      .select("id, dedupe_key")
      .not("dedupe_key", "is", null);
    if (!err2 && allNotifs) {
      const seen = new Set();
      let dups = 0;
      for (const n of allNotifs) {
        if (seen.has(n.dedupe_key)) dups++;
        seen.add(n.dedupe_key);
      }
      console.log(
        `Total notifications with dedupe_key: ${allNotifs.length}, duplicates found: ${dups}`,
      );
    }
  } catch (err) {
    console.error("Exception:", err);
  }
}

check();
