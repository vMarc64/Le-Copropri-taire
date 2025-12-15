"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  UserPlus,
  HelpCircle, 
  LogOut, 
  ChevronDown,
  Shield,
  Activity,
  ExternalLink
} from "lucide-react";

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const navigation = [
  { name: "Dashboard", href: "/platform", icon: LayoutDashboard },
  { name: "Syndics", href: "/platform/tenants", icon: Building2 },
  { name: "Utilisateurs", href: "/platform/users", icon: Users },
];

const SIGNOZ_URL = process.env.NEXT_PUBLIC_SIGNOZ_URL || "https://signoz.uat.lecopro.mneto.fr";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        // Ignore
      }
    }
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    window.location.href = "/";
  };

  const userName = user ? `${user.firstName} ${user.lastName}` : "Admin";
  const userEmail = user?.email || "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "PA";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8">
            <Link href="/platform" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">Le Copropriétaire</span>
              <span className="rounded-md bg-violet-600 px-2 py-0.5 text-xs font-medium text-white">
                Admin
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/platform" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-violet-600/10 text-violet-600 dark:text-violet-400"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
              {/* SigNoz External Link */}
              <a
                href={SIGNOZ_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Activity className="h-4 w-4" />
                Monitoring
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 h-auto hover:bg-muted">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-violet-600/10 text-sm font-semibold text-violet-600">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">{userName}</span>
                    <span className="text-xs text-muted-foreground">Admin Plateforme</span>
                  </div>
                  <ChevronDown className="hidden md:block h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
                <DropdownMenuLabel className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1.5" />
                <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-sm">
                  <Link href="/support" className="flex items-center gap-2.5">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    Aide
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1.5" />
                <DropdownMenuItem 
                  onSelect={handleLogout}
                  className="rounded-lg px-3 py-2 text-sm text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:text-rose-400 dark:focus:text-rose-400 dark:focus:bg-rose-950/20 cursor-pointer"
                >
                  <LogOut className="mr-2.5 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">{children}</main>
    </div>
  );
}
