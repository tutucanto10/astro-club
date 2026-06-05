import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@astrobrand.com" },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || "admin@astrobrand.com",
      name: "Admin Astro",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin created:", admin.email);

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "camisas" },
      update: {},
      create: { name: "Camisas", slug: "camisas", description: "Camisas oversized premium" },
    }),
    prisma.category.upsert({
      where: { slug: "bones" },
      update: {},
      create: { name: "Bonés", slug: "bones", description: "Bonés streetwear" },
    }),
    prisma.category.upsert({
      where: { slug: "cintos" },
      update: {},
      create: { name: "Cintos", slug: "cintos", description: "Cintos personalizados" },
    }),
    prisma.category.upsert({
      where: { slug: "aneis" },
      update: {},
      create: { name: "Anéis", slug: "aneis", description: "Anéis urbanos" },
    }),
  ]);
  console.log("✅ Categories created:", categories.map((c) => c.name).join(", "));

  // Sample products
  const products = [
    {
      name: "Camisa Oversized Astro Essential",
      slug: "camisa-oversized-astro-essential",
      description: "A camisa essencial da ASTRO. Corte oversized com caimento perfeito, 100% algodão premium. Logo ASTRO bordado no peito.",
      price: 189.90,
      categoryId: categories[0].id,
      featured: true,
      images: [],
      variants: [
        { size: "P", stock: 10 },
        { size: "M", stock: 15 },
        { size: "G", stock: 12 },
        { size: "GG", stock: 8 },
      ],
    },
    {
      name: "Camisa Astro Vintage Wash",
      slug: "camisa-astro-vintage-wash",
      description: "Camisa oversized com lavagem especial para efeito vintage. Acabamento premium e detalhe ASTRO na manga.",
      price: 219.90,
      comparePrice: 259.90,
      categoryId: categories[0].id,
      featured: true,
      images: [],
      variants: [
        { size: "P", stock: 5 },
        { size: "M", stock: 8 },
        { size: "G", stock: 10 },
        { size: "GG", stock: 3 },
      ],
    },
    {
      name: "Boné Astro Signature",
      slug: "bone-astro-signature",
      description: "Boné 6 painéis com logo ASTRO bordado. Aba reta, ajuste regulável. Material premium resistente.",
      price: 129.90,
      categoryId: categories[1].id,
      featured: true,
      images: [],
      variants: [
        { size: "Único", stock: 25 },
      ],
    },
    {
      name: "Cinto Astro Leather",
      slug: "cinto-astro-leather",
      description: "Cinto de couro legítimo com fivela metálica personalizada. Detalhe ASTRO gravado. Acabamento premium.",
      price: 149.90,
      categoryId: categories[2].id,
      featured: true,
      images: [],
      variants: [
        { size: "P/M", stock: 10 },
        { size: "G/GG", stock: 10 },
      ],
    },
    {
      name: "Anel Astro Star",
      slug: "anel-astro-star",
      description: "Anel em prata 925 com símbolo ASTRO. Acabamento polido e fosco. Joia urbana exclusiva.",
      price: 89.90,
      categoryId: categories[3].id,
      featured: false,
      images: [],
      variants: [
        { size: "16", stock: 5 },
        { size: "17", stock: 8 },
        { size: "18", stock: 6 },
        { size: "19", stock: 4 },
        { size: "20", stock: 3 },
      ],
    },
  ];

  for (const productData of products) {
    const { variants, ...rest } = productData;
    const existing = await prisma.product.findUnique({ where: { slug: rest.slug } });
    if (!existing) {
      await prisma.product.create({
        data: {
          ...rest,
          active: true,
          variants: { create: variants },
        },
      });
      console.log(`✅ Product created: ${rest.name}`);
    }
  }

  // Sample coupon
  await prisma.coupon.upsert({
    where: { code: "ASTRO10" },
    update: {},
    create: {
      code: "ASTRO10",
      description: "10% de desconto",
      type: "PERCENTAGE",
      value: 10,
      active: true,
    },
  });
  console.log("✅ Coupon created: ASTRO10");

  console.log("🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
