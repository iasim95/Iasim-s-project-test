"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/import/csv", { method: "POST", body: formData });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "Error al importar");
        return;
      }

      toast.success(`${result.imported} gastos importados`);
      if (result.errors?.length) {
        toast.warning(`${result.errors.length} filas omitidas por errores`);
      }
      router.push("/expenses");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="file">Archivo CSV</Label>
        <Input
          id="file"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
        />
      </div>
      <Button type="submit" disabled={!file || pending} className="w-fit">
        {pending ? "Importando…" : "Importar"}
      </Button>
    </form>
  );
}
