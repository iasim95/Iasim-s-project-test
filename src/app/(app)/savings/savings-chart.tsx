"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const currency = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("es-ES", {
    month: "short",
    year: "2-digit",
  });
}

export function SavingsChart({
  data,
}: {
  data: { month: string; income: number; expenses: number }[];
}) {
  const chartData = data.map((d) => ({ ...d, month: monthLabel(d.month) }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos vs. gastos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => currency.format(v)}
              width={80}
            />
            <Tooltip formatter={(value) => currency.format(Number(value))} />
            <Legend />
            <Bar dataKey="income" name="Ingresos" fill="var(--color-success)" radius={4} />
            <Bar dataKey="expenses" name="Gastos" fill="var(--color-destructive)" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
