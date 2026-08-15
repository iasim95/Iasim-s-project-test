import { FileSpreadsheet, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ExportPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Exportar</h1>
        <p className="text-muted-foreground">Descarga todos tus gastos registrados.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="size-4" /> CSV
            </CardTitle>
            <CardDescription>Para abrir en Excel, Sheets o Numbers.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/api/export/csv">Descargar CSV</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-4" /> PDF
            </CardTitle>
            <CardDescription>Informe listo para imprimir o compartir.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/api/export/pdf">Descargar PDF</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
