import { createClient } from "@/lib/supabase/server";
import { CategoryIcon } from "@/lib/category-icons";
import type { Category } from "@/lib/types";
import { NewCategoryForm } from "./new-category-form";
import { DeleteCategoryButton } from "./delete-category-button";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  const categoryList = (categories ?? []) as Category[];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Categorías</h1>

      <NewCategoryForm />

      <div className="flex flex-wrap gap-2">
        {categoryList.map((category) => (
          <div
            key={category.id}
            className="flex items-center gap-2 rounded-full border py-1 pr-2 pl-1.5"
          >
            <CategoryIcon name={category.name} color={category.color} size="sm" />
            <span className="text-sm font-medium">{category.name}</span>
            <DeleteCategoryButton id={category.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
