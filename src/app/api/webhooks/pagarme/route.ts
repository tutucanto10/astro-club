import { NextResponse } from "next/server";

// Webhook legado — substituído por /api/webhooks/inter
export async function POST() {
  return NextResponse.json({ received: true });
}
