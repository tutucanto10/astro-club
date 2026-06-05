import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditProductForm } from "@/components/admin/EditProductForm";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: { variants: true, category: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-wide">Editar Produto</h1>
        <p className="text-muted-foreground text-sm mt-1">{product.name}</p>
      </div>
      <EditProductForm product={product as any} categories={categories} />
    </div>
  );
}
