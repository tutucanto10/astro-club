import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmedEmail } from "@/lib/notifications";

function verifySignature(body: string, signature: string | null): boolean {
  const secret = process.env.PAGARME_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  return signature === expected || signature === `sha256=${expected}`;
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature =
    request.headers.get("x-pagarme-signature") ??
    request.headers.get("x-hub-signature-256") ??
    request.headers.get("x-hub-signature");

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const type: string = payload.type ?? "";

  if (type === "order.paid" || type === "charge.paid") {
    const data = payload.data;
    const orderId: string = data.code ?? data.order?.code;
    if (!orderId) return NextResponse.json({ received: true });

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "PAID", status: "CONFIRMED" },
      include: { items: true, user: true },
    });

    await sendOrderConfirmedEmail({
      id: order.id,
      customerName: order.user.name ?? "Cliente",
      customerEmail: order.user.email ?? "",
      items: order.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: Number(i.price),
      })),
      total: Number(order.total),
    }).catch(console.error);
  }

  if (type === "order.payment_failed" || type === "charge.refused") {
    const orderId: string = payload.data?.code ?? payload.data?.order?.code;
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "FAILED" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
