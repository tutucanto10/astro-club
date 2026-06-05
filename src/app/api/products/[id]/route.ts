import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true, category: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { variants, images, ...rest } = body;

    const updateData: any = {
      ...rest,
      price: parseFloat(rest.price),
      comparePrice: rest.comparePrice ? parseFloat(rest.comparePrice) : null,
      images: images || [],
    };

    if (rest.name) {
      const newSlug = slugify(rest.name);
      const existing = await prisma.product.findFirst({
        where: { slug: newSlug, id: { not: id } },
      });
      updateData.slug = existing ? `${newSlug}-${Date.now()}` : newSlug;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    if (variants) {
      const newVariantIds = variants
        .filter((v: any) => v.id)
        .map((v: any) => v.id);

      await prisma.productVariant.deleteMany({
        where: { productId: id, id: { notIn: newVariantIds } },
      });

      for (const variant of variants) {
        if (variant.id) {
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: {
              size: variant.size || null,
              color: variant.color || null,
              stock: parseInt(variant.stock),
              sku: variant.sku || null,
            },
          });
        } else {
          await prisma.productVariant.create({
            data: {
              productId: id,
              size: variant.size || null,
              color: variant.color || null,
              stock: parseInt(variant.stock),
              sku: variant.sku || null,
            },
          });
        }
      }
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.product.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ success: true });
}
