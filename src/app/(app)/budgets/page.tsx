import { createClient } from "@/lib/supabase/server";
import { getSpendByCategoryThisMonth } from "@/lib/spend";
import { getCurrencySymbol } from "@/lib/currency";
import { BudgetRow } from "./budget-row";
import type { Budget, Category } from "@/lib/types";

export default async function BudgetsPage() {
  const supabase = await createClient();

  const [{ data: budgets }, { data: categories }, spend, symbol] = await Promise.all([
    supabase.from("budgets").select("*"),
    supabase.from("categories").select("*").order("name"),
    getSpendByCategoryThisMonth(supabase),
    getCurrencySymbol(supabase),
  ]);

  const budgetByCategory = new Map(
    ((budgets ?? []) as Budget[]).map((b) => [b.category_id, b.monthly_limit]),
  );
  const categoryList = (categories ?? []) as Category[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Presupuestos</h1>
        <p className="text-muted-foreground">
          Define un límite mensual por categoría y recibe una alerta si te pasas. Deja en 0
          para no poner límite.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {categoryList.map((category) => (
          <BudgetRow
            key={category.id}
            category={category}
            spent={spend.get(category.id) ?? 0}
            limit={budgetByCategory.get(category.id) ?? null}
            symbol={symbol}
          />
        ))}
        {categoryList.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Todavía no tienes categorías. Añade alguna primero.
          </p>
        )}
      </div>
    </div>
  );
}
