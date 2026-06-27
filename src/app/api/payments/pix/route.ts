import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPixCharge, getPixQrCode } from "@/lib/inter";
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

    // txid: 26-35 chars alphanumeric, use orderId stripped
    const txid = orderId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 35).padStart(26, "0");

    const charge = await createPixCharge({ txid, amount, name, email });
    const locId = charge.loc?.id;

    if (!locId) {
      throw new Error("Inter não retornou loc.id");
    }

    const qrcode = await getPixQrCode(locId);

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: txid,
        pixCode: qrcode.qrcode,
        pixQrCodeBase64: qrcode.imagemQrcode,
      },
    });

    return NextResponse.json({
      pixCode: qrcode.qrcode,
      qrCodeBase64: qrcode.imagemQrcode,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Erro ao gerar PIX" }, { status: 500 });
  }
}
