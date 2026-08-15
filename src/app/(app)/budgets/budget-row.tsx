"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { Input } from "@/components/ui/input";
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
    <div className="flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold">{category.name}</p>
        <p className="text-sm text-muted-foreground">
          {limit
            ? `${formatCurrency(spent, symbol)} / ${formatCurrency(limit, symbol)}`
            : `${formatCurrency(spent, symbol)} (sin presupuesto)`}
        </p>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={over ? "h-full rounded-full bg-destructive" : "h-full rounded-full bg-primary"}
          initial={{ width: 0 }}
          animate={{ width: limit ? `${percent}%` : "100%" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>

      {limit != null && (
        <p className={over ? "text-xs font-medium text-destructive" : "text-xs text-success"}>
          {over
            ? `Superado — ${formatCurrency(spent - limit, symbol)} por encima del presupuesto`
            : "Dentro del presupuesto"}
        </p>
      )}

      <div className="flex items-center gap-2">
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
        <span className="text-xs text-muted-foreground">presupuesto mensual ({symbol})</span>
      </div>
    </div>
  );
}
