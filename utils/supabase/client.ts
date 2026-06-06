import { createClient } from "@supabase/supabase-js";
import { publicAnonKey, supabaseUrl } from "./info";

export const supabase = createClient(supabaseUrl, publicAnonKey);
