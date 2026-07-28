import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  email: z.string().email(),
  name: z.string(),
});

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://astroclub.world";

export async function POST(request: Request) {
  try {
    const { orderId, amount, email, name } = schema.parse(await request.json());

    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: [
          {
            id: orderId,
            title: "Pedido ASTRO",
            quantity: 1,
            unit_price: Math.round(amount * 100) / 100,
            currency_id: "BRL",
          },
        ],
        payer: { name, email },
        external_reference: orderId,
        back_urls: {
          success: `${BASE_URL}/checkout/success`,
          failure: `${BASE_URL}/checkout`,
          pending: `${BASE_URL}/checkout/success`,
        },
        auto_return: "approved",
        statement_descriptor: "ASTRO CLUB",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[Preference MP]", data);
      return NextResponse.json({ error: data.message ?? "Erro Mercado Pago" }, { status: 502 });
    }

    return NextResponse.json({ initPoint: data.init_point });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    console.error("[Preference]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
