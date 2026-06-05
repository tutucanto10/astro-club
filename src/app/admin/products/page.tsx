import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2 } from "lucide-react";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl tracking-wide">Produtos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {products.length} produto{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/products/new">
          <button className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs tracking-[0.15em] uppercase font-medium hover:opacity-90 transition-opacity">
            <Plus size={14} />
            Novo produto
          </button>
        </Link>
      </div>

      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-xs tracking-[0.1em] uppercase text-muted-foreground font-medium w-12" />
              <th className="px-6 py-3 text-left text-xs tracking-[0.1em] uppercase text-muted-foreground font-medium">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs tracking-[0.1em] uppercase text-muted-foreground font-medium">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs tracking-[0.1em] uppercase text-muted-foreground font-medium">
                Estoque
              </th>
              <th className="px-6 py-3 text-left text-xs tracking-[0.1em] uppercase text-muted-foreground font-medium">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs tracking-[0.1em] uppercase text-muted-foreground font-medium">
                Preço
              </th>
              <th className="px-6 py-3 text-right text-xs tracking-[0.1em] uppercase text-muted-foreground font-medium">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const totalStock = product.variants.reduce(
                (s, v) => s + v.stock,
                0
              );
              return (
                <tr
                  key={product.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="relative w-10 h-12 bg-secondary">
                      {product.images[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {product.category.name}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs ${
                        totalStock === 0
                          ? "text-red-500"
                          : totalStock <= 5
                          ? "text-amber-500"
                          : "text-green-600"
                      }`}
                    >
                      {totalStock} un.
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 ${
                        product.active
                          ? "bg-green-50 text-green-700"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {product.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {formatPrice(parseFloat(product.price.toString()))}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Edit size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}

            {products.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-muted-foreground text-sm"
                >
                  Nenhum produto cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
