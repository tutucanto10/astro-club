import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import AstroLogo3DClient from "@/components/AstroLogo3DClient";

export const dynamic = "force-dynamic";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "ASTRO — Streetwear Premium",
};

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { featured: true, active: true },
    include: {
      category: true,
      variants: true,
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
}

async function getCategories() {
  return prisma.category.findMany({
    take: 4,
    orderBy: { name: "asc" },
  });
}

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-foreground">
          <div className="absolute inset-0 opacity-20">
            {/* Geometric pattern overlay */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 40px,
                  rgba(255,255,255,0.03) 40px,
                  rgba(255,255,255,0.03) 41px
                )`,
              }}
            />
          </div>
        </div>

        <div className="relative z-10 text-center px-6 animate-fade-in">
          <div className="mb-6">
            <AstroLogo3DClient />
          </div>
          <p className="text-background/70 text-sm md:text-base tracking-widest mb-8 font-light">
            Nas ruas, somos estrelas.
          </p>
          <Link href="/products">
            <button className="border border-background/30 text-background px-10 py-4 text-xs tracking-[0.2em] uppercase font-medium hover:bg-background hover:text-foreground transition-all duration-300 btn-press">
              Explorar Coleção
            </button>
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-background/20 relative overflow-hidden">
            <div className="absolute w-full bg-background/60 h-1/2 animate-[slideDown_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="border-y border-border overflow-hidden py-4 bg-background">
        <div className="marquee-track flex gap-16 whitespace-nowrap">
          {Array(8)
            .fill(null)
            .map((_, i) => (
              <span
                key={i}
                className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-medium"
              >
                Astro Studio &nbsp;·&nbsp; Streetwear Premium &nbsp;·&nbsp; Nova Coleção &nbsp;·&nbsp; 2026
              </span>
            ))}
        </div>
      </div>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
              Destaques
            </p>
            <h2 className="font-display text-4xl lg:text-5xl tracking-wide">
              Produtos em Destaque
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden md:flex items-center gap-2 text-xs tracking-[0.15em] uppercase hover:gap-3 transition-all"
          >
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Placeholder cards when no products */}
            {Array(4).fill(null).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-secondary animate-pulse" />
            ))}
          </div>
        )}

        <div className="mt-10 text-center md:hidden">
          <Link href="/products">
            <button className="border border-border px-8 py-3 text-xs tracking-[0.15em] uppercase hover:bg-foreground hover:text-background transition-colors">
              Ver todos
            </button>
          </Link>
        </div>
      </section>

      {/* Split Feature */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh]">
        <div className="bg-foreground flex flex-col justify-end p-10 lg:p-16 min-h-[50vh] lg:min-h-0">
          <p className="text-background/40 text-xs tracking-[0.25em] uppercase mb-3">
            Identidade
          </p>
          <h2 className="font-display text-4xl lg:text-5xl text-background leading-tight tracking-wide mb-5">
            Feito para quem<br />define o estilo
          </h2>
          <p className="text-background/60 text-sm leading-relaxed mb-8 max-w-sm">
            Cada peça ASTRO é projetada com precisão e intenção.
            Do corte à estampa, tudo comunica quem você é.
          </p>
          <Link href="/about">
            <button className="self-start border border-background/30 text-background px-8 py-3 text-xs tracking-[0.2em] uppercase hover:bg-background hover:text-foreground transition-all">
              Nossa história
            </button>
          </Link>
        </div>
        <div className="bg-secondary min-h-[50vh] lg:min-h-0 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-[20vw] lg:text-[12vw] text-foreground/5 select-none">
              A
            </span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
        <div className="mb-12 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
            Categorias
          </p>
          <h2 className="font-display text-4xl lg:text-5xl tracking-wide">
            Explore a Coleção
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Camisas", slug: "camisas", label: "Oversized & Premium" },
            { name: "Bonés", slug: "bones", label: "Streetwear Essential" },
            { name: "Cintos", slug: "cintos", label: "Acessório Exclusivo" },
            { name: "Anéis", slug: "aneis", label: "Joia Urbana" },
          ].map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group relative aspect-square bg-secondary overflow-hidden"
            >
              <div className="absolute inset-0 flex flex-col justify-end p-5 bg-gradient-to-t from-foreground/60 to-transparent">
                <p className="text-[10px] tracking-[0.2em] uppercase text-background/60 mb-1">
                  {cat.label}
                </p>
                <h3 className="font-display text-xl lg:text-2xl text-background tracking-wide">
                  {cat.name}
                </h3>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-[8vw] lg:text-5xl text-foreground/10 group-hover:text-foreground/20 transition-colors select-none">
                  {cat.name[0]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Collection Banner */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20 lg:pb-28">
        <div className="bg-foreground text-background px-10 lg:px-20 py-16 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-background/40 text-xs tracking-[0.3em] uppercase mb-3">
              Limited Drop
            </p>
            <h2 className="font-display text-4xl lg:text-5xl tracking-wide leading-tight">
              Nova Coleção<br />chegando em breve
            </h2>
          </div>
          <div className="flex-shrink-0">
            <Link href="/products">
              <button className="border border-background/30 text-background px-10 py-4 text-xs tracking-[0.2em] uppercase font-medium hover:bg-background hover:text-foreground transition-all btn-press">
                Ver Coleção Atual
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
