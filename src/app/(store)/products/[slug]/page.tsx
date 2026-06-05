import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductPageClient } from "@/components/product/ProductPageClient";
import { ProductCard } from "@/components/product/ProductCard";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug, active: true },
    include: { category: true, variants: true },
  });
}

async function getRelated(categoryId: string, excludeId: string) {
  return prisma.product.findMany({
    where: { categoryId, active: true, id: { not: excludeId } },
    include: { variants: true, category: true },
    take: 4,
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Produto não encontrado" };
  return {
    title: product.name,
    description: product.description.substring(0, 160),
    openGraph: {
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await getRelated(product.categoryId, product.id);

  return (
    <div className="pt-20">
      <ProductPageClient product={product as any} />

      {related.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-20 mt-20 border-t border-border pt-16">
          <h2 className="font-display text-3xl lg:text-4xl tracking-wide mb-10">
            Você também pode gostar
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
