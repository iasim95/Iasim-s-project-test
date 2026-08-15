import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function lastDayOfMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const today = now.getDate();

  const { data: due, error } = await supabase
    .from("recurring_expenses")
    .select("id, user_id, household_id, category_id, amount, description, day_of_month")
    .eq("active", true)
    .or(`last_generated_month.is.null,last_generated_month.neq.${currentMonth}`)
    .lte("day_of_month", today);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let created = 0;
  for (const item of due ?? []) {
    const day = Math.min(item.day_of_month, lastDayOfMonth(now.getFullYear(), now.getMonth()));
    const expenseDate = new Date(now.getFullYear(), now.getMonth(), day)
      .toISOString()
      .slice(0, 10);

    const { error: insertError } = await supabase.from("expenses").insert({
      user_id: item.user_id,
      household_id: item.household_id,
      category_id: item.category_id,
      amount: item.amount,
      description: item.description,
      expense_date: expenseDate,
      recurring_expense_id: item.id,
    });

    if (!insertError) {
      await supabase
        .from("recurring_expenses")
        .update({ last_generated_month: currentMonth })
        .eq("id", item.id);
      created++;
    }
  }

  return NextResponse.json({ ok: true, created });
}
