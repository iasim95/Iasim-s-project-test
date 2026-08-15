import Papa from "papaparse";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type CsvRow = {
  Fecha?: string;
  Categoría?: string;
  Descripción?: string;
  Importe?: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se ha subido ningún archivo" }, { status: 400 });
  }

  const text = await file.text();
  const parsed = Papa.parse<CsvRow>(text, { header: true, skipEmptyLines: true });

  const { data: categories } = await supabase.from("categories").select("id, name");
  const categoryByName = new Map(
    (categories ?? []).map((c) => [c.name.toLowerCase().trim(), c.id]),
  );

  const rows = [];
  const errors: string[] = [];

  for (const [i, row] of parsed.data.entries()) {
    const amount = Number(row.Importe);
    const date = row.Fecha?.trim();
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.push(`Fila ${i + 2}: fecha inválida ("${row.Fecha}"), se esperaba AAAA-MM-DD`);
      continue;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.push(`Fila ${i + 2}: importe inválido ("${row.Importe}")`);
      continue;
    }

    rows.push({
      user_id: user.id,
      expense_date: date,
      amount,
      description: row.Descripción?.trim() || null,
      category_id: row.Categoría
        ? (categoryByName.get(row.Categoría.toLowerCase().trim()) ?? null)
        : null,
    });
  }

  if (rows.length > 0) {
    const { error } = await supabase.from("expenses").insert(rows);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ imported: rows.length, errors });
}
