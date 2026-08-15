"use client";

import { useActionState, useEffect, useRef } from "react";
import { upsertBudget, type BudgetFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/lib/types";

const initialState: BudgetFormState = { error: null };

export function BudgetForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(upsertBudget, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && state.error === null) {
      formRef.current?.reset();
    }
  }, [state, pending]);

  return (
    <form ref={formRef} action={formAction} className="flex items-end gap-3">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Categoría</label>
        <Select name="category_id" required>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Elige categoría" />
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
        <label htmlFor="monthly_limit" className="text-sm font-medium">
          Límite mensual (€)
        </label>
        <Input
          id="monthly_limit"
          name="monthly_limit"
          type="number"
          step="0.01"
          min="0.01"
          required
          className="w-32"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Guardar"}
      </Button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
