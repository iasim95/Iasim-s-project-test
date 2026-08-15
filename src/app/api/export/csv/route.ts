import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: expenses } = await supabase
    .from("expenses")
    .select("expense_date, amount, description, category:categories(name)")
    .order("expense_date", { ascending: false });

  const rows = (expenses ?? []) as unknown as {
    expense_date: string;
    amount: number;
    description: string | null;
    category: { name: string } | null;
  }[];

  const header = ["Fecha", "Categoría", "Descripción", "Importe"];
  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.expense_date,
        escapeCsv(row.category?.name ?? ""),
        escapeCsv(row.description ?? ""),
        row.amount.toFixed(2),
      ].join(","),
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="gastos-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
