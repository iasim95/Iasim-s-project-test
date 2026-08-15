import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const [categories, expenses, recurringExpenses, budgets, income, savingsGoals, userSettings] =
    await Promise.all([
      supabase.from("categories").select("*"),
      supabase.from("expenses").select("*"),
      supabase.from("recurring_expenses").select("*"),
      supabase.from("budgets").select("*"),
      supabase.from("income").select("*"),
      supabase.from("savings_goals").select("*"),
      supabase.from("user_settings").select("*").maybeSingle(),
    ]);

  const backup = {
    version: 1,
    exported_at: new Date().toISOString(),
    categories: categories.data ?? [],
    expenses: expenses.data ?? [],
    recurring_expenses: recurringExpenses.data ?? [],
    budgets: budgets.data ?? [],
    income: income.data ?? [],
    savings_goals: savingsGoals.data ?? [],
    user_settings: userSettings.data ?? null,
  };

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
