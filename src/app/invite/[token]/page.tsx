import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("household_invites")
    .select("household_id, expires_at, used_at, created_by")
    .eq("token", token)
    .maybeSingle();

  const valid = invite && !invite.used_at && new Date(invite.expires_at) > new Date();

  let inviterEmail = "";
  if (invite) {
    const { data } = await admin.auth.admin.getUserById(invite.created_by);
    inviterEmail = data.user?.email ?? "";
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{valid ? "Te han invitado" : "Enlace no válido"}</CardTitle>
          <CardDescription>
            {valid
              ? `${inviterEmail || "Alguien"} quiere compartir contigo sus gastos, ingresos y objetivo de ahorro en Gastos.`
              : "Este enlace de invitación ha caducado o ya se usó. Pide uno nuevo a quien te invitó."}
          </CardDescription>
        </CardHeader>
        {valid && (
          <CardContent>
            <Button asChild className="w-full">
              <Link href={`/signup?invite=${token}`}>Crear cuenta y unirme</Link>
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Inicia sesión
              </Link>{" "}
              (deberás pedir que te unan manualmente).
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
