"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdId } from "@/lib/household";

export type GoalFormState = { error: string | null };

export async function createGoal(
  _prevState: GoalFormState,
  formData: FormData,
): Promise<GoalFormState> {
  const name = (formData.get("name") as string)?.trim();
  const targetAmount = Number(formData.get("target_amount"));
  const targetDate = (formData.get("target_date") as string) || null;

  if (!name) return { error: "El nombre es obligatorio." };
  if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
    return { error: "El importe objetivo debe ser mayor que 0." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const householdId = await getHouseholdId(supabase);
  if (!householdId) return { error: "No perteneces a ningún hogar." };

  const { error } = await supabase.from("savings_goals").insert({
    user_id: user.id,
    household_id: householdId,
    name,
    target_amount: targetAmount,
    target_date: targetDate,
  });

  if (error) return { error: error.message };

  revalidatePath("/goal");
  return { error: null };
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();
  await supabase.from("savings_goals").delete().eq("id", id);
  revalidatePath("/goal");
}
