import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — ASTRO Club",
  description: "Dúvidas sobre entrega, pagamento, trocas e tamanhos. Encontre as respostas aqui.",
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
