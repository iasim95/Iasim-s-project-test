"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SettingsFormState = { error: string | null };

export async function updateGeneralSettings(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const defaultIncome = formData.get("default_monthly_income");
  const currencySymbol = (formData.get("currency_symbol") as string)?.trim() || "€";
  const displayName = (formData.get("display_name") as string)?.trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { error } = await supabase.from("user_settings").upsert({
    user_id: user.id,
    default_monthly_income: defaultIncome ? Number(defaultIncome) : null,
    currency_symbol: currencySymbol.slice(0, 3),
    display_name: displayName,
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/goal");
  revalidatePath("/expenses");
  return { error: null };
}

// Only strictly personal tables. Expenses/income/recurring_expenses/savings_goals
// are shared with the household, so one member deleting "all data" must not
// wipe them out from under a partner who hasn't consented.
const PERSONAL_DATA_TABLES = ["budgets", "categories", "user_settings"] as const;

export async function deleteAllData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  for (const table of PERSONAL_DATA_TABLES) {
    await supabase.from(table).delete().eq("user_id", user.id);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
