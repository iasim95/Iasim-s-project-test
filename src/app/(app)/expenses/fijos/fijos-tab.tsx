import { Repeat, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { detectSubscriptions } from "@/lib/subscriptions";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon } from "@/lib/category-icons";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";
import { RecurringForm } from "./recurring-form";
import { RecurringRowActions } from "./recurring-row-actions";
import { AddSuggestedButton } from "./add-suggested-button";
import type { Category, RecurringExpense } from "@/lib/types";

export async function FijosTab() {
  const supabase = await createClient();

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);

  const [{ data: recurring }, { data: categories }, { data: recentExpenses }, symbol] =
    await Promise.all([
      supabase
        .from("recurring_expenses")
        .select("*, category:categories(id, name, color)")
        .order("day_of_month"),
      supabase.from("categories").select("*").order("name"),
      supabase
        .from("expenses")
        .select("amount, description, expense_date, category:categories(name, color)")
        .is("recurring_expense_id", null)
        .gte("expense_date", twelveMonthsAgo.toISOString().slice(0, 10)),
      getCurrencySymbol(supabase),
    ]);

  const recurringList = (recurring ?? []) as unknown as (RecurringExpense & {
    category: Pick<Category, "id" | "name" | "color"> | null;
  })[];
  const categoryList = (categories ?? []) as Category[];

  const existingDescriptions = new Set(
    recurringList.map((r) => r.description.trim().toLowerCase()),
  );
  const suggestions = detectSubscriptions(
    (recentExpenses ?? []) as unknown as Parameters<typeof detectSubscriptions>[0],
  ).filter((s) => !existingDescriptions.has(s.key));

  const totalMonthly = recurringList
    .filter((r) => r.active)
    .reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">Total fijo mensual</p>
          <p className="text-2xl font-semibold">{formatCurrency(totalMonthly, symbol)}</p>
        </CardContent>
      </Card>

      <RecurringForm categories={categoryList} />

      <div className="flex flex-col divide-y overflow-hidden rounded-2xl border">
        {recurringList.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No tienes gastos fijos configurados.
          </p>
        )}
        {recurringList.map((item) => (
          <div key={item.id} className="flex items-center gap-4 px-4 py-3">
            <CategoryIcon name={item.category?.name ?? "Otros"} color={item.category?.color ?? "#94a3b8"} />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{item.description}</p>
              <p className="text-xs text-muted-foreground">
                {item.category?.name ?? "Sin categoría"} · Día {item.day_of_month}
              </p>
            </div>
            <span className="font-semibold">{formatCurrency(item.amount, symbol)}</span>
            <RecurringRowActions id={item.id} active={item.active} />
          </div>
        ))}
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-muted-foreground">
            Hemos detectado estos posibles gastos fijos en tu historial
          </p>
          {suggestions.map((s) => (
            <Card key={s.key}>
              <CardContent className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                    <Repeat className="size-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium capitalize">{s.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.occurrences} cargos · ~{formatCurrency(s.averageAmount, symbol)}/mes
                    </p>
                  </div>
                </div>
                <AddSuggestedButton
                  description={s.description}
                  amount={s.averageAmount}
                  categoryName={s.categoryName}
                  categories={categoryList}
                  trigger={
                    <span className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                      <Plus className="size-3.5" /> Añadir como fijo
                    </span>
                  }
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
