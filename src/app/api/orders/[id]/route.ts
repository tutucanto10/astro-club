import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderShippedEmail } from "@/lib/notifications";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status, trackingCode } = await request.json();

  const order = await prisma.order.update({
    where: { id },
    data: { ...(status && { status }) },
  });

  if (status === "SHIPPED") {
    sendOrderShippedEmail({
      id: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      trackingCode,
    }).catch(console.error);
  }

  return NextResponse.json(order);
}
