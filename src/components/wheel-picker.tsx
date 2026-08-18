"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const PADDING = ((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT;

export function WheelPicker({
  values,
  value,
  onChange,
  className,
}: {
  values: (string | number)[];
  value: string | number;
  onChange: (value: string | number) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the wheel in sync when `value` changes from outside (not from user scroll).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const idx = values.indexOf(value);
    if (idx < 0) return;
    const target = idx * ITEM_HEIGHT;
    if (Math.abs(el.scrollTop - target) > 2) el.scrollTop = target;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(values.length - 1, idx));
      if (values[clamped] !== value) onChange(values[clamped]);
    }, 60);
  }

  return (
    <div className={cn("relative", className)} style={{ height: VISIBLE_ITEMS * ITEM_HEIGHT }}>
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 rounded-md border-y-2 border-primary/50 bg-primary/5"
        style={{ height: ITEM_HEIGHT }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-4 bg-gradient-to-b from-card to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-4 bg-gradient-to-t from-card to-transparent"
        aria-hidden
      />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "y mandatory" }}
      >
        <div style={{ height: PADDING }} />
        {values.map((v) => (
          <div
            key={v}
            style={{ height: ITEM_HEIGHT, scrollSnapAlign: "center" }}
            className={cn(
              "flex items-center justify-center text-lg font-medium tabular-nums transition-colors",
              v === value ? "text-foreground" : "text-muted-foreground/50",
            )}
          >
            {v}
          </div>
        ))}
        <div style={{ height: PADDING }} />
      </div>
    </div>
  );
}
