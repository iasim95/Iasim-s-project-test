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
  month,
}: {
  categories: Category[];
  filters: { q?: string; category?: string };
  month: string;
}) {
  return (
    <form className="flex flex-wrap items-end gap-3" action="/expenses" method="GET">
      <input type="hidden" name="month" value={month} />
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
      <Button type="submit" variant="secondary">
        Filtrar
      </Button>
      {(filters.q || (filters.category && filters.category !== "all")) && (
        <Button asChild variant="ghost">
          <a href={`/expenses?month=${month}`}>Limpiar</a>
        </Button>
      )}
    </form>
  );
}
