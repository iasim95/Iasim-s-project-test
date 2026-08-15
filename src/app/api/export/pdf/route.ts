import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { ExpensesPdfDocument } from "./expenses-pdf-document";

export const runtime = "nodejs";

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

  const buffer = await renderToBuffer(
    ExpensesPdfDocument({ rows, userEmail: user.email ?? "" }),
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="gastos-${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  });
}
