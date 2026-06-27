import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CAMISA_CORES = [
  "Marrom / Azul Claro",
  "Azul Escuro / Amarelo",
  "Grená / Dourado",
  "Verde / Bege",
  "Bege / Verde",
  "Branco / Vermelho",
  "Preto / Vermelho",
];

const CAMISA_TAMANHOS = ["P", "M", "G", "GG"];

const CINTO_CORES = [
  "Preto / Fivela Vermelha",
  "Preto / Fivela Prata",
  "Rosa / Fivela Preta",
];

async function main() {
  console.log("🌱 Seeding...");

  const camisas = await prisma.category.upsert({
    where: { slug: "camisas" },
    update: {},
    create: { name: "Camisas", slug: "camisas", description: "Camisas oversized premium" },
  });

  const cintos = await prisma.category.upsert({
    where: { slug: "cintos" },
    update: {},
    create: { name: "Cintos", slug: "cintos", description: "Cintos personalizados" },
  });

  // ─── Camisa Astro Basic ───────────────────────────────────────────────
  // 7 cores × 4 tamanhos = 28 variantes
  const camisaExisting = await prisma.product.findUnique({ where: { slug: "camisa-astro-basic" } });
  if (!camisaExisting) {
    const camisaVariants = CAMISA_CORES.flatMap((color) =>
      CAMISA_TAMANHOS.map((size) => ({ color, size, stock: 10 }))
    );

    await prisma.product.create({
      data: {
        name: "Camisa Astro Basic",
        slug: "camisa-astro-basic",
        description: "Camisa oversized da ASTRO. Corte amplo, tecido premium 100% algodão. Logo ASTRO bordado no peito em cor contrastante. Disponível em 7 combinações exclusivas.",
        price: 99.90,
        categoryId: camisas.id,
        featured: true,
        active: true,
        images: [
          "https://i.ibb.co/1Gxtw530/IMG-1732.jpg",
          "https://i.ibb.co/MyYbKXvG/IMG-1786.jpg",
        ],
        variants: { create: camisaVariants },
      },
    });
    console.log("✅ Camisa Astro Basic — 28 variantes");
  }

  // ─── Cinto Astro ─────────────────────────────────────────────────────
  // 3 variantes
  const cintoExisting = await prisma.product.findUnique({ where: { slug: "cinto-astro" } });
  if (!cintoExisting) {
    const cintoVariants = CINTO_CORES.map((color) => ({ color, size: "Único", stock: 10 }));

    await prisma.product.create({
      data: {
        name: "Cinto Astro",
        slug: "cinto-astro",
        description: "Cinto com fivela metálica personalizada ASTRO. Acabamento premium. Disponível em 3 combinações.",
        price: 49.90,
        categoryId: cintos.id,
        featured: true,
        active: true,
        images: [
          "https://i.ibb.co/tTyqT21H/IMG-1689.jpg",
        ],
        variants: { create: cintoVariants },
      },
    });
    console.log("✅ Cinto Astro — 3 variantes");
  }

  console.log("🎉 Seed concluído!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
