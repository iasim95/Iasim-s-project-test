import { createClient } from "@/lib/supabase/server";
import { getSpendByCategoryThisMonth } from "@/lib/spend";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon } from "@/lib/category-icons";
import { ProgressRing } from "@/components/progress-ring";
import { BudgetForm } from "./budget-form";
import { DeleteBudgetButton } from "./delete-budget-button";
import type { Budget, Category } from "@/lib/types";

const currency = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

export default async function BudgetsPage() {
  const supabase = await createClient();

  const [{ data: budgets }, { data: categories }, spend] = await Promise.all([
    supabase.from("budgets").select("*, category:categories(id, name, color)"),
    supabase.from("categories").select("*").order("name"),
    getSpendByCategoryThisMonth(supabase),
  ]);

  const budgetList = (budgets ?? []) as unknown as (Budget & {
    category: Pick<Category, "id" | "name" | "color">;
  })[];
  const categoryList = (categories ?? []) as Category[];
  const budgetedCategoryIds = new Set(budgetList.map((b) => b.category_id));
  const availableCategories = categoryList.filter((c) => !budgetedCategoryIds.has(c.id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Presupuestos</h1>
        <p className="text-muted-foreground">
          Define un límite mensual por categoría y recibe una alerta si te pasas.
        </p>
      </div>

      {availableCategories.length > 0 && <BudgetForm categories={availableCategories} />}

      <div className="grid gap-3 md:grid-cols-2">
        {budgetList.map((budget) => {
          const spent = spend.get(budget.category_id) ?? 0;
          const percent = Math.min(100, (spent / budget.monthly_limit) * 100);
          const over = spent > budget.monthly_limit;

          return (
            <Card key={budget.id}>
              <CardContent className="flex items-center gap-4 py-2">
                <CategoryIcon name={budget.category.name} color={budget.category.color} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{budget.category.name}</p>
                  <p className={over ? "text-sm font-medium text-destructive" : "text-sm text-muted-foreground"}>
                    {currency.format(spent)} de {currency.format(budget.monthly_limit)}
                    {over && " · ¡Superado!"}
                  </p>
                </div>
                <ProgressRing percent={percent} color={over ? "var(--color-destructive)" : budget.category.color} />
                <DeleteBudgetButton id={budget.id} />
              </CardContent>
            </Card>
          );
        })}
        {budgetList.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Todavía no has definido ningún presupuesto.
          </p>
        )}
      </div>
    </div>
  );
}
