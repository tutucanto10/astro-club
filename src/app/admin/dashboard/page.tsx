import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";

async function getDashboardStats() {
  const [totalOrders, totalProducts, totalUsers, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "PAID" },
    }),
  ]);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true, items: true },
  });

  return { totalOrders, totalProducts, totalUsers, revenue, recentOrders };
}

export default async function AdminDashboard() {
  const { totalOrders, totalProducts, totalUsers, revenue, recentOrders } =
    await getDashboardStats();

  const stats = [
    {
      label: "Receita Total",
      value: formatPrice(parseFloat(revenue._sum.total?.toString() || "0")),
      icon: TrendingUp,
    },
    { label: "Pedidos", value: totalOrders.toString(), icon: ShoppingCart },
    { label: "Produtos", value: totalProducts.toString(), icon: Package },
    { label: "Clientes", value: totalUsers.toString(), icon: Users },
  ];

  const statusLabels: Record<string, string> = {
    PENDING: "Pendente",
    CONFIRMED: "Confirmado",
    PROCESSING: "Em processo",
    SHIPPED: "Enviado",
    DELIVERED: "Entregue",
    CANCELLED: "Cancelado",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-wide">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visão geral da sua loja
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-background border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs tracking-[0.1em] uppercase text-muted-foreground">
                {stat.label}
              </p>
              <stat.icon size={16} className="text-muted-foreground" />
            </div>
            <p className="font-display text-2xl tracking-wide">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-background border border-border">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-medium text-sm tracking-wide">Pedidos Recentes</h2>
          <a
            href="/admin/orders"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            Ver todos
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs tracking-[0.1em] uppercase text-muted-foreground font-medium">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs tracking-[0.1em] uppercase text-muted-foreground font-medium">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs tracking-[0.1em] uppercase text-muted-foreground font-medium">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs tracking-[0.1em] uppercase text-muted-foreground font-medium">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                    #{order.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">{order.user?.name || "—"}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs tracking-wide px-2 py-1 bg-secondary">
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {formatPrice(parseFloat(order.total.toString()))}
                  </td>
                </tr>
              ))}

              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground text-sm">
                    Nenhum pedido ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
