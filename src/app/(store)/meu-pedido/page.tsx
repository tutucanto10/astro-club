"use client";

import { useState } from "react";
import { Loader2, PackageSearch } from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  size: string | null;
  color: string | null;
  price: number;
}

interface Order {
  id: string;
  shortId: string;
  status: string;
  statusLabel: string;
  total: number;
  createdAt: string;
  trackingCode: string | null;
  items: OrderItem[];
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-yellow-600 bg-yellow-50 border-yellow-200",
  CONFIRMED: "text-blue-700 bg-blue-50 border-blue-200",
  SHIPPED: "text-purple-700 bg-purple-50 border-purple-200",
  DELIVERED: "text-green-700 bg-green-50 border-green-200",
  CANCELLED: "text-red-700 bg-red-50 border-red-200",
};

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function MeuPedidoPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrders(null);

    const res = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Email inválido. Tente novamente.");
      return;
    }

    const data: Order[] = await res.json();
    if (data.length === 0) {
      setError("Nenhum pedido encontrado para esse e-mail.");
    } else {
      setOrders(data);
    }
  }

  return (
    <div className="pt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
          Acompanhar
        </p>
        <h1 className="font-display text-5xl lg:text-7xl tracking-wide leading-none max-w-3xl mb-16">
          Meu Pedido
        </h1>

        <div className="max-w-md">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs tracking-[0.15em] uppercase text-muted-foreground block mb-2">
                E-mail usado na compra
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="border border-foreground bg-foreground text-background px-8 py-3 text-xs tracking-[0.2em] uppercase hover:bg-background hover:text-foreground transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <PackageSearch size={14} />}
              {loading ? "Buscando..." : "Buscar pedidos"}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}
        </div>

        {orders && (
          <div className="mt-16 space-y-8 max-w-2xl">
            {orders.map((order) => (
              <div key={order.id} className="border border-border">
                <div className="flex items-start justify-between p-6 border-b border-border flex-wrap gap-4">
                  <div>
                    <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-1">
                      Pedido #{order.shortId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-3 py-1 border tracking-wide ${
                      STATUS_COLOR[order.status] ?? "text-muted-foreground bg-secondary border-border"
                    }`}
                  >
                    {order.statusLabel}
                  </span>
                </div>

                <div className="p-6 space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}× {item.name}
                        {item.color ? ` — ${item.color}` : ""}
                        {item.size && item.size !== "Único" ? ` / ${item.size}` : ""}
                      </span>
                      <span>{brl(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-border flex justify-between font-medium">
                    <span>Total</span>
                    <span>{brl(order.total)}</span>
                  </div>
                </div>

                {order.trackingCode && (
                  <div className="px-6 pb-6">
                    <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-1">
                      Código de rastreamento
                    </p>
                    <a
                      href={`https://www.correios.com.br/rastreamento/detalhe/${order.trackingCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm underline underline-offset-4"
                    >
                      {order.trackingCode}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
