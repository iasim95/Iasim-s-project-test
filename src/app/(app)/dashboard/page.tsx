import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSpendByCategoryThisMonth } from "@/lib/spend";
import { getMonthlyNetSavings, getNetSavingsSince } from "@/lib/net-savings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FadeIn, AnimatedCurrency } from "@/components/motion";
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
  const savingsThisMonth = netSavings[netSavings.length - 1]?.net ?? 0;

  const goalData = goal as SavingsGoal | null;
  const goalSaved = goalData
    ? await getNetSavingsSince(supabase, goalData.created_at.slice(0, 10))
    : 0;
  const goalPercent = goalData
    ? Math.max(0, Math.min(100, (goalSaved / goalData.target_amount) * 100))
    : 0;

  return (
    <FadeIn className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hola{user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground">Así va tu mes.</p>
      </div>

      {overBudget.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Presupuesto superado</AlertTitle>
          <AlertDescription>
            {overBudget.map((b) => (
              <div key={b.id}>
                {b.category.name}: {currency.format(spend.get(b.category_id) ?? 0)} de{" "}
                {currency.format(b.monthly_limit)}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/expenses">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardDescription>Gastado este mes</CardDescription>
              <AnimatedCurrency value={totalThisMonth} className="text-3xl font-semibold" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {thisMonthRows.length} movimiento{thisMonthRows.length === 1 ? "" : "s"}{" "}
                registrado{thisMonthRows.length === 1 ? "" : "s"}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/savings">
          <Card className="h-full border-primary/30 bg-accent/40 transition-shadow hover:shadow-md">
            <CardHeader>
              <CardDescription>Ahorro neto este mes</CardDescription>
              <AnimatedCurrency value={savingsThisMonth} className="text-3xl font-semibold" />
            </CardHeader>
            <CardContent>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                Ver ingresos y gastos <ArrowRight className="size-3" />
              </p>
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
          <CardHeader>
            <CardTitle className="text-base">
              {goalData ? goalData.name : "Sin objetivo de ahorro todavía"}
            </CardTitle>
            <CardDescription>
              {goalData
                ? `${currency.format(goalSaved)} de ${currency.format(goalData.target_amount)}`
                : "Crea uno y sigue tu progreso automáticamente"}
            </CardDescription>
          </CardHeader>
          {goalData && (
            <CardContent>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${goalPercent}%` }}
                />
              </div>
            </CardContent>
          )}
        </Card>
      </Link>
    </FadeIn>
  );
}
