"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Silently refreshes the current route (via router.refresh) whenever a
 * postgres_changes event fires for the given table, scoped to the current
 * household. Renders nothing — drop it anywhere inside a page that shows
 * household-shared data to keep it live across devices/people.
 */
export function RealtimeRefresh({
  table,
  householdId,
}: {
  table: string;
  householdId: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`${table}-${householdId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `household_id=eq.${householdId}` },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, householdId, router]);

  return null;
}
