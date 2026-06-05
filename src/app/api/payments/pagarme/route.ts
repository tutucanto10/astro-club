import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPagarmeOrder, extractPaymentData } from "@/lib/pagarme";
import { z } from "zod";

const schema = z.object({
  orderId: z.string(),
  paymentMethod: z.enum(["PIX", "CREDIT_CARD", "BOLETO"]),
  card: z
    .object({
      number: z.string(),
      holderName: z.string(),
      expiryMonth: z.string(),
      expiryYear: z.string(),
      cvv: z.string(),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, paymentMethod, card } = schema.parse(body);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    const amountInCents = Math.round(Number(order.total) * 100);

    const pagarmeMethod =
      paymentMethod === "CREDIT_CARD"
        ? "credit_card"
        : paymentMethod === "BOLETO"
        ? "boleto"
        : "pix";

    const pagarmeOrder = await createPagarmeOrder({
      orderId,
      customer: {
        name: order.user.name ?? "Cliente",
        email: order.user.email ?? "",
      },
      items: order.items.map((item) => ({
        amount: Math.round(Number(item.price) * 100),
        description: item.name,
        quantity: item.quantity,
        code: item.productId,
      })),
      amount: amountInCents,
      paymentMethod: pagarmeMethod,
      card,
    });

    const paymentData = extractPaymentData(pagarmeOrder);

    await prisma.order.update({
      where: { id: orderId },
      data: {
        pagarmeOrderId: paymentData.pagarmeOrderId,
        pixCode: paymentData.pixCode,
        pixQrCodeUrl: paymentData.pixQrCodeUrl,
        boletoUrl: paymentData.boletoUrl,
        boletoBarcode: paymentData.boletoBarcode,
        ...(paymentData.status === "paid" && {
          paymentStatus: "PAID",
          status: "CONFIRMED",
        }),
      },
    });

    return NextResponse.json({
      pixCode: paymentData.pixCode,
      pixQrCodeUrl: paymentData.pixQrCodeUrl,
      boletoUrl: paymentData.boletoUrl,
      boletoBarcode: paymentData.boletoBarcode,
      paid: paymentData.status === "paid",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    console.error("Pagar.me payment error:", error);
    return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 });
  }
}
