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
});

type CheckoutForm = z.infer<typeof checkoutSchema>;
type Step = "form" | "pix" | "success";

const COUPONS: Record<string, number> = {
  ASTROFEST: 0.10,
};

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const cartTotal = total();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [pixData, setPixData] = useState<{ code: string; qrCodeBase64?: string } | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  const discountAmount = appliedCoupon ? cartTotal * appliedCoupon.discount : 0;
  const finalTotal = cartTotal - discountAmount;

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const discount = COUPONS[code];
    if (discount) {
      setAppliedCoupon({ code, discount });
      setCouponError("");
    } else {
      setAppliedCoupon(null);
      setCouponError("Cupom inválido");
    }
  };

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutForm) => {
    setLoading(true);
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, paymentMethod: "PIX", items }),
      });
      if (!orderRes.ok) throw new Error("Erro ao criar pedido");
      const { orderId: oid } = await orderRes.json();
      setOrderId(oid);

      const paymentRes = await fetch("/api/payments/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: oid, amount: finalTotal, name: data.name, email: data.email }),
      });
      if (!paymentRes.ok) throw new Error("Erro ao gerar PIX");
      const payment = await paymentRes.json();

      clearCart();
      setPixData({ code: payment.pixCode, qrCodeBase64: payment.qrCodeBase64 });
      setStep("pix");
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

          {pixData.qrCodeBase64 && (
            <div className="border border-border p-4 inline-block mb-6">
              <Image
                src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                alt="QR Code PIX"
                width={200}
                height={200}
                unoptimized
              />
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
            Pagamento confirmado. Você receberá um email em breve.
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
                      <p className="text-[11px] text-muted-foreground mt-1">Você receberá atualizações do pedido neste email</p>
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
                      {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Rua / Avenida *</label>
                    <input {...register("street")} className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" placeholder="Nome da rua" />
                    {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street.message}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Número *</label>
                      <input {...register("number")} className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" placeholder="123" />
                      {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number.message}</p>}
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
                      {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Cidade *</label>
                      <input {...register("city")} className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background" placeholder="Sua cidade" />
                      {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
                    </div>
                  </div>
                </div>
              </section>

              {/* Pagamento */}
              <section>
                <h2 className="text-xs tracking-[0.2em] uppercase font-medium mb-5 pb-3 border-b border-border">
                  Forma de Pagamento
                </h2>
                <div className="border border-foreground bg-foreground/5 p-4">
                  <p className="text-sm font-medium mb-0.5">PIX</p>
                  <p className="text-xs text-muted-foreground">Aprovação imediata — QR Code gerado após confirmação</p>
                </div>
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
                {/* Cupom */}
                <div className="mb-4">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-foreground/5 border border-foreground/20 px-3 py-2">
                      <span className="text-xs font-medium tracking-wider">{appliedCoupon.code} — {appliedCoupon.discount * 100}% OFF</span>
                      <button
                        type="button"
                        onClick={() => { setAppliedCoupon(null); setCouponInput(""); }}
                        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                          placeholder="Cupom de desconto"
                          className="flex-1 border border-border px-3 py-2 text-xs uppercase tracking-wider focus:outline-none focus:border-foreground bg-background"
                        />
                        <button
                          type="button"
                          onClick={applyCoupon}
                          className="border border-border px-3 py-2 text-xs tracking-wider uppercase hover:bg-foreground hover:text-background transition-colors"
                        >
                          Aplicar
                        </button>
                      </div>
                      {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4 space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto ({appliedCoupon.code})</span>
                      <span>− {formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="text-muted-foreground">A calcular</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t border-border">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-foreground text-background py-4 text-xs tracking-[0.2em] uppercase font-medium hover:opacity-90 transition-opacity disabled:opacity-50 btn-press"
                >
                  {loading ? "Processando..." : "Gerar PIX"}
                </button>
                <p className="text-[11px] text-muted-foreground text-center mt-3">
                  Seus dados estão seguros e protegidos
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
