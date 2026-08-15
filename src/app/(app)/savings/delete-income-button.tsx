"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { deleteIncome } from "./actions";

export function DeleteIncomeButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label="Eliminar ingreso"
      disabled={isPending}
      className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
      onClick={() => startTransition(() => deleteIncome(id))}
    >
      <X className="size-3.5" />
    </button>
  );
}
