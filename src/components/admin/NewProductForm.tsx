"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Minus, Upload } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  description: z.string().min(10, "Descrição obrigatória"),
  price: z.string().min(1, "Preço obrigatório"),
  comparePrice: z.string().optional(),
  categoryId: z.string().min(1, "Categoria obrigatória"),
  featured: z.boolean().default(false),
  variants: z.array(
    z.object({
      size: z.string().optional(),
      color: z.string().optional(),
      stock: z.string().min(0),
      sku: z.string().optional(),
    })
  ),
});

type ProductForm = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
}

export function NewProductForm({ categories }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      variants: [{ size: "", stock: "10" }],
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
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, images }),
      });

      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      {/* Basic info */}
      <div className="bg-background border border-border p-6 space-y-4">
        <h2 className="text-xs tracking-[0.15em] uppercase font-medium border-b border-border pb-3 mb-4">
          Informações básicas
        </h2>

        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">
            Nome *
          </label>
          <input
            {...register("name")}
            className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background"
            placeholder="Nome do produto"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">
            Descrição *
          </label>
          <textarea
            {...register("description")}
            rows={4}
            className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background resize-none"
            placeholder="Descreva o produto..."
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">
              Preço *
            </label>
            <input
              {...register("price")}
              type="number"
              step="0.01"
              className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">
              Preço original (opcional)
            </label>
            <input
              {...register("comparePrice")}
              type="number"
              step="0.01"
              className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">
            Categoria *
          </label>
          <select
            {...register("categoryId")}
            className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background"
          >
            <option value="">Selecionar categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            {...register("featured")}
            type="checkbox"
            id="featured"
            className="border border-border"
          />
          <label htmlFor="featured" className="text-sm text-muted-foreground cursor-pointer">
            Produto em destaque
          </label>
        </div>
      </div>

      {/* Images */}
      <div className="bg-background border border-border p-6">
        <h2 className="text-xs tracking-[0.15em] uppercase font-medium border-b border-border pb-3 mb-4">
          Imagens
        </h2>

        <label className="flex flex-col items-center justify-center border border-dashed border-border p-8 cursor-pointer hover:border-foreground transition-colors">
          <Upload size={20} className="text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">
            {uploading ? "Enviando..." : "Clique para enviar imagens"}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleImageUpload}
          />
        </label>

        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square bg-secondary">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 bg-background/80 p-1 hover:bg-background transition-colors"
                >
                  <Minus size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variants */}
      <div className="bg-background border border-border p-6">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <h2 className="text-xs tracking-[0.15em] uppercase font-medium">
            Variantes (Estoque)
          </h2>
          <button
            type="button"
            onClick={() => append({ size: "", stock: "10" })}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus size={12} /> Adicionar
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, i) => (
            <div key={field.id} className="grid grid-cols-3 gap-3 items-end">
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Tamanho
                </label>
                <input
                  {...register(`variants.${i}.size`)}
                  className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors bg-background"
                  placeholder="P, M, G, GG..."
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Estoque
                </label>
                <input
                  {...register(`variants.${i}.stock`)}
                  type="number"
                  min="0"
                  className="w-full border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors bg-background"
                  placeholder="0"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  disabled={fields.length === 1}
                  className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 mb-0.5"
                >
                  <Minus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-foreground text-background px-8 py-3 text-xs tracking-[0.15em] uppercase font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar produto"}
        </button>
        <a
          href="/admin/products"
          className="px-8 py-3 text-xs tracking-[0.15em] uppercase border border-border hover:bg-secondary transition-colors text-center"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}
