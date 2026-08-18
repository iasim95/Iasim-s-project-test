import { Repeat, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrencySymbol, formatCurrency } from "@/lib/currency";
import { getHouseholdId, getHouseholdMemberLabels } from "@/lib/household";
import { detectSubscriptions } from "@/lib/subscriptions";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/motion";
import { MonthSelector } from "@/components/month-selector";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { AddExpenseForm } from "./add-expense-form";
import { ExpenseFilters } from "./expense-filters";
import { ExpenseList } from "./expense-list";
import { AddSuggestedButton } from "./add-suggested-button";
import type { Category, Expense } from "@/lib/types";

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const month = params.month || currentMonth;
  const [year, monthNum] = month.split("-").map(Number);
  const fromDate = new Date(year, monthNum - 1, 1).toISOString().slice(0, 10);
  const toDate = new Date(year, monthNum, 0).toISOString().slice(0, 10);

  const isGlobalSearch = Boolean(params.q);

  let query = supabase
    .from("expenses")
    .select("*, category:categories(id, name, color)")
    .order("expense_date", { ascending: false });

  if (isGlobalSearch) {
    query = query.ilike("description", `%${params.q}%`).limit(200);
  } else {
    query = query.gte("expense_date", fromDate).lte("expense_date", toDate);
  }
  if (params.category) query = query.eq("category_id", params.category);

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);

  const [
    { data: expenses },
    { data: categories },
    symbol,
    { data: recurringTemplates },
    { data: recentExpenses },
    memberLabelsMap,
    householdId,
  ] = await Promise.all([
    query,
    supabase.from("categories").select("*").order("name"),
    getCurrencySymbol(supabase),
    supabase.from("recurring_expenses").select("description").eq("active", true),
    supabase
      .from("expenses")
      .select("amount, description, expense_date, category:categories(name, color)")
      .is("recurring_expense_id", null)
      .gte("expense_date", twelveMonthsAgo.toISOString().slice(0, 10)),
    getHouseholdMemberLabels(supabase),
    getHouseholdId(supabase),
  ]);

  const categoryList = (categories ?? []) as Category[];
  const expenseList = (expenses ?? []) as unknown as (Expense & {
    category: Pick<Category, "id" | "name" | "color"> | null;
  })[];
  const total = expenseList.reduce((sum, e) => sum + Number(e.amount), 0);
  const memberLabels = Object.fromEntries(memberLabelsMap);

  const existingRecurringDescriptions = new Set(
    (recurringTemplates ?? []).map((r) => r.description.trim().toLowerCase()),
  );
  const suggestions = detectSubscriptions(
    (recentExpenses ?? []) as unknown as Parameters<typeof detectSubscriptions>[0],
  ).filter((s) => !existingRecurringDescriptions.has(s.key));

  return (
    <FadeIn className="flex flex-col gap-6">
      {householdId && <RealtimeRefresh table="expenses" householdId={householdId} />}

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Mes:</span>
        <MonthSelector month={month} basePath="/expenses" />
      </div>

      <AddExpenseForm categories={categoryList} symbol={symbol} />

      <ExpenseFilters categories={categoryList} filters={params} month={month} />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium capitalize">
            {isGlobalSearch ? `Resultados para "${params.q}"` : `Gastos de ${monthLabel(month)}`}
          </h2>
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{formatCurrency(total, symbol)}</span>
          </p>
        </div>

        <ExpenseList
          expenses={expenseList}
          categories={categoryList}
          symbol={symbol}
          memberLabels={memberLabels}
          emptyMessage={
            isGlobalSearch
              ? "No hay gastos que coincidan con la búsqueda."
              : "No hay gastos que coincidan con el filtro."
          }
        />
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
                      <Plus className="size-3.5" /> Repetir cada mes
                    </span>
                  }
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </FadeIn>
  );
}
