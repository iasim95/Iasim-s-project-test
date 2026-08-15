import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSpendByCategoryForMonth } from "@/lib/spend";
import { getMonthlyNetSavings, getNetSavingsSince } from "@/lib/net-savings";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { FadeIn, AnimatedCurrency } from "@/components/motion";
import { ProgressRing } from "@/components/progress-ring";
import { MonthSelector } from "@/components/month-selector";
import { CategoryBarList } from "./category-bar-list";
import type { Budget, Category, Expense, SavingsGoal } from "@/lib/types";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const selectedMonth = params.month || currentMonth;
  const [selYear, selMonthNum] = selectedMonth.split("-").map(Number);

  const fromDate = new Date(selYear, selMonthNum - 1, 1).toISOString().slice(0, 10);
  const toDate = new Date(selYear, selMonthNum, 0).toISOString().slice(0, 10);

  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, amount, expense_date, category:categories(id, name, color)")
    .gte("expense_date", fromDate)
    .lte("expense_date", toDate);

  const rows = (expenses ?? []) as unknown as (Pick<
    Expense,
    "id" | "amount" | "expense_date"
  > & { category: { id: string; name: string; color: string } | null })[];

  const totalSelectedMonth = rows.reduce((sum, r) => sum + Number(r.amount), 0);

  const byCategory = new Map<string, { name: string; value: number; color: string }>();
  for (const row of rows) {
    const key = row.category?.name ?? "Sin categoría";
    const color = row.category?.color ?? "#94a3b8";
    const existing = byCategory.get(key);
    if (existing) {
      existing.value += Number(row.amount);
    } else {
      byCategory.set(key, { name: key, value: Number(row.amount), color });
    }
  }

  const [{ data: budgets }, spend, netSavings, { data: goal }, symbol] = await Promise.all([
    supabase.from("budgets").select("*, category:categories(id, name, color)"),
    getSpendByCategoryForMonth(supabase, selectedMonth),
    getMonthlyNetSavings(supabase, 1, selectedMonth),
    supabase
      .from("savings_goals")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getCurrencySymbol(supabase),
  ]);
  const budgetList = (budgets ?? []) as unknown as (Budget & {
    category: Pick<Category, "id" | "name" | "color">;
  })[];
  const overBudget = budgetList.filter(
    (b) => (spend.get(b.category_id) ?? 0) > b.monthly_limit,
  );
  const incomeSelectedMonth = netSavings[netSavings.length - 1]?.income ?? 0;
  const savingsSelectedMonth = netSavings[netSavings.length - 1]?.net ?? 0;

  const goalData = goal as SavingsGoal | null;
  const goalSaved = goalData
    ? await getNetSavingsSince(supabase, goalData.created_at.slice(0, 10))
    : 0;
  const goalPercent = goalData
    ? Math.max(0, Math.min(100, (goalSaved / goalData.target_amount) * 100))
    : 0;

  return (
    <FadeIn className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Mes:</span>
        <MonthSelector month={selectedMonth} basePath="/dashboard" />
      </div>

      {overBudget.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
          <AlertTriangle className="size-4" />
          {overBudget.length} presupuesto{overBudget.length === 1 ? "" : "s"} superado
          {overBudget.length === 1 ? "" : "s"} este mes
        </div>
      )}

      <FadeIn delay={0.05} className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-2">
            <p className="text-sm text-muted-foreground">Ingreso del mes</p>
            <AnimatedCurrency value={incomeSelectedMonth} symbol={symbol} className="text-3xl font-bold" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-2">
            <p className="text-sm text-muted-foreground">Gastos del mes</p>
            <AnimatedCurrency value={totalSelectedMonth} symbol={symbol} className="text-3xl font-bold" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-2">
            <p className="text-sm text-muted-foreground">Ahorro del mes</p>
            <AnimatedCurrency value={savingsSelectedMonth} symbol={symbol} className="text-3xl font-bold text-success" />
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.12}>
        <CategoryBarList data={Array.from(byCategory.values())} symbol={symbol} />
      </FadeIn>

      <FadeIn delay={0.18}>
        <Link href="/goal">
          <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="flex items-center justify-between gap-4 py-2">
              <div>
                <CardTitle className="text-base">
                  {goalData ? goalData.name : "Sin objetivo de ahorro todavía"}
                </CardTitle>
                <CardDescription>
                  {goalData
                    ? `${formatCurrency(goalSaved, symbol)} de ${formatCurrency(goalData.target_amount, symbol)}`
                    : "Crea uno y sigue tu progreso automáticamente"}
                </CardDescription>
              </div>
              {goalData ? (
                <ProgressRing percent={goalPercent} color="var(--color-primary)" />
              ) : (
                <ArrowRight className="size-4 text-muted-foreground" />
              )}
            </CardContent>
          </Card>
        </Link>
      </FadeIn>
    </FadeIn>
  );
}
