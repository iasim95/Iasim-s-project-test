import type { SupabaseClient } from "@supabase/supabase-js";

export function monthRange(monthKey?: string) {
  const [year, month] = monthKey
    ? monthKey.split("-").map(Number)
    : [new Date().getFullYear(), new Date().getMonth() + 1];

  const from = new Date(year, month - 1, 1).toISOString().slice(0, 10);
  const to = new Date(year, month, 0).toISOString().slice(0, 10);
  return { from, to };
}

export function currentMonthRange() {
  return monthRange();
}

export async function getSpendByCategoryForMonth(
  supabase: SupabaseClient,
  monthKey?: string,
): Promise<Map<string, number>> {
  const { from, to } = monthRange(monthKey);

  const { data } = await supabase
    .from("expenses")
    .select("amount, category_id")
    .gte("expense_date", from)
    .lte("expense_date", to);

  const spend = new Map<string, number>();
  for (const row of data ?? []) {
    if (!row.category_id) continue;
    spend.set(row.category_id, (spend.get(row.category_id) ?? 0) + Number(row.amount));
  }
  return spend;
}

export async function getSpendByCategoryThisMonth(
  supabase: SupabaseClient,
): Promise<Map<string, number>> {
  return getSpendByCategoryForMonth(supabase);
}
