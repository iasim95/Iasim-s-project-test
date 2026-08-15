import { createClient } from "@/lib/supabase/server";
import { getNetSavingsSince } from "@/lib/net-savings";
import { FadeIn } from "@/components/motion";
import { GoalForm } from "./goal-form";
import { GoalCard } from "./goal-card";
import type { SavingsGoal } from "@/lib/types";

export default async function GoalPage() {
  const supabase = await createClient();

  const { data: goal } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const goalData = goal as SavingsGoal | null;
  const saved = goalData
    ? await getNetSavingsSince(supabase, goalData.created_at.slice(0, 10))
    : 0;

  return (
    <FadeIn className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Objetivo de ahorro</h1>
        <p className="text-muted-foreground">
          Fíjate una meta y observa cómo se acerca sola con tu ahorro mensual.
        </p>
      </div>

      {goalData ? <GoalCard goal={goalData} saved={saved} /> : <GoalForm />}
    </FadeIn>
  );
}
