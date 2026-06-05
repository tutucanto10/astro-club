"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag, Minus, Plus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice, getStockStatus } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Variant {
  id: string;
  size?: string | null;
  color?: string | null;
  stock: number;
  sku?: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: any;
  comparePrice?: any;
  images: string[];
  variants: Variant[];
  category: { name: string; slug: string };
}

export function ProductPageClient({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants.length === 1 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addItem, toggleCart } = useCart();
  const { toast } = useToast();

  const sizes = [...new Set(product.variants.map((v) => v.size).filter(Boolean))];
  const stock = selectedVariant?.stock ?? 0;
  const { label: stockLabel, color: stockColor } = getStockStatus(stock);

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedVariant) {
      toast({ title: "Selecione um tamanho", variant: "destructive" });
      return;
    }

    const cartVariant = selectedVariant || product.variants[0];
    if (!cartVariant) return;

    addItem({
      id: `${product.id}-${cartVariant.id}`,
      productId: product.id,
      variantId: cartVariant.id,
      name: product.name,
      image: product.images[0] || "",
      price: parseFloat(product.price),
      size: cartVariant.size || undefined,
      color: cartVariant.color || undefined,
      quantity,
      stock: cartVariant.stock,
    });

    toast({ title: "Adicionado ao carrinho" });
    toggleCart();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square bg-secondary overflow-hidden">
            {product.images[activeImage] ? (
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-[12vw] text-foreground/10">
                  A
                </span>
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-square bg-secondary overflow-hidden border-2 transition-colors ${
                    activeImage === i
                      ? "border-foreground"
                      : "border-transparent hover:border-border"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="10vw"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="lg:py-4">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
            {product.category.name}
          </p>
          <h1 className="font-display text-4xl lg:text-5xl tracking-wide mb-4">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-medium">
              {formatPrice(parseFloat(product.price))}
            </span>
            {product.comparePrice &&
              parseFloat(product.comparePrice) > parseFloat(product.price) && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(parseFloat(product.comparePrice))}
                </span>
              )}
          </div>

          {/* Stock */}
          {selectedVariant && (
            <p className={`text-xs mb-6 ${stockColor}`}>{stockLabel}</p>
          )}

          {/* Size selector */}
          {sizes.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs tracking-[0.15em] uppercase font-medium">
                  Tamanho
                </h3>
                {selectedVariant?.size && (
                  <span className="text-xs text-muted-foreground">
                    Selecionado: {selectedVariant.size}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const variant = product.variants.find((v) => v.size === size);
                  const outOfStock = (variant?.stock ?? 0) === 0;
                  const isSelected = selectedVariant?.size === size;

                  return (
                    <button
                      key={size}
                      onClick={() => !outOfStock && setSelectedVariant(variant!)}
                      disabled={outOfStock}
                      className={`min-w-[52px] h-11 px-3 border text-sm transition-all ${
                        outOfStock
                          ? "border-border text-muted-foreground/40 cursor-not-allowed line-through"
                          : isSelected
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:border-foreground text-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="text-xs tracking-[0.15em] uppercase font-medium mb-3">
              Quantidade
            </h3>
            <div className="flex items-center border border-border w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-secondary transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="px-5 text-sm tabular-nums min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(stock || 10, quantity + 1))}
                className="p-3 hover:bg-secondary transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={!!selectedVariant && stock === 0}
            className="w-full bg-foreground text-background py-4 flex items-center justify-center gap-3 text-xs tracking-[0.2em] uppercase font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed btn-press mb-4"
          >
            <ShoppingBag size={16} />
            {stock === 0 && selectedVariant ? "Esgotado" : "Adicionar ao carrinho"}
          </button>

          <div className="border border-border p-6 space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="text-muted-foreground">Envio:</span>
              <span>Calculado no checkout</span>
            </div>
            <div className="flex gap-3">
              <span className="text-muted-foreground">Troca:</span>
              <span>30 dias após recebimento</span>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-xs tracking-[0.15em] uppercase font-medium mb-4">
              Descrição
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
