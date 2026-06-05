"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(3, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error || "Erro ao criar conta");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-foreground items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-6xl text-background tracking-[0.2em]">ASTRO</h1>
          <p className="text-background/40 text-xs tracking-[0.3em] uppercase mt-3">Streetwear Premium</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-10">
            <h1 className="font-display text-4xl tracking-[0.2em]">ASTRO</h1>
          </div>

          <h2 className="font-display text-3xl tracking-wide mb-8">Criar conta</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Nome</label>
              <input
                {...register("name")}
                className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background"
                placeholder="Seu nome"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Email</label>
              <input
                {...register("email")}
                type="email"
                className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background"
                placeholder="seu@email.com"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5">Senha</label>
              <input
                {...register("password")}
                type="password"
                className="w-full border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors bg-background"
                placeholder="Mínimo 6 caracteres"
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background py-4 text-xs tracking-[0.2em] uppercase font-medium hover:opacity-90 transition-opacity disabled:opacity-50 btn-press mt-2"
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem conta?{" "}
            <Link href="/login" className="text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
