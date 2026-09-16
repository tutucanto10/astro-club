import { NextResponse } from "next/server";
import { sendNewOrderAlert, sendOrderPaidEmail } from "@/lib/notifications";

const FAKE_ORDER = {
  id: "test-0000-0000-0000-teste123",
  customerName: "Cliente Teste",
  customerEmail: "astrosuporte5@gmail.com",
  customerPhone: "(21) 99999-9999",
  street: "Rua de Teste",
  number: "123",
  complement: "Apto 1",
  district: "Centro",
  city: "Rio de Janeiro",
  state: "RJ",
  zipCode: "20040-020",
  total: 189.80,
  items: [
    { name: "Camisa Astro Basic", quantity: 1, size: "M", color: "azul e amarelo", price: 99.90 },
    { name: "Cinto Astro", quantity: 1, size: "90cm", color: "preto", price: 89.90 },
  ],
};

export async function GET() {
  try {
    await Promise.all([
      sendOrderPaidEmail(FAKE_ORDER),
      sendNewOrderAlert({ ...FAKE_ORDER, paymentConfirmed: true, paymentMethod: "CARD" }),
    ]);

    return NextResponse.json({ ok: true, message: "2 emails enviados: cliente + loja (pagamento confirmado)" });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
