import { createServiceClient } from "../src/lib/supabase/server";

async function main() {
  const supabase = await createServiceClient();
  const { data, error } = await supabase.from("settings").upsert([
    { key: "whatsapp_number", value: "923162873835" },
    { key: "business_name", value: "QistGhar" }
  ]);
  if (error) {
    console.error("Error updating settings:", error);
  } else {
    console.log("Successfully updated settings:", data);
  }
}

main();
