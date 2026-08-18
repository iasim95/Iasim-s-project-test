"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/lib/category-icons";
import { formatCurrency } from "@/lib/currency";
import { deleteExpense } from "./actions";
import { ExpenseDialog } from "./expense-dialog";
import { StopRecurringButton } from "./stop-recurring-button";
import type { Category, Expense } from "@/lib/types";

const dateFormat = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });
const UNDO_WINDOW_MS = 5000;

type ExpenseRow = Expense & { category: Pick<Category, "id" | "name" | "color"> | null };

export function ExpenseList({
  expenses,
  categories,
  symbol,
  memberLabels,
  emptyMessage,
}: {
  expenses: ExpenseRow[];
  categories: Category[];
  symbol: string;
  memberLabels: Record<string, string>;
  emptyMessage: string;
}) {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  function handleDelete(id: string) {
    setHiddenIds((prev) => new Set(prev).add(id));

    const timer = setTimeout(() => {
      timers.current.delete(id);
      deleteExpense(id);
    }, UNDO_WINDOW_MS);
    timers.current.set(id, timer);

    toast("Gasto eliminado", {
      duration: UNDO_WINDOW_MS,
      action: {
        label: "Deshacer",
        onClick: () => {
          const pending = timers.current.get(id);
          if (pending) clearTimeout(pending);
          timers.current.delete(id);
          setHiddenIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        },
      },
    });
  }

  const visible = expenses.filter((e) => !hiddenIds.has(e.id));

  return (
    <div className="flex flex-col divide-y overflow-hidden rounded-2xl border">
      {visible.length === 0 && (
        <p className="p-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
      )}
      {visible.map((expense) => (
        <div
          key={expense.id}
          className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/40"
        >
          <CategoryIcon
            name={expense.category?.name ?? "Otros"}
            color={expense.category?.color ?? "#94a3b8"}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{expense.description || "Sin descripción"}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              {expense.category && (
                <Badge
                  variant="outline"
                  className="px-1.5 py-0 text-[11px]"
                  style={{ backgroundColor: `${expense.category.color}15`, color: expense.category.color }}
                >
                  {expense.category.name}
                </Badge>
              )}
              <Badge variant="outline" className="px-1.5 py-0 text-[11px]">
                {expense.installment_total
                  ? `Cuota ${expense.installment_number}/${expense.installment_total}`
                  : expense.recurring_expense_id
                    ? "Recurrente"
                    : "Único"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {dateFormat.format(new Date(expense.expense_date))}
              </span>
              {Object.keys(memberLabels).length > 1 && (
                <span className="text-xs text-muted-foreground">
                  · {memberLabels[expense.user_id] ?? "Alguien"}
                </span>
              )}
            </div>
          </div>
          <span className="font-semibold">{formatCurrency(expense.amount, symbol)}</span>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {expense.recurring_expense_id && (
              <StopRecurringButton recurringExpenseId={expense.recurring_expense_id} />
            )}
            <ExpenseDialog
              categories={categories}
              expense={expense}
              symbol={symbol}
              trigger={
                <Button variant="ghost" size="sm">
                  Editar
                </Button>
              }
            />
            <Button variant="ghost" size="sm" onClick={() => handleDelete(expense.id)}>
              Eliminar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
