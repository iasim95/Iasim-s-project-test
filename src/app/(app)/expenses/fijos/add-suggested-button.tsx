"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { createRecurringExpense } from "./actions";
import type { Category } from "@/lib/types";

export function AddSuggestedButton({
  description,
  amount,
  categoryName,
  categories,
  trigger,
}: {
  description: string;
  amount: number;
  categoryName: string | null;
  categories: Category[];
  trigger: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const category = categories.find(
        (c) => c.name.toLowerCase() === categoryName?.toLowerCase(),
      );
      const formData = new FormData();
      formData.set("description", description);
      formData.set("amount", amount.toFixed(2));
      formData.set("day_of_month", String(new Date().getDate()));
      if (category) formData.set("category_id", category.id);

      const result = await createRecurringExpense({ error: null }, formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Añadido a gastos fijos");
      }
    });
  }

  return (
    <button type="button" onClick={handleClick} disabled={isPending}>
      {trigger}
    </button>
  );
}
