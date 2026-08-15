"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase";

export async function addTestMessage(formData: FormData) {
  const message = formData.get("message");
  if (typeof message !== "string" || message.trim() === "") {
    return;
  }

  const supabase = getSupabaseClient();
  await supabase.from("connection_test").insert({ message: message.trim() });

  revalidatePath("/");
}
