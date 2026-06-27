import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Sobre — ASTRO Club",
  description: "Fundada em 2020 por Artur Canto e Gabriel Barros, a Astro Club nasceu das ruas e para as ruas.",
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
          Nas ruas, somos estrelas.
        </h1>
      </div>

      <div className="border-t border-border" />

      {/* Foto + Texto */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

        {/* Foto */}
        <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
          <Image
            src="https://i.ibb.co/7N6r8YPT/Whats-App-Image-2026-06-27-at-17-59-52.jpg"
            alt="Astro Club — Fundadores"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        {/* Texto */}
        <div className="space-y-10 lg:pt-8">
          <div className="space-y-6">
            <p className="text-muted-foreground leading-relaxed text-base">
              Fundada em 2020 por Artur Canto e Gabriel Barros, a Astro Club nasceu das ruas e para as ruas.
              Criada a partir da vivência, da cultura e da essência do underground, a marca carrega em cada peça
              a força da expressão, da autenticidade e da liberdade de ser quem você é.
            </p>
            <p className="text-muted-foreground leading-relaxed text-base">
              Mais do que uma marca de roupa, a Astro Club representa movimento, visão e atitude —
              para quem transforma o cotidiano em identidade e faz do estilo uma extensão da própria história.
            </p>
          </div>

          <div className="border-l-2 border-foreground pl-6 space-y-1">
            <p className="font-display text-xl tracking-wide">Porque antes da moda, vem a essência.</p>
          </div>

          <div className="border-t border-border pt-10 grid grid-cols-3 gap-6 text-center">
            {[
              { num: "2020", label: "Fundada em" },
              { num: "100%", label: "Das ruas" },
              { num: "BR", label: "Feito no Brasil" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-3xl tracking-wide">{stat.num}</p>
                <p className="text-xs text-muted-foreground mt-2 tracking-[0.1em] uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner final */}
      <div className="bg-foreground text-background px-10 lg:px-20 py-16 lg:py-20 text-center">
        <p className="text-background/40 text-xs tracking-[0.3em] uppercase mb-4">Astro Club</p>
        <h2 className="font-display text-4xl lg:text-6xl tracking-wide">
          Nas ruas, somos estrelas.
        </h2>
      </div>

    </div>
  );
}
