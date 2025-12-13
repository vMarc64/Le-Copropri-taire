"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Building2,
  LayoutDashboard,
  Users,
  Landmark,
  FileText,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const navigation: NavItem[] = [
  { title: "Dashboard", href: "/app", icon: LayoutDashboard },
  { title: "Copropriétés", href: "/app/condominiums", icon: Building2 },
  { title: "Propriétaires", href: "/app/owners", icon: Users },
  { title: "Banque", href: "/app/bank", icon: Landmark },
  { title: "Documents", href: "/app/documents", icon: FileText },
  { title: "Paramètres", href: "/app/settings", icon: Settings },
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
          "flex h-full flex-col border-r border-border bg-card transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center border-b border-border px-5">
          {!collapsed ? (
            <Link href="/app" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-foreground">Le Copropriétaire</span>
                <span className="text-[12px] text-muted-foreground">Gestion immobilière</span>
              </div>
            </Link>
          ) : (
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <div className="flex justify-end px-3 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/app" && pathname.startsWith(item.href + "/"));
              const Icon = item.icon;
              
              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Icon className={cn("h-[20px] w-[20px]", isActive && "text-primary")} />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="text-[13px]">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.href}>{linkContent}</div>;
            })}
          </nav>
        </ScrollArea>

        {/* Help Section */}
        <div className="border-t border-border p-4">
          {!collapsed ? (
            <div className="rounded-xl bg-muted p-4">
              <div className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <span>Besoin d&apos;aide ?</span>
              </div>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Consultez notre documentation
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 h-8 w-full rounded-lg border-border text-[13px] font-medium" 
                asChild
              >
                <Link href="/app/help">Voir la doc</Link>
              </Button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/app/help"
                  className="flex items-center justify-center rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <HelpCircle className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-[13px]">
                <p>Aide</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
