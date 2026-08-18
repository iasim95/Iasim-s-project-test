"use client";

import { useState } from "react";
import { Keyboard, MoveHorizontal } from "lucide-react";
import { WheelPicker } from "@/components/wheel-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const HUNDREDS = Array.from({ length: 10 }, (_, i) => i); // 0-9 -> x100
const UNITS = Array.from({ length: 100 }, (_, i) => String(i).padStart(2, "0")); // 00-99
const CENTS = Array.from({ length: 100 }, (_, i) => String(i).padStart(2, "0")); // 00-99
const WHEEL_MAX = 999.99;

export function AmountWheelPicker({
  name,
  symbol = "€",
  defaultValue,
}: {
  name: string;
  symbol?: string;
  defaultValue?: number;
}) {
  const initial = defaultValue ?? 0;
  const [manual, setManual] = useState(initial > WHEEL_MAX);
  const [hundreds, setHundreds] = useState(Math.floor(initial / 100) % 10);
  const [units, setUnits] = useState(String(Math.floor(initial) % 100).padStart(2, "0"));
  const [cents, setCents] = useState(
    String(Math.round((initial - Math.floor(initial)) * 100)).padStart(2, "0"),
  );
  const [manualValue, setManualValue] = useState(initial > WHEEL_MAX ? String(initial) : "");

  const amount = hundreds * 100 + Number(units) + Number(cents) / 100;

  if (manual) {
    return (
      <div className="flex items-center gap-2">
        <Input
          name={name}
          type="number"
          step="0.01"
          min="0.01"
          required
          defaultValue={manualValue}
          onChange={(e) => setManualValue(e.target.value)}
          placeholder={`0.00 ${symbol}`}
          autoFocus
        />
        <Button type="button" variant="ghost" size="icon-sm" onClick={() => setManual(false)} title="Usar ruedas">
          <MoveHorizontal className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-center gap-1 rounded-xl border bg-card px-2">
        <input type="hidden" name={name} value={amount.toFixed(2)} />
        <WheelPicker values={HUNDREDS} value={hundreds} onChange={(v) => setHundreds(Number(v))} className="w-10" />
        <WheelPicker values={UNITS} value={units} onChange={(v) => setUnits(String(v))} className="w-12" />
        <span className="text-lg font-medium text-muted-foreground">,</span>
        <WheelPicker values={CENTS} value={cents} onChange={(v) => setCents(String(v))} className="w-12" />
        <span className="pl-1 text-lg font-medium text-muted-foreground">{symbol}</span>
      </div>
      <button
        type="button"
        onClick={() => setManual(true)}
        className="flex w-fit items-center gap-1 self-center text-xs text-muted-foreground hover:text-foreground"
      >
        <Keyboard className="size-3" /> Escribir a mano (para importes de {symbol}1.000 o más)
      </button>
    </div>
  );
}
