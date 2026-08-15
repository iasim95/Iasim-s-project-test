"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { deleteCategory } from "./actions";

export function DeleteCategoryButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label="Eliminar categoría"
      disabled={isPending}
      className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
      onClick={() => {
        if (confirm("¿Eliminar esta categoría? Los gastos asociados quedarán sin categoría.")) {
          startTransition(() => deleteCategory(id));
        }
      }}
    >
      <X className="size-3" />
    </button>
  );
}
