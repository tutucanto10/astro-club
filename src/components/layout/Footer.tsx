import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h2 className="font-display text-3xl tracking-[0.2em] mb-4">ASTRO</h2>
            <p className="text-sm text-background/60 leading-relaxed">
              Nascida das ruas e para as ruas.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs tracking-[0.15em] uppercase font-medium mb-4 text-background/40">
              Shop
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/products", label: "Todos os produtos" },
                { href: "/products?category=camisas", label: "Camisas" },
                { href: "/products?category=bones", label: "Bonés" },
                { href: "/products?category=cintos", label: "Cintos" },
                { href: "/products?category=aneis", label: "Anéis" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs tracking-[0.15em] uppercase font-medium mb-4 text-background/40">
              Marca
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/about", label: "Sobre nós" },
                { href: "/contact", label: "Contato" },
                { href: "/lookbook", label: "Lookbook" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs tracking-[0.15em] uppercase font-medium mb-4 text-background/40">
              Suporte
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/faq", label: "FAQ" },
                { href: "/shipping", label: "Envio e Trocas" },
                { href: "/privacy", label: "Privacidade" },
                { href: "/terms", label: "Termos" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/40 tracking-wide">
            © {new Date().getFullYear()} ASTRO. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://www.instagram.com/astroclub.world/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs tracking-[0.1em] uppercase text-background/40 hover:text-background transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs tracking-[0.1em] uppercase text-background/40 hover:text-background transition-colors"
            >
              TikTok
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
