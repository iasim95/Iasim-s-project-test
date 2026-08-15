import { createClient } from "@/lib/supabase/server";
import { getSpendByCategoryForMonth } from "@/lib/spend";
import { getCurrencySymbol } from "@/lib/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthSelector } from "@/components/month-selector";
import { FadeIn } from "@/components/motion";
import { BudgetRow } from "./budget-row";
import type { Budget, Category } from "@/lib/types";

function monthTitle(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const month = params.month || new Date().toISOString().slice(0, 7);

  const [{ data: budgets }, { data: categories }, spend, symbol] = await Promise.all([
    supabase.from("budgets").select("*"),
    supabase.from("categories").select("*").order("name"),
    getSpendByCategoryForMonth(supabase, month),
    getCurrencySymbol(supabase),
  ]);

  const budgetByCategory = new Map(
    ((budgets ?? []) as Budget[]).map((b) => [b.category_id, b.monthly_limit]),
  );
  const categoryList = (categories ?? []) as Category[];

  return (
    <FadeIn className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Mes:</span>
        <MonthSelector month={month} basePath="/budgets" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg capitalize">
            Presupuesto por categoría — {monthTitle(month)}
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
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
            <p className="py-4 text-sm text-muted-foreground">
              Todavía no tienes categorías. Añade alguna primero.
            </p>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  );
}
