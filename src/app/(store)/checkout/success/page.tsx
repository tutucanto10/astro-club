import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 bg-foreground rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="font-display text-4xl tracking-wide mb-4">Pedido confirmado!</h1>
        <p className="text-muted-foreground mb-8">
          Pagamento aprovado. Você receberá um email com os detalhes em breve.
        </p>
        <Link href="/" className="text-sm underline underline-offset-4">
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}
