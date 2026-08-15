"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { updateGeneralSettings, type SettingsFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: SettingsFormState = { error: null };

export function GeneralSettingsForm({
  defaultIncome,
  currencySymbol,
}: {
  defaultIncome: number | null;
  currencySymbol: string;
}) {
  const [state, formAction, pending] = useActionState(updateGeneralSettings, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="default_monthly_income">Ingreso mensual por defecto</Label>
        <Input
          id="default_monthly_income"
          name="default_monthly_income"
          type="number"
          step="0.01"
          min="0"
          defaultValue={defaultIncome ?? ""}
          className="w-40"
          placeholder="p. ej. 1500"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="currency_symbol">Símbolo de moneda</Label>
        <Input
          id="currency_symbol"
          name="currency_symbol"
          defaultValue={currencySymbol}
          maxLength={3}
          className="w-20"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Guardar ajustes"}
      </Button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {!pending && state.error === null && <SuccessToast token={state} />}
    </form>
  );
}

function SuccessToast({ token }: { token: SettingsFormState }) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    toast.success("Ajustes guardados");
  }, [token]);
  return null;
}
