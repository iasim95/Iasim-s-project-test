"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CategoryIcon } from "@/lib/category-icons";
import { formatCurrency } from "@/lib/currency";
import { ProgressRing } from "@/components/progress-ring";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { setCategoryBudget } from "./actions";
import type { Category } from "@/lib/types";

export function BudgetRow({
  category,
  spent,
  limit,
  symbol,
}: {
  category: Category;
  spent: number;
  limit: number | null;
  symbol: string;
}) {
  const [value, setValue] = useState(limit ?? 0);
  const [isPending, startTransition] = useTransition();
  const percent = limit ? Math.min(100, (spent / limit) * 100) : 0;
  const over = limit != null && spent > limit;

  function save() {
    startTransition(async () => {
      const result = await setCategoryBudget(category.id, value);
      if (result.error) toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-2">
        <CategoryIcon name={category.name} color={category.color} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">{category.name}</p>
          <p className={over ? "text-sm font-medium text-destructive" : "text-sm text-muted-foreground"}>
            {limit
              ? `${formatCurrency(spent, symbol)} de ${formatCurrency(limit, symbol)}${over ? " · ¡Superado!" : ""}`
              : `${formatCurrency(spent, symbol)} (sin presupuesto)`}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Input
              type="number"
              min="0"
              step="1"
              value={value || ""}
              placeholder="0"
              disabled={isPending}
              onChange={(e) => setValue(Number(e.target.value))}
              onBlur={save}
              className="h-8 w-28"
            />
            <span className="text-xs text-muted-foreground">límite mensual ({symbol})</span>
          </div>
        </div>
        {limit != null && limit > 0 && (
          <ProgressRing percent={percent} color={over ? "var(--color-destructive)" : category.color} />
        )}
      </CardContent>
    </Card>
  );
}
