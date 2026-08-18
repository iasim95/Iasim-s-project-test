"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { createExpense } from "./actions";
import { guessCategoryName } from "@/lib/auto-categorize";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AmountWheelPicker } from "@/components/amount-wheel-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/lib/types";

export function AddExpenseForm({
  categories,
  symbol,
}: {
  categories: Category[];
  symbol: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [amountKey, setAmountKey] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [categoryTouched, setCategoryTouched] = useState(false);

  function handleDescriptionChange(description: string) {
    if (categoryTouched) return;
    const guessed = guessCategoryName(description);
    if (!guessed) return;
    const match = categories.find((c) => c.name.toLowerCase() === guessed.toLowerCase());
    if (match) setCategoryId(match.id);
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createExpense({ error: null }, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      formRef.current?.reset();
      setCategoryId("");
      setCategoryTouched(false);
      setAmountKey((k) => k + 1);
      toast.success("Gasto añadido");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Añadir gasto</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="expense_date">Fecha</Label>
              <Input
                id="expense_date"
                name="expense_date"
                type="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="category_id">Categoría</Label>
              <Select
                name="category_id"
                value={categoryId}
                onValueChange={(v) => {
                  setCategoryId(v);
                  setCategoryTouched(true);
                }}
              >
                <SelectTrigger id="category_id" className="w-full">
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
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input
              id="description"
              name="description"
              placeholder="Ej: Supermercado, alquiler, factura luz…"
              onChange={(e) => handleDescriptionChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Detectamos la categoría automáticamente a partir de la descripción — puedes
              cambiarla a mano si no acierta.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Importe total</Label>
            <AmountWheelPicker key={amountKey} name="amount" symbol={symbol} />
          </div>

          <div className="flex flex-col gap-2 sm:w-40">
            <Label htmlFor="installments">Número de cuotas</Label>
            <Input id="installments" name="installments" type="number" min="1" max="60" defaultValue={1} />
          </div>
          <p className="-mt-2 text-xs text-muted-foreground">
            Deja en 1 para un gasto único. Pon más de 1 si se pagará a plazos (ej. una compra
            financiada) — se repartirá automáticamente mes a mes.
          </p>

          <div className="flex items-center gap-2">
            <Checkbox id="repeat_monthly" name="repeat_monthly" />
            <Label htmlFor="repeat_monthly" className="font-normal text-muted-foreground">
              Repetir cada mes (gasto fijo, p. ej. alquiler o una suscripción)
            </Label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? "Guardando…" : "Guardar gasto"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
