import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportForm } from "./import-form";

export default function ImportPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Importar</h1>
        <p className="text-muted-foreground">
          Sube un CSV para añadir gastos en lote.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formato esperado</CardTitle>
          <CardDescription>
            Columnas: <code>Fecha</code> (AAAA-MM-DD), <code>Categoría</code>,{" "}
            <code>Descripción</code>, <code>Importe</code>. Es el mismo formato que
            genera la exportación CSV de esta app. Si el nombre de categoría no
            coincide con ninguna existente, el gasto se importa sin categoría.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImportForm />
        </CardContent>
      </Card>
    </div>
  );
}
