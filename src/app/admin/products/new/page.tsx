import { prisma } from "@/lib/prisma";
import { NewProductForm } from "@/components/admin/NewProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-wide">Novo Produto</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Adicione um novo produto à loja
        </p>
      </div>

      <NewProductForm categories={categories} />
    </div>
  );
}
