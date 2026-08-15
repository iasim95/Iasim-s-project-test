import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCurrencySymbol(supabase: SupabaseClient): Promise<string> {
  const { data } = await supabase
    .from("user_settings")
    .select("currency_symbol")
    .maybeSingle();
  return data?.currency_symbol || "€";
}

export function formatCurrency(amount: number, symbol = "€"): string {
  const formatted = Math.abs(amount).toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? "-" : ""}${symbol}${formatted}`;
}
