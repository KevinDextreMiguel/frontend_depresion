/** Configuración Supabase — proyecto MindCheck */
export const projectId =
  import.meta.env.VITE_SUPABASE_PROJECT_REF ||
  import.meta.env.VITE_SUPABASE_URL?.replace("https://", "").split(".")[0] ||
  "hlfqmhsatxiiyzhwqacq";

export const publicAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_-r4NNThNElqVV9ungL2NTA_CFoz0LMX";

export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  `https://${projectId}.supabase.co`;
