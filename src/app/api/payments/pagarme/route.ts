import { NextResponse } from "next/server";

// Rota legada — substituída por /api/payments/pix
export async function POST() {
  return NextResponse.json({ error: "Use /api/payments/pix" }, { status: 410 });
}
