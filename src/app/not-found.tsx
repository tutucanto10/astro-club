import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-6">
        <h1 className="font-display text-[20vw] text-foreground/5 leading-none select-none">
          404
        </h1>
        <div className="-mt-8">
          <h2 className="font-display text-3xl tracking-wide mb-4">
            Página não encontrada
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            A página que você procura não existe ou foi movida.
          </p>
          <Link href="/">
            <button className="bg-foreground text-background px-8 py-3 text-xs tracking-[0.2em] uppercase font-medium hover:opacity-90 transition-opacity">
              Voltar ao início
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
