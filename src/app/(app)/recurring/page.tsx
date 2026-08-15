import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RecurringForm } from "./recurring-form";
import { RecurringRowActions } from "./recurring-row-actions";
import type { Category, RecurringExpense } from "@/lib/types";

const currency = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export default async function RecurringPage() {
  const supabase = await createClient();

  const [{ data: recurring }, { data: categories }] = await Promise.all([
    supabase
      .from("recurring_expenses")
      .select("*, category:categories(id, name, color)")
      .order("day_of_month"),
    supabase.from("categories").select("*").order("name"),
  ]);

  const recurringList = (recurring ?? []) as unknown as (RecurringExpense & {
    category: Pick<Category, "id" | "name" | "color"> | null;
  })[];
  const categoryList = (categories ?? []) as Category[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Gastos recurrentes</h1>
        <p className="text-muted-foreground">
          Se registran automáticamente cada mes en el día indicado.
        </p>
      </div>

      <RecurringForm categories={categoryList} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descripción</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Día</TableHead>
              <TableHead className="text-right">Importe</TableHead>
              <TableHead className="w-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {recurringList.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No tienes gastos recurrentes configurados.
                </TableCell>
              </TableRow>
            )}
            {recurringList.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.description}</TableCell>
                <TableCell>
                  {item.category ? (
                    <Badge
                      variant="outline"
                      style={{ backgroundColor: `${item.category.color}20`, color: item.category.color }}
                    >
                      {item.category.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>Día {item.day_of_month}</TableCell>
                <TableCell className="text-right font-medium">
                  {currency.format(item.amount)}
                </TableCell>
                <TableCell>
                  <RecurringRowActions id={item.id} active={item.active} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
