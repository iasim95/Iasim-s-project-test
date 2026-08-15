"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { stopRecurring } from "./actions";

export function StopRecurringButton({ recurringExpenseId }: { recurringExpenseId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (confirm("¿Dejar de repetir este gasto cada mes?")) {
          startTransition(async () => {
            await stopRecurring(recurringExpenseId);
            toast.success("Repetición detenida");
          });
        }
      }}
    >
      Detener repetición
    </Button>
  );
}
