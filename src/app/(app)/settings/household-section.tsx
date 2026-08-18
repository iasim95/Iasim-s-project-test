"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Copy, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createHouseholdInvite, leaveHousehold, type HouseholdMember } from "./household-actions";

export function HouseholdSection({ members }: { members: HouseholdMember[] }) {
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [leaving, startLeaving] = useTransition();
  const [leaveOpen, setLeaveOpen] = useState(false);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createHouseholdInvite({ error: null, link: null }, formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      setError(null);
      setLink(result.link);
    });
  }

  function handleCopy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {members.map((m) => (
          <div key={m.userId} className="flex items-center gap-2 text-sm">
            <div className="flex size-7 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <UserRound className="size-3.5" />
            </div>
            <span className="font-medium">{m.name ?? m.email}</span>
            {m.name && <span className="text-xs text-muted-foreground">({m.email})</span>}
            {m.isYou && <span className="text-xs text-muted-foreground">· tú</span>}
          </div>
        ))}
      </div>

      {link ? (
        <div className="flex items-center gap-2">
          <Input readOnly value={link} className="max-w-md" />
          <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setLink(null)}>
            Nueva invitación
          </Button>
        </div>
      ) : (
        <form action={handleSubmit} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-email">Email de tu pareja</Label>
            <Input
              id="invite-email"
              name="email"
              type="email"
              placeholder="pareja@email.com"
              required
              className="w-64"
            />
          </div>
          <Button type="submit" variant="outline" disabled={pending}>
            {pending ? "Generando…" : "Generar enlace de invitación"}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>
      )}
      <p className="text-xs text-muted-foreground">
        Se genera un enlace que caduca en 7 días — envíaselo tú por el medio que prefieras
        (WhatsApp, email, etc.). Quien lo abra podrá crear una cuenta y verá los mismos
        gastos, ingresos y objetivo de ahorro que tú (sus categorías y presupuestos siguen
        siendo suyos).
      </p>

      {members.length > 1 && (
        <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="w-fit text-muted-foreground">
              <LogOut className="size-3.5" /> Salir de este hogar compartido
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Salir del hogar compartido?</DialogTitle>
              <DialogDescription>
                Dejarás de ver los gastos e ingresos compartidos. Volverás a tener tu propio
                espacio, vacío. Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="destructive"
                disabled={leaving}
                onClick={() =>
                  startLeaving(async () => {
                    await leaveHousehold();
                    setLeaveOpen(false);
                    toast.success("Has salido del hogar compartido");
                  })
                }
              >
                {leaving ? "Saliendo…" : "Salir"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
