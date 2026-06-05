import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, Tag } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Produtos", icon: Package },
    { href: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
    { href: "/admin/customers", label: "Clientes", icon: Users },
    { href: "/admin/coupons", label: "Cupons", icon: Tag },
  ];

  return (
    <div className="flex min-h-screen bg-secondary/30">
      {/* Sidebar */}
      <aside className="w-56 bg-background border-r border-border flex flex-col fixed h-full">
        <div className="p-6 border-b border-border">
          <Link href="/" className="font-display text-xl tracking-[0.2em]">
            ASTRO
          </Link>
          <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mt-1">
            Admin Panel
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar à loja
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-56 p-8">{children}</main>
    </div>
  );
}
