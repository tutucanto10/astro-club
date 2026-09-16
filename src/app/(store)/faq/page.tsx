"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Qual o prazo de entrega?",
    answer:
      "O prazo de entrega varia de acordo com a sua região. Em geral, os pedidos são despachados em até 3 dias úteis após a confirmação do pagamento. Após o envio, o prazo dos Correios é de 5 a 15 dias úteis para todo o Brasil.",
  },
  {
    question: "Quais são as formas de pagamento?",
    answer:
      "Aceitamos PIX, cartão de crédito e boleto bancário — tudo processado com segurança pelo Mercado Pago. No PIX o pagamento é confirmado na hora. No cartão, você pode parcelar.",
  },
  {
    question: "Como rastrear meu pedido?",
    answer:
      "Assim que seu pedido for despachado, você recebe um e-mail com o código de rastreamento dos Correios. Você pode acompanhar pelo site dos Correios (correios.com.br) ou nos chamar no Instagram @astroclub.world.",
  },
  {
    question: "Posso trocar ou devolver um produto?",
    answer:
      "Sim. Aceitamos trocas e devoluções em até 7 dias após o recebimento do produto, desde que ele esteja em perfeito estado, sem uso e com a etiqueta. Entre em contato conosco pelo Instagram ou pelo e-mail astrosuporte5@gmail.com para iniciar o processo.",
  },
  {
    question: "Como funciona o tamanho das camisas?",
    answer:
      "Nossas camisas têm corte oversized — elas são propositalmente largas. Se você tem dúvida entre dois tamanhos, recomendamos pegar o menor. Disponíveis nos tamanhos P, M, G e GG.",
  },
  {
    question: "Os produtos são feitos no Brasil?",
    answer:
      "Sim, todos os produtos ASTRO são produzidos no Brasil. As camisas são em algodão 100% nacional e os cintos são fabricados com materiais selecionados aqui mesmo.",
  },
  {
    question: "Como entrar em contato com a ASTRO?",
    answer:
      "Você pode nos chamar pelo Instagram @astroclub.world ou enviar um e-mail para astrosuporte5@gmail.com. Respondemos em até 24 horas nos dias úteis.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-6 text-left gap-4 hover:text-muted-foreground transition-colors"
      >
        <span className="font-medium tracking-wide">{question}</span>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-6 text-muted-foreground leading-relaxed text-sm pr-8">
          {answer}
        </p>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
          Dúvidas frequentes
        </p>
        <h1 className="font-display text-5xl lg:text-7xl tracking-wide leading-none max-w-3xl">
          FAQ
        </h1>
      </div>

      <div className="border-t border-border" />

      {/* FAQ list */}
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        {faqs.map((faq) => (
          <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
        ))}
      </div>

      {/* CTA */}
      <div className="bg-foreground text-background px-10 lg:px-20 py-16 lg:py-20 text-center">
        <p className="text-background/40 text-xs tracking-[0.3em] uppercase mb-4">Ainda com dúvidas?</p>
        <h2 className="font-display text-4xl lg:text-5xl tracking-wide mb-8">
          Fala com a gente.
        </h2>
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
