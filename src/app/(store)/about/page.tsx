import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre — ASTRO",
};

export default function AboutPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
          Nossa história
        </p>
        <h1 className="font-display text-5xl lg:text-7xl tracking-wide leading-none max-w-3xl">
          Feitos para quem vive a cultura
        </h1>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div>
          <div className="aspect-[4/5] bg-foreground flex items-center justify-center">
            <span className="font-display text-[20vw] lg:text-[8vw] text-background/10">
              A
            </span>
          </div>
        </div>

        <div className="space-y-8 lg:pt-8">
          <div>
            <h2 className="font-display text-3xl tracking-wide mb-4">
              O que é a Astro
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              ASTRO nasceu da convergência entre moda urbana e minimalismo. 
              Uma marca criada para quem não precisa de excessos para se destacar — 
              apenas de peças que falem por si.
            </p>
          </div>

          <div>
            <h2 className="font-display text-3xl tracking-wide mb-4">
              Nossa Filosofia
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Acreditamos que o verdadeiro estilo é discreto. Cada peça ASTRO 
              é desenvolvida com atenção aos detalhes, materiais premium e um 
              design que resiste ao tempo. Sem tendências passageiras. 
              Apenas qualidade que dura.
            </p>
          </div>

          <div>
            <h2 className="font-display text-3xl tracking-wide mb-4">
              Nossos Produtos
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Camisas oversized com caimento perfeito. Bonés com acabamento premium. 
              Cintos e anéis que completam qualquer visual. Cada produto carrega 
              a identidade ASTRO — limpa, forte e inconfundível.
            </p>
          </div>

          <div className="border-t border-border pt-8">
            <div className="grid grid-cols-3 gap-6 text-center">
              {[
                { num: "100%", label: "Qualidade premium" },
                { num: "2025", label: "Fundada em" },
                { num: "BR", label: "Made in" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl tracking-wide">{stat.num}</p>
                  <p className="text-xs text-muted-foreground mt-1 tracking-wide">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
