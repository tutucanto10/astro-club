"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const checkoutSchema = z.object({
  name: z.string().min(3, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  zipCode: z.string().min(8, "CEP inválido"),
  street: z.string().min(3, "Endereço obrigatório"),
  number: z.string().min(1, "Número obrigatório"),
  complement: z.string().optional(),
  district: z.string().min(2, "Bairro obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().min(2, "Estado obrigatório"),
  paymentMethod: z.enum(["PIX", "CREDIT_CARD", "BOLETO"]),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;
type Step = "form" | "pix" | "boleto" | "success";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const cartTotal = total();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [pixData, setPixData] = useState<{ code: string; qrCodeUrl: string } | null>(null);
  const [boletoData, setBoletoData] = useState<{ url: string; barcode: string } | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [cardData, setCardData] = useState({
    number: "",
    holderName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "PIX" },
  });

  const paymentMethod = watch("paymentMethod");

  const onSubmit = async (data: CheckoutForm) => {
    setLoading(true);
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, items }),
      });
      if (!orderRes.ok) throw new Error("Erro ao criar pedido");
      const { orderId: oid } = await orderRes.json();
      setOrderId(oid);

      const paymentRes = await fetch("/api/payments/pagarme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: oid,
          paymentMethod: data.paymentMethod,
          ...(data.paymentMethod === "CREDIT_CARD" && { card: cardData }),
        }),
      });
      if (!paymentRes.ok) throw new Error("Erro ao processar pagamento");
      const payment = await paymentRes.json();

      clearCart();

      if (data.paymentMethod === "PIX") {
        setPixData({ code: payment.pixCode, qrCodeUrl: payment.pixQrCodeUrl });
        setStep("pix");
      } else if (data.paymentMethod === "BOLETO") {
        setBoletoData({ url: payment.boletoUrl, barcode: payment.boletoBarcode });
        setStep("boleto");
      } else {
        setStep("success");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao processar o pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "pix" && pixData) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">Pagamento via</p>
          <h1 className="font-display text-4xl tracking-wide mb-8">PIX</h1>
          {pixData.qrCodeUrl && (
            <div className="border border-border p-4 inline-block mb-6">
              <Image src={pixData.qrCodeUrl} alt="QR Code PIX" width={200} height={200} unoptimized />
            </div>
          )}
          <p className="text-sm text-muted-foreground mb-3">Ou copie o código abaixo:</p>
          <div className="border border-border p-3 text-xs break-all text-left mb-4 font-mono bg-secondary">
            {pixData.code}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(pixData.code)}
            className="w-full bg-foreground text-background py-3 text-xs tracking-[0.2em] uppercase font-medium hover:opacity-90 transition-opacity mb-4"
          >
            Copiar código PIX
          </button>
          <p className="text-xs text-muted-foreground">
            Você receberá um email quando o pagamento for confirmado. O código expira em 1 hora.
          </p>
          {orderId && (
            <p className="text-xs text-muted-foreground mt-3">
              Pedido #{orderId.slice(-8).toUpperCase()}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (step === "boleto" && boletoData) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">Pagamento via</p>
          <h1 className="font-display text-4xl tracking-wide mb-8">Boleto</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Pague em qualquer banco, lotérica ou pelo app do seu banco. Vencimento em 3 dias.
          </p>
          {boletoData.barcode && (
            <div className="border border-border p-3 text-xs break-all text-left mb-4 font-mono bg-secondary">
              {boletoData.barcode}
            </div>
          )}
          <a
            href={boletoData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-foreground text-background py-3 text-xs tracking-[0.2em] uppercase font-medium hover:opacity-90 transition-opacity mb-4 text-center"
          >
            Visualizar boleto
          </a>
          <p className="text-xs text-muted-foreground">
            Confirmação em até 3 dias úteis após o pagamento.
          </p>
          {orderId && (
            <p className="text-xs text-muted-foreground mt-3">
              Pedido #{orderId.slice(-8).toUpperCase()}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-foreground rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="font-display text-4xl tracking-wide mb-4">Pedido realizado!</h1>
          <p className="text-muted-foreground mb-8">
            Pagamento aprovado. Você receberá um email de confirmação em breve.
          </p>
          <Link href="/" className="text-sm underline underline-offset-4">Voltar para o início</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl tracking-wide mb-4">Carrinho vazio</h1>
          <Link href="/products" className="text-sm underline underline-offset-4">Explorar produtos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        <h1 className="font-display text-4xl lg:text-5xl tracking-wide mb-12">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3 space-y-8">

              {/* Dados pessoais */}
              <section>
                <h2 className="text-xs tracking-[0.2em] uppercase font-medium mb-5 pb-3 border-b border-border">
                  Dados Pessoais
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Nome completo *</label>
                    <input {...register("name")} className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" placeholder="Seu nome" />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Email *</label>
                      <input {...register("email")} type="email" className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" placeholder="seu@email.com" />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Telefone *</label>
                      <input {...register("phone")} className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" placeholder="(11) 99999-9999" />
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                    </div>
                  </div>
                </div>
              </section>

              {/* Endereço */}
              <section>
                <h2 className="text-xs tracking-[0.2em] uppercase font-medium mb-5 pb-3 border-b border-border">
                  Endereço de Entrega
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">CEP *</label>
                      <input {...register("zipCode")} className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" placeholder="00000-000" />
                      {errors.zipCode && <p className="text-xs text-red-500 mt-1">{errors.zipCode.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Estado *</label>
                      <input {...register("state")} className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" placeholder="SP" maxLength={2} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Rua / Avenida *</label>
                    <input {...register("street")} className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" placeholder="Nome da rua" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Número *</label>
                      <input {...register("number")} className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" placeholder="123" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Complemento</label>
                      <input {...register("complement")} className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" placeholder="Apto, Bloco..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Bairro *</label>
                      <input {...register("district")} className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" placeholder="Seu bairro" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Cidade *</label>
                      <input {...register("city")} className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" placeholder="Sua cidade" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Pagamento */}
              <section>
                <h2 className="text-xs tracking-[0.2em] uppercase font-medium mb-5 pb-3 border-b border-border">
                  Forma de Pagamento
                </h2>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { value: "PIX", label: "Pix", desc: "Aprovação imediata" },
                    { value: "CREDIT_CARD", label: "Cartão", desc: "Crédito ou débito" },
                    { value: "BOLETO", label: "Boleto", desc: "Vence em 3 dias" },
                  ].map((m) => (
                    <label
                      key={m.value}
                      className={`border p-4 cursor-pointer transition-colors ${
                        paymentMethod === m.value ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/50"
                      }`}
                    >
                      <input {...register("paymentMethod")} type="radio" value={m.value} className="sr-only" />
                      <p className="text-sm font-medium mb-0.5">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                    </label>
                  ))}
                </div>

                {paymentMethod === "CREDIT_CARD" && (
                  <div className="border border-border p-4 space-y-3">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Dados do Cartão</p>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Número</label>
                      <input value={cardData.number} onChange={(e) => setCardData((p) => ({ ...p, number: e.target.value }))} className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" placeholder="0000 0000 0000 0000" maxLength={19} />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Nome no cartão</label>
                      <input value={cardData.holderName} onChange={(e) => setCardData((p) => ({ ...p, holderName: e.target.value }))} className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" placeholder="Como está no cartão" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Mês</label>
                        <input value={cardData.expiryMonth} onChange={(e) => setCardData((p) => ({ ...p, expiryMonth: e.target.value }))} className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" placeholder="MM" maxLength={2} />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Ano</label>
                        <input value={cardData.expiryYear} onChange={(e) => setCardData((p) => ({ ...p, expiryYear: e.target.value }))} className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" placeholder="AA" maxLength={2} />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">CVV</label>
                        <input value={cardData.cvv} onChange={(e) => setCardData((p) => ({ ...p, cvv: e.target.value }))} className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" placeholder="000" maxLength={4} />
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Resumo */}
            <div className="lg:col-span-2">
              <div className="border border-border p-6 sticky top-24">
                <h2 className="text-xs tracking-[0.2em] uppercase font-medium mb-6">Resumo do Pedido</h2>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-20 bg-secondary flex-shrink-0">
                        {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-tight">{item.name}</p>
                        {item.size && <p className="text-xs text-muted-foreground mt-0.5">Tam: {item.size}</p>}
                        <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                        <p className="text-sm font-medium mt-1">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="text-muted-foreground">A calcular</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t border-border">
                    <span>Total</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-foreground text-background py-4 text-xs tracking-[0.2em] uppercase font-medium hover:opacity-90 transition-opacity disabled:opacity-50 btn-press">
                  {loading ? "Processando..." : "Confirmar Pedido"}
                </button>
                <p className="text-[11px] text-muted-foreground text-center mt-3">Seus dados estão seguros e protegidos</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
