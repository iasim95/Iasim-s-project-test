import Link from "next/link";
import { Tag, Wallet, Download, Upload, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/motion";

const items = [
  {
    href: "/categories",
    icon: Tag,
    title: "Categorías",
    description: "Crea, edita y elimina las categorías de tus gastos.",
  },
  {
    href: "/budgets",
    icon: Wallet,
    title: "Presupuestos",
    description: "Límites mensuales por categoría y alertas si te pasas.",
  },
  {
    href: "/export",
    icon: Download,
    title: "Exportar",
    description: "Descarga tus gastos en CSV o PDF.",
  },
  {
    href: "/import",
    icon: Upload,
    title: "Importar",
    description: "Sube un CSV para añadir gastos en lote.",
  },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Ajustes</h1>
        <p className="text-muted-foreground">Gestión de categorías, presupuestos y datos.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <FadeIn key={item.href} delay={i * 0.05}>
              <Link href={item.href}>
                <Card className="transition-all hover:border-primary/40 hover:shadow-md">
                  <CardContent className="flex items-center gap-4 py-2">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                      <Icon className="size-4 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}
