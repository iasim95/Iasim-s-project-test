import type { SupabaseClient } from "@supabase/supabase-js";

export function currentMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
  return { from, to };
}

export async function getSpendByCategoryThisMonth(
  supabase: SupabaseClient,
): Promise<Map<string, number>> {
  const { from, to } = currentMonthRange();

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
