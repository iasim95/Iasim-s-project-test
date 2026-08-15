"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type BudgetFormState = { error: string | null };

export async function upsertBudget(
  _prevState: BudgetFormState,
  formData: FormData,
): Promise<BudgetFormState> {
  const categoryId = formData.get("category_id") as string;
  const monthlyLimit = Number(formData.get("monthly_limit"));

  if (!categoryId) return { error: "Selecciona una categoría." };
  if (!Number.isFinite(monthlyLimit) || monthlyLimit <= 0) {
    return { error: "El límite debe ser mayor que 0." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { error } = await supabase
    .from("budgets")
    .upsert(
      { user_id: user.id, category_id: categoryId, monthly_limit: monthlyLimit },
      { onConflict: "user_id,category_id" },
    );

  if (error) return { error: error.message };

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteBudget(id: string) {
  const supabase = await createClient();
  await supabase.from("budgets").delete().eq("id", id);

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
}
