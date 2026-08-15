import Link from "next/link";
import { AlertTriangle, ArrowRight, Wallet, Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSpendByCategoryThisMonth } from "@/lib/spend";
import { getMonthlyNetSavings, getNetSavingsSince } from "@/lib/net-savings";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { FadeIn, AnimatedCurrency } from "@/components/motion";
import { ProgressRing } from "@/components/progress-ring";
import { CategoryPieChart, MonthlyBarChart } from "./expense-charts";
import type { Budget, Category, Expense, SavingsGoal } from "@/lib/types";

const currency = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

function monthKey(date: string) {
  return date.slice(0, 7); // YYYY-MM
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("es-ES", {
    month: "short",
    year: "2-digit",
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  const fromDate = sixMonthsAgo.toISOString().slice(0, 10);

  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, amount, expense_date, category:categories(id, name, color)")
    .gte("expense_date", fromDate)
    .order("expense_date", { ascending: true });

  const rows = (expenses ?? []) as unknown as (Pick<
    Expense,
    "id" | "amount" | "expense_date"
  > & { category: { id: string; name: string; color: string } | null })[];

  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthRows = rows.filter((r) => monthKey(r.expense_date) === currentMonth);
  const totalThisMonth = thisMonthRows.reduce((sum, r) => sum + Number(r.amount), 0);

  const byCategory = new Map<string, { name: string; value: number; color: string }>();
  for (const row of thisMonthRows) {
    const key = row.category?.name ?? "Sin categoría";
    const color = row.category?.color ?? "#94a3b8";
    const existing = byCategory.get(key);
    if (existing) {
      existing.value += Number(row.amount);
    } else {
      byCategory.set(key, { name: key, value: Number(row.amount), color });
    }
  }

  const byMonth = new Map<string, number>();
  for (const row of rows) {
    const key = monthKey(row.expense_date);
    byMonth.set(key, (byMonth.get(key) ?? 0) + Number(row.amount));
  }
  const monthlyData = Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, total]) => ({ month: monthLabel(key), total }));

  const [{ data: budgets }, spend, netSavings, { data: goal }] = await Promise.all([
    supabase.from("budgets").select("*, category:categories(id, name, color)"),
    getSpendByCategoryThisMonth(supabase),
    getMonthlyNetSavings(supabase, 1),
    supabase
      .from("savings_goals")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  const budgetList = (budgets ?? []) as unknown as (Budget & {
    category: Pick<Category, "id" | "name" | "color">;
  })[];
  const overBudget = budgetList.filter(
    (b) => (spend.get(b.category_id) ?? 0) > b.monthly_limit,
  );
  const incomeThisMonth = netSavings[netSavings.length - 1]?.income ?? 0;
  const savingsThisMonth = netSavings[netSavings.length - 1]?.net ?? 0;

  const goalData = goal as SavingsGoal | null;
  const goalSaved = goalData
    ? await getNetSavingsSince(supabase, goalData.created_at.slice(0, 10))
    : 0;
  const goalPercent = goalData
    ? Math.max(0, Math.min(100, (goalSaved / goalData.target_amount) * 100))
    : 0;

  const monthName = new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  return (
    <FadeIn className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-violet-700 p-6 text-primary-foreground shadow-lg dark:text-white">
        <div
          className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-white/10"
          aria-hidden
        />
        <div className="relative flex items-center justify-between">
          <p className="font-medium">
            Hola{user?.email ? `, ${user.email.split("@")[0]}` : ""}
          </p>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium capitalize backdrop-blur-sm">
            {monthName}
          </span>
        </div>
        <p className="relative mt-6 text-sm text-primary-foreground/75 dark:text-white/75">
          Ahorro neto este mes
        </p>
        <AnimatedCurrency
          value={savingsThisMonth}
          className="relative block text-4xl font-semibold tracking-tight"
        />
        {overBudget.length > 0 && (
          <span className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <AlertTriangle className="size-3.5" />
            {overBudget.length} presupuesto{overBudget.length === 1 ? "" : "s"} superado
            {overBudget.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/savings">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 py-2">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                <Wallet className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ingresos este mes</p>
                <AnimatedCurrency value={incomeThisMonth} className="text-xl font-semibold" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/expenses">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 py-2">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                <Receipt className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gastado este mes</p>
                <AnimatedCurrency value={totalThisMonth} className="text-xl font-semibold" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CategoryPieChart data={Array.from(byCategory.values())} />
        <MonthlyBarChart data={monthlyData} />
      </div>

      <Link href="/goal">
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="flex items-center justify-between gap-4 py-2">
            <div>
              <CardTitle className="text-base">
                {goalData ? goalData.name : "Sin objetivo de ahorro todavía"}
              </CardTitle>
              <CardDescription>
                {goalData
                  ? `${currency.format(goalSaved)} de ${currency.format(goalData.target_amount)}`
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
  );
}
