"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
  activeCategory?: string;
  activeSort?: string;
}

export function ProductFilters({
  categories,
  activeCategory,
  activeSort,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null) params.delete(name);
      else params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const setFilter = (key: string, value: string | null) => {
    router.push(`${pathname}?${createQueryString(key, value)}`);
  };

  const sizes = ["P", "M", "G", "GG", "XG", "Único"];
  const sortOptions = [
    { value: "newest", label: "Mais recentes" },
    { value: "price_asc", label: "Menor preço" },
    { value: "price_desc", label: "Maior preço" },
  ];

  return (
    <div className="space-y-8">
      {/* Sort */}
      <div>
        <h3 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3 font-medium">
          Ordenar
        </h3>
        <div className="space-y-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                setFilter(
                  "sort",
                  activeSort === opt.value ? null : opt.value
                )
              }
              className={`block w-full text-left text-sm py-1 transition-all ${
                activeSort === opt.value
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3 font-medium">
          Categorias
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => setFilter("category", null)}
            className={`block w-full text-left text-sm py-1 transition-all ${
              !activeCategory
                ? "font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setFilter(
                  "category",
                  activeCategory === cat.slug ? null : cat.slug
                )
              }
              className={`block w-full text-left text-sm py-1 transition-all ${
                activeCategory === cat.slug
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3 font-medium">
          Tamanho
        </h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const active = searchParams.get("size") === size;
            return (
              <button
                key={size}
                onClick={() => setFilter("size", active ? null : size)}
                className={`text-xs px-3 py-1.5 border transition-colors ${
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear all */}
      {(activeCategory || activeSort || searchParams.get("size")) && (
        <button
          onClick={() => router.push(pathname)}
          className="text-xs tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
