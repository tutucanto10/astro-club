import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CAMISA_CORES = ["azul e amarelo", "bege e verde", "preto e vermelho", "verde e bege"];
const CAMISA_TAMANHOS = ["P", "M", "G", "GG"];

const CINTO_CORES = ["preto", "rosa"];

async function main() {
  console.log("🌱 Seeding...");

  const camisas = await prisma.category.upsert({
    where: { slug: "camisas" },
    update: {},
    create: { name: "Camisas", slug: "camisas", description: "Camisas oversized" },
  });

  const cintos = await prisma.category.upsert({
    where: { slug: "cintos" },
    update: {},
    create: { name: "Cintos", slug: "cintos", description: "Cintos personalizados" },
  });

  // ─── Camisa Astro Basic ───────────────────────────────────────────────
  const camisa = await prisma.product.upsert({
    where: { slug: "camisa-astro-basic" },
    update: {
      images: ["/camisas basic/azul e amarelo/IMG_2773.jpeg"],
    },
    create: {
      name: "Camisa Astro Basic",
      slug: "camisa-astro-basic",
      description: "Camisa oversized da ASTRO. Corte amplo, tecido 100% algodão. Logo ASTRO bordado no peito em cor contrastante. Disponível em 4 cores exclusivas.",
      price: 99.90,
      categoryId: camisas.id,
      featured: true,
      active: true,
      images: ["/camisas basic/azul e amarelo/IMG_2773.jpeg"],
    },
  });

  await prisma.productVariant.deleteMany({ where: { productId: camisa.id } });
  await prisma.productVariant.createMany({
    data: CAMISA_CORES.flatMap((color) =>
      CAMISA_TAMANHOS.map((size) => ({ productId: camisa.id, color, size, stock: 10 }))
    ),
  });
  console.log("✅ Camisa Astro Basic");

  // ─── Cinto Astro ─────────────────────────────────────────────────────
  const cinto = await prisma.product.upsert({
    where: { slug: "cinto-astro" },
    update: {
      images: ["/cinto/preto/IMG_2883.jpeg"],
    },
    create: {
      name: "Cinto Astro",
      slug: "cinto-astro",
      description: "Cinto com fivela metálica personalizada ASTRO. Acabamento premium. Disponível em preto e rosa.",
      price: 49.90,
      categoryId: cintos.id,
      featured: true,
      active: true,
      images: ["/cinto/preto/IMG_2883.jpeg"],
    },
  });

  await prisma.productVariant.deleteMany({ where: { productId: cinto.id } });
  await prisma.productVariant.createMany({
    data: CINTO_CORES.map((color) => ({ productId: cinto.id, color, size: "Único", stock: 10 })),
  });
  console.log("✅ Cinto Astro");

  console.log("🎉 Seed concluído!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
