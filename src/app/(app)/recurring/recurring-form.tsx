"use client";

import { useActionState, useEffect, useRef } from "react";
import { createRecurringExpense, type RecurringFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/lib/types";

const initialState: RecurringFormState = { error: null };

export function RecurringForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(createRecurringExpense, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && state.error === null) {
      formRef.current?.reset();
    }
  }, [state, pending]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descripción</Label>
        <Input id="description" name="description" placeholder="Netflix" required className="w-40" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="amount">Importe (€)</Label>
        <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required className="w-28" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="category_id">Categoría</Label>
        <Select name="category_id">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sin categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="day_of_month">Día del mes</Label>
        <Input
          id="day_of_month"
          name="day_of_month"
          type="number"
          min="1"
          max="31"
          required
          className="w-20"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Añadiendo…" : "Añadir"}
      </Button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
