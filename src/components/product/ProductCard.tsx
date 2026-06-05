"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: any;
    comparePrice?: any;
    images: string[];
    variants: Array<{
      id: string;
      stock: number;
    }>;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  const isOutOfStock = totalStock === 0;

  return (
    <Link href={`/products/${product.slug}`} className="group product-card block">
      {/* Image */}
      <div className="relative aspect-[3/4] bg-secondary overflow-hidden mb-3">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover product-card-image"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-5xl text-foreground/10">A</span>
          </div>
        )}

        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt={product.name}
            fill
            className="object-cover product-card-image absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
              Esgotado
            </span>
          </div>
        )}

        {/* Quick add */}
        {!isOutOfStock && (
          <div className="absolute bottom-0 left-0 right-0 bg-foreground text-background py-3 text-center text-xs tracking-[0.15em] uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2">
            <ShoppingBag size={12} />
            Ver produto
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <h3 className="text-sm font-medium leading-tight mb-1 group-hover:opacity-70 transition-opacity">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {formatPrice(parseFloat(product.price))}
          </span>
          {product.comparePrice &&
            parseFloat(product.comparePrice) > parseFloat(product.price) && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(parseFloat(product.comparePrice))}
              </span>
            )}
        </div>
      </div>
    </Link>
  );
}
