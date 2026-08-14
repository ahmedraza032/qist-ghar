import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, base_price, description, specs, images, stock_qty, category_id, markup_percent, down_payment_percent, brand:brands(id, name), category:categories(name, slug)"
    )
    .eq("slug", "hp-pavilion-15")
    .single();
    
  console.log("Error:", error);
  console.log("Data:", data);
}

main();
