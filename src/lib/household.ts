import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

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

/**
 * Maps each household member's user_id to a short display label:
 * "Tú" for the current user, otherwise the part of their email before the @.
 */
export async function getHouseholdMemberLabels(
  supabase: SupabaseClient,
): Promise<Map<string, string>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: members } = await supabase.from("household_members").select("user_id");
  const labels = new Map<string, string>();
  if (!members || members.length === 0) return labels;

  const admin = createAdminClient();
  for (const m of members) {
    if (m.user_id === user?.id) {
      labels.set(m.user_id, "Tú");
      continue;
    }
    const { data } = await admin.auth.admin.getUserById(m.user_id);
    labels.set(m.user_id, data.user?.email?.split("@")[0] ?? "Alguien");
  }
  return labels;
}
