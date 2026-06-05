import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "USER" },
    include: {
      orders: {
        select: { total: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-wide">Clientes</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {customers.length} cliente{customers.length !== 1 ? "s" : ""} cadastrados
        </p>
      </div>

      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Nome", "Email", "Cadastro", "Pedidos", "Total gasto"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs tracking-[0.1em] uppercase text-muted-foreground font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const totalSpent = customer.orders
                .filter((o) => o.status === "DELIVERED")
                .reduce((s, o) => s + parseFloat(o.total.toString()), 0);

              return (
                <tr
                  key={customer.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium">
                    {customer.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {customer.orders.length}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(totalSpent)}
                  </td>
                </tr>
              );
            })}

            {customers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-muted-foreground text-sm"
                >
                  Nenhum cliente cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
