"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ExpenseFormState = { error: string | null };

type ParsedExpense = {
  amount: number;
  category_id: string | null;
  description: string | null;
  expense_date: string;
};

function parseExpenseForm(
  formData: FormData,
): { ok: true; value: ParsedExpense } | { ok: false; error: string } {
  const amount = Number(formData.get("amount"));
  const categoryId = formData.get("category_id") as string;
  const description = (formData.get("description") as string) || null;
  const expenseDate = formData.get("expense_date") as string;

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "El importe debe ser mayor que 0." };
  }

  return {
    ok: true,
    value: {
      amount,
      category_id: categoryId || null,
      description,
      expense_date: expenseDate,
    },
  };
}

export async function createExpense(
  _prevState: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  const parsed = parseExpenseForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { error } = await supabase.from("expenses").insert({
    ...parsed.value,
    user_id: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateExpense(
  id: string,
  _prevState: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  const parsed = parseExpenseForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("expenses")
    .update(parsed.value)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  await supabase.from("expenses").delete().eq("id", id);

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}
