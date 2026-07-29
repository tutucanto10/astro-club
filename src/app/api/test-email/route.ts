import { NextResponse } from "next/server";
import { sendNewOrderAlert } from "@/lib/notifications";

export async function GET() {
  try {
    await sendNewOrderAlert({
      id: "test-0000-0000-0000-teste123",
      customerName: "Cliente Teste",
      customerEmail: "teste@exemplo.com",
      customerPhone: "(21) 99999-9999",
      street: "Rua de Teste",
      number: "123",
      complement: "Apto 1",
      district: "Centro",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "20040-020",
      total: 99.90,
      paymentConfirmed: false,
      paymentMethod: "PIX",
      items: [
        { name: "Camisa Astro Basic", quantity: 1, size: "M", color: "azul e amarelo", price: 99.90 },
      ],
    });

    return NextResponse.json({ ok: true, message: "Email enviado para astrosuporte5@gmail.com" });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
