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
 * Maps each household member's user_id to a short display label: their
 * chosen display_name (Ajustes), falling back to the part of their email
 * before the @ if they haven't set one.
 */
export async function getHouseholdMemberLabels(
  supabase: SupabaseClient,
): Promise<Map<string, string>> {
  const { data: members } = await supabase.from("household_members").select("user_id");
  const labels = new Map<string, string>();
  if (!members || members.length === 0) return labels;

  const admin = createAdminClient();
  for (const m of members) {
    const [{ data: authData }, { data: settings }] = await Promise.all([
      admin.auth.admin.getUserById(m.user_id),
      admin.from("user_settings").select("display_name").eq("user_id", m.user_id).maybeSingle(),
    ]);
    const fallback = authData.user?.email?.split("@")[0] ?? "Alguien";
    labels.set(m.user_id, settings?.display_name?.trim() || fallback);
  }
  return labels;
}
