import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function shiftMonth(monthKey: string, delta: number) {
  const [year, month] = monthKey.split("-").map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
}

export function MonthSelector({ month, basePath }: { month: string; basePath: string }) {
  return (
    <div className="flex items-center gap-1 rounded-full border bg-card px-1 py-1">
      <Link
        href={`${basePath}?month=${shiftMonth(month, -1)}`}
        className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        aria-label="Mes anterior"
      >
        <ChevronLeft className="size-4" />
      </Link>
      <span className="min-w-32 text-center text-sm font-medium capitalize">
        {monthLabel(month)}
      </span>
      <Link
        href={`${basePath}?month=${shiftMonth(month, 1)}`}
        className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        aria-label="Mes siguiente"
      >
        <ChevronRight className="size-4" />
      </Link>
    </div>
  );
}
