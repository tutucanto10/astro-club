import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product/ProductFilters";

export const metadata: Metadata = {
  title: "Shop — Todos os Produtos",
};

interface SearchParams {
  category?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  size?: string;
}

async function getProducts(params: SearchParams) {
  const where: any = { active: true };

  if (params.category) {
    const cat = await prisma.category.findFirst({
      where: { slug: params.category },
    });
    if (cat) where.categoryId = cat.id;
  }

  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) where.price.gte = parseFloat(params.minPrice);
    if (params.maxPrice) where.price.lte = parseFloat(params.maxPrice);
  }

  if (params.size) {
    where.variants = {
      some: { size: params.size, stock: { gt: 0 } },
    };
  }

  let orderBy: any = { createdAt: "desc" };
  if (params.sort === "price_asc") orderBy = { price: "asc" };
  if (params.sort === "price_desc") orderBy = { price: "desc" };

  return prisma.product.findMany({
    where,
    include: { category: true, variants: true },
    orderBy,
  });
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ]);

  const activeCategory = params.category;

  return (
    <div className="pt-20">
      {/* Page header */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 border-b border-border">
        <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
          Coleção 2025
        </p>
        <div className="flex items-end justify-between">
          <h1 className="font-display text-5xl lg:text-6xl tracking-wide">
            {activeCategory
              ? categories.find((c) => c.slug === activeCategory)?.name ||
                "Produtos"
              : "Shop"}
          </h1>
          <span className="text-sm text-muted-foreground">
            {products.length} produto{products.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filters Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <ProductFilters
              categories={categories}
              activeCategory={activeCategory}
              activeSort={params.sort}
            />
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <span className="font-display text-6xl text-foreground/10 mb-4">
                  0
                </span>
                <p className="font-medium mb-2">Nenhum produto encontrado</p>
                <p className="text-sm text-muted-foreground">
                  Tente ajustar seus filtros
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
