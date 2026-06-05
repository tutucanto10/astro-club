import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendOrderShippedEmail } from "@/lib/notifications";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, address: true, user: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  if (session.user.role !== "ADMIN" && order.userId !== session.user.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { status, paymentStatus, trackingCode } = await request.json();

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
    },
    include: { user: true },
  });

  if (status === "SHIPPED") {
    sendOrderShippedEmail({
      id: order.id,
      customerName: order.user.name ?? "Cliente",
      customerEmail: order.user.email ?? "",
      trackingCode,
    }).catch(console.error);
  }

  return NextResponse.json(order);
}
