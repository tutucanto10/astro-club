"use client";

import Link from "next/link";
import { ShoppingBag, User, Search, Menu, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const { itemCount, toggleCart } = useCart();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const count = itemCount();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { href: "/products", label: "Shop" },
    { href: "/products?category=camisas", label: "Camisas" },
    { href: "/products?category=bones", label: "Bonés" },
    { href: "/products?category=cintos", label: "Cintos" },
    { href: "/products?category=aneis", label: "Anéis" },
    { href: "/about", label: "Sobre" },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/95 backdrop-blur-sm border-b border-border"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left: Nav (desktop) */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs tracking-[0.15em] uppercase font-medium text-foreground/70 hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile: Menu */}
            <button
              className="lg:hidden p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>

            {/* Center: Logo */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 font-display text-2xl lg:text-3xl tracking-[0.2em] hover:opacity-80 transition-opacity"
            >
              ASTRO
            </Link>

            {/* Right: Nav (desktop) + Icons */}
            <div className="flex items-center gap-6">
              <nav className="hidden lg:flex items-center gap-8">
                {navLinks.slice(3).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs tracking-[0.15em] uppercase font-medium text-foreground/70 hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-4">
                <button aria-label="Buscar" className="hover:opacity-70 transition-opacity">
                  <Search size={18} />
                </button>

                <Link
                  href={session ? "/account" : "/login"}
                  aria-label="Conta"
                  className="hover:opacity-70 transition-opacity"
                >
                  <User size={18} />
                </Link>

                <button
                  onClick={toggleCart}
                  className="relative hover:opacity-70 transition-opacity"
                  aria-label="Carrinho"
                >
                  <ShoppingBag size={18} />
                  {count > 0 && (
                    <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-background border-t border-border">
            <nav className="flex flex-col px-6 py-4 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm tracking-[0.12em] uppercase font-medium py-2 border-b border-border/50"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
