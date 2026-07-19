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

const COLOR_MAP: Record<string, { primary: string; secondary: string }> = {
  "azul e amarelo":   { primary: "#1B2A6B", secondary: "#FFD700" },
  "bege e verde":     { primary: "#C8A882", secondary: "#3B5323" },
  "preto e vermelho": { primary: "#111111", secondary: "#DC2626" },
  "verde e bege":     { primary: "#3B5323", secondary: "#D4B896" },
  "preto":            { primary: "#111111", secondary: "#333333" },
  "rosa":             { primary: "#F4A7B9", secondary: "#e08090" },
};

const COLOR_IMAGES: Record<string, Record<string, string[]>> = {
  "camisa-astro-basic": {
    "azul e amarelo": [
      "/camisas%20basic/azul%20e%20amarelo/IMG_2773.jpeg",
      "/camisas%20basic/azul%20e%20amarelo/IMG_2774.jpeg",
      "/camisas%20basic/azul%20e%20amarelo/IMG_2808.jpeg",
      "/camisas%20basic/azul%20e%20amarelo/IMG_2824.jpeg",
    ],
    "bege e verde": [
      "/camisas%20basic/bege%20e%20verde/IMG_2691.jpeg",
      "/camisas%20basic/bege%20e%20verde/IMG_2695.jpeg",
      "/camisas%20basic/bege%20e%20verde/IMG_2708.jpeg",
      "/camisas%20basic/bege%20e%20verde/IMG_2767.jpeg",
    ],
    "preto e vermelho": [
      "/camisas%20basic/preto%20e%20vermelho/IMG_2482.jpeg",
      "/camisas%20basic/preto%20e%20vermelho/IMG_2502.jpeg",
      "/camisas%20basic/preto%20e%20vermelho/IMG_2509%20copy.jpeg",
      "/camisas%20basic/preto%20e%20vermelho/IMG_2633.jpeg",
    ],
    "verde e bege": [
      "/camisas%20basic/verde%20e%20bege/IMG_2434.jpeg",
      "/camisas%20basic/verde%20e%20bege/IMG_2448.jpeg",
      "/camisas%20basic/verde%20e%20bege/IMG_2462.jpeg",
      "/camisas%20basic/verde%20e%20bege/IMG_2465.jpeg",
    ],
  },
  "cinto-astro": {
    "preto": [
      "/cinto/preto/IMG_2883.jpeg",
      "/cinto/preto/IMG_2892.jpeg",
      "/cinto/preto/IMG_2904.jpeg",
      "/cinto/preto/IMG_2913.jpeg",
      "/cinto/preto/IMG_2918.jpeg",
    ],
    "rosa": [
      "/cinto/rosa/IMG_2837.jpeg",
      "/cinto/rosa/IMG_2841.jpeg",
      "/cinto/rosa/IMG_2858.jpeg",
      "/cinto/rosa/IMG_2863.jpeg",
      "/cinto/rosa/IMG_2871.jpeg",
    ],
  },
};

export function ProductPageClient({ product }: { product: Product }) {
  const colors = [...new Set(product.variants.map((v) => v.color).filter(Boolean))] as string[];
  const sizes  = [...new Set(product.variants.map((v) => v.size).filter(Boolean))] as string[];

  const hasColors = colors.length > 0;
  const hasSizes  = sizes.length > 0;

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize]   = useState<string | null>(
    sizes.length === 1 ? sizes[0] : null
  );
  const [quantity, setQuantity]     = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addItem, toggleCart } = useCart();
  const { toast } = useToast();

  // Fotos: usa a cor selecionada; se nenhuma selecionada, usa a primeira cor disponível
  const colorImagesMap = COLOR_IMAGES[product.slug] ?? {};
  const defaultColor   = colors[0] ?? null;
  const imageColor     = selectedColor ?? defaultColor;
  const displayImages  = (imageColor && colorImagesMap[imageColor])
    ? colorImagesMap[imageColor]
    : product.images;

  const selectedVariant = product.variants.find((v) => {
    const colorMatch = !hasColors || v.color === selectedColor;
    const sizeMatch  = !hasSizes  || v.size  === selectedSize;
    return colorMatch && sizeMatch;
  }) ?? null;

  const availableSizes = selectedColor
    ? sizes.filter((s) => product.variants.find((v) => v.color === selectedColor && v.size === s))
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
      image: displayImages[0] || product.images[0] || "",
      price: parseFloat(product.price),
      size: selectedVariant.size || undefined,
      color: selectedVariant.color || undefined,
      quantity,
      stock: selectedVariant.stock,
    });

    toast({ title: "Adicionado ao carrinho" });
    toggleCart();
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">

        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square bg-secondary overflow-hidden">
            {product.slug === "copo-astro" ? (
              <video
                src="/copoastrovideopresentation.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : displayImages[activeImage] ? (
              <Image
                key={displayImages[activeImage]}
                src={displayImages[activeImage]}
                alt={product.name}
                fill
                className="object-contain"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-[12vw] text-foreground/10">A</span>
              </div>
            )}
          </div>

          {product.slug !== "copo-astro" && displayImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {displayImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-square bg-secondary overflow-hidden border-2 transition-colors ${
                    activeImage === i ? "border-foreground" : "border-transparent hover:border-border"
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-contain" sizes="10vw" />
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
                {selectedColor ? (
                  <span className="text-xs text-muted-foreground">{capitalize(selectedColor)}</span>
                ) : (
                  <span className="text-xs text-muted-foreground/50">Selecione uma cor</span>
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
                        setActiveImage(0);
                      }}
                      title={capitalize(color)}
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

          {product.slug === "cinto-astro" && (
            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="text-xs tracking-[0.15em] uppercase font-medium mb-4">Guia de Tamanho</h3>
              <div className="relative w-full">
                <Image
                  src="/tamanhocintoastro.png"
                  alt="Guia de tamanho — Cinto Astro"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
