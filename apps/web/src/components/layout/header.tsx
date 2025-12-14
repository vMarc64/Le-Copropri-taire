"use client";

import { useEffect, useState } from "react";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, User, HelpCircle, LogOut, ChevronDown } from "lucide-react";
import { MobileNav } from "./mobile-nav";

// Role labels for display
const roleLabels: Record<string, string> = {
  owner: "Copropriétaire",
  manager: "Gestionnaire",
  syndic_admin: "Administrateur Syndic",
  platform_admin: "Admin Plateforme",
};

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string | null;
  tenantName?: string | null;
}

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  const userName = user ? `${user.firstName} ${user.lastName}` : "Utilisateur";
  const userEmail = user?.email || "";
  const userRole = user?.role ? (roleLabels[user.role] || user.role) : "";

  const handleLogout = async () => {
    // Clear localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    
    // Call logout API to clear httpOnly cookie
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore errors, still redirect
    }
    
    // Force redirect using window.location to ensure full page reload
    window.location.href = "/";
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <header className="flex h-14 md:h-16 items-center justify-between border-b border-border bg-card px-3 md:px-6">
      {/* Left: Mobile Menu + Search */}
      <div className="flex items-center gap-2 flex-1 max-w-xl">
        {/* Mobile Navigation */}
        <MobileNav />
        
        {/* Search - Hidden on small mobile, visible from sm */}
        <div className="relative hidden sm:block flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher copropriétés ou propriétaires..."
            className="h-10 w-full rounded-xl border-0 bg-muted pl-10 pr-4 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 md:gap-2 ml-2 md:ml-6">
        {/* Mobile Search Button - visible only on very small screens */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 md:hidden rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Rechercher</span>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9 md:h-10 md:w-10 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 md:right-1.5 md:top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
            2
          </span>
        </Button>

        {/* Divider - hidden on mobile */}
        <div className="hidden md:block mx-2 h-8 w-px bg-border" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 md:gap-3 rounded-xl px-1.5 md:px-2 py-1.5 h-auto hover:bg-muted">
              <Avatar className="h-8 w-8 md:h-9 md:w-9">
                <AvatarFallback className="bg-primary/10 text-[12px] md:text-[13px] font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-[14px] font-medium text-foreground">{userName}</span>
                <span className="text-[12px] text-muted-foreground">
                  {userRole}
                  {user?.tenantName && <span className="ml-1">• {user.tenantName}</span>}
                </span>
              </div>
              <ChevronDown className="hidden md:block h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
            <DropdownMenuLabel className="px-3 py-2">
              <p className="text-[14px] font-medium text-foreground">{userName}</p>
              <p className="text-[12px] text-muted-foreground">{userEmail}</p>
              {user?.tenantName && (
                <p className="text-[11px] text-primary font-medium mt-0.5">{user.tenantName}</p>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1.5" />
            <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-[13px]">
              <Link href="/app/profile" className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-muted-foreground" />
                Mon profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1.5" />
            <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-[13px]">
              <Link href="/support" className="flex items-center gap-2.5">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                Aide
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1.5" />
            <DropdownMenuItem 
              onSelect={handleLogout}
              className="rounded-lg px-3 py-2 text-[13px] text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:text-rose-400 dark:focus:text-rose-400 dark:focus:bg-rose-950/20 cursor-pointer"
            >
              <LogOut className="mr-2.5 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
