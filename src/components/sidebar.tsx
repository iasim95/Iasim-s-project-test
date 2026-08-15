"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Tag,
  Wallet,
  Repeat,
  Download,
  Upload,
  CalendarClock,
} from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/expenses", label: "Gastos", icon: Receipt },
  { href: "/categories", label: "Categorías", icon: Tag },
  { href: "/budgets", label: "Presupuestos", icon: Wallet },
  { href: "/recurring", label: "Recurrentes", icon: CalendarClock },
  { href: "/subscriptions", label: "Suscripciones", icon: Repeat },
  { href: "/export", label: "Exportar", icon: Download },
  { href: "/import", label: "Importar", icon: Upload },
];

export function Sidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-semibold">
          €
        </div>
        <span className="font-semibold">Gastos</span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-between gap-2 border-t px-3 py-3">
        <span className="truncate text-xs text-muted-foreground" title={userEmail}>
          {userEmail}
        </span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              Salir
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
