"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type BudgetFormState = { error: string | null };

export async function setCategoryBudget(categoryId: string, monthlyLimit: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  if (!Number.isFinite(monthlyLimit) || monthlyLimit <= 0) {
    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("category_id", categoryId)
      .eq("user_id", user.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("budgets")
      .upsert(
        { user_id: user.id, category_id: categoryId, monthly_limit: monthlyLimit },
        { onConflict: "user_id,category_id" },
      );
    if (error) return { error: error.message };
  }

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { error: null };
}
