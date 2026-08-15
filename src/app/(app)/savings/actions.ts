"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type IncomeFormState = { error: string | null };

export async function createIncome(
  _prevState: IncomeFormState,
  formData: FormData,
): Promise<IncomeFormState> {
  const amount = Number(formData.get("amount"));
  const description = (formData.get("description") as string) || null;
  const incomeDate = formData.get("income_date") as string;

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "El importe debe ser mayor que 0." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { error } = await supabase.from("income").insert({
    user_id: user.id,
    amount,
    description,
    income_date: incomeDate,
  });

  if (error) return { error: error.message };

  revalidatePath("/savings");
  revalidatePath("/goal");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteIncome(id: string) {
  const supabase = await createClient();
  await supabase.from("income").delete().eq("id", id);

  revalidatePath("/savings");
  revalidatePath("/goal");
  revalidatePath("/dashboard");
}
