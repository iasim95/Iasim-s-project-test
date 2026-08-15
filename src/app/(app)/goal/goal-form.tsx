"use client";

import { useActionState } from "react";
import { createGoal, type GoalFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: GoalFormState = { error: null };

export function GoalForm() {
  const [state, formAction, pending] = useActionState(createGoal, initialState);

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Crea un objetivo de ahorro</CardTitle>
        <CardDescription>
          El progreso se calcula solo, sumando tu ahorro neto (ingresos − gastos) mes a mes desde hoy.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" placeholder="Viaje a Japón" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="target_amount">Importe objetivo (€)</Label>
            <Input id="target_amount" name="target_amount" type="number" step="0.01" min="0.01" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="target_date">Fecha objetivo (opcional)</Label>
            <Input id="target_date" name="target_date" type="date" />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Creando…" : "Crear objetivo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
