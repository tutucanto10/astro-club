import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Cupom não encontrado" }, { status: 404 });
    }

    if (!coupon.active) {
      return NextResponse.json({ error: "Cupom inativo" }, { status: 400 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Cupom expirado" }, { status: 400 });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "Cupom esgotado" }, { status: 400 });
    }

    if (coupon.minOrder && subtotal < parseFloat(coupon.minOrder.toString())) {
      return NextResponse.json(
        {
          error: `Pedido mínimo de R$ ${parseFloat(coupon.minOrder.toString()).toFixed(2)}`,
        },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.type === "PERCENTAGE") {
      discount = (subtotal * parseFloat(coupon.value.toString())) / 100;
    } else {
      discount = parseFloat(coupon.value.toString());
    }

    return NextResponse.json({
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: Math.min(discount, subtotal),
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
