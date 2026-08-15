"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteAllData } from "./actions";

export function DeleteAllButton() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
          Borrar todos los datos
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Borrar tus datos personales?</DialogTitle>
          <DialogDescription>
            Se eliminarán tus categorías, presupuestos y ajustes personales. Los gastos,
            ingresos y objetivos compartidos con tu hogar <strong>no</strong> se tocan, ya que
            también pertenecen a las demás personas con acceso. Esta acción no se puede
            deshacer. Escribe <strong>BORRAR</strong> para confirmar.
          </DialogDescription>
        </DialogHeader>
        <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="BORRAR" />
        <DialogFooter>
          <Button
            variant="destructive"
            disabled={confirmText !== "BORRAR" || pending}
            onClick={() => startTransition(() => deleteAllData())}
          >
            {pending ? "Borrando…" : "Borrar definitivamente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
