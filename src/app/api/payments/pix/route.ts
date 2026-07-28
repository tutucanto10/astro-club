import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderReceivedEmail, sendNewOrderAlert } from "@/lib/notifications";
import { z } from "zod";

const PIX_KEY = "65.934.661/0001-30";

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

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { pixCode: PIX_KEY },
      include: { items: true },
    });

    const itemsMapped = order.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      size: i.size,
      color: i.color,
      price: Number(i.price),
    }));

    sendOrderReceivedEmail({
      id: orderId,
      customerName: name,
      customerEmail: email,
      total: amount,
      pixKey: PIX_KEY,
      items: itemsMapped,
    }).catch(console.error);

    sendNewOrderAlert({
      id: orderId,
      customerName: name,
      customerEmail: email,
      customerPhone: order.customerPhone,
      street: order.street,
      number: order.number,
      complement: order.complement,
      district: order.district,
      city: order.city,
      state: order.state,
      zipCode: order.zipCode,
      total: amount,
      items: itemsMapped,
    }).catch(console.error);

    return NextResponse.json({
      pixCode: PIX_KEY,
      amount,
      manual: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    console.error("[PIX]", error);
    return NextResponse.json({ error: "Erro ao gerar PIX" }, { status: 500 });
  }
}
