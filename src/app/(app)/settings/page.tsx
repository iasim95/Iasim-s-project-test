import Link from "next/link";
import { Download, Upload, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion";
import { GeneralSettingsForm } from "./general-settings-form";
import { RestoreForm } from "./restore-form";
import { DeleteAllButton } from "./delete-all-button";
import { HouseholdSection } from "./household-section";
import { getHouseholdMembers } from "./household-actions";
import type { UserSettings } from "@/lib/types";

const items = [
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

export default async function SettingsPage() {
  const supabase = await createClient();
  const [{ data: settings }, members] = await Promise.all([
    supabase.from("user_settings").select("*").maybeSingle(),
    getHouseholdMembers(),
  ]);
  const userSettings = settings as UserSettings | null;

  return (
    <FadeIn className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Ajustes</h1>
        <p className="text-muted-foreground">Ingresos, moneda, compartir y datos.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compartir con tu pareja</CardTitle>
          <CardDescription>
            Comparte tus gastos, ingresos y objetivo de ahorro con otra persona.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HouseholdSection members={members} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ingresos y moneda</CardTitle>
        </CardHeader>
        <CardContent>
          <GeneralSettingsForm
            defaultIncome={userSettings?.default_monthly_income ?? null}
            currencySymbol={userSettings?.currency_symbol ?? "€"}
          />
        </CardContent>
      </Card>

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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos y copia de seguridad</CardTitle>
          <CardDescription>
            Tus datos viven en Supabase. Puedes descargar una copia completa en JSON o
            restaurarla más tarde.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild variant="outline" className="w-fit">
            <a href="/api/settings/backup">Descargar copia de seguridad (.json)</a>
          </Button>
          <RestoreForm />
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Zona de peligro</CardTitle>
          <CardDescription>Elimina permanentemente todos tus datos.</CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAllButton />
        </CardContent>
      </Card>
    </FadeIn>
  );
}
