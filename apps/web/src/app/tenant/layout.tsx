"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Home, CreditCard, FileText, BarChart3, User, LogOut, Loader2 } from "lucide-react";

interface TenantInfo {
  name: string;
  email: string;
  lot: string;
}

const navItems = [
  { href: "/tenant", label: "Dashboard", icon: Home },
  { href: "/tenant/payments", label: "Paiements", icon: CreditCard },
  { href: "/tenant/documents", label: "Documents", icon: FileText },
  { href: "/tenant/consumptions", label: "Consommations", icon: BarChart3 },
];

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTenantInfo() {
      try {
        setLoading(true);
        // TODO: Get from auth context
        setTenantInfo(null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTenantInfo();
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tenant" className="flex items-center gap-2">
              <Home className="h-6 w-6" />
              <span className="text-xl font-bold">Le Copropriétaire</span>
              <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                Locataire
              </span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant={isActive ? "secondary" : "ghost"} 
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="hidden lg:block">{tenantInfo?.name || "Utilisateur"}</span>
              )}
            </div>
            <Link href="/login">
              <Button variant="outline" size="sm" className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </Link>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden border-t">
          <div className="container flex items-center gap-1 py-2 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant={isActive ? "secondary" : "ghost"} 
                    size="sm"
                    className="whitespace-nowrap gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="container py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 Le Copropriétaire. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
