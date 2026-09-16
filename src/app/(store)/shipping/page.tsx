import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Envio e Trocas — ASTRO Club",
  description: "Informações sobre prazo de entrega, frete e política de trocas e devoluções da ASTRO Club.",
};

export default function ShippingPage() {
  return (
    <div className="pt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">Logística</p>
        <h1 className="font-display text-5xl lg:text-7xl tracking-wide leading-none max-w-3xl">
          Envio e Trocas
        </h1>
      </div>

      <div className="border-t border-border" />

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16 lg:py-24 space-y-14">

        <section className="space-y-4">
          <h2 className="font-display text-2xl tracking-wide">Prazo de Envio</h2>
          <p className="text-muted-foreground leading-relaxed">
            Os pedidos são processados em até <strong>3 dias úteis</strong> após a confirmação do pagamento.
            Após o despacho, o prazo de entrega pelos Correios é de <strong>5 a 15 dias úteis</strong> dependendo da sua região.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Você receberá um e-mail com o código de rastreamento assim que o pedido for despachado.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl tracking-wide">Frete</h2>
          <p className="text-muted-foreground leading-relaxed">
            O frete é calculado automaticamente no checkout com base no seu CEP. Enviamos para todo o Brasil via Correios.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl tracking-wide">Trocas e Devoluções</h2>
          <p className="text-muted-foreground leading-relaxed">
            Aceitamos trocas e devoluções em até <strong>7 dias corridos</strong> após o recebimento do produto,
            conforme o Código de Defesa do Consumidor.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Para solicitar uma troca ou devolução, o produto deve estar:
          </p>
          <ul className="list-none space-y-2">
            {[
              "Sem uso e sem lavagem",
              "Com etiqueta original",
              "Na embalagem original ou equivalente",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-muted-foreground">
                <span className="mt-1 w-1 h-1 rounded-full bg-foreground flex-shrink-0 block" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl tracking-wide">Como Solicitar</h2>
          <p className="text-muted-foreground leading-relaxed">
            Entre em contato pelo Instagram <strong>@astroclub.world</strong> ou pelo e-mail{" "}
            <a href="mailto:pedidos@astroclub.world" className="underline underline-offset-4">
              pedidos@astroclub.world
            </a>{" "}
            informando o número do pedido e o motivo da troca ou devolução.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            O custo do frete de retorno é de responsabilidade do cliente, exceto em casos de defeito de fabricação.
          </p>
        </section>

      </div>

      <div className="bg-foreground text-background px-10 lg:px-20 py-16 text-center">
        <p className="text-background/40 text-xs tracking-[0.3em] uppercase mb-4">Dúvidas?</p>
        <h2 className="font-display text-3xl lg:text-4xl tracking-wide mb-8">Fala com a gente.</h2>
        <a
          href="https://www.instagram.com/astroclub.world/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block border border-background/30 text-background px-10 py-4 text-xs tracking-[0.2em] uppercase hover:bg-background hover:text-foreground transition-all"
        >
          Instagram
        </a>
      </div>
    </div>
  );
}
