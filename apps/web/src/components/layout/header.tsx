"use client";

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
import { Bell, Search, User, Settings, HelpCircle, LogOut, ChevronDown } from "lucide-react";

interface HeaderProps {
  tenantName?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

export function Header({ 
  userName = "Jean Dupont",
  userEmail = "jean.dupont@syndic.fr",
  userRole = "Gestionnaire"
}: HeaderProps) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Left: Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher copropriétés ou propriétaires..."
            className="h-10 w-full rounded-xl border-0 bg-muted pl-10 pr-4 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 ml-6">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
            2
          </span>
        </Button>

        {/* Divider */}
        <div className="mx-2 h-8 w-px bg-border" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 rounded-xl px-2 py-1.5 h-auto hover:bg-muted">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-[13px] font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-[14px] font-medium text-foreground">{userName}</span>
                <span className="text-[12px] text-muted-foreground">{userRole}</span>
              </div>
              <ChevronDown className="hidden md:block h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
            <DropdownMenuLabel className="px-3 py-2">
              <p className="text-[14px] font-medium text-foreground">{userName}</p>
              <p className="text-[12px] text-muted-foreground">{userEmail}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1.5" />
            <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-[13px]">
              <Link href="/app/profile" className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-muted-foreground" />
                Mon profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-[13px]">
              <Link href="/app/settings" className="flex items-center gap-2.5">
                <Settings className="h-4 w-4 text-muted-foreground" />
                Paramètres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1.5" />
            <DropdownMenuItem asChild className="rounded-lg px-3 py-2 text-[13px]">
              <Link href="/app/help" className="flex items-center gap-2.5">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                Aide
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1.5" />
            <DropdownMenuItem className="rounded-lg px-3 py-2 text-[13px] text-rose-600 focus:text-rose-600 dark:text-rose-400 dark:focus:text-rose-400">
              <LogOut className="mr-2.5 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
