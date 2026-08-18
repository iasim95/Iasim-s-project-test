import { Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getNetSavingsSince, computeGoalProjection, getMonthlyNetSavings } from "@/lib/net-savings";
import { getCurrencySymbol, formatCurrency } from "@/lib/currency";
import { getHouseholdMemberLabels } from "@/lib/household";
import { FadeIn } from "@/components/motion";
import { GoalForm } from "./goal-form";
import { GoalCard } from "./goal-card";
import { MonthlySavingsList } from "./monthly-savings-list";
import { IncomeForm } from "./income-form";
import { DeleteIncomeButton } from "./delete-income-button";
import type { SavingsGoal, Income, UserSettings } from "@/lib/types";

const dateFormat = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });

export default async function GoalPage() {
  const supabase = await createClient();

  const [{ data: goal }, symbol, monthly, { data: income }, { data: settings }, memberLabels] =
    await Promise.all([
      supabase
        .from("savings_goals")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      getCurrencySymbol(supabase),
      getMonthlyNetSavings(supabase, 6),
      supabase.from("income").select("*").order("income_date", { ascending: false }).limit(20),
      supabase.from("user_settings").select("*").maybeSingle(),
      getHouseholdMemberLabels(supabase),
    ]);

  const goalData = goal as SavingsGoal | null;
  const saved = goalData
    ? await getNetSavingsSince(supabase, goalData.created_at.slice(0, 10))
    : 0;

  const projection = goalData
    ? computeGoalProjection({
        saved,
        targetAmount: goalData.target_amount,
        createdAt: goalData.created_at,
        targetDate: goalData.target_date,
      })
    : null;

  const incomeList = (income ?? []) as Income[];
  const defaultIncome = (settings as UserSettings | null)?.default_monthly_income ?? undefined;

  return (
    <FadeIn className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Meta de ahorro</h1>
      </div>

      {goalData ? (
        <GoalCard goal={goalData} saved={saved} symbol={symbol} projection={projection} />
      ) : (
        <GoalForm />
      )}

      <MonthlySavingsList data={monthly} symbol={symbol} />

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
                  {memberLabels.size > 1 && ` · ${memberLabels.get(item.user_id) ?? "Alguien"}`}
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
