"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";

function monthName(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("es-ES", { month: "long" });
}

export function MonthlySavingsList({
  data,
  symbol = "€",
}: {
  data: { month: string; net: number }[];
  symbol?: string;
}) {
  const max = Math.max(1, ...data.map((d) => Math.abs(d.net)));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ahorro mensual (últimos {data.length} meses)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {data.map((d, i) => (
          <div key={d.month} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-sm text-muted-foreground capitalize">
              {monthName(d.month)}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className={d.net < 0 ? "h-full rounded-full bg-destructive" : "h-full rounded-full bg-primary"}
                initial={{ width: 0 }}
                animate={{ width: `${(Math.abs(d.net) / max) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
              />
            </div>
            <span className="w-24 shrink-0 text-right text-sm font-medium">
              {formatCurrency(d.net, symbol)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
