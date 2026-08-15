import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/lib/category-icons";
import { ExpenseDialog } from "./expense-dialog";
import { DeleteExpenseButton } from "./delete-expense-button";
import { ExpenseFilters } from "./expense-filters";
import type { Category, Expense } from "@/lib/types";

const currency = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
const dateFormat = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });

export async function OtrosTab({
  filters,
}: {
  filters: { q?: string; category?: string; from?: string; to?: string };
}) {
  const supabase = await createClient();

  let query = supabase
    .from("expenses")
    .select("*, category:categories(id, name, color)")
    .is("recurring_expense_id", null)
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ExpenseFilters categories={categoryList} filters={filters} />
        <ExpenseDialog categories={categoryList} trigger={<Button>Añadir gasto</Button>} />
      </div>

      <div className="flex flex-col divide-y overflow-hidden rounded-2xl border">
        {expenseList.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No hay gastos que coincidan con el filtro.
          </p>
        )}
        {expenseList.map((expense) => (
          <div
            key={expense.id}
            className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/40"
          >
            <CategoryIcon
              name={expense.category?.name ?? "Otros"}
              color={expense.category?.color ?? "#94a3b8"}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{expense.description || "Sin descripción"}</p>
              <div className="mt-0.5 flex items-center gap-2">
                {expense.category && (
                  <Badge
                    variant="outline"
                    className="px-1.5 py-0 text-[11px]"
                    style={{ backgroundColor: `${expense.category.color}15`, color: expense.category.color }}
                  >
                    {expense.category.name}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {dateFormat.format(new Date(expense.expense_date))}
                </span>
              </div>
            </div>
            <span className="font-semibold">{currency.format(expense.amount)}</span>
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
          </div>
        ))}
      </div>

      {expenseList.length > 0 && (
        <p className="text-right text-sm text-muted-foreground">
          Total: <span className="font-medium text-foreground">{currency.format(total)}</span>
        </p>
      )}
    </div>
  );
}
