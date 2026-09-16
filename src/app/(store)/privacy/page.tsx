import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidade — ASTRO Club",
  description: "Política de privacidade da ASTRO Club. Como coletamos, usamos e protegemos seus dados.",
};

export default function PrivacyPage() {
  return (
    <div className="pt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">Legal</p>
        <h1 className="font-display text-5xl lg:text-7xl tracking-wide leading-none max-w-3xl">
          Privacidade
        </h1>
      </div>

      <div className="border-t border-border" />

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16 lg:py-24 space-y-14">

        <section className="space-y-4">
          <h2 className="font-display text-2xl tracking-wide">Quais dados coletamos</h2>
          <p className="text-muted-foreground leading-relaxed">
            Coletamos apenas os dados necessários para processar e entregar seu pedido: nome completo,
            endereço de e-mail, telefone e endereço de entrega. Não armazenamos dados de cartão de crédito —
            o pagamento é processado integralmente pelo Mercado Pago.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl tracking-wide">Como usamos seus dados</h2>
          <p className="text-muted-foreground leading-relaxed">
            Seus dados são usados exclusivamente para:
          </p>
          <ul className="list-none space-y-2">
            {[
              "Processar e entregar seu pedido",
              "Enviar atualizações sobre o status da entrega",
              "Responder dúvidas e solicitações de suporte",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-muted-foreground">
                <span className="mt-1 w-1 h-1 rounded-full bg-foreground flex-shrink-0 block" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins comerciais.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl tracking-wide">Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            Utilizamos cookies essenciais para manter o carrinho de compras funcionando.
            Não utilizamos cookies de rastreamento ou publicidade.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl tracking-wide">Seus direitos (LGPD)</h2>
          <p className="text-muted-foreground leading-relaxed">
            De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito de
            acessar, corrigir ou solicitar a exclusão dos seus dados pessoais. Para exercer esses
            direitos, entre em contato pelo e-mail{" "}
            <a href="mailto:pedidos@astroclub.world" className="underline underline-offset-4">
              pedidos@astroclub.world
            </a>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl tracking-wide">Segurança</h2>
          <p className="text-muted-foreground leading-relaxed">
            Todos os dados são transmitidos com criptografia (HTTPS). As informações de pagamento
            são processadas diretamente pelo Mercado Pago, que possui certificação PCI DSS.
          </p>
        </section>

        <p className="text-xs text-muted-foreground">Última atualização: setembro de 2026.</p>

      </div>
    </div>
  );
}
