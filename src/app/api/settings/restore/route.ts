import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdId } from "@/lib/household";

type BackupCategory = { id: string; name: string; color: string };
type BackupExpense = {
  id: string;
  category_id: string | null;
  recurring_expense_id: string | null;
  installment_group_id: string | null;
  installment_number: number | null;
  installment_total: number | null;
  amount: number;
  description: string | null;
  expense_date: string;
};
type BackupRecurring = {
  id: string;
  category_id: string | null;
  amount: number;
  description: string;
  day_of_month: number;
  active: boolean;
  last_generated_month: string | null;
};
type BackupBudget = { category_id: string; monthly_limit: number };
type BackupIncome = { amount: number; description: string | null; income_date: string };
type BackupGoal = {
  name: string;
  target_amount: number;
  target_date: string | null;
  active: boolean;
};
type Backup = {
  categories?: BackupCategory[];
  expenses?: BackupExpense[];
  recurring_expenses?: BackupRecurring[];
  budgets?: BackupBudget[];
  income?: BackupIncome[];
  savings_goals?: BackupGoal[];
  user_settings?: { default_monthly_income: number | null; currency_symbol: string } | null;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const householdId = await getHouseholdId(supabase);
  if (!householdId) {
    return NextResponse.json({ error: "No perteneces a ningún hogar" }, { status: 400 });
  }

  let backup: Backup;
  try {
    backup = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { data: existingCategories } = await supabase
    .from("categories")
    .select("id, name");
  const categoryIdByName = new Map(
    (existingCategories ?? []).map((c) => [c.name.toLowerCase(), c.id as string]),
  );
  const categoryIdMap = new Map<string, string>();

  for (const cat of backup.categories ?? []) {
    const existing = categoryIdByName.get(cat.name.toLowerCase());
    if (existing) {
      categoryIdMap.set(cat.id, existing);
      continue;
    }
    const { data: inserted, error } = await supabase
      .from("categories")
      .insert({ user_id: user.id, name: cat.name, color: cat.color })
      .select("id")
      .single();
    if (error || !inserted) continue;
    categoryIdMap.set(cat.id, inserted.id);
    categoryIdByName.set(cat.name.toLowerCase(), inserted.id);
  }

  const recurringIdMap = new Map<string, string>();
  for (const rec of backup.recurring_expenses ?? []) {
    const { data: inserted, error } = await supabase
      .from("recurring_expenses")
      .insert({
        user_id: user.id,
        household_id: householdId,
        category_id: rec.category_id ? (categoryIdMap.get(rec.category_id) ?? null) : null,
        amount: rec.amount,
        description: rec.description,
        day_of_month: rec.day_of_month,
        active: rec.active,
        last_generated_month: rec.last_generated_month,
      })
      .select("id")
      .single();
    if (error || !inserted) continue;
    recurringIdMap.set(rec.id, inserted.id);
  }

  let importedExpenses = 0;
  for (const exp of backup.expenses ?? []) {
    const { error } = await supabase.from("expenses").insert({
      user_id: user.id,
      household_id: householdId,
      category_id: exp.category_id ? (categoryIdMap.get(exp.category_id) ?? null) : null,
      recurring_expense_id: exp.recurring_expense_id
        ? (recurringIdMap.get(exp.recurring_expense_id) ?? null)
        : null,
      installment_group_id: exp.installment_group_id,
      installment_number: exp.installment_number,
      installment_total: exp.installment_total,
      amount: exp.amount,
      description: exp.description,
      expense_date: exp.expense_date,
    });
    if (!error) importedExpenses++;
  }

  for (const budget of backup.budgets ?? []) {
    const categoryId = categoryIdMap.get(budget.category_id);
    if (!categoryId) continue;
    await supabase
      .from("budgets")
      .upsert(
        { user_id: user.id, category_id: categoryId, monthly_limit: budget.monthly_limit },
        { onConflict: "user_id,category_id" },
      );
  }

  let importedIncome = 0;
  for (const inc of backup.income ?? []) {
    const { error } = await supabase.from("income").insert({
      user_id: user.id,
      household_id: householdId,
      amount: inc.amount,
      description: inc.description,
      income_date: inc.income_date,
    });
    if (!error) importedIncome++;
  }

  for (const goal of backup.savings_goals ?? []) {
    await supabase.from("savings_goals").insert({
      user_id: user.id,
      household_id: householdId,
      name: goal.name,
      target_amount: goal.target_amount,
      target_date: goal.target_date,
      active: goal.active,
    });
  }

  if (backup.user_settings) {
    await supabase.from("user_settings").upsert({
      user_id: user.id,
      default_monthly_income: backup.user_settings.default_monthly_income,
      currency_symbol: backup.user_settings.currency_symbol,
      updated_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    categories: categoryIdMap.size,
    recurring: recurringIdMap.size,
    expenses: importedExpenses,
    income: importedIncome,
  });
}
