import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExpenseDialog } from "./expense-dialog";
import { DeleteExpenseButton } from "./delete-expense-button";
import { ExpenseFilters } from "./expense-filters";
import type { Category, Expense } from "@/lib/types";

const currency = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});
const dateFormat = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; from?: string; to?: string }>;
}) {
  const filters = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("expenses")
    .select("*, category:categories(id, name, color)")
    .order("expense_date", { ascending: false });

  if (filters.q) query = query.ilike("description", `%${filters.q}%`);
  if (filters.category) query = query.eq("category_id", filters.category);
  if (filters.from) query = query.gte("expense_date", filters.from);
  if (filters.to) query = query.lte("expense_date", filters.to);

  const [{ data: expenses }, { data: categories }] = await Promise.all([
    query,
    supabase.from("categories").select("*").order("name"),
  ]);

  const categoryList = (categories ?? []) as Category[];
  const expenseList = (expenses ?? []) as unknown as (Expense & {
    category: Pick<Category, "id" | "name" | "color"> | null;
  })[];
  const total = expenseList.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gastos</h1>
        <ExpenseDialog
          categories={categoryList}
          trigger={<Button>Añadir gasto</Button>}
        />
      </div>

      <ExpenseFilters categories={categoryList} filters={filters} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Importe</TableHead>
              <TableHead className="w-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenseList.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No hay gastos que coincidan con el filtro.
                </TableCell>
              </TableRow>
            )}
            {expenseList.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{dateFormat.format(new Date(expense.expense_date))}</TableCell>
                <TableCell>
                  {expense.category ? (
                    <Badge
                      style={{
                        backgroundColor: `${expense.category.color}20`,
                        color: expense.category.color,
                      }}
                      variant="outline"
                    >
                      {expense.category.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {expense.description || "—"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {currency.format(expense.amount)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <ExpenseDialog
                      categories={categoryList}
                      expense={expense}
                      trigger={
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      }
                    />
                    <DeleteExpenseButton id={expense.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {expenseList.length > 0 && (
        <p className="text-right text-sm text-muted-foreground">
          Total: <span className="font-medium text-foreground">{currency.format(total)}</span>
        </p>
      )}
    </div>
  );
}
