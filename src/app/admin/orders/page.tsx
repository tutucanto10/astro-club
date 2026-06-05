import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  PROCESSING: "Em processo",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PROCESSING: "bg-purple-50 text-purple-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
  REFUNDED: "bg-gray-50 text-gray-700",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-wide">Pedidos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {orders.length} pedido{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Pedido", "Cliente", "Data", "Items", "Status", "Pagamento", "Total"].map(
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
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
              >
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                  #{order.id.slice(-6).toUpperCase()}
                </td>
                <td className="px-6 py-4">{order.user?.name || "—"}</td>
                <td className="px-6 py-4 text-muted-foreground">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs px-2 py-1 ${statusColors[order.status] || "bg-secondary"}`}
                  >
                    {statusLabels[order.status] || order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs px-2 py-1 ${
                      order.paymentStatus === "PAID"
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {order.paymentStatus === "PAID" ? "Pago" : "Pendente"}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">
                  {formatPrice(parseFloat(order.total.toString()))}
                </td>
              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-muted-foreground text-sm"
                >
                  Nenhum pedido ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
