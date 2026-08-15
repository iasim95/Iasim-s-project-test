import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/lib/types";

export function ExpenseFilters({
  categories,
  filters,
}: {
  categories: Category[];
  filters: { q?: string; category?: string; from?: string; to?: string };
}) {
  return (
    <form className="flex flex-wrap items-end gap-3" action="/expenses" method="GET">
      <div className="flex flex-col gap-2">
        <label htmlFor="q" className="text-sm font-medium">
          Buscar
        </label>
        <Input
          id="q"
          name="q"
          placeholder="Descripción…"
          defaultValue={filters.q}
          className="w-40"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="category" className="text-sm font-medium">
          Categoría
        </label>
        <Select name="category" defaultValue={filters.category || "all"}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="from" className="text-sm font-medium">
          Desde
        </label>
        <Input id="from" name="from" type="date" defaultValue={filters.from} className="w-40" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="to" className="text-sm font-medium">
          Hasta
        </label>
        <Input id="to" name="to" type="date" defaultValue={filters.to} className="w-40" />
      </div>
      <Button type="submit" variant="secondary">
        Filtrar
      </Button>
      {(filters.q || filters.category || filters.from || filters.to) && (
        <Button asChild variant="ghost">
          <a href="/expenses">Limpiar</a>
        </Button>
      )}
    </form>
  );
}
