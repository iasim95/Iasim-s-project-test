"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type RecurringFormState = { error: string | null };

export async function createRecurringExpense(
  _prevState: RecurringFormState,
  formData: FormData,
): Promise<RecurringFormState> {
  const amount = Number(formData.get("amount"));
  const description = (formData.get("description") as string)?.trim();
  const categoryId = (formData.get("category_id") as string) || null;
  const dayOfMonth = Number(formData.get("day_of_month"));

  if (!description) return { error: "La descripción es obligatoria." };
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "El importe debe ser mayor que 0." };
  }
  if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
    return { error: "El día debe estar entre 1 y 31." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { error } = await supabase.from("recurring_expenses").insert({
    user_id: user.id,
    category_id: categoryId,
    amount,
    description,
    day_of_month: dayOfMonth,
  });

  if (error) return { error: error.message };

  revalidatePath("/recurring");
  return { error: null };
}

export async function toggleRecurringExpense(id: string, active: boolean) {
  const supabase = await createClient();
  await supabase.from("recurring_expenses").update({ active }).eq("id", id);
  revalidatePath("/recurring");
}

export async function deleteRecurringExpense(id: string) {
  const supabase = await createClient();
  await supabase.from("recurring_expenses").delete().eq("id", id);
  revalidatePath("/recurring");
}
