"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCategory, type CategoryFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: CategoryFormState = { error: null };

export function NewCategoryForm() {
  const [state, formAction, pending] = useActionState(createCategory, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && state.error === null) {
      formRef.current?.reset();
    }
  }, [state, pending]);

  return (
    <form ref={formRef} action={formAction} className="flex items-end gap-3">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium">
          Nueva categoría
        </label>
        <Input id="name" name="name" placeholder="p. ej. Suscripciones" required />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="color" className="text-sm font-medium">
          Color
        </label>
        <Input
          id="color"
          name="color"
          type="color"
          defaultValue="#64748b"
          className="h-9 w-14 p-1"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Añadiendo…" : "Añadir"}
      </Button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
