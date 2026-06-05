import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendOrderWhatsApp } from "@/lib/notifications";
import { z } from "zod";

const orderSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  zipCode: z.string(),
  street: z.string(),
  number: z.string(),
  complement: z.string().optional(),
  district: z.string(),
  city: z.string(),
  state: z.string(),
  paymentMethod: z.enum(["PIX", "CREDIT_CARD", "BOLETO"]),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      name: z.string(),
      image: z.string().optional(),
      size: z.string().optional(),
      quantity: z.number(),
      price: z.number(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = orderSchema.parse(body);
    const session = await getServerSession(authOptions);

    let userId: string;
    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      let user = await prisma.user.findUnique({ where: { email: data.email } });
      if (!user) {
        user = await prisma.user.create({
          data: { email: data.email, name: data.name },
        });
      }
      userId = user.id;
    }

    const address = await prisma.address.create({
      data: {
        userId,
        name: data.name,
        street: data.street,
        number: data.number,
        complement: data.complement,
        district: data.district,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        phone: data.phone,
      },
    });

    const subtotal = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        userId,
        addressId: address.id,
        paymentMethod: data.paymentMethod,
        subtotal,
        total: subtotal,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            image: item.image,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    for (const item of data.items) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    sendOrderWhatsApp({
      id: order.id,
      customerName: data.name,
      total: subtotal,
      paymentMethod: data.paymentMethod,
      itemCount: data.items.reduce((s, i) => s + i.quantity, 0),
    }).catch(console.error);

    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    include: { user: true, items: true, address: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
