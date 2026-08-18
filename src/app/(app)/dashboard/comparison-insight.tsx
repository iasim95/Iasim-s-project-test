import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CategoryComparison } from "@/lib/category-comparison";

export function ComparisonInsight({
  increase,
  decrease,
}: {
  increase: CategoryComparison | null;
  decrease: CategoryComparison | null;
}) {
  if (!increase && !decrease) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {increase && (
        <Card className="flex-1 border-destructive/20">
          <CardContent className="flex items-center gap-3 py-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <TrendingUp className="size-4" />
            </div>
            <p className="text-sm">
              Este mes gastaste{" "}
              <span className="font-semibold text-destructive">
                {Math.round(increase.percentChange ?? 0)}% más
              </span>{" "}
              en <span className="font-medium">{increase.name}</span> que el mes pasado.
            </p>
          </CardContent>
        </Card>
      )}
      {decrease && (
        <Card className="flex-1 border-success/20">
          <CardContent className="flex items-center gap-3 py-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
              <TrendingDown className="size-4" />
            </div>
            <p className="text-sm">
              Este mes gastaste{" "}
              <span className="font-semibold text-success">
                {Math.round(Math.abs(decrease.percentChange ?? 0))}% menos
              </span>{" "}
              en <span className="font-medium">{decrease.name}</span> que el mes pasado.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
