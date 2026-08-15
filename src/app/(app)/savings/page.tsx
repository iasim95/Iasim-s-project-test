import { Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMonthlyNetSavings } from "@/lib/net-savings";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { FadeIn, AnimatedCurrency } from "@/components/motion";
import { IncomeForm } from "./income-form";
import { DeleteIncomeButton } from "./delete-income-button";
import { SavingsChart } from "./savings-chart";
import type { Income, UserSettings } from "@/lib/types";

const dateFormat = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });

export default async function SavingsPage() {
  const supabase = await createClient();

  const [monthly, { data: income }, symbol, { data: settings }] = await Promise.all([
    getMonthlyNetSavings(supabase, 6),
    supabase.from("income").select("*").order("income_date", { ascending: false }).limit(20),
    getCurrencySymbol(supabase),
    supabase.from("user_settings").select("*").maybeSingle(),
  ]);
  const currentMonth = monthly[monthly.length - 1];
  const incomeList = (income ?? []) as Income[];
  const defaultIncome = (settings as UserSettings | null)?.default_monthly_income ?? undefined;

  return (
    <FadeIn className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Ahorro</h1>
        <p className="text-muted-foreground">Ingresos menos gastos, mes a mes.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ingresos este mes</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatedCurrency value={currentMonth.income} symbol={symbol} className="text-2xl font-semibold text-success" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gastos este mes</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatedCurrency value={currentMonth.expenses} symbol={symbol} className="text-2xl font-semibold text-destructive" />
          </CardContent>
        </Card>
        <Card className="border-primary/30 bg-accent/40">
          <CardHeader className="pb-2">
            <CardDescription>Ahorro neto este mes</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatedCurrency value={currentMonth.net} symbol={symbol} className="text-2xl font-semibold" />
          </CardContent>
        </Card>
      </div>

      <SavingsChart data={monthly} symbol={symbol} />

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Ingresos</h2>
        <IncomeForm defaultAmount={defaultIncome} />
        <div className="flex flex-col divide-y overflow-hidden rounded-2xl border">
          {incomeList.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Todavía no has añadido ningún ingreso.
            </p>
          )}
          {incomeList.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                <Wallet className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.description || "Ingreso"}</p>
                <p className="text-sm text-muted-foreground">
                  {dateFormat.format(new Date(item.income_date))}
                </p>
              </div>
              <span className="font-semibold text-success">+{formatCurrency(item.amount, symbol)}</span>
              <DeleteIncomeButton id={item.id} />
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}
