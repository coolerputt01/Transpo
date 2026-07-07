import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

export type SignupPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "buyer" | "seller" | "driver" | "storekeeper";
};

export async function createTranspoUser(payload: SignupPayload) {
  if (!supabase) {
    return {
      ok: false,
      message: "Supabase is not configured yet. Add your keys in .env.local."
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        name: payload.name,
        phone: payload.phone,
        role: payload.role,
        verification_status: "pending"
      }
    }
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, data };
}
