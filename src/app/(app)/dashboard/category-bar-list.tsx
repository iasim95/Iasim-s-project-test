"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryIcon } from "@/lib/category-icons";
import { formatCurrency } from "@/lib/currency";

export function CategoryBarList({
  data,
  symbol = "€",
}: {
  data: { name: string; value: number; color: string }[];
  symbol?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const sorted = [...data].sort((a, b) => b.value - a.value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gasto por categoría</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {sorted.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Todavía no hay gastos registrados este mes.
          </p>
        )}
        {sorted.map((d, i) => (
          <div key={d.name} className="flex items-center gap-3">
            <CategoryIcon name={d.name} color={d.color} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="truncate font-medium">{d.name}</span>
                <span className="font-semibold">{formatCurrency(d.value, symbol)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${d.color}, ${d.color}99)`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(d.value / max) * 100}%` }}
                  transition={{ duration: 0.7, delay: i * 0.06, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
