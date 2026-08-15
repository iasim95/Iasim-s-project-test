import { Repeat } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { detectSubscriptions } from "@/lib/subscriptions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const currency = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});
const dateFormat = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });

export default async function SubscriptionsPage() {
  const supabase = await createClient();

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);

  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount, description, expense_date, category:categories(name, color)")
    .gte("expense_date", twelveMonthsAgo.toISOString().slice(0, 10));

  const candidates = detectSubscriptions(
    (expenses ?? []) as unknown as Parameters<typeof detectSubscriptions>[0],
  );

  const totalMonthly = candidates.reduce((sum, c) => sum + c.averageAmount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Suscripciones</h1>
        <p className="text-muted-foreground">
          Gastos recurrentes detectados automáticamente por descripción e importe similar.
        </p>
      </div>

      {candidates.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">Coste recurrente estimado / mes</p>
            <p className="text-2xl font-semibold">{currency.format(totalMonthly)}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {candidates.map((c) => (
          <Card key={c.key}>
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                  <Repeat className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium capitalize">{c.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.occurrences} cargos · último el {dateFormat.format(new Date(c.lastDate))}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {c.categoryName && (
                  <Badge
                    variant="outline"
                    style={{ backgroundColor: `${c.categoryColor}20`, color: c.categoryColor ?? undefined }}
                  >
                    {c.categoryName}
                  </Badge>
                )}
                <span className="font-medium">{currency.format(c.averageAmount)}/mes</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {candidates.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hemos detectado gastos recurrentes todavía. Añade una descripción
            consistente (p. ej. &quot;Netflix&quot;) a tus gastos para que podamos
            identificarlos.
          </p>
        )}
      </div>
    </div>
  );
}
