import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");

  const where: any = { active: true };
  if (category) where.category = { slug: category };
  if (featured === "true") where.featured = true;

  const products = await prisma.product.findMany({
    where,
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}
