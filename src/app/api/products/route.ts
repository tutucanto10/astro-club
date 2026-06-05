import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.string(),
  comparePrice: z.string().optional(),
  categoryId: z.string(),
  featured: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  variants: z.array(
    z.object({
      size: z.string().optional(),
      color: z.string().optional(),
      stock: z.string(),
      sku: z.string().optional(),
    })
  ),
});

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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = productSchema.parse(body);

    let slug = slugify(data.name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: parseFloat(data.price),
        comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
        categoryId: data.categoryId,
        featured: data.featured,
        images: data.images,
        variants: {
          create: data.variants.map((v) => ({
            size: v.size || null,
            color: v.color || null,
            stock: parseInt(v.stock),
            sku: v.sku || null,
          })),
        },
      },
      include: { variants: true, category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
