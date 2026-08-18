"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getHouseholdId } from "@/lib/household";

export type HouseholdInviteState = { error: string | null; link: string | null };

export async function createHouseholdInvite(
  _prevState: HouseholdInviteState,
  formData: FormData,
): Promise<HouseholdInviteState> {
  const email = (formData.get("email") as string)?.trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado.", link: null };

  const householdId = await getHouseholdId(supabase);
  if (!householdId) return { error: "No perteneces a ningún hogar.", link: null };

  const { data, error } = await supabase
    .from("household_invites")
    .insert({ household_id: householdId, created_by: user.id, invited_email: email })
    .select("token")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "No se pudo crear la invitación.", link: null };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return { error: null, link: `${siteUrl}/invite/${data.token}` };
}

export type HouseholdMember = {
  userId: string;
  email: string;
  name: string | null;
  isYou: boolean;
};

export async function getHouseholdMembers(): Promise<HouseholdMember[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: members } = await supabase
    .from("household_members")
    .select("user_id");

  if (!members || members.length === 0) return [];

  const admin = createAdminClient();
  const results: HouseholdMember[] = [];
  for (const m of members) {
    const [{ data }, { data: settings }] = await Promise.all([
      admin.auth.admin.getUserById(m.user_id),
      admin.from("user_settings").select("display_name").eq("user_id", m.user_id).maybeSingle(),
    ]);
    results.push({
      userId: m.user_id,
      email: data.user?.email ?? "—",
      name: settings?.display_name?.trim() || null,
      isYou: m.user_id === user.id,
    });
  }
  return results;
}

export async function leaveHousehold() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const householdId = await getHouseholdId(supabase);
  if (!householdId) return;

  const admin = createAdminClient();
  await admin
    .from("household_members")
    .delete()
    .eq("household_id", householdId)
    .eq("user_id", user.id);

  const { data: newHousehold } = await admin
    .from("households")
    .insert({ name: "Mi hogar" })
    .select("id")
    .single();

  if (newHousehold) {
    await admin
      .from("household_members")
      .insert({ household_id: newHousehold.id, user_id: user.id });
  }

  revalidatePath("/settings");
}
