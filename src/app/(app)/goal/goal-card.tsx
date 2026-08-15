"use client";

import { useTransition } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedCurrency } from "@/components/motion";
import { formatCurrency } from "@/lib/currency";
import { deleteGoal } from "./actions";
import type { SavingsGoal } from "@/lib/types";

const dateFormat = new Intl.DateTimeFormat("es-ES", { dateStyle: "long" });

export type GoalProjection = {
  avgMonthly: number;
  requiredMonthly: number;
  monthsRemaining: number;
  onTrack: boolean;
};

export function GoalCard({
  goal,
  saved,
  symbol = "€",
  projection,
}: {
  goal: SavingsGoal;
  saved: number;
  symbol?: string;
  projection: GoalProjection | null;
}) {
  const [isPending, startTransition] = useTransition();
  const percent = Math.max(0, Math.min(100, (saved / goal.target_amount) * 100));
  const reached = saved >= goal.target_amount;

  return (
    <Card className="max-w-md overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{goal.name}</CardTitle>
          {goal.target_date && (
            <p className="text-sm text-muted-foreground">
              Objetivo para el {dateFormat.format(new Date(goal.target_date))}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isPending}
          onClick={() => {
            if (confirm("¿Eliminar este objetivo?")) startTransition(() => deleteGoal(goal.id));
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <AnimatedCurrency value={saved} symbol={symbol} className="text-3xl font-semibold" />
          <span className="text-sm text-muted-foreground">
            de {formatCurrency(goal.target_amount, symbol)}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className={reached ? "h-full rounded-full bg-success" : "h-full rounded-full bg-primary"}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {reached ? "¡Objetivo alcanzado! 🎉" : `${percent.toFixed(0)}% completado`}
        </p>

        {!reached && projection && (
          <p
            className={
              projection.onTrack
                ? "rounded-lg bg-success/10 px-3 py-2 text-sm text-success"
                : "rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            }
          >
            {projection.onTrack
              ? `Vas bien: ahorras de media ${formatCurrency(projection.avgMonthly, symbol)}/mes, suficiente para llegar a tiempo.`
              : `Vas retrasado: ahorras de media ${formatCurrency(projection.avgMonthly, symbol)}/mes; necesitarías ${formatCurrency(projection.requiredMonthly, symbol)}/mes para llegar a tu meta.`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
