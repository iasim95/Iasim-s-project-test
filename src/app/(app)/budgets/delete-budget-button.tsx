"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { deleteBudget } from "./actions";

export function DeleteBudgetButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label="Eliminar presupuesto"
      disabled={isPending}
      className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
      onClick={() => startTransition(() => deleteBudget(id))}
    >
      <X className="size-3.5" />
    </button>
  );
}
