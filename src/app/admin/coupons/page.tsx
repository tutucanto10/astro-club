"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: string;
  value: string;
  minOrder: string | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: "",
    description: "",
    type: "PERCENTAGE",
    value: "",
    minOrder: "",
    maxUses: "",
    active: true,
  });

  useEffect(() => {
    fetch("/api/coupons")
      .then((r) => r.json())
      .then(setCoupons);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const newCoupon = await res.json();
      setCoupons((prev) => [newCoupon, ...prev]);
      setShowForm(false);
      setForm({
        code: "",
        description: "",
        type: "PERCENTAGE",
        value: "",
        minOrder: "",
        maxUses: "",
        active: true,
      });
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este cupom?")) return;
    await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl tracking-wide">Cupons</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {coupons.length} cupom{coupons.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs tracking-[0.15em] uppercase font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          Novo cupom
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-background border border-border p-6 mb-8 grid grid-cols-2 gap-4"
        >
          <div className="col-span-2">
            <h2 className="text-xs tracking-[0.15em] uppercase font-medium mb-4 pb-2 border-b border-border">
              Criar cupom
            </h2>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">
              Código *
            </label>
            <input
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
              className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground bg-background font-mono"
              placeholder="ASTRO20"
              required
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">
              Tipo *
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground bg-background"
            >
              <option value="PERCENTAGE">Percentual (%)</option>
              <option value="FIXED">Valor fixo (R$)</option>
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">
              Valor *
            </label>
            <input
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              type="number"
              step="0.01"
              className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground bg-background"
              placeholder={form.type === "PERCENTAGE" ? "10" : "50.00"}
              required
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">
              Pedido mínimo (R$)
            </label>
            <input
              value={form.minOrder}
              onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
              type="number"
              step="0.01"
              className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground bg-background"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">
              Descrição
            </label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground bg-background"
              placeholder="Desconto especial"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">
              Limite de usos
            </label>
            <input
              value={form.maxUses}
              onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
              type="number"
              className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground bg-background"
              placeholder="Ilimitado"
            />
          </div>

          <div className="col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-foreground text-background px-8 py-3 text-xs tracking-[0.15em] uppercase font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Criando..." : "Criar cupom"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-8 py-3 text-xs tracking-[0.15em] uppercase border border-border hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Código", "Tipo", "Valor", "Mín. pedido", "Usos", "Status", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs tracking-[0.1em] uppercase text-muted-foreground font-medium"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr
                key={coupon.id}
                className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
              >
                <td className="px-6 py-4 font-mono font-medium">{coupon.code}</td>
                <td className="px-6 py-4 text-muted-foreground">
                  {coupon.type === "PERCENTAGE" ? "Percentual" : "Valor fixo"}
                </td>
                <td className="px-6 py-4 font-medium">
                  {coupon.type === "PERCENTAGE"
                    ? `${coupon.value}%`
                    : new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(parseFloat(coupon.value))}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {coupon.minOrder
                    ? new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(parseFloat(coupon.minOrder))
                    : "—"}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {coupon.usedCount}
                  {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs px-2 py-1 ${
                      coupon.active
                        ? "bg-green-50 text-green-700"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {coupon.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {coupons.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-muted-foreground text-sm"
                >
                  Nenhum cupom criado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
