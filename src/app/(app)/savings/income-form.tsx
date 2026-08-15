"use client";

import { useActionState, useEffect, useRef } from "react";
import { createIncome, type IncomeFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: IncomeFormState = { error: null };

export function IncomeForm() {
  const [state, formAction, pending] = useActionState(createIncome, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && state.error === null) {
      formRef.current?.reset();
    }
  }, [state, pending]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="amount">Importe (€)</Label>
        <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required className="w-32" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="income_date">Fecha</Label>
        <Input
          id="income_date"
          name="income_date"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="w-40"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Input id="description" name="description" placeholder="Nómina" className="w-48" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Añadiendo…" : "Añadir ingreso"}
      </Button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
