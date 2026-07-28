import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mpPayment } from "@/lib/mercadopago";
import { sendNewOrderAlert } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.type !== "payment" || !body.data?.id) {
      return NextResponse.json({ ok: true });
    }

    const payment = await mpPayment.get({ id: String(body.data.id) });

    if (payment.status === "approved" && payment.external_reference) {
      const order = await prisma.order.update({
        where: { id: payment.external_reference },
        data: { paymentStatus: "PAID", status: "CONFIRMED" },
        include: { items: true },
      });

      sendNewOrderAlert({
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        street: order.street,
        number: order.number,
        complement: order.complement,
        district: order.district,
        city: order.city,
        state: order.state,
        zipCode: order.zipCode,
        total: Number(order.total),
        paymentConfirmed: true,
        paymentMethod: "CARD",
        items: order.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
          price: Number(i.price),
        })),
      }).catch(console.error);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Webhook MP]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
