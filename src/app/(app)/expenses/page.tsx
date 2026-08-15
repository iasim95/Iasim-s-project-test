import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn } from "@/components/motion";
import { OtrosTab } from "./otros-tab";
import { FijosTab } from "./fijos/fijos-tab";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; from?: string; to?: string }>;
}) {
  const filters = await searchParams;

  return (
    <FadeIn className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Gastos</h1>
        <p className="text-muted-foreground">Fijos que se repiten cada mes, y todo lo demás.</p>
      </div>

      <Tabs defaultValue="otros">
        <TabsList>
          <TabsTrigger value="otros">Otros gastos</TabsTrigger>
          <TabsTrigger value="fijos">Gastos fijos</TabsTrigger>
        </TabsList>
        <TabsContent value="otros" className="pt-4">
          <OtrosTab filters={filters} />
        </TabsContent>
        <TabsContent value="fijos" className="pt-4">
          <FijosTab />
        </TabsContent>
      </Tabs>
    </FadeIn>
  );
}
