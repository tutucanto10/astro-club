"use client";

import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, total } = useCart();
  const cartTotal = total();

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) toggleCart();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, toggleCart]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-foreground/30 z-50 backdrop-blur-sm"
        onClick={toggleCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} />
            <span className="font-medium tracking-wide text-sm uppercase">
              Carrinho ({items.length})
            </span>
          </div>
          <button
            onClick={toggleCart}
            className="hover:opacity-60 transition-opacity"
            aria-label="Fechar carrinho"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={40} className="text-muted-foreground" />
              <div>
                <p className="font-medium">Seu carrinho está vazio</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Adicione produtos para continuar
                </p>
              </div>
              <button
                onClick={toggleCart}
                className="text-sm underline underline-offset-4 hover:opacity-60 transition-opacity"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            <div className="space-y-0">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className="flex gap-4 py-5 border-b border-border last:border-0"
                >
                  <div className="relative w-20 h-24 bg-secondary flex-shrink-0 overflow-hidden">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm leading-tight truncate">
                      {item.name}
                    </h3>
                    {item.size && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Tamanho: {item.size}
                      </p>
                    )}
                    <p className="text-sm font-medium mt-2">
                      {formatPrice(item.price)}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1.5 hover:bg-secondary transition-colors"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-sm tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock}
                          className="p-1.5 hover:bg-secondary transition-colors disabled:opacity-30"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Remover item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(cartTotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Frete calculado no checkout
            </p>
            <Link href="/checkout" onClick={toggleCart}>
              <button className="w-full bg-foreground text-background py-4 text-xs tracking-[0.15em] uppercase font-medium hover:opacity-90 transition-opacity btn-press">
                Finalizar compra
              </button>
            </Link>
            <button
              onClick={toggleCart}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide underline underline-offset-4"
            >
              Continuar comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
