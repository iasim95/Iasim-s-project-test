import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryPieChart, MonthlyBarChart } from "./expense-charts";
import type { Expense } from "@/lib/types";

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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Hola{user?.email ? `, ${user.email}` : ""}
        </h1>
        <p className="text-muted-foreground">Resumen de tus gastos</p>
      </div>

      <Card>
        <CardHeader>
          <CardDescription>Gastado este mes</CardDescription>
          <CardTitle className="text-3xl">
            {currency.format(totalThisMonth)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {thisMonthRows.length} movimiento{thisMonthRows.length === 1 ? "" : "s"}{" "}
            registrado{thisMonthRows.length === 1 ? "" : "s"}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <CategoryPieChart data={Array.from(byCategory.values())} />
        <MonthlyBarChart data={monthlyData} />
      </div>
    </div>
  );
}
