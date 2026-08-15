import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
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
            className="flex items-center gap-2 rounded-full border py-1 pr-1 pl-3"
          >
            <Badge
              style={{
                backgroundColor: `${category.color}20`,
                color: category.color,
              }}
              variant="outline"
            >
              {category.name}
            </Badge>
            <DeleteCategoryButton id={category.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
