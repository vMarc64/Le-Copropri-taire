"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Loader2 } from "lucide-react";

interface OwnerInfo {
  name: string;
  email: string;
}

const navItems = [
  { href: "/portal", label: "Dashboard", icon: "🏠" },
  { href: "/portal/payments", label: "Paiements", icon: "💳" },
  { href: "/portal/documents", label: "Documents", icon: "📁" },
  { href: "/portal/consumptions", label: "Consommations", icon: "📊" },
  { href: "/portal/sepa", label: "Mandat SEPA", icon: "🏦" },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [ownerInfo, setOwnerInfo] = useState<OwnerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // TODO: Get from auth context
        setOwnerInfo(null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/portal" className="flex items-center gap-2">
              <span className="text-xl font-bold">🏠 Le Copropriétaire</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant={pathname === item.href ? "secondary" : "ghost"} 
                  size="sm"
                >
                  {item.icon} {item.label}
                </Button>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden sm:block h-6 w-px bg-border" />
            <span className="hidden sm:block text-sm text-muted-foreground">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                ownerInfo?.name || "Utilisateur"
              )}
            </span>
            <Link href="/login">
              <Button variant="outline" size="sm">Déconnexion</Button>
            </Link>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden border-t">
          <div className="container flex items-center gap-1 py-2 overflow-x-auto">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant={pathname === item.href ? "secondary" : "ghost"} 
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {item.icon} {item.label}
                </Button>
              </Link>
            ))}
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
