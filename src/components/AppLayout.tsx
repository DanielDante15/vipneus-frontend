import { ReactNode, useState } from "react";
import { SidebarLink } from "./SidebarLink";
import { Package, BarChart3, ShoppingCart, DollarSign, FileText, Menu, X } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: "/", icon: Package, label: "Estoque" },
  { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { to: "/compras", icon: ShoppingCart, label: "Compras" },
  { to: "/vendas", icon: DollarSign, label: "Vendas" },
  { to: "/relatorios", icon: FileText, label: "Relatórios" },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-50 flex flex-col h-full w-64 bg-card border-r border-border transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground">VIPneus</h1>
            <p className="text-xs text-muted-foreground">Controle de Estoque</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">© 2026 VIPneus</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border md:hidden">
          <button onClick={() => setMobileOpen(true)} className="text-foreground">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-display font-bold text-foreground">VIPneus</h1>
        </header>
        <div className="p-6 md:p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
