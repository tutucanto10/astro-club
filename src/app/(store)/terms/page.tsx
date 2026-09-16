import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso — ASTRO Club",
  description: "Termos e condições de uso da loja ASTRO Club.",
};

export default function TermsPage() {
  return (
    <div className="pt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">Legal</p>
        <h1 className="font-display text-5xl lg:text-7xl tracking-wide leading-none max-w-3xl">
          Termos de Uso
        </h1>
      </div>

      <div className="border-t border-border" />

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16 lg:py-24 space-y-14">

        <section className="space-y-4">
          <h2 className="font-display text-2xl tracking-wide">Sobre a loja</h2>
          <p className="text-muted-foreground leading-relaxed">
            A ASTRO Club é uma marca brasileira de streetwear operada por Artur Canto e Gabriel Barros.
            Ao realizar uma compra em astroclub.world, você concorda com os termos descritos nesta página.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl tracking-wide">Pedidos e Pagamento</h2>
          <p className="text-muted-foreground leading-relaxed">
            Os pedidos são confirmados apenas após a aprovação do pagamento. O pagamento é processado
            pelo Mercado Pago, que aceita PIX, cartão de crédito e boleto bancário. A ASTRO Club não
            tem acesso aos dados do seu cartão.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Os preços exibidos no site são em Reais (BRL) e incluem os impostos aplicáveis.
            O frete é calculado no checkout e não está incluso no preço dos produtos.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl tracking-wide">Disponibilidade de Estoque</h2>
          <p className="text-muted-foreground leading-relaxed">
            Todos os produtos estão sujeitos à disponibilidade de estoque. Em caso de indisponibilidade
            após a confirmação do pedido, entraremos em contato para oferecer alternativas ou realizar
            o estorno integral.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl tracking-wide">Propriedade Intelectual</h2>
          <p className="text-muted-foreground leading-relaxed">
            Todo o conteúdo do site — incluindo marca, logotipo, imagens e design — é propriedade
            da ASTRO Club e protegido por lei. É proibida a reprodução sem autorização prévia.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl tracking-wide">Limitação de Responsabilidade</h2>
          <p className="text-muted-foreground leading-relaxed">
            A ASTRO Club não se responsabiliza por atrasos nos Correios após o despacho do pedido,
            por erros de endereço informados pelo cliente, ou por danos causados por uso indevido
            dos produtos.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl tracking-wide">Foro</h2>
          <p className="text-muted-foreground leading-relaxed">
            Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer controvérsias
            decorrentes destes termos, com renúncia a qualquer outro, por mais privilegiado que seja.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl tracking-wide">Contato</h2>
          <p className="text-muted-foreground leading-relaxed">
            Dúvidas sobre estes termos podem ser enviadas para{" "}
            <a href="mailto:astrosuporte5@gmail.com" className="underline underline-offset-4">
              astrosuporte5@gmail.com
            </a>.
          </p>
        </section>

        <p className="text-xs text-muted-foreground">Última atualização: setembro de 2026.</p>

      </div>
    </div>
  );
}
