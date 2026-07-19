import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mpPayment } from "@/lib/mercadopago";
import { z } from "zod";

const schema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  name: z.string(),
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, name, email } = schema.parse(body);

    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || nameParts[0];

    const notificationUrl = process.env.NEXT_PUBLIC_URL
      ? `${process.env.NEXT_PUBLIC_URL}/api/webhooks/mercadopago`
      : undefined;

    const response = await mpPayment.create({
      body: {
        transaction_amount: Math.round(amount * 100) / 100,
        description: `Pedido ASTRO #${orderId.slice(-8).toUpperCase()}`,
        payment_method_id: "pix",
        payer: {
          email,
          first_name: firstName,
          last_name: lastName,
        },
        external_reference: orderId,
        ...(notificationUrl && { notification_url: notificationUrl }),
      },
      requestOptions: { idempotencyKey: orderId },
    });

    const pixCode = response.point_of_interaction?.transaction_data?.qr_code;
    const qrCodeBase64 = response.point_of_interaction?.transaction_data?.qr_code_base64;
    const paymentId = response.id?.toString();

    if (!pixCode) {
      console.error("[PIX] Resposta MP:", JSON.stringify(response, null, 2));
      throw new Error("Mercado Pago não retornou o código PIX");
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentId, pixCode, pixQrCodeBase64: qrCodeBase64 ?? null },
    });

    return NextResponse.json({ pixCode, qrCodeBase64 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    // Loga detalhes completos do erro do Mercado Pago
    console.error("[PIX] Erro:", error?.message);
    console.error("[PIX] Causa:", JSON.stringify(error?.cause ?? error, null, 2));
    return NextResponse.json(
      { error: "Erro ao gerar PIX", detail: error?.message },
      { status: 500 }
    );
  }
}
