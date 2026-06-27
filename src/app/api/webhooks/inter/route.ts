import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmedEmail } from "@/lib/notifications";

// Inter PIX webhook — payload: { pix: [{ txid, valor, horario }] }
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const pixList: Array<{ txid: string }> = payload.pix ?? [];

    for (const { txid } of pixList) {
      if (!txid) continue;

      const order = await prisma.order.findFirst({
        where: { paymentId: txid },
        include: { items: true },
      });

      if (!order || order.paymentStatus === "PAID") continue;

      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "PAID", status: "CONFIRMED" },
      });

      sendOrderConfirmedEmail({
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: order.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: Number(i.price),
        })),
        total: Number(order.total),
      }).catch(console.error);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
