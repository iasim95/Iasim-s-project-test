"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CategoryFormState = { error: string | null };

const DEFAULT_COLOR = "#64748b";

export async function createCategory(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const name = (formData.get("name") as string)?.trim();
  const color = (formData.get("color") as string) || DEFAULT_COLOR;

  if (!name) return { error: "El nombre es obligatorio." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { error } = await supabase
    .from("categories")
    .insert({ name, color, user_id: user.id });

  if (error) {
    return {
      error: error.code === "23505" ? "Ya existe una categoría con ese nombre." : error.message,
    };
  }

  revalidatePath("/categories");
  revalidatePath("/expenses");
  return { error: null };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", id);

  revalidatePath("/categories");
  revalidatePath("/expenses");
}
