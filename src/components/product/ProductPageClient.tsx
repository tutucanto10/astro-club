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

// primary = cor da peça / secondary = cor da logo ou detalhe
const COLOR_MAP: Record<string, { primary: string; secondary: string }> = {
  // Camisa Astro Basic
  "Marrom / Azul Claro":     { primary: "#7C4A2B", secondary: "#87CEEB" },
  "Azul Escuro / Amarelo":   { primary: "#1B2A6B", secondary: "#FFD700" },
  "Grená / Dourado":         { primary: "#722F37", secondary: "#C5A028" },
  "Verde / Bege":            { primary: "#3B5323", secondary: "#D4B896" },
  "Bege / Verde":            { primary: "#C8A882", secondary: "#3B5323" },
  "Branco / Vermelho":       { primary: "#F0F0F0", secondary: "#DC2626" },
  "Preto / Vermelho":        { primary: "#111111", secondary: "#DC2626" },
  // Cinto Astro
  "Preto / Fivela Vermelha": { primary: "#111111", secondary: "#DC2626" },
  "Preto / Fivela Prata":    { primary: "#111111", secondary: "#C0C0C0" },
  "Rosa / Fivela Preta":     { primary: "#F4A7B9", secondary: "#111111" },
};

export function ProductPageClient({ product }: { product: Product }) {
  const colors = [...new Set(product.variants.map((v) => v.color).filter(Boolean))] as string[];
  const sizes  = [...new Set(product.variants.map((v) => v.size).filter(Boolean))] as string[];

  const hasColors = colors.length > 0;
  const hasSizes  = sizes.length > 0;

  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors.length === 1 ? colors[0] : null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes.length === 1 ? sizes[0] : null
  );
  const [quantity, setQuantity]   = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addItem, toggleCart } = useCart();
  const { toast } = useToast();

  const selectedVariant = product.variants.find((v) => {
    const colorMatch = !hasColors || v.color === selectedColor;
    const sizeMatch  = !hasSizes  || v.size  === selectedSize;
    return colorMatch && sizeMatch;
  }) ?? null;

  const availableSizes = selectedColor
    ? sizes.filter((s) => {
        const v = product.variants.find((v) => v.color === selectedColor && v.size === s);
        return v !== undefined;
      })
    : sizes;

  const stock = selectedVariant?.stock ?? 0;
  const { label: stockLabel, color: stockColor } = getStockStatus(stock);

  const handleAddToCart = () => {
    if (hasColors && !selectedColor) {
      toast({ title: "Selecione uma cor", variant: "destructive" });
      return;
    }
    if (hasSizes && !selectedSize) {
      toast({ title: "Selecione um tamanho", variant: "destructive" });
      return;
    }
    if (!selectedVariant) return;

    addItem({
      id: `${product.id}-${selectedVariant.id}`,
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      image: product.images[0] || "",
      price: parseFloat(product.price),
      size: selectedVariant.size || undefined,
      color: selectedVariant.color || undefined,
      quantity,
      stock: selectedVariant.stock,
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
                <span className="font-display text-[12vw] text-foreground/10">A</span>
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
                    activeImage === i ? "border-foreground" : "border-transparent hover:border-border"
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="10vw" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
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
            {product.comparePrice && parseFloat(product.comparePrice) > parseFloat(product.price) && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(parseFloat(product.comparePrice))}
              </span>
            )}
          </div>

          {selectedVariant && (
            <p className={`text-xs mb-6 ${stockColor}`}>{stockLabel}</p>
          )}

          {/* Color selector */}
          {hasColors && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs tracking-[0.15em] uppercase font-medium">Cor</h3>
                {selectedColor && (
                  <span className="text-xs text-muted-foreground">{selectedColor}</span>
                )}
              </div>
              <div className="flex gap-3">
                {colors.map((color) => {
                  const { primary, secondary } = COLOR_MAP[color] ?? { primary: "#888", secondary: "#ccc" };
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setSelectedSize(null);
                      }}
                      title={color}
                      className={`w-9 h-9 rounded-full transition-all overflow-hidden ${
                        isSelected
                          ? "ring-2 ring-offset-2 ring-foreground scale-110"
                          : "ring-1 ring-border hover:scale-105"
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${primary} 50%, ${secondary} 50%)`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Size selector */}
          {hasSizes && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs tracking-[0.15em] uppercase font-medium">Tamanho</h3>
                {selectedSize && (
                  <span className="text-xs text-muted-foreground">{selectedSize}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => {
                  const variant = product.variants.find(
                    (v) => v.size === size && (!hasColors || v.color === selectedColor)
                  );
                  const outOfStock = (variant?.stock ?? 0) === 0;
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      onClick={() => !outOfStock && setSelectedSize(size)}
                      disabled={outOfStock}
                      className={`min-w-[52px] h-11 px-3 border text-sm transition-all ${
                        outOfStock
                          ? "border-border text-muted-foreground/40 cursor-not-allowed line-through"
                          : isSelected
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:border-foreground"
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
            <h3 className="text-xs tracking-[0.15em] uppercase font-medium mb-3">Quantidade</h3>
            <div className="flex items-center border border-border w-fit">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-secondary transition-colors">
                <Minus size={14} />
              </button>
              <span className="px-5 text-sm tabular-nums min-w-[3rem] text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(stock || 10, quantity + 1))} className="p-3 hover:bg-secondary transition-colors">
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

          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-xs tracking-[0.15em] uppercase font-medium mb-4">Descrição</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
