import type { SupabaseClient } from "@supabase/supabase-js";

export type MonthlyNet = { month: string; income: number; expenses: number; net: number };

function monthKey(date: string) {
  return date.slice(0, 7);
}

export async function getMonthlyNetSavings(
  supabase: SupabaseClient,
  monthsBack = 6,
): Promise<MonthlyNet[]> {
  const from = new Date();
  from.setMonth(from.getMonth() - (monthsBack - 1));
  from.setDate(1);
  const fromDate = from.toISOString().slice(0, 10);

  const [{ data: income }, { data: expenses }] = await Promise.all([
    supabase.from("income").select("amount, income_date").gte("income_date", fromDate),
    supabase.from("expenses").select("amount, expense_date").gte("expense_date", fromDate),
  ]);

  const byMonth = new Map<string, MonthlyNet>();
  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
    const key = d.toISOString().slice(0, 7);
    byMonth.set(key, { month: key, income: 0, expenses: 0, net: 0 });
  }

  for (const row of income ?? []) {
    const entry = byMonth.get(monthKey(row.income_date));
    if (entry) entry.income += Number(row.amount);
  }
  for (const row of expenses ?? []) {
    const entry = byMonth.get(monthKey(row.expense_date));
    if (entry) entry.expenses += Number(row.amount);
  }
  for (const entry of byMonth.values()) {
    entry.net = entry.income - entry.expenses;
  }

  return Array.from(byMonth.values()).sort((a, b) => a.month.localeCompare(b.month));
}

export async function getNetSavingsSince(
  supabase: SupabaseClient,
  sinceDate: string,
): Promise<number> {
  const [{ data: income }, { data: expenses }] = await Promise.all([
    supabase.from("income").select("amount").gte("income_date", sinceDate),
    supabase.from("expenses").select("amount").gte("expense_date", sinceDate),
  ]);

  const totalIncome = (income ?? []).reduce((sum, r) => sum + Number(r.amount), 0);
  const totalExpenses = (expenses ?? []).reduce((sum, r) => sum + Number(r.amount), 0);
  return totalIncome - totalExpenses;
}
