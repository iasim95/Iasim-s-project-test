"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toggleRecurringExpense, deleteRecurringExpense } from "./actions";

export function RecurringRowActions({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={active}
        disabled={isPending}
        onCheckedChange={(checked) =>
          startTransition(() => toggleRecurringExpense(id, checked))
        }
      />
      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() => {
          if (confirm("¿Eliminar este gasto recurrente?")) {
            startTransition(() => deleteRecurringExpense(id));
          }
        }}
      >
        Eliminar
      </Button>
    </div>
  );
}
