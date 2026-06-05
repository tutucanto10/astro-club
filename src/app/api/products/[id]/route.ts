import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { variants: true, category: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { variants, images, ...rest } = body;

    // Update slug if name changed
    let updateData: any = {
      ...rest,
      price: parseFloat(rest.price),
      comparePrice: rest.comparePrice ? parseFloat(rest.comparePrice) : null,
      images: images || [],
    };

    if (rest.name) {
      const newSlug = slugify(rest.name);
      const existing = await prisma.product.findFirst({
        where: { slug: newSlug, id: { not: params.id } },
      });
      updateData.slug = existing ? `${newSlug}-${Date.now()}` : newSlug;
    }

    // Update product
    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
    });

    // Update variants
    if (variants) {
      // Delete old variants not in the new list
      const newVariantIds = variants
        .filter((v: any) => v.id)
        .map((v: any) => v.id);

      await prisma.productVariant.deleteMany({
        where: {
          productId: params.id,
          id: { notIn: newVariantIds },
        },
      });

      // Upsert each variant
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
              productId: params.id,
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
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await prisma.product.update({
    where: { id: params.id },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}
