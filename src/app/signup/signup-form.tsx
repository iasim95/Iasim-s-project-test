"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signUp, type AuthState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardDescription } from "@/components/ui/card";

const initialState: AuthState = { error: null };

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");

  return (
    <>
      <CardDescription>
        {inviteToken
          ? "Te han invitado a compartir gastos. Crea tu cuenta para unirte."
          : "Empieza a controlar tus gastos personales"}
      </CardDescription>

      {state.message ? (
        <p className="text-sm text-muted-foreground">{state.message}</p>
      ) : (
        <form action={formAction} className="flex flex-col gap-4">
          {inviteToken && <input type="hidden" name="invite_token" value={inviteToken} />}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" minLength={6} required />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Creando cuenta…" : "Crear cuenta"}
          </Button>
        </form>
      )}
      <p className="mt-4 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
