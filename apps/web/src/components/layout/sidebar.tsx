"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: "Principal",
    items: [
      { title: "Dashboard", href: "/app", icon: "📊" },
      { title: "Copropriétés", href: "/app/condominiums", icon: "🏢" },
    ],
  },
  {
    title: "Gestion",
    items: [
      { title: "Propriétaires", href: "/app/owners", icon: "👥" },
      { title: "Locataires", href: "/app/tenants", icon: "🔑" },
      { title: "Lots", href: "/app/lots", icon: "🚪" },
    ],
  },
  {
    title: "Finances",
    items: [
      { title: "Appels de fonds", href: "/app/calls", icon: "📨" },
      { title: "Paiements", href: "/app/payments", icon: "💳" },
      { title: "Banque", href: "/app/bank", icon: "🏦" },
      { title: "Comptabilité", href: "/app/accounting", icon: "📒" },
    ],
  },
  {
    title: "Communication",
    items: [
      { title: "Assemblées", href: "/app/meetings", icon: "📋" },
      { title: "Documents", href: "/app/documents", icon: "📁" },
      { title: "Messages", href: "/app/messages", icon: "✉️", badge: 3 },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "flex h-full flex-col border-r bg-card transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <Link href="/app" className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">Le Copro</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(collapsed && "mx-auto")}
          >
            {collapsed ? "→" : "←"}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-4 px-2">
            {navigation.map((group) => (
              <div key={group.title}>
                {!collapsed && (
                  <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
                    {group.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    
                    const linkContent = (
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          collapsed && "justify-center px-2"
                        )}
                      >
                        <span className="text-lg">{item.icon}</span>
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    );

                    if (collapsed) {
                      return (
                        <Tooltip key={item.href}>
                          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return <div key={item.href}>{linkContent}</div>;
                  })}
                </div>
                {!collapsed && <Separator className="mt-4" />}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/app/settings"
                  className="flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted"
                >
                  ⚙️
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Paramètres</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/app/settings"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              <span>⚙️</span>
              <span>Paramètres</span>
            </Link>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
