import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Aguardando pagamento",
  CONFIRMED: "Pagamento confirmado — preparando pedido",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Email inválido" }, { status: 400 });

  const orders = await prisma.order.findMany({
    where: { customerEmail: parsed.data.email },
    include: { items: { select: { name: true, quantity: true, size: true, color: true, price: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json(
    orders.map((o) => ({
      id: o.id,
      shortId: o.id.slice(-8).toUpperCase(),
      status: o.status,
      statusLabel: STATUS_LABEL[o.status] ?? o.status,
      paymentStatus: o.paymentStatus,
      total: Number(o.total),
      createdAt: o.createdAt,
      trackingCode: o.trackingCode ?? null,
      items: o.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
        price: Number(i.price),
      })),
    }))
  );
}
