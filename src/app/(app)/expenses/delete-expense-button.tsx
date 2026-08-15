"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteExpense } from "./actions";

export function DeleteExpenseButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (confirm("¿Eliminar este gasto?")) {
          startTransition(() => deleteExpense(id));
        }
      }}
    >
      Eliminar
    </Button>
  );
}
