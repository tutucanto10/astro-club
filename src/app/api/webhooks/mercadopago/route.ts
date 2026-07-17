import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mpPayment } from "@/lib/mercadopago";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // MP envia type=payment e data.id com o ID do pagamento
    if (body.type !== "payment" || !body.data?.id) {
      return NextResponse.json({ ok: true });
    }

    const payment = await mpPayment.get({ id: String(body.data.id) });

    if (payment.status === "approved" && payment.external_reference) {
      await prisma.order.update({
        where: { id: payment.external_reference },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Webhook MP]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
