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

    const response = await mpPayment.create({
      body: {
        transaction_amount: amount,
        description: `Pedido ASTRO #${orderId.slice(-8).toUpperCase()}`,
        payment_method_id: "pix",
        payer: {
          email,
          first_name: firstName,
          last_name: lastName,
        },
        external_reference: orderId,
        notification_url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/mercadopago`,
      },
      requestOptions: { idempotencyKey: orderId },
    });

    const pixCode = response.point_of_interaction?.transaction_data?.qr_code;
    const qrCodeBase64 = response.point_of_interaction?.transaction_data?.qr_code_base64;
    const paymentId = response.id?.toString();

    if (!pixCode) {
      throw new Error("Mercado Pago não retornou o código PIX");
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId,
        pixCode,
        pixQrCodeBase64: qrCodeBase64 ?? null,
      },
    });

    return NextResponse.json({ pixCode, qrCodeBase64 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    console.error("[PIX]", error);
    return NextResponse.json({ error: "Erro ao gerar PIX" }, { status: 500 });
  }
}
