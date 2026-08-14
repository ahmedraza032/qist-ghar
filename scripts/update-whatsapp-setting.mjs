import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        process.env[key] = value;
      }
    }
  }
}

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing Supabase credentials in .env.local");
    return;
  }
  const supabase = createClient(url, key);
  const { data, error } = await supabase.from("settings").upsert([
    { key: "whatsapp_number", value: "923162873835" },
    { key: "business_name", value: "QistGhar" },
    { key: "business_address", value: "Karachi, Pakistan" }
  ]);
  if (error) {
    console.error("Failed to update settings:", error);
  } else {
    console.log("Successfully updated settings:", data);
  }
}

main();
