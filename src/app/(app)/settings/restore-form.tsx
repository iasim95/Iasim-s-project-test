"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RestoreForm() {
  const [file, setFile] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    startTransition(async () => {
      const text = await file.text();
      const res = await fetch("/api/settings/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: text,
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "Error al restaurar");
        return;
      }

      toast.success(
        `Restaurado: ${result.categories} categorías, ${result.expenses} gastos, ${result.income} ingresos`,
      );
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        type="file"
        accept="application/json"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="max-w-xs"
      />
      <Button type="submit" variant="outline" disabled={!file || pending}>
        {pending ? "Restaurando…" : "Restaurar"}
      </Button>
    </form>
  );
}
