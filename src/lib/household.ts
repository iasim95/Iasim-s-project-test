import type { SupabaseClient } from "@supabase/supabase-js";

export async function getHouseholdId(supabase: SupabaseClient): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return data?.household_id ?? null;
}
