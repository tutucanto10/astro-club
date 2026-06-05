"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Minus, Upload, Trash2 } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.string().min(1),
  comparePrice: z.string().optional(),
  categoryId: z.string().min(1),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  variants: z.array(
    z.object({
      id: z.string().optional(),
      size: z.string().optional(),
      color: z.string().optional(),
      stock: z.string(),
      sku: z.string().optional(),
    })
  ),
});

type ProductForm = z.infer<typeof productSchema>;

interface Variant {
  id: string;
  size: string | null;
  color: string | null;
  stock: number;
  sku: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: any;
  comparePrice: any;
  categoryId: string;
  featured: boolean;
  active: boolean;
  images: string[];
  variants: Variant[];
}

interface Category {
  id: string;
  name: string;
}

export function EditProductForm({
  product,
  categories,
}: {
  product: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [images, setImages] = useState<string[]>(product.images);
  const [uploading, setUploading] = useState(false);

  const { register, control, handleSubmit, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      description: product.description,
      price: product.price?.toString(),
      comparePrice: product.comparePrice?.toString() || "",
      categoryId: product.categoryId,
      featured: product.featured,
      active: product.active,
      variants: product.variants.map((v) => ({
        id: v.id,
        size: v.size || "",
        color: v.color || "",
        stock: v.stock.toString(),
        sku: v.sku || "",
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setImages((prev) => [...prev, data.url]);
    }
    setUploading(false);
  };

  const onSubmit = async (data: ProductForm) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, images }),
      });
      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Excluir este produto permanentemente?")) return;
    setDeleting(true);
    await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      <div className="bg-background border border-border p-6 space-y-4">
        <h2 className="text-xs tracking-[0.15em] uppercase font-medium border-b border-border pb-3 mb-4">
          Informações
        </h2>

        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Nome *</label>
          <input
            {...register("name")}
            className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground bg-background"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Descrição *</label>
          <textarea
            {...register("description")}
            rows={4}
            className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground bg-background resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Preço *</label>
            <input
              {...register("price")}
              type="number"
              step="0.01"
              className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground bg-background"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Preço original</label>
            <input
              {...register("comparePrice")}
              type="number"
              step="0.01"
              className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground bg-background"
            />
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Categoria *</label>
          <select
            {...register("categoryId")}
            className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground bg-background"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register("featured")} type="checkbox" />
            <span className="text-sm text-muted-foreground">Destaque</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register("active")} type="checkbox" />
            <span className="text-sm text-muted-foreground">Ativo</span>
          </label>
        </div>
      </div>

      {/* Images */}
      <div className="bg-background border border-border p-6">
        <h2 className="text-xs tracking-[0.15em] uppercase font-medium border-b border-border pb-3 mb-4">Imagens</h2>

        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square bg-secondary">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 bg-background/90 p-1 hover:bg-background transition-colors"
                >
                  <Minus size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="flex flex-col items-center justify-center border border-dashed border-border p-6 cursor-pointer hover:border-foreground transition-colors">
          <Upload size={18} className="text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">
            {uploading ? "Enviando..." : "Adicionar imagens"}
          </span>
          <input type="file" accept="image/*" multiple className="sr-only" onChange={handleImageUpload} />
        </label>
      </div>

      {/* Variants */}
      <div className="bg-background border border-border p-6">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <h2 className="text-xs tracking-[0.15em] uppercase font-medium">Variantes</h2>
          <button
            type="button"
            onClick={() => append({ size: "", stock: "0" })}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus size={12} /> Adicionar
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, i) => (
            <div key={field.id} className="grid grid-cols-3 gap-3 items-end">
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Tamanho</label>
                <input
                  {...register(`variants.${i}.size`)}
                  className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground bg-background"
                  placeholder="P, M, G..."
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Estoque</label>
                <input
                  {...register(`variants.${i}.stock`)}
                  type="number"
                  min="0"
                  className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground bg-background"
                />
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                disabled={fields.length === 1}
                className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-30 mb-0.5"
              >
                <Minus size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-foreground text-background px-8 py-3 text-xs tracking-[0.15em] uppercase font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar alterações"}
          </button>
          <Link
            href="/admin/products"
            className="px-8 py-3 text-xs tracking-[0.15em] uppercase border border-border hover:bg-secondary transition-colors text-center"
          >
            Cancelar
          </Link>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-red-500 transition-colors"
        >
          <Trash2 size={14} />
          {deleting ? "Excluindo..." : "Excluir produto"}
        </button>
      </div>
    </form>
  );
}
